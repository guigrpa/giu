// @flow

import React from 'react';
import { omit } from 'timm';
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
  icon: string, // e.g. `ambulance`, `cogs`...
  size?: 'lg' | '2x' | '3x' | '4x' | '5x',
  fixedWidth?: boolean,
  spin?: boolean,
  onClick?: (ev: SyntheticMouseEvent<*>) => any,
  disabled?: boolean,
  style?: Object, // merged with the `i` element style
  skipTheme?: boolean,

  // All other props are passed through to the `i` element
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};

const FILTERED_PROPS = [
  'className',
  'icon',
  'size',
  'fixedWidth',
  'spin',
  'disabled',
  'skipTheme',
  'theme',
];

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
    const otherProps = omit(this.props, FILTERED_PROPS);
    if (disabled) otherProps.onClick = undefined;
    return (
      <i
        className={classnames(
          'giu-icon',
          size ? `giu-icon-${size}` : undefined,
          isMdl ? 'material-icons' : `fa fa-${icon}`,
          {
            'fa-spin': !isMdl && (icon === SPINNER_ICON || spin),
            'giu-icon-disabled': disabled,
            'giu-icon-clickable': !disabled && this.props.onClick,
            'giu-icon-fixed-width': this.props.fixedWidth,
          },
          this.props.className
        )}
        {...otherProps}
      >
        {isMdl ? icon : null}
      </i>
    );
  }

  renderMdlSpinner() {
    const { size } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <div
        ref={this.refIcon}
        className={classnames(
          'giu-mdl-spinner mdl-spinner mdl-js-spinner is-active',
          size ? `giu-mdl-spinner-${size}` : undefined
        )}
        {...otherProps}
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
