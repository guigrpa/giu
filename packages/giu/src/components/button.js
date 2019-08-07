// @flow

import React from 'react';
import classnames from 'classnames';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

// ==========================================
// Declarations
// ==========================================
// -- An inconspicuous-looking button-in-a-`span`. Props:
// --
// -- START_DOCS
type PublicProps = {
  className?: string,
  id?: string,
  plain?: boolean, // removes most button styles
  children?: any, // button contents (can include `Icon` components, etc.)
  onClick?: (ev: SyntheticMouseEvent<*>) => any,
  onMouseDown?: (ev: SyntheticMouseEvent<*>) => any,
  disabled?: boolean,
  skipTheme?: boolean,

  // Additional props with `mdl` theme
  colored?: boolean,
  primary?: boolean,
  accent?: boolean,
  fab?: boolean,
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};

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
    const { children, disabled } = this.props;
    return (
      <span
        className={classnames(
          'giu-button',
          {
            'giu-button-with-border': !this.props.plain,
            'giu-button-disabled': disabled,
          },
          this.props.className
        )}
        id={this.props.id}
        onClick={disabled ? undefined : this.props.onClick}
        onMouseDown={disabled ? undefined : this.props.onMouseDown}
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
      this.props.className
    );
    return (
      <button
        ref={this.refButton}
        type="button"
        className={className}
        id={this.props.id}
      >
        {this.props.children}
      </button>
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
