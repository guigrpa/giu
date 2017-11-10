# Roadmap

- [ ] Migrate examples to Next
    - [ ] Clean up deps (remove Webpack, etc)
    - [ ] Bug when moving from index to compact
- [ ] Complete migration to React 16 (see console errors in index.js, demo1.js)
- [ ] Update docs (see breaking changes in changelog)
- [ ] Migrate to latest Flow

- [ ] Unit tests (with Jest snapshots)

- [ ] Add copy&paste to RangePicker
- [ ] *Bug* ListPicker on Windows incorrectly aligns (vertically) items and shortcuts (it *is* correct in the main doc page)
- [ ] Stop scrollers (in ListPickers and DataTables) from scrolling the window! (seems to happen only on Chrome Mac)
- [ ] Safari Mac: DataTables don't scroll smoothly
- [ ] Check DataTable behaviour on iOS, especially dragging

- [ ] Use SVG icons: https://css-tricks.com/icon-fonts-vs-svg/
- [ ] Combo input (free-text, typeahead, list)

Long-standing:
- [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
- [ ] Focus delegation?
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
