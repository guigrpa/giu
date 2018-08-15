# Roadmap

* **Bugs**
  * When drop-down DatePicker is visible and the input disappears from view (in a transform=0 view), the picker is still shown.
  * Inline DateInputs no longer shown correctly on iOS
  * Android Select: when item is selected, it retains focus
  * DataTable example (one of them): TextArea does not cover full
* Allow DateInputs with dropdown/inline pickers to work without focusing
* DataTable: remove focus capture on mobile and tablets
* Migrate to the latest React:
    * ONGOING: migrate refs to use the new React.createRef() and forwardRef(). Is it useful for cases in which we are currently using register functions?
    * Context: use `accentColor` from context, and remove prop.
    * **Remove deprecated lifecycle hooks**
    * Use Portals?
    * DateInput: use same wrapping approach as for other inputs (ThemedXxxx below Input HOC) and remove DateInputWrapper. Use defaults internally in the render method.
* [ ] ONGOING: Migrate input HOC to latest Flow

* Update Font Awesome (later)

* [ ] Unit tests (with Jest snapshots)

* [ ] Add copy&paste to RangePicker
* [ ] _Bug_ ListPicker on Windows incorrectly aligns (vertically) items and shortcuts (it _is_ correct in the main doc page)
* [ ] Stop scrollers (in ListPickers and DataTables) from scrolling the window! (seems to happen only on Chrome Mac)
* [ ] Safari Mac: DataTables don't scroll smoothly
* [ ] Check DataTable behaviour on iOS, especially dragging

* [ ] Combo input (free-text, typeahead, list)

Long-standing:

* [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
* [ ] Focus delegation?
* [ ] Multi-selection ListPicker
* [ ] Drag and drop
