# Changelog

* LargeMessage: allow style customisation.
* **Bugfix**: SelectCustom: fix value provided to the `onClickItem` handler.

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
