import path from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { createClog } from '@marianmeres/clog';
import { TestRunner } from '@marianmeres/test-runner';
import { createSelectionStore } from '../src/index.js';

const clog = createClog(path.basename(fileURLToPath(import.meta.url)));
const suite = new TestRunner(path.basename(fileURLToPath(import.meta.url)));

suite.test('not multiple', async () => {
	const a = { id: 'a' };
	const c = { id: 'c' };
	const s = createSelectionStore([a, { id: 'b' }, c]);

	const unsub = s.subscribe((v) => {});

	assert(s.get().items.length === 3);
	assert(s.get().selected.length === 0);
	assert(s.get().selection.length === 0);

	s.select(1);

	assert(s.get().items.length === 3);
	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'b');

	s.select([1, 1, 1]);

	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'b');

	// not multiple, so the last index must win
	// reset false must have no effect since we're not multiple (it is always resetting)
	s.select([0, 1, 2], false);

	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'c');

	// reset false must have no effect since we're not multiple
	s.select(s.findIndexBy('id', 'a'), false);

	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'a');

	// selectItem
	s.select(c, true);
	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'c');

	// must not work, since this is another instance
	s.select({ id: 'a' }, true);
	assert(s.get().selected.length === 0);
	assert(s.get().selection.length === 0);

	// only the last one will be selected
	s.select([a, a, c], true);
	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'c');

	// noop, sice 0 is not selected
	s.unselect(0);
	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'c');

	s.unselect(2);
	assert(s.get().selected.length === 0);
	assert(s.get().selection.length === 0);
	assert(s.get().items.length === 3);

	s.select(2);
	s.unselect(); // unselect "all"
	assert(s.get().selected.length === 0);
	assert(s.get().selection.length === 0);
	assert(s.get().items.length === 3);

	s.reset();

	assert(s.get().items.length === 0);
	assert(s.get().selected.length === 0);
	assert(s.get().selection.length === 0);

	unsub();
});

suite.test('multiple', async () => {
	const a = { id: 'a' };
	const c = { id: 'c' };
	const s = createSelectionStore([a, { id: 'b' }, c], [1], true);

	const unsub = s.subscribe((v) => {});

	assert(s.get().items.length === 3);
	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'b');

	s.select(0, false);

	assert(s.get().selected.length === 2);
	assert(s.get().selection.length === 2);
	// order is not guaranteed
	assert(s.get().selection.some((v) => v.id === 'a'));
	assert(s.get().selection.some((v) => v.id === 'b'));

	s.select([1, 2], true);

	assert(s.get().selected.length === 2);
	assert(s.get().selection.length === 2);
	assert(s.get().selection.some((v) => v.id === 'c'));
	assert(s.get().selection.some((v) => v.id === 'b'));

	// this must be noop
	s.select(999, false);

	assert(s.get().selected.length === 2);
	assert(s.get().selection.length === 2);
	assert(s.get().selection.some((v) => v.id === 'c'));
	assert(s.get().selection.some((v) => v.id === 'b'));

	// this must be noop
	s.select([], false);

	assert(s.get().selected.length === 2);
	assert(s.get().selection.length === 2);
	assert(s.get().selection.some((v) => v.id === 'c'));
	assert(s.get().selection.some((v) => v.id === 'b'));

	// this unselects all
	s.select([], true);

	assert(s.get().items.length === 3);
	assert(s.get().selected.length === 0);
	assert(s.get().selection.length === 0);

	// multiple with same index must be unique
	s.select([1, 1, 1], true);

	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'b');

	// select by item (same multiple will be ignored)
	s.select([a, a, c], true);
	assert(s.get().selected.length === 2);
	assert(s.get().selection.length === 2);
	assert(s.get().selection.some((v) => v.id === 'c'));
	assert(s.get().selection.some((v) => v.id === 'a'));

	s.select(1, false).unselect(c);
	assert(s.get().selected.length === 2);
	assert(s.get().selection.length === 2);
	assert(s.get().selection.some((v) => v.id === 'b'));
	assert(s.get().selection.some((v) => v.id === 'a'));

	s.select([0, 1, 2]).unselect([a, c]);
	assert(s.get().selected.length === 1);
	assert(s.get().selection.length === 1);
	assert(s.get().selection[0].id === 'b');

	// clog(s.get());
	unsub();
});

export default suite;
