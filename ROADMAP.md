# Roadmap

- [ ] DATATABLE/VIRTUALSCROLLER
  - [x] Selection & multi-selection
  - [x] alwaysRenderIds
  - [x] Drag-n-drop sorting:
      - [x] Include localStorage support?
  - [ ] Disable scroll wheel when we reach the end (same as in popups)
  - [ ] Keyboard actions
  - [ ] Clipboard actions (requires focus -- what about nested focusable items??)
  - [ ] Style customisation
  - [ ] Add examples:
      - [ ] All defaults
      - [ ] Classical pagination (external) vs. infinite scrolling
      - [ ] Multi-level sorting (external) vs. default sorting
      - [ ] Clipboard actions

- [ ] LANGUAGE SUPPORT FOR SELECTS:
  - [ ] Native
  - [ ] Custom (probably DropDownMenu should also pass down lang property if it exists...)

Long-standing:
- [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
- [ ] Focus delegation?
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
