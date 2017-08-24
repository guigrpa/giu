# Roadmap
​
- Upgrade to the latest Flow (lots of React goodies!)
    - [ ] Solve giu errors
    - [ ] Check updates to HOCs
    - [ ] Enable Flow on giu-examples, and solve those too
    - [ ] Enable hocs/playFlowXXXX, and solve those too
- Upgrade giu (subpackage)'s deps, and include React 16
- Export useful types (HoverableProps, etc.)
- In types.js, update the Command type: (1) make it a union; (2) remove exact-ness; (3) add SET_VALUE command, with `value: any` attribute
- En iOS, los floats de errores de validación causan que los inputs de longitud 100% se hagan más cortos... y están muy distanciados del input
- Combo box (or TextInput with hanging menu with typeahead)
- Update docs to indicate that moment is now optional

- [ ] Expose `delay()`, `waitUntil()` and `isWaiting()` (`gral/wait`) helpers again, using `babel-runtime` and `babel-plugin-transform-runtime`.

- [ ] Jest snapshots

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
