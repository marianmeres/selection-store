import { createDerivedStore, createStore } from '@marianmeres/store';

const _isObject = (v) => typeof v === 'object' && !Array.isArray(v) && v !== null;

export const createSelectionStore = <T>(
	items: T[],
	selected: number[] = [],
	multiple: boolean = false
) => {
	const _assertValidItems = (items) => {
		if (!Array.isArray(items) || !items.every(_isObject)) {
			throw new TypeError(`Expecting array of initial item objects`);
		}
		return items;
	};

	if (
		!Array.isArray(selected) ||
		!selected.every((idx) => !isNaN(idx) && items[idx] !== undefined)
	) {
		throw new TypeError(`Expecting array of initial selected indexes`);
	}

	const _items = createStore<T[]>(_assertValidItems(items));
	const _selected = createStore<number[]>(selected);

	const _uniq = (arr: number[]) => [...new Set(arr)];

	const _findIndexByProp = (propName: string, propValue: any, values: T[]): number =>
		values.findIndex(
			(val) => val && val[propName] !== undefined && val[propName] === propValue
		);

	const store = createDerivedStore<{
		items: T[];
		selected: number[];
		selection: T[];
	}>([_items, _selected], ([items, selected]) => ({
		items,
		selected,
		selection: selected.map((idx) => items[idx]),
	}));

	const _normalize = (index: number) => {
		if (typeof index !== 'number') {
			throw new TypeError(`Expecting numeric index`);
		}
		const items = _items.get();
		if (!items.length || items[index] === undefined) return [];

		return [index];
	};

	const _selectOne = (index: number, reset) => {
		const idxs = _normalize(index);
		_selected.update((old) => (!multiple || reset ? idxs : _uniq([...old, ...idxs])));
	};

	const _selectMany = (indexes: number[], reset) => {
		if (!indexes.length) {
			return reset ? _selected.set([]) : undefined;
		}
		if (!multiple) {
			return _selectOne(indexes[indexes.length - 1], reset);
		}
		const _idxs = indexes.reduce((m, i) => [...m, ..._normalize(i)], []);
		_selected.update((old) => (reset ? _uniq(_idxs) : _uniq([...old, ..._idxs])));
	};

	const out = {
		//
		subscribe: store.subscribe,
		get: store.get,
		//
		select: (indexOrItem: number | number[] | T | T[], resetSelected = true) => {
			let _values: (number | T)[] = Array.isArray(indexOrItem)
				? indexOrItem
				: [indexOrItem];

			if (resetSelected) _selected.set([]);

			let _indexes = [];
			_values.forEach((v) => {
				if (typeof v !== 'number') v = _items.get().findIndex((_v) => _v === v);
				if (v >= 0) _indexes.push(v);
			});

			_selectMany(_indexes, false);

			return out;
		},
		//
		unselect: (indexOrItem?: number | number[] | T | T[]) => {
			// unselect all
			if (indexOrItem === undefined) {
				_selected.set([]);
				return out;
			}

			const current = _selected.get();
			if (!current.length) return out; // nothing to do

			let _values: (number | T)[] = Array.isArray(indexOrItem)
				? indexOrItem
				: [indexOrItem];

			let _indexesMap = current.reduce((m, i) => ({ ...m, [i]: true }), {});
			_values.forEach((v) => {
				if (typeof v !== 'number') v = _items.get().findIndex((_v) => _v === v);
				delete _indexesMap[v];
			});

			_selectMany(
				Object.keys(_indexesMap).map((v) => parseInt(v)),
				true
			);

			return out;
		},
		//
		findIndexBy: (propName: string, propValue: any) => {
			return _findIndexByProp(propName, propValue, _items.get());
		},
		//
		reset: (items: T[] = []) => {
			_selected.set([]);
			_items.set(_assertValidItems(items || []));
			return out;
		},
	};

	return out;
};
