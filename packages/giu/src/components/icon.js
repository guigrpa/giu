// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { merge, omit } from 'timm';
import { COLORS } from '../gral/constants';

require('font-awesome/css/font-awesome.css');

const SPINNER_ICON = 'circle-o-notch';

// ==========================================
// Component
// ==========================================
// -- A wrapper for Font Awesome icons. Props:
// --
// -- START_DOCS
type Props = {
  icon: string, // e.g. `ambulance`, `cogs`...
  size?: 'lg' | '2x' | '3x' | '4x' | '5x',
  fixedWidth?: boolean,
  spin?: boolean,
  onClick?: (ev: SyntheticMouseEvent) => any,
  disabled?: boolean,
  style?: Object, // merged with the `i` element style
  skipTheme?: boolean,
  // All other props are passed through to the `i` element
};
// -- END_DOCS

const FILTERED_PROPS = [
  'icon',
  'size',
  'fixedWidth',
  'spin',
  'disabled',
  'style',
  'skipTheme',
];

class Icon extends React.PureComponent {
  props: Props;
  refIcon: ?Object;

  componentDidMount() {
    if (this.context.theme === 'mdl' && this.refIcon) {
      window.componentHandler.upgradeElement(this.refIcon);
    }
  }

  render() {
    if (!this.props.skipTheme && this.context.theme === 'mdl') {
      return this.renderMdl();
    }
    const { icon, size, fixedWidth, spin, disabled } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    if (disabled) otherProps.onClick = undefined;
    let className = `giu-icon fa fa-${icon}`;
    if (size != null) className += ` fa-${size}`;
    if (fixedWidth) className += ' fa-fw';
    if (icon === SPINNER_ICON || spin) className += ' fa-spin';
    return (
      <i className={className} {...otherProps} style={style.icon(this.props)} />
    );
  }

  renderMdl() {
    if (this.props.icon === SPINNER_ICON) return this.renderMdlSpinner();
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <i
        className="giu-icon material-icons"
        {...otherProps}
        style={style.icon(this.props, 'mdl')}
      >
        {this.props.icon}
      </i>
    );
  }

  renderMdlSpinner() {
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <div
        ref={c => {
          this.refIcon = c;
        }}
        className="mdl-spinner mdl-js-spinner is-active"
        {...otherProps}
        style={style.mdlSpinner(this.props)}
      />
    );
  }
}

Icon.contextTypes = { theme: PropTypes.any };

// ==========================================
// Styles
// ==========================================
const style = {
  icon: ({ onClick, disabled, size, style: base }, theme) =>
    merge(
      {
        cursor: disabled || !onClick ? undefined : 'pointer',
        color: disabled ? COLORS.dim : undefined,
        fontSize: theme === 'mdl' ? style.mdlSize(size) : undefined,
        letterSpacing: 'normal',
      },
      base
    ),
  mdlSpinner: ({ size, style: base }) => {
    const dim = style.mdlSize(size);
    return merge(
      {
        width: dim,
        height: dim,
      },
      base
    );
  },
  mdlSize: size => {
    let fontSize = '1em';
    if (size === 'lg') fontSize = '1.33333333em';
    else if (size === '2x') fontSize = '2em';
    else if (size === '3x') fontSize = '3em';
    else if (size === '4x') fontSize = '4em';
    else if (size === '5x') fontSize = '5em';
    return fontSize;
  },
};

// ==========================================
// Public API
// ==========================================
export default Icon;
export { SPINNER_ICON };
