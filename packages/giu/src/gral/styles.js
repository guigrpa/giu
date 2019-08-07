// @flow

import tinycolor from 'tinycolor2';
import { merge } from 'timm';

/* --
**flexContainer()**

Provides an inline style object for a Flex container.

* **flexDirection** *('row' | 'column') = 'row'*
* **style?** *Object*: custom style (merged with the Flex style)
* **Returns** *Object*: Flex container style
-- */
const flexContainer = (
  flexDirection: 'row' | 'column' = 'row',
  style?: Object
): Object => merge({ display: 'flex', flexDirection }, style);

/* --
**flexItem()**

Provides an inline style object for a Flex item.

* **flex** *string|number*: value for the CSS `flex`/`-webkit-flex` attribute
* **style?** *Object*: custom style (merged with the Flex style)
* **Returns** *Object*: Flex item style
-- */
const flexItem = (flex: string | number, style?: Object): Object =>
  merge({ flex, WebkitFlex: flex }, style);

/* --
**isDark() / isLight()**

Determines whether the provided color is perceived as dark or light.
Can be used to decide whether text on this background color should be light
or dark, respectively, for good readability.

* **color** *string|Object*: parameter describing the color (anything that
  can be processed by [tinycolor](https://github.com/bgrins/TinyColor))
* **Returns** *boolean*: whether the color is dark (light)
-- */
const isDark = (color: string | Object): boolean =>
  tinycolor(color).getLuminance() < 0.6;
const isLight = (color: string | Object): boolean => !isDark(color);

/* --
**darken() / lighten()**

Darkens or lightens a given color by a given percentage.

* **color** *string|Object*: parameter describing the color (anything that
  can be processed by [tinycolor](https://github.com/bgrins/TinyColor))
* **percentage?** *number = 10*: percentage by which the color will be modified
* **Returns** *string*: hex string for the new color, e.g. `#ffaadd`
-- */
const darken = (color: string | Object, percentage?: number = 10): string =>
  tinycolor(color)
    .darken(percentage)
    .toHexString();
const lighten = (color: string | Object, percentage?: number = 10): string =>
  tinycolor(color)
    .lighten(percentage)
    .toHexString();

/* --
**addStylesToPage()**

Creates a new `<style>` element containing the provided CSS styles and
attaches it to the page.

* **styles** *string*: CSS styles to be added to the page
-- */
function addStylesToPage(styles: string) {
  // May be SSR, hence try
  try {
    const el = document.createElement('style');
    el.type = 'text/css';
    el.innerHTML = styles;
    document.getElementsByTagName('head')[0].appendChild(el);
  } catch (err) {
    /* ignore */
  }
}

// ==========================================
// Public
// ==========================================
export {
  flexContainer,
  flexItem,
  isLight,
  isDark,
  lighten,
  darken,
  addStylesToPage,
};
