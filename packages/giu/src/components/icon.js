// @flow

import React from 'react';
import classnames from 'classnames';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

const SPINNER_ICON = 'circle-o-notch';

// ==========================================
// Declaration
// ==========================================
// -- A wrapper for Font Awesome icons. Props:
// --
// -- START_DOCS
type PublicProps = {
  className?: string,
  id?: string,
  icon: string, // e.g. `ambulance`, `cogs`...
  family?: string, // e.g. `fas`, `far`
  size?: 'lg' | '2x' | '3x' | '4x' | '5x',
  fixedWidth?: boolean,
  spin?: boolean,
  onClick?: (ev: SyntheticMouseEvent<*>) => any,
  disabled?: boolean,
  skipTheme?: boolean,
  style?: Object, // use sparsely (CSS should cover you in most cases!)
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
class Icon extends React.PureComponent<Props> {
  refIcon: any = React.createRef();

  componentDidMount() {
    if (this.props.theme.id === 'mdl' && this.refIcon.current) {
      window.componentHandler.upgradeElement(this.refIcon.current);
    }
  }

  // ==========================================
  render() {
    const isMdl = !this.props.skipTheme && this.props.theme.id === 'mdl';
    const { icon, spin, disabled, size } = this.props;
    if (isMdl && icon === SPINNER_ICON) return this.renderMdlSpinner();
    const family = this.props.family || 'fa';
    return (
      <i
        className={classnames(
          'giu-icon',
          size ? `giu-icon-${size}` : undefined,
          isMdl ? 'material-icons' : `${family} fa-${icon}`,
          {
            'fa-spin': !isMdl && (icon === SPINNER_ICON || spin),
            'giu-icon-disabled': disabled,
            'giu-icon-clickable': !disabled && this.props.onClick,
            'giu-icon-fixed-width': this.props.fixedWidth,
          },
          this.props.className
        )}
        id={this.props.id}
        onClick={disabled ? undefined : this.props.onClick}
        style={this.props.style}
      >
        {isMdl ? icon : null}
      </i>
    );
  }

  renderMdlSpinner() {
    const { size } = this.props;
    return (
      <div
        ref={this.refIcon}
        className={classnames(
          'giu-mdl-spinner mdl-spinner mdl-js-spinner is-active',
          size ? `giu-mdl-spinner-${size}` : undefined,
          this.props.className
        )}
        id={this.props.id}
        style={this.props.style}
      />
    );
  }
}

// ==========================================
const ThemedIcon = (props: PublicProps) => (
  <ThemeContext.Consumer>
    {theme => <Icon {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
// Public
// ==========================================
export default ThemedIcon;
export { SPINNER_ICON };
