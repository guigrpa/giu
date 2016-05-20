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
- [x] Select: `native`, `inlinePicker`, `dropDownPicker`
- [x] Dropdown menu: should register its keys
- [x] DateInput
- [x] Homogeneous styles: background, focusability, etc.
- [x] Select: use `required` instead of `allowNull` (inverse)
- [x] Input validation
    + By default (`required` prop is `false` or `isRequired` is not included in the `validate` prop), an input can be left blank. In this case, validations are only run if the input is *not blank*.
        * Detecting that an input is blank is input-dependent, but typically should use the internal value (e.g. for dates, the internal string)
    + If an input is `required`:
        * We first determine whether the user has left the input blank (as above): if blank, the `isRequired` validator is the only one run
        * If not blank, all other validators are run
    + User validator functions:
        (value, ...) => undefined | error message

    + Default validators for a given type input; may depend on props (e.g. date format, numbers):
        * Dates must respect the format
        * Numbers must be correct numbers and within the range (if specified)
    + Validation is applied by default whenever the user blurs an input (or via `cmds`)
    + User-facing API must:
        * Be simple
        * Allow extra, higher-level user validations
        * Allow i18n
        * Allow extra errors to be added via props
        <TextInput />
            = [no validations]
        <TextInput required />
            = `isRequired`
        <NumberInput required />
            = apply first the `isNumber` validator
            = ...
        * Only processed upon componentWillMount
- [x] Fix tabIndex for disabled comps
- [x] RadioButton
- [x] ColorInput
- [x] Input type=range
- [x] HintScreen (embedded)
- [x] Hints
    + Support user actions:
        * Define hint X
        * Disable all
        * Show hint X (and disable it afterwards)
        * Reset (so that they are shown again)
    + Store shown hints in localStorage and don't show again (unless reset)
- [x] Add clipboard support -- *Unfortunately, native selects and native range/checkbox inputs do not work*
- [x] Add style to dropdownmenu title
- [x] Check embedded hint positioning!
- [ ] Documentation:
    + [x] Reference
    + [ ] Long demo with explanations
- [ ] Test as a user, in particular DateInputs with i18n. Screenshot and add to ref.
- [ ] Check installation with:
    + [ ] Webpack 1
    + [ ] Webpack 2
    + [ ] Without Webpack!
- [ ] Basic tests with enzyme? Floats, modals, etc. are bound to be tricky

- [ ] Focus delegation?
- [ ] Include native components for mobile? (e.g. `input type="date"`)
- [ ] Pressing enter on button opening a modal also dismisses the modal!
- [ ] Add alternative style to inputs (no borders, etc.) or make it simple to wrap the provided components and customise
- [ ] Multi-selection ListPicker
- [ ] Drag and drop
- [ ] Include SVG font?
