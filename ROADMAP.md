# Roadmap

* **Bugs**
  * Inline DateInputs no longer shown correctly on iOS
  * Android Select: when item is selected, it retains focus
* Allow DateInputs with dropdown/inline pickers to work without focusing
* DataTable: remove focus capture on mobile and tablets
* Migrate to the latest React:
    * ONGOING: migrate refs to use the new React.createRef() and forwardRef(). Is it useful for cases in which we are currently using register functions?
    * **Remove deprecated lifecycle hooks**
    * Use Portals?
* [ ] ONGOING: Migrate input HOC to latest Flow
* [ ] Proof-of-concept with `giu-examples` with Next 6 and Babel 7

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
