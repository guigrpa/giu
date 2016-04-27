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

export {
  merge, addDefaults,
  flexContainer, flexItem,
  boxWithShadow,
};
