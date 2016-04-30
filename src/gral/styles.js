import tinycolor            from 'tinycolor2';
import {
  merge,
  addDefaults,
}                           from 'timm';

// * `flexDirection`: `'row'` | `'column'`
const flexContainer = (flexDirection, style) => merge({
  display: 'flex',
  flexDirection,
}, style);

const flexItem = (flex, style) => merge({
  flex,
  WebkitFlex: flex,
}, style);

const boxWithShadow = style => merge({
  backgroundColor: 'white',
  borderRadius: 2,
  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
}, style);

const isDark = color => tinycolor(color).getLuminance() < 0.6;
const isLight = color => !isDark(color);
const darken = (color, percentage) => tinycolor(color).darken(percentage).toHexString();
const lighten = (color, percentage) => tinycolor(color).lighten(percentage).toHexString();

export {
  merge, addDefaults,
  flexContainer, flexItem,
  boxWithShadow,
  isLight, isDark, lighten, darken,
};
