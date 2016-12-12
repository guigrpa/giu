# Roadmap

- FLOW conversion:
    - [ ] Add support for Hoverable HOC on functional components
    - [ ] Check status of https://github.com/facebook/flow/issues/1326 (Object type spread)
    - [ ] Check status of https://github.com/facebook/flow/issues/2372 (incorrect handling of `undefined` for required React props) -- and also related: https://github.com/facebook/flow/issues/2781
    - [ ] Add types to input HOC and derived components
- [ ] Jest snapshots

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
