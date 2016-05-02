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
- [ ] Floats (same approach as Modals) -- pushed on componentDidMount/Update (when the anchor position is known).
    + [x] Get them to work on IE!!
    + [ ] Floats at the bottom of the page and going down are cut off; each float owner should manage how it copes with this...
- [ ] Comps:
    + [x] Spinner
    + [x] Backdrop (extracted from Modal)
    + [x] SimpleList
    + [ ] DropDownMenu
        * [ ] Basic POC
    + DateInput
        * [x] Basic POC
        * [x] Use isFloatsMounted()
        * [ ] Use `dispatch` if passed, otherwise the imperative floats api
        * [ ] Build the real float, once SimpleList and AnalogTime are there
    + [ ] ProgressBar
    + [ ] AnalogTime
    + [ ] FileInput
    + [ ] Hints
    + [ ] Multiple-selection list
- [ ] Add alternative style to inputs (no borders, etc.) or make it simple to wrap the provided components and customise
- [ ] Use SimpleList for Selects (optional)
- [ ] Drag and drop
- [ ] Include SVG font?
- [ ] DOCS!
