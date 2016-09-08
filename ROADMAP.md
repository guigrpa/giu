# Roadmap

- [ ] DATATABLE/VIRTUALSCROLLER
  - [x] Selection & multi-selection
  - [x] alwaysRenderIds
  - [ ] Drag-n-drop sorting:
      - [x] Debug (in particular, what happens when there are alwaysRenderIds)
      - [x] Add localStorage to save manual order? No, better leave to the user!
      - [x] Remove `top` animations while dragging
      - [x] Fix `sort()` function in DataTable

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
