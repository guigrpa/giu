* DataTable: add specific class names for first, last row.
* DataTable: allow user to specify item(row)-specific class names (`getRowClassNames` prop).

## 0.19.8 (2020-12-9)

* VirtualScroller: fix incorrect calculation of row interval to be rendered.

## 0.19.7 (2019-10-20)

* Modal: fix issue in which modal could not be discarded by clicking on backdrop.

## 0.19.6 (2019-10-7)

## 0.19.5 (2019-10-7)

* Notification: add `iconFamily` prop.

## 0.19.4 (2019-10-5)

* Bundle missing icon, used in notifications.

## 0.19.3 (2019-10-2)

* Manually include all icons we use (not the whole library).

## 0.19.2 (2019-8-17)

* Change input placeholder color.

## 0.19.1 (2019-8-15)

## 0.19.0 (2019-8-15)

* **Breaking**:
    * Migrate to Font Awesome v5 - see the examples for how to define your own icon library (choosing the icons you need from the 1500+ FA library) and using them with Giu.

## 0.18.5 (2019-8-15)

* Icon: add `family` prop.

## 0.18.4 (2019-8-15)

* Input: add `cleanUpOnChange`, `cleanUpOnValidate` props.

## 0.18.3 (2019-8-13)

## 0.18.2 (2019-8-13)

* Fix vertical alignment of cells in datatable rows (baseline).
* Make datatable header easier to customise

## 0.18.1 (2019-8-13)

* Add class name to datatable header and rows.
* Add col class name to datatble header.

## 0.18.0 (2019-8-11)

* **Breaking**:
    * Move 99.99% of styles to **giu.css**, so that they can be fully configured by the user.
    * Remove `style` props.
    * Remove `zIndex` props.
    * Remove **reset.css**, **colorInput.css**.
    * Remove `notifDeleteByName`.
* Add `className`, `id` to all components (for CSS customisation).
* Bump babel.
* Remove tests + related dependencies.

## 0.17.3 (2018-10-11)

* DropDownMenu: add `styleListPicker` prop.

## 0.17.2 (2018-10-2)

* DataTable: don't cancel wheel events when table height is not fixed (i.e. as long as required to show all rows).
* Giu component: fix Flow definition (make `themeId` optional).

## 0.17.1 (2018-9-27)

## 0.17.0 (2018-9-27)

* **Breaking**: some CSS now has to be included manually by the user (removed `styled-jsx` dependency). Include the CSS files from `giu/lib/css/*.css` that you need.
* **Breaking on IE**: removed `unorm` dependency -- breaks `simplifyString()` on IE, since this browser does not include `String.prototype.normalize()`. `unorm` is just too big to be included in Giu for so little added value.

## 0.16.1 (2018-9-14)

* DataTable: **support tables without a fixed height**.

## 0.16.0 (2018-8-19)

* **Breaking**: `cmds` prop are no longer supported; use the imperative API instead (e.g. instead of passing down a `REVERT` command in `cmds`, call `revert()` on the corresponding input). See the docs for more details.
* **Breaking**: We no longer set input `id`/`name` on many components by default (e.g. checkboxes, text/password/number inputs, selects, etc.). If you use input labels or radio groups, make sure you explicitly set the input's `id` prop.
* Remove **deprecated React lifecycle methods**: componentWillReceiveProps(), componentWillUpdate(). This makes giu compatible with React 17 features such as Suspense!
* DataTable, ColorInput, DateInput: **improved behaviour on touch-based devices**.
* Add iOS-specific styles in the Giu component – **if you target the iOS platform, please include this component above all other Giu components**.
* Improve **Flow support for all inputs** (thanks to the new Input HOC).
* Upgrade to Flow v0.78.
* Floats: fix bug in which floats where incorrectly drawn even when having a cropping ancestor (when the cropping ancestor's style was not inlined).
* ColorPicker: fix bug in which the transparency slider did not work in RGB mode.

## 0.16.0-alpha.1 (2018-7-19)

* **Breaking**: Requires React 16.3.0 or higher (uses ref forwarding, new Context API, etc.).
* **Breaking**: Giu component: `theme` prop is now called `themeId`, and it also supports an `accentColor` prop which is passed down to components that previously had their own `accentColor` props. Giu now uses the new React 16.3 Context API extensively. Theming is expected to be expanded in future releases.

## 0.16.0-alpha.0 (2018-3-26)

* **Breaking**: Remove `hoverable`, `Hoverable`. Recommended alternative: simple state in your component, or CSS-in-JS such as styled-jsx.
* **Breaking**: Input HOC has changed so that it *always* wraps inputs in a span. This may break some layouts. Edit the input HOC's style by passing it a `styleOuter` prop (e.g. with `display: block`).
* Select, DropDownMenu, ColorInput: **improved behaviour on touch-based devices**.

## 0.15.1 (2017-12-6)

* Icon: calculate size always, not relying on Font Awesome styles

## 0.15.0 (2017-12-6)

* Add `disabled` prop to choices, so they can be used as titles in lists
* Minor tweaks to HintLabels (linespace)
* Fix invalid props passed to DOM elements in Button and ListPicker (surfaced upgrading to React 16)

## 0.15.0-alpha.4 (2017-11-10)

* **Breaking**: Fonts are no longer included out of the box. Please add to your bundle Gloria Hallelujah, Roboto, Font Awesome, Material Icons and any others you may need.
* **Breaking**: material-design-lite (mdl) library is no longer included out of the box. Please add it to your bundle (see giu-examples/pages/material.js).
* HintScreen: style (including font family) can now be customised (via `HintScreenPars`)
* AnimatedCounter: Fix SSR incompatibility.

## 0.15.0-alpha.3 (2017-10-20)

* HintArrow: add `style` prop.

## 0.15.0-alpha.2 (2017-10-19)

* Icon: no longer show a `pointer` cursor when hovering, when no `onClick` prop is given.
* Checkbox: add support for `mdl` theme, including `skipTheme` prop.
* Export `HoverableProps`, `PublicHoverableProps` flow types.
* Use `Hoverable` wrapper instead of `hoverable` HOC throughout the library. We keep the `hoverable` HOC available for backwards compatibility, at least for the time being.

## 0.15.0-alpha.1 (2017-10-13)

* Add custom formatter to AnimatedCounter.

## 0.15.0-alpha.0 (2017-10-13)

* Add **AnimatedCounter**.
* Add **Hoverable** (a wrapper that will eventually replace the `hoverable` HOC).

## 0.14.1 (2017-8-19)

* Bugfix: fix an issue in which keyboard shortcuts involving the command key were incorrectly processed in OS X.

## 0.14.0 (2017-7-14)

* Complete Flow coverage.
* Reintroduce `delay()`, `waitUntil()` helpers

## 0.13.4 (2017-6-26)

* VerticalManager: sanitise `id` before using it as DOM attribute.

## 0.13.3 (2017-6-13)

* FileInput: add support for `mdl` theme, including `skipTheme` prop (#11).

## 0.13.2 (2017-6-9)

* DataTable: `onChangeManualOrder` prop now receives an object as second argument, including the row that has been dragged (if applicable) as `draggedId`.
* DataTable: add `disableDragging` prop to temporarily disable dragging, even if the manual-sorting column is displayed and even selected.
* Bugfix: FileInput does not work with children (#10).

## 0.13.1 (2017-6-3)

* DataTable: remove hidden rows (due to a filter) from the selection
* Bugfix: VirtualScroller: fix a sporadic issue that surfaced when filtering DataTable rows (incorrect trimming of shown indexes)

## 0.13.0 (2017-5-30)

* DataTable: add `animated` prop (**disabled by default**) to enable the `top` animation on rows. Notes:
    * This has no effect on row animation during drag & drop when ordering manually.
    * This animation works perfectly fine to react to columns that change their height (e.g. due to changing contents or to window resizing/zoom). It is even advisable to enable it, since it helps the user keep track of rows, since they move slowly. However, this animation doesn't work so well in the more general case when the sort criterion changes and a lot of rows shuffle up and down; that's why it has been disabled by default. **Recommendation: use `animated` when you have such columns which may change height dynamically**.

## 0.12.3 (2017-5-29)

* Modal buttons: in MDL, make default buttons 'primary' (instead of 'accent') and other buttons 'plain' (#8).
* DataTable: add optional `emptyIndicator` prop (shown when no rows are displayed). By default, a LargeMessage reading **No items** is shown.
* DataTable: when sort order changes, keep selected item visible.
* Bugfixes:
    * DataTable: refresh float positions when sort order changes

## 0.12.2 (2017-5-22)

* Modal: honor `plain` and `disabled` props on modal buttons (might be useful in the MDL theme) (#6).
* Modal: remove lines above and below the main contents.
* DataTable header: restrict clickable area to the column title only (not the whitespace).
* Select: improve default title styles (ellipsized by default; height is also easier to configure now, with `styleTitle` and `maxWidth`)
* Bugfixes:
    * Spinner: Fix creation after initial page load (#4).
    * Notification: Fix default icon when using MDL (#5).
    * Input HOC: Reset validation errors upon REVERT.

## 0.12.1 (2017-5-15)

* SelectCustom: hide caret when input is disabled.
* DataTable: add `neverFilterIds`, for those rows that MUST be shown, no matter what.
* DataTable: add `customPositions`, to tweak the position of certain rows.

## 0.12.0 (2017-5-11)

* DataTable: select a row when user focuses on an input in that row (e.g. via TAB).
* DataTable: add `isItemSelected` to the props received by all column render functions.
* DataTable: add `onRowDoubleClick` prop
* DataTable: prevent rendering extra rows on selection change (the new callback, `getSpecificRowProps()`, also adds more flexibility for future improvements)
* VirtualScroller: improve responsiveness by drawing X pixels above and below the viewport.
* New HeightMeasurer component: measures the height of its parent and passes it down to its function-as-a-child. **HeightMeasurer MUST BE the direct child of an element with an "extrinsic" height (ie. a height that is not determined by its children, but rather by its parents, e.g. a flex item with `overflow: hidden`)**
* Add `simplifyString()` to public API (useful for simplistic sorting and filtering).
* Bugfix: DataTable: Discard bubbled keyDown events when focus is on an input.

## 0.11.1 (2017-5-10)

* SelectCustom: add `styleTitle` prop (merged with the title span)

## 0.11.0 (2017-5-8)

* Simplify inclusion of Material Design Light: just `import 'giu/lib/mdl';` and wrap your application in `<Giu theme="mdl">`
* Add `skipTheme` prop to TextInput, NumberInput, PasswordInput + DateInput (#3)
* **Bugfixes**:
    - DataTable: Tolerate undefined/null raw values when filtering.
    - DataTable: Remove unwanted logs in the console.
    - DataTable: Refresh floats on scroll and after dragging a row.
    - Select: Fix imperative API (forward validateAndGetValue() to the inner input).
    - DateInput: Fix imperative API (moved to a class-based outer React component).
    - FileInput: Fix incorrect update when selecting a file again, after clearing the input.
* DataTable: add draft docs.
* Examples: DataTable: add "alternative-layout" (not-so-tabular) example.
* Internal: **convert to a monorepo** (with [oao](https://github.com/guigrpa/oao)) with `giu` and `giu-examples`.

## 0.10.2 (March 13, 2017)

* Expose tinycolor in the public API.
* **Bugfix**: honor `onClick` props in notifications.

## 0.10.1 (February 24, 2017)

* [M] Input HOC: multiple bugfixes (esp. concerning validation lifecycles)

## 0.10.0 (February 22, 2017)

* [M] Add partial **Material Design Lite** support
* [m] DatePicker: when clicking on Today button, always change to the current month (even if today is already selected)
* Internal:
    - Use Typefaces to include fonts as a package

## 0.9.2 (December 15, 2016)

* Remove external-facing Flow types for the time being

## 0.9.1 (December 12, 2016)

* *Internal*: publish source in order to support always-up-to-date Flow types, using flow-copy-source

## 0.9.0 (December 1, 2016)

* [M] Makes **moment an optional dependency**. Only include it in your project if you use DateInput or the date utilities
* [M] **Bugfix**: Redux stores (Notifications, Hints, Floats) are now lazily initialised
* [m] Pass through disabled property to native checkbox
* [m] Backdrop: add small transition when it appears
- [M] Ongoing internal work adding Flow types

## 0.8.1 (September 21, 2016)

* [m] **Bugfix**: Hints: fix incorrect initialisation
* [m] Remove legacy peer dependency: react-addons-pure-render-mixin

## 0.8.0 (September 21, 2016)

* [M] **Add DataTable component**
* [M] **Add VirtualScroller component**
* [M] **Add language support to components with `items` props (Select, RadioGroup, DropDownMenu)**. Components now refresh when language changes, and item `label` members can now be functions.
* [m] Protect JSON-based inputs (SelectNative, SelectCustom, RadioGroup) against invalid contents pasted in. They no longer throw and put themselves in an unstable state, but rather show a warning in the console and reset their contents.
* [m] Compact demo: split in multiple sub-demos (it was becoming too big!)
* [m] ColorInput: tweak vertical alignment (hopefully fix it once and for all!)
* [m] **Bugfix**: Textarea: check for null refs before accessing offsetHeight (this could interfere with unit tests with a fake/mocked DOM)

## 0.7.1 (July 29, 2016)

* [m] Modal: allow customising button style.

## 0.7.0 (July 28, 2016)

* [M] Bump deps, including React (to 15.2.x)
* [m] ColorInput: initial values can be in any format supported by [tinycolor2](https://github.com/bgrins/TinyColor). Note that v1.4.1 of this library is aligned to CSS 4 color specification RRGGBBAA (previously AARRGGBB). In any case, the values provided by this input are in the browser-ready `rgba(r, g, b, a)` format
* [m] Input HOC: allow simultaneously setting a new value prop and reverting to it
* **Bugfix**: Prevent bubbling `click` events from blurring components within Modals.
* **Bugfix**: Fix ColorInput's vertical positioning when inline.

## 0.6.0 (June 8, 2016)

* [M] **Add iOS support**, with some limitations, most notably:
    - When the user focuses on an input *inside a Modal*, the browser scrolls to the top of the page. This is a known issue with Mobile Safari that appeared years ago (!!).
    - The `FOCUS` and `BLUR` commands on Inputs do not work correctly in Mobile Safari. Apparently `focus()` can only be called from within a `click` event handler, but I couldn't find the way to trigger the `click` handler programmatically.
    - *Any suggestion on how to solve these issues is welcome!*
* [M] DateInput: when the `lang` prop is used, the component changes its internal value whenever `lang` changes, to reflect the new applicable format.
* LargeMessage: allow style customisation.
* Bugfixes:
    - SelectCustom: fix bug where keyboard shortcuts were unregistered when props changed.
    - SelectCustom: fix value provided to the `onClickItem` handler.
    - ListPicker: don't highlight the Select's current value when hovering a separator.
    - HOCs: fix `displayName`.

## 0.5.0 (May. 25, 2016)

* [M] **Add SSR support**:
    - Prevent access to `document` or `window` at the server side, at least in unsafe parts (not event handlers, module initialisation, etc.)
    - Initialise Textarea input's height to a very low value, so that it does not render in SSR very large and then shrink in the browser

## 0.4.2 (May. 25, 2016)

* **Bugfix**: Reposition floats for inputs in modals.

## 0.4.1 (May. 22, 2016)

* **Bugfix**: Execute `FOCUS` and `BLUR` commands asynchronously, so that owner of Input component doesn't find a `null` ref in a `focus`/`blur` handler.
* **Bugfix**: Correct validation error colors (compare against last validated value).
* **Bugfix**: Correct repositioning of error message floats when anchor resizes.
* **Bugfix**: Correct pass/stop behaviour for ESC/RETURN keys within modals.
* Add `stopPropagation()` helper function.

## 0.4.0 (May. 22, 2016)

* **Breaking**: Hints: merge `arrows` and `labels` props into a single `elements` prop.
* **Bugfix**: Hints: upon `hintShow()`, only add a hint screen to the disabled list if not already there.

## 0.3.1 (May. 21, 2016)

* Style override for both SelectNative and SelectCustom is now called the same: `style`.
* Documentation tweaks.

## 0.3.0 (May. 20, 2016)

* First public release.
