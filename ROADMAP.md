# Roadmap

* Use plain old CSS stylesheets (customisable!), instead of element CSS:
    * Input HOC:
      - review all input trees
    * Remove FILTERED_PROPS, use explicit prop passing
    * id prop (especially floats: inherit from owner)
    * z-index
    * Remove boxWithShadow and other items from gral/styles
    * Review MDL
    * Remove HIDDEN_FOCUS_CAPTURE, HIDDEN_FOCUS_CAPTURE_IOS once they're no longer used
    * Clean up examples, using CSS
    * Make `id` prop mandatory in some components.
    * Fix zIndex in examples!!
    * Fix styleOuter in examples
    * Remove contents from gral/styles that is no longer needed and not public

* **Bugs**
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
