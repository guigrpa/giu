# Roadmap

* **Bugs**
    * Android Select: when item is selected, it retains focus
* **More tests on Android**
* [ ] Think: how do we revert all fields in a datatable record? (try to update the example page `datatable.js`)
* Use Portals?
* [ ] Proof-of-concept with `giu-examples` with Next 6 and Babel 7
* [ ] Update Font Awesome (later)
* [ ] Unit tests (with Jest snapshots)

* [ ] Add copy&paste to RangePicker
* [ ] _Bug_ ListPicker on Windows incorrectly aligns (vertically) items and shortcuts (it _is_ correct in the main doc page)
* [ ] Check DataTable behaviour on iOS, especially dragging

Long-term:

* [ ] Combo input (free-text, typeahead, list)
* [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
* [ ] Focus delegation?
* [ ] Multi-selection ListPicker
* [ ] Drag and drop
