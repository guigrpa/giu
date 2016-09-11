# Roadmap

- [ ] DATATABLE/VIRTUALSCROLLER
  - [ ] Add examples:
      - [x] Editing
      - [ ] Classical pagination (external) vs. infinite scrolling
      - [ ] Multi-level sorting (external) vs. default sorting
      - [ ] Clipboard actions
      - [x] All defaults
  - [x] Keyboard actions
  - [ ] Scroll to selection (copy technique from listPicker)
  - [ ] Clipboard actions (requires focus -- what about nested focusable items??)

- [ ] LANGUAGE SUPPORT FOR SELECTS:
  - [ ] Native
  - [ ] Custom (probably DropDownMenu should also pass down lang property if it exists...)

Long-standing:
- [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
- [ ] Focus delegation?
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
