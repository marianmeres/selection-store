# @marianmeres/selection-store

Simple store utility for marking objects in collection as selected.

## Install

```shell
$ npm i @marianmeres/selection-store
```

## Example

```typescript
// factory
const store = createSelectionStore<T>(
    // initial collection of arbitrary objects
    items: T[] = [],  // e.g. [{ id: 'a' }, { id: 'b' }, { id: 'c' }],

    // initial set of selected indexes
    selected: number[] = [],

    // allow multiple selection flag
    multiple: boolean = false
);

//
store.subscribe((v) => {
    // full collection of objects
    // v.items: T[];

    // currently selected indexes
    // v.selected: number[];

    // current selection of objects (mapped indexes)
    // v.selection: T[];
});

// `resetSelected` flag empties the selection before applying the current one
// (makes sense only for multiple, since non multiple are always reset)
store.select(indexOrItem, resetSelected = true);
store.select([indexOrItem, indexOrItem2, ...], resetSelected = true);

// "unselect"
store.select([], resetSelected = true);
store.unselect(); // will unselect all
store.unselect(indexOrItem);
store.unselect([indexOrItem, indexOrItem2, ...]);

// helper to find index
store.findIndexBy(propName, propValue);
// for cases like:
store.select(store.findIndexBy('id', 'a'));

// resets selection and internal collection of objects
store.reset(items = []);
```

Note: If your collection is huge, working with numerical indexes (see `indexOrItem` above)
should be preferred.
