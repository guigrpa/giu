// @flow

import React                from 'react';
import { merge, omit }      from 'timm';
import { COLORS }           from '../gral/constants';

require('font-awesome/css/font-awesome.css');

// ==========================================
// Component
// ==========================================
// -- A wrapper for Font Awesome icons. Props:
// --
// -- * **icon** *string*: e.g. `ambulance`, `cogs`...
// -- * **size?** *`lg` | `2x` | `3x` | `4x` | `5x`*
// -- * **fixedWidth?** *boolean*
// -- * **spin?** *boolean*
// -- * **disabled?** *boolean*
// -- * **style?** *Object*: merged with the `i` element style
// -- * *All other props are passed through to the `i` element*
type Props = {
  icon: string,
  size?: 'lg' | '2x' | '3x' | '4x' | '5x',
  fixedWidth?: boolean,
  spin?: boolean,
  disabled?: boolean,
  style?: Object,
  // all other props are passed through
};
const FILTERED_PROPS = ['icon', 'size', 'fixedWidth', 'spin', 'disabled', 'style'];

class Icon extends React.PureComponent {
  props: Props;

  render() {
    const { icon, size, fixedWidth, spin, disabled } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    if (disabled) otherProps.onClick = undefined;
    let className = `giu-icon fa fa-${icon}`;
    if (size != null) className += ` fa-${size}`;
    if (fixedWidth) className += ' fa-fw';
    if (icon === 'circle-o-notch' || spin) className += ' fa-spin';
    return <i className={className} {...otherProps} style={style.icon(this.props)} />;
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  icon: ({ disabled, style: base }) => merge({
    cursor: disabled ? undefined : 'pointer',
    color: disabled ? COLORS.dim : undefined,
    letterSpacing: 'normal',
  }, base),
};

// ==========================================
// Public API
// ==========================================
export default Icon;
