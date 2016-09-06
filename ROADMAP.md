# Roadmap

- [ ] DATATABLE/VIRTUALSCROLLER
  - [ ] After filtering (and then removing the filter), fetchMore no longer works
  - [ ] Does request animation frame bring some benefit?
  - [ ] Add prop: list of rows that should NOT be removed even when out of sight (e.g. editing)
- [ ] Add language support for Selects:
  - [ ] Native
  - [ ] Custom (probably DropDownMenu should also pass down lang property if it exists...)

Long-standing:
- [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
- [ ] Focus delegation?
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
