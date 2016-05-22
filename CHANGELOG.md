# Changelog

* **Bugfix**: execute `FOCUS` and `BLUR` commands asynchronously, so that owner of Input component doesn't find a `null` ref in a `focus`/`blur` handler

## 0.4.0 (May. 22, 2013)

* **Breaking**: Hints: merge `arrows` and `labels` props into a single `elements` prop.
* **Bugfix**: Hints: upon `hintShow()`, only add a hint screen to the disabled list if not already there.

## 0.3.1 (May. 21, 2013)

* Style override for both SelectNative and SelectCustom is now called the same: `style`.
* Documentation tweaks.

## 0.3.0 (May. 20, 2013)

* First public release.
