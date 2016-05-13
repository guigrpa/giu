import tinycolor            from 'tinycolor2';
import {
  merge,
  addDefaults,
}                           from 'timm';
import { COLORS }           from '../gral/constants';

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
  width: 10,
  height: 10,
  padding: 0,
  cursor: 'default',
  pointerEvents: 'none',
  zIndex: -80,
  top: 8,
  left: 8,
};

const GLOW = {
  boxShadow: '0 0 5px rgba(81, 203, 238, 1)',
  border: '1px solid rgba(81, 203, 238, 1)',
};

export {
  merge, addDefaults,
  flexContainer, flexItem,
  boxWithShadow,
  isLight, isDark, lighten, darken,
  HIDDEN_FOCUS_CAPTURE,
  GLOW,
  inputReset, INPUT_DISABLED,
};
