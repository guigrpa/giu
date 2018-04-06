// @flow

import React from 'react';
import { merge, omit } from 'timm';
import { COLORS } from '../gral/constants';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

const SPINNER_ICON = 'circle-o-notch';

// ==========================================
// Declaration
// ==========================================
// -- A wrapper for Font Awesome icons. Props:
// --
// -- START_DOCS
type Props = {
  icon: string, // e.g. `ambulance`, `cogs`...
  size?: 'lg' | '2x' | '3x' | '4x' | '5x',
  fixedWidth?: boolean,
  spin?: boolean,
  onClick?: (ev: SyntheticMouseEvent<*>) => any,
  disabled?: boolean,
  style?: Object, // merged with the `i` element style
  skipTheme?: boolean,

  // Context
  theme: Theme,

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
  'theme',
];

// ==========================================
// Component
// ==========================================
class Icon extends React.PureComponent<Props> {
  refIcon = React.createRef();

  componentDidMount() {
    if (this.props.theme.id === 'mdl' && this.refIcon.current) {
      window.componentHandler.upgradeElement(this.refIcon.current);
    }
  }

  // ==========================================
  render() {
    if (!this.props.skipTheme && this.props.theme.id === 'mdl') {
      return this.renderMdl();
    }
    const { icon, spin, disabled } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    if (disabled) otherProps.onClick = undefined;
    let className = `giu-icon fa fa-${icon}`;
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
        style={style.icon(this.props)}
      >
        {this.props.icon}
      </i>
    );
  }

  renderMdlSpinner() {
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <div
        ref={this.refIcon}
        className="mdl-spinner mdl-js-spinner is-active"
        {...otherProps}
        style={style.mdlSpinner(this.props)}
      />
    );
  }
}

// ==========================================
const ThemedIcon = props => (
  <ThemeContext.Consumer>
    {theme => <Icon {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
const style = {
  icon: ({ onClick, disabled, size, fixedWidth, style: base }) =>
    merge(
      {
        display: 'inline-block',
        cursor: disabled || !onClick ? undefined : 'pointer',
        color: disabled ? COLORS.dim : undefined,
        fontSize: calcSize(size),
        letterSpacing: 'normal',
        width: fixedWidth ? '1.28571429em' : undefined,
        textAlign: fixedWidth ? 'center' : undefined,
      },
      base
    ),
  mdlSpinner: ({ size, style: base }) => {
    const dim = calcSize(size);
    return merge(
      {
        width: dim,
        height: dim,
      },
      base
    );
  },
};

const calcSize = size => {
  let fontSize = '1em';
  if (size === 'lg') fontSize = '1.33333333em';
  else if (size === '2x') fontSize = '2em';
  else if (size === '3x') fontSize = '3em';
  else if (size === '4x') fontSize = '4em';
  else if (size === '5x') fontSize = '5em';
  return fontSize;
};

// ==========================================
// Public
// ==========================================
export default ThemedIcon;
export { SPINNER_ICON };
