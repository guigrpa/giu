# Roadmap

- [ ] DATATABLE/VIRTUALSCROLLER
  - [ ] Does request animation frame bring some benefit?
  - [ ] Add prop: list of rows that should NOT be removed even when out of sight (e.g. editing)
- [ ] Check Select support for language changes

Long-standing:
- [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
- [ ] Focus delegation?
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
