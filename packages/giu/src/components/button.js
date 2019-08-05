// @flow

import React from 'react';
import classnames from 'classnames';
import { omit } from 'timm';
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
        className={classnames('giu-button', {
          'giu-button-with-border': !this.props.plain,
        })}
        onClick={disabled ? undefined : onClick}
        {...otherProps}
      >
        {children}
      </span>
    );
  }

  renderMdl() {
    const className = classnames(
      'giu-button',
      'mdl-button',
      'mdl-js-button',
      'mdl-js-ripple-effect',
      {
        'mdl-button--raised': !this.props.plain,
        'mdl-button--colored': this.props.colored,
        'mdl-button--primary': this.props.primary,
        'mdl-button--accent': this.props.accent,
        'mdl-button--fab': this.props.fab,
      },
      ...(this.props.classNames || [])
    );
    const otherProps = omit(this.props, FILTERED_PROPS_MDL);
    return (
      <button
        ref={this.refButton}
        type="button"
        className={className}
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
// Public
// ==========================================
export default ThemedButton;
