import {
  merge,
  addDefaults,
}                           from 'timm';

function flexItem(flex, style) {
  return merge({
    flex,
    WebkitFlex: flex,
  }, style);
}

// * `flexDirection`: `'row'` | `'column'`
function flexContainer(flexDirection, style) {
  return merge({
    display: 'flex',
    flexDirection,
  }, style);
}

export {
  merge, addDefaults,
  flexItem, flexContainer,
};
