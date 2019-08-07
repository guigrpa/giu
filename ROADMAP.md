# Roadmap

* Use plain old CSS stylesheets (customisable!), instead of element CSS:
    * Clean up examples, using CSS
        * Fix zIndex, esp. in modals
        * Fix field widths in datatable headers
        * Review MDL
    * Check Flow errors
    * Remove flexContainer, flexItem if possible

* **Bugs**
    * `[Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive. See <URL>` while mouse-wheeling in a Custom Select
    * Main docs: inline textareas: misaligned
    * Android Select: when item is selected, it retains focus
* Main docs:
    * Explain that analogue picker is not supported on iOS
    * Update accent color explanation
    * Talk about the theme
* Make analogue picker impossible also on Android
* **More tests on Android**
* [ ] Think: how do we revert all fields in a datatable record? (try to update the example page `datatable.js`)
* Use Portals?
* Use Hooks?
* [ ] Update Font Awesome (later)

* [ ] Add copy&paste to RangePicker
* [ ] _Bug_ ListPicker on Windows incorrectly aligns (vertically) items and shortcuts (it _is_ correct in the main doc page)
* [ ] Check DataTable behaviour on iOS, especially dragging

Long-term:

* [ ] Combo input (free-text, typeahead, list)
* [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
* [ ] Focus delegation?
* [ ] Multi-selection ListPicker
* [ ] Drag and drop
