# Roadmap

--
- Add multiple selection for Select (at least for inline!)
- Update docs to indicate that moment is now optional

- Allow radio groups to be set horizontally, and based on spans rather than divs

* **Bugs**
    * iOS: incorrect backdrop positioning (see Compact > Add modal)
    * `[Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive. See <URL>` while mouse-wheeling in a Custom Select
    * Main docs: inline textareas: misaligned
    * Android Select: when item is selected, it retains focus
* Custom range input, allowing for -- well, ranges
* Main docs:
    * Explain that analogue picker is not supported on iOS
    * Update accent color explanation
    * Talk about the theme
* Make analogue picker impossible also on Android
- Combo box (or TextInput with hanging menu with typeahead)
* **More tests on Android**
* [ ] Think: how do we revert all fields in a datatable record? (try to update the example page `datatable.js`)
* Use Portals?
* Use Hooks?

* [ ] Add copy&paste to RangePicker
* [ ] _Bug_ ListPicker on Windows incorrectly aligns (vertically) items and shortcuts (it _is_ correct in the main doc page)

Long-term:

* [ ] Combo input (free-text, typeahead, list)
* [ ] ListPicker: if not focused, it should not scrollintoview! But don't use fFocused (draws a border). Add a new `fParentFocused` and use it for this purpose. Dropdownmenus should stop scrolling also if keyboard shortcuts are used
* [ ] Focus delegation?
* [ ] Multi-selection ListPicker
* [ ] Drag and drop
