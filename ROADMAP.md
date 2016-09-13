# Roadmap

- [ ] DATATABLE/VIRTUALSCROLLER
  - [ ] Add example to modal
  - [ ] Only scrollIntoView() fully when we have the focus

Check behaviour when data loads after a certain interval

- [ ] Use SVG icons: https://css-tricks.com/icon-fonts-vs-svg/

- [ ] LANGUAGE SUPPORT FOR SELECTS:
  - [ ] Native
  - [ ] Custom (probably DropDownMenu should also pass down lang property if it exists...)

Long-standing:
- [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
- [ ] Focus delegation?
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
