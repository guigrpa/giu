# Roadmap

- [x] Complete Modal implementation
    + [x] Default buttons
    + [x] Button positions
    + [x] Better layout
    + [x] Autofocus
    + [x] Keyboard events, etc.)
- [x] Fix textarea carriage returns...
- [x] Notifications (same approach as Modals)
- [x] Notification (same approach as Modal)
- [x] Rethink zIndex: Textarea (maybe inside a modal), Float (maybe inside a modal), Notifications, etc. etc.
- [x] ScrollIntoView
- [x] Floats
- [x] Replace imperative API with `cmds` prop
- [x] ListPicker separators
- [x] Spinner
- [x] ProgressBar
- [x] Backdrop (extracted from Modal)
- [x] ListPicker
- [x] DropDownMenu
- [x] Floats: open down or up, right or left, depending on anchor position, by default. Limit size
- [x] Change error color to yellow when changed
- [x] Show errors on inputs
- [x] DateTimePicker: DatePicker, TimePickerDigital, TimePickerAnalogue
- [x] DateInput
- [x] FileInput
- [ ] Add validation hook to inputs; return an error or an array of errors
- [ ] Make input styles more homogeneous, minimal:
    + [ ] Disabled means no border (not dimmed), no reaction to clicks, no `pointer` cursor, obviously not focusable
    + [x] Input borders, font family, font size, padding, etc.
- [ ] Dropdown menu: should keep its keys registered, no matter whether the listpicker is open or not (add `keepRegistered` prop to ListPicker, default to `false` and set to `true` by DropDownMenu)
- [ ] Pressing enter on button opening a modal also dismisses the modal!
- [ ] Add alternative style to inputs (no borders, etc.) or make it simple to wrap the provided components and customise
- [ ] RadioButton
- [ ] Hints
- [x] Select: `native`, `inlinePicker`, `dropDownPicker`
- [ ] Select: scrollIntoView when opening float
- [ ] DateInput:
    + [ ] Types: `onlyField`, `inlinePicker` (hidden field, no float), `dropDownPicker` (default) [they all have an input field]
    + [ ] **With dropdown: not working**
    + [ ] `DateTimePicker`: remove focusability
    + [ ] `DateTimePicker`: remove `input` HOC
- ListPicker:
    + [ ] [m] Make separators span the whole horiz. extension
    + [x] Automatically show item
    + [x] Show keyboard shortcuts (cmd-X, etc.)
    + [ ] Multiple-selection
- [ ] ColorInput + ColorPicker
- [ ] Design customisation strategy for theme constants (context? constant modification?) -- reduce to the minimum the style-related props (one color), so that we don't need to handle that!
- [ ] Drag and drop
- [ ] Include SVG font?
- [ ] DOCS!
