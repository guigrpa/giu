// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { omit, merge } from 'timm';
import { COLORS } from '../gral/constants';

// ==========================================
// Component
// ==========================================
// -- An inconspicuous-looking button-in-a-`span`.
// --
// -- START_DOCS
type Props = {
  plain?: boolean, // removes most button styles
  children?: any, // button contents (can include `Icon` components, etc.)
  onClick?: (ev: SyntheticMouseEvent) => any,
  disabled?: boolean,
  style?: Object, // merged with the `span` style
  skipTheme?: boolean,

  // Additional props with `mdl` theme
  colored?: boolean,
  primary?: boolean,
  accent?: boolean,
  fab?: boolean,

  // All other props are passed through to the `span` element
};
// -- END_DOCS

const FILTERED_PROPS = [
  'skipTheme',
  'plain',
  'colored',
  'primary',
  'accent',
  'fab',
  'children',
  'onClick',
  'disabled',
  'style',
];
const FILTERED_PROPS_MDL = [
  'skipTheme',
  'plain',
  'colored',
  'primary',
  'accent',
  'fab',
];

class Button extends React.PureComponent {
  props: Props;
  refButton: ?Object;

  componentDidMount() {
    if (this.context.theme === 'mdl' && this.refButton) {
      window.componentHandler.upgradeElement(this.refButton);
    }
  }

  render() {
    if (!this.props.skipTheme && this.context.theme === 'mdl') {
      return this.renderMdl();
    }
    const { children, disabled, onClick } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <span
        className="giu-button"
        onClick={!disabled && onClick}
        {...otherProps}
        style={style.button(this.props)}
      >
        {children}
      </span>
    );
  }

  renderMdl() {
    let classNames = [
      'giu-button',
      'mdl-button',
      'mdl-js-button',
      'mdl-js-ripple-effect',
    ];
    if (!this.props.plain) classNames.push('mdl-button--raised');
    if (this.props.colored) classNames.push('mdl-button--colored');
    if (this.props.primary) classNames.push('mdl-button--primary');
    if (this.props.accent) classNames.push('mdl-button--accent');
    if (this.props.fab) classNames.push('mdl-button--fab');
    if (this.props.classNames) {
      classNames = classNames.concat(this.props.classNames);
    }
    const otherProps = omit(this.props, FILTERED_PROPS_MDL);
    return (
      <button
        ref={c => {
          this.refButton = c;
        }}
        className={classNames.join(' ')}
        {...otherProps}
      />
    );
  }
}

Button.contextTypes = { theme: PropTypes.any };

// ==========================================
// Styles
// ==========================================
const style = {
  plainBase: {
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  buttonBase: {
    display: 'inline-block',
    cursor: 'pointer',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 5,
    padding: '1px 5px',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  button: ({ plain, disabled, style: baseStyle }) => {
    let out = plain ? style.plainBase : style.buttonBase;
    if (disabled) {
      out = merge(out, {
        color: COLORS.dim,
        cursor: 'default',
        pointerEvents: 'none',
      });
    }
    out = merge(out, baseStyle);
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
export default Button;
