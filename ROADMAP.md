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
- [ ] Include SVG font?
- [ ] Floats (same approach as Modals) -- pushed on componentDidMount/Update (when the anchor position is known).
    + [x] Get them to work on IE!!
    + [ ] Floats at the bottom of the page and going down are cut off; each float owner should manage how it copes with this...
    + [ ] Allow clicking on floats... and also outside!
    + [ ] How do we close a float?
        * [x] Use case 1: float is open as support to data entering in e.g. a date/time field, or a select. For example, as long as the DateInput is focused, the float can be displayed. When it is blurred (or the user presses ESC), the DateInput closes it.
        * [ ] Use case 2: a dropdown menu opens a float with the menu and closes it when clicking again on the menu title. Opening the menu should install a one-off `onClick` listener on `window` to close it. It may also react to `close()` callback functions in the float.
- [ ] Comps:
    + [x] Spinner
    + [x] Backdrop (extracted from Modal)
    + [ ] ProgressBar
    + DateInput
        * [x] Basic POC
        * [x] Use isFloatsMounted()
        * [ ] Use `dispatch` if passed, otherwise the imperative floats api
        * [ ] Build the real float, once SimpleList and AnalogTime are there
    + [ ] SimpleList -- pending:
        * [x] Make focusable true by default (configurable)
        * [x] Keys
        * [ ] Pagedown, pageup?
        * [ ] Scroll into view
        * [ ] Example and test
        * [x] Allow customisation of accent color; make text on accent white or dark, depending on the case...
    + [ ] AnalogTime
    + [ ] FileInput
    + [ ] DropDownMenu
    + [ ] Hints
- [ ] Add alternative style to inputs
- [ ] Add classNames to help the user style via CSSs
- [ ] Use SimpleList for Selects
- [ ] ScrollIntoView
- [ ] Drag and drop
- [ ] DOCS!
