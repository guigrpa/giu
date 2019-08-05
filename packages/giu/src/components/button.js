// @flow

import React from 'react';
import { omit, merge } from 'timm';
import { COLORS } from '../gral/constants';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

// ==========================================
// Declarations
// ==========================================
// -- An inconspicuous-looking button-in-a-`span`. Props:
// --
// -- START_DOCS
type PublicProps = {
  plain?: boolean, // removes most button styles
  children?: any, // button contents (can include `Icon` components, etc.)
  onClick?: (ev: SyntheticMouseEvent<*>) => any,
  disabled?: boolean,
  style?: Object, // merged with the `span` style
  skipTheme?: boolean,

  // Additional props with `mdl` theme
  colored?: boolean,
  primary?: boolean,
  accent?: boolean,
  fab?: boolean,
  classNames?: Array<string>,

  // All other props are passed through to the `span` element
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};

const FILTERED_PROPS_MDL = [
  'skipTheme',
  'plain',
  'colored',
  'primary',
  'accent',
  'fab',
  'classNames',
  'theme',
];
const FILTERED_PROPS = [
  ...FILTERED_PROPS_MDL,
  'children',
  'onClick',
  'disabled',
  'style',
];

// ==========================================
// Component
// ==========================================
class Button extends React.PureComponent<Props> {
  refButton: any = React.createRef();

  componentDidMount() {
    if (this.props.theme.id === 'mdl' && this.refButton.current) {
      window.componentHandler.upgradeElement(this.refButton.current);
    }
  }

  // ==========================================
  render() {
    if (!this.props.skipTheme && this.props.theme.id === 'mdl') {
      return this.renderMdl();
    }
    const { children, disabled, onClick } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <span
        className="giu-button"
        onClick={disabled ? undefined : onClick}
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
        ref={this.refButton}
        type="button"
        className={classNames.join(' ')}
        {...otherProps}
      />
    );
  }
}

// ==========================================
const ThemedButton = (props: PublicProps) => (
  <ThemeContext.Consumer>
    {theme => <Button {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

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
// Public
// ==========================================
export default ThemedButton;
