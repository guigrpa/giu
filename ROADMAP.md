# Roadmap

- [ ] Build examples for SSR, static site
- [ ] Copy docs from giu-examples to the docs folder for publishing
- [ ] Expose `delay()`, `waitUntil()` and `isWaiting()` (`gral/wait`) helpers again, using `babel-runtime` and `babel-plugin-transform-runtime`.

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
