import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { merge, omit }      from 'timm';
import { COLORS }           from '../gral/constants';
require('font-awesome/css/font-awesome.css');

// ==========================================
// Component
// ==========================================
// -- A wrapper for Font Awesome icons.
// --
// -- * **icon** *string*: e.g. `ambulance`, `cogs`...
// -- * **size** *string(`lg`|`2x`|`3x`|`4x`|`5x`)?*
// -- * **fixedWidth** *boolean?*
// -- * **spin** *boolean?*
// -- * **disabled** *boolean?*
// -- * **style** *object?*: merged with the `i` element style
// -- * *All other props are passed through to the `i` element*
class Icon extends React.Component {
  static propTypes = {
    icon:                   React.PropTypes.string.isRequired,
    size:                   React.PropTypes.string,   // lg, 2x, 3x, 4x, 5x
    fixedWidth:             React.PropTypes.bool,
    spin:                   React.PropTypes.bool,
    disabled:               React.PropTypes.bool,
    style:                  React.PropTypes.object,
    // all other props are passed through
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { icon, size, fixedWidth, spin, disabled } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
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
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Icon.propTypes);

// ==========================================
// Public API
// ==========================================
export default Icon;
