import tinycolor            from 'tinycolor2';
import { merge }            from 'timm';
import { COLORS }           from '../gral/constants';

// -- **flexContainer()**
// --
// -- Provides an inline style object for a Flex container.
// --
// -- * **flexDirection** *string(`row` | `column`)? = `row`*
// -- * **style** *object?*: custom style (merged with the Flex style)
// -- * **Returns** *object*: Flex container style
const flexContainer = (flexDirection = 'row', style) => merge({
  display: 'flex',
  flexDirection,
}, style);

// -- **flexItem()**
// --
// -- Provides an inline style object for a Flex item.
// --
// -- * **flex** *string|number*: value for the CSS `flex`/`-webkit-flex` attribute
// -- * **style** *object?*: custom style (merged with the Flex style)
// -- * **Returns** *object*: Flex item style
const flexItem = (flex, style) => merge({
  flex,
  WebkitFlex: flex,
}, style);

// -- **boxWithShadow()**
// --
// -- Provides an inline style object for a slightly rounded shadowed box.
// --
// -- * **style** *object?*: custom style (merged with the base style)
// -- * **Returns** *object*: inline style
const boxWithShadow = style => merge({
  backgroundColor: 'white',
  borderRadius: 2,
  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
}, style);

// -- **isDark() / isLight()**
// --
// -- Determines whether the provided color is perceived as dark or light.
// -- Can be used to decide whether text on this background color should be light
// -- or dark, respectively, for good readability.
// --
// -- * **color** *string/Color*: parameter describing the color (anything that
// --   can be processed by [tinycolor](https://github.com/bgrins/TinyColor))
// -- * **Returns** *bool*: whether the color is dark (light)
const isDark = color => tinycolor(color).getLuminance() < 0.6;
const isLight = color => !isDark(color);

// -- **darken() / lighten()**
// --
// -- Darkens or lightens a given color by a given percentage.
// --
// -- * **color** *string/Color*: parameter describing the color (anything that
// --   can be processed by [tinycolor](https://github.com/bgrins/TinyColor))
// -- * **percentage** *number? = 10*: percentage by which the color will be modified
// -- * **Returns** *string*: hex string for the new color, e.g. `#ffaadd`
const darken = (color, percentage = 10) => tinycolor(color).darken(percentage).toHexString();
const lighten = (color, percentage = 10) => tinycolor(color).lighten(percentage).toHexString();

const inputReset = style => merge({
  backgroundColor: COLORS.bgInput,
  border: `1px solid ${COLORS.line}`,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  color: 'inherit',
}, style);

const INPUT_DISABLED = {
  border: `1px solid ${COLORS.lineDim}`,
  backgroundColor: 'transparent',
  cursor: 'default',
  pointerEvents: 'none',
};

const HIDDEN_FOCUS_CAPTURE = {
  position: 'fixed',
  opacity: 0,
  width: 0,
  height: 0,
  padding: 0,
  cursor: 'default',
  pointerEvents: 'none',
  zIndex: -80,
  top: 8,
  left: 8,
};

const HIDDEN_FOCUS_CAPTURE_IOS = merge(HIDDEN_FOCUS_CAPTURE, {
  position: 'absolute',
  top: 0,
  left: 0,
});

const GLOW = {
  boxShadow: '0 0 5px rgba(81, 203, 238, 1)',
  border: '1px solid rgba(81, 203, 238, 1)',
};

// -- **addStylesToPage()**
// --
// -- Creates a new `<style>` element containing the provided CSS styles and
// -- attaches it to the page.
// --
// -- * **styles** *string*: CSS styles to be added to the page
function addStylesToPage(styles) {
  // May be SSR, hence try
  try {
    const el = document.createElement('style');
    el.type = 'text/css';
    el.innerHTML = styles;
    document.getElementsByTagName('head')[0].appendChild(el);
  } catch (err) { /* ignore */ }
}

export {
  flexContainer, flexItem,
  boxWithShadow,
  isLight, isDark, lighten, darken,
  HIDDEN_FOCUS_CAPTURE,
  HIDDEN_FOCUS_CAPTURE_IOS,
  GLOW,
  inputReset, INPUT_DISABLED,
  addStylesToPage,
};
