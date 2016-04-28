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
- [ ] What should be the zIndex for floats coming from a modal?
- [ ] Floats (same approach as Modals) -- pushed on componentDidMount/Update (when the anchor position is known).
    + [ ] What happens during scrolls?
        * [ ] Floats: install a listener on body scroll
        * [ ] Other scrolling divs that may contain elements driving float positions should do the same
        * [ ] That listener should dispatch a FLOAT_SCROLL, which should trigger a `repositionOrClose()` function in each float. Function is missing? Then remove it from the store state.
    + [ ] How do we close a float?
        * Use case 1: float is open as support to data entering in e.g. a date/time field, or a select. For example, as long as the DateInput is focused, the float can be displayed. When it is blurred (or the user presses ESC), the DateInput closes it.
        * Use case 2: a dropdown menu opens a float with the menu and closes it when clicking again on the menu title. Opening the menu should install a one-off `onClick` listener on `window` to close it. It may also react to `close()` callback functions in the float.
- [ ] Comps:
    + [x] Spinner
    + [x] Backdrop (extracted from Modal)
    + DateInput
        * [ ] Basic POC
        * [ ] Use isFloatsMounted()
        * [ ] Use `dispatch` if passed, otherwise the imperative floats api
    + [ ] SimpleList
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
