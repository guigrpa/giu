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
- [ ] Show errors on inputs -- **test more extensively**
- [ ] Change error color to yellow when changed
- [ ] Test embedded modal in a div with translateZ(0)
- ListPicker:
    + [ ] [m] Make separators span the whole horiz. extension
    + [x] Automatically show item
    + [ ] Show keyboard shortcuts (cmd-X, etc.)
- [ ] Design customisation strategy for theme constants (context? constant modification?) -- reduce to the minimum the style-related props (one color), so that we don't need to handle that!
- [ ] DateTimePicker:
    + [x] DatePicker
    + [x] TimePickerDigital
    + [ ] TimePickerAnalogue:
        * [ ] Performance?
    + [ ] TAB + focus on date/time
- [ ] ListPicker: when there are many elements, consider using translateZ(0), or even not painting all elements...
- [ ] Use ListPicker for Selects (optional)
- DateInput
    + [x] Basic POC
    + [x] Use isFloatsMounted()
    + [ ] Build the real float, using DateTimePicker
    + [ ] Use `dispatch` if passed, otherwise the imperative floats api
- [ ] FileInput
- [ ] Hints
- [ ] Multiple-selection list (ctrl-click?)
- [ ] Add alternative style to inputs (no borders, etc.) or make it simple to wrap the provided components and customise
- [ ] Drag and drop
- [ ] Include SVG font?
- [ ] DOCS!
