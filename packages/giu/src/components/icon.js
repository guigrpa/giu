// @flow

import React from 'react';
import classnames from 'classnames';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

faConfig.autoAddCss = false;

const SPINNER_ICON = 'circle-notch';

// ==========================================
// Declaration
// ==========================================
// -- A wrapper for Font Awesome icons. Props:
// --
// -- START_DOCS
type PublicProps = {
  className?: string,
  id?: string,
  icon: string | [string, string], // e.g. `ambulance`, `cogs`...
  family?: string, // e.g. `fas`, `far`
  size?: 'lg' | '2x' | '3x' | '4x' | '5x',
  fixedWidth?: boolean,
  spin?: boolean,
  pulse?: boolean,
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
    if (!this.props.skipTheme && this.props.theme.id === 'mdl') {
      return icon === SPINNER_ICON ? this.renderMdlSpinner() : this.renderMdl();
    }
    const { icon, disabled } = this.props;
    const family = this.props.family || 'fa';
    return (
      <FontAwesomeIcon
        className={classnames(
          'giu-icon',
          {
            'giu-icon-disabled': disabled,
            'giu-icon-clickable': !disabled && this.props.onClick,
          },
          this.props.className
        )}
        id={this.props.id}
        icon={family ? [family, icon] : icon}
        size={this.props.size}
        onClick={disabled ? undefined : this.props.onClick}
        fixedWidth={this.props.fixedWidth}
        spin={icon === SPINNER_ICON || this.props.spin}
        pulse={this.props.pulse}
        style={this.props.style}
      />
    );
  }

  renderMdl() {
    const { icon, disabled, size } = this.props;
    return (
      <i
        className={classnames(
          'giu-icon',
          size ? `giu-icon-${size}` : undefined,
          'material-icons',
          {
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
        {icon}
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
