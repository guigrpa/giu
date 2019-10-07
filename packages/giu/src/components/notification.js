// @flow

import React from 'react';
import classnames from 'classnames';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';
import type { NotificationPars } from './notificationTypes';
import Icon from './icon';

// ==========================================
// Declarations
// ==========================================
type PublicProps = {
  ...NotificationPars,
  onHoverStart?: (ev: SyntheticEvent<*>) => any,
  onHoverStop?: (ev: SyntheticEvent<*>) => any,
};
type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};
type State = {};

// ==========================================
// Component
// ==========================================
class Notification extends React.PureComponent<Props, State> {
  render() {
    const { theme, type } = this.props;
    const isMdl = theme.id === 'mdl';
    const icon = this.props.icon || (isMdl ? 'announcement' : 'exclamation');
    return (
      <div
        className={classnames(
          `giu-notification giu-notification-${type || 'info'}`,
          {
            'giu-notification-clickable': this.props.onClick,
            'giu-notification-mdl': isMdl,
            'giu-notification-default-position': !this.props.noStylePosition,
            'giu-box-shadow': !this.props.noStyleShadow,
          }
        )}
        id={this.props.id}
        onMouseEnter={this.onHoverStart}
        onMouseLeave={this.onHoverStop}
        onClick={this.props.onClick}
      >
        <div className="giu-notification-icon">
          <Icon
            icon={icon}
            iconFamily={this.props.iconFamily}
            size="2x"
            spin={this.props.iconSpin}
          />
        </div>
        <div className="giu-notification-body">
          <div className="giu-notification-title">{this.props.title}</div>
          <div className="giu-notification-message">{this.props.msg}</div>
        </div>
      </div>
    );
  }

  // ==========================================
  onHoverStart = (ev: SyntheticEvent<*>) => {
    this.props.onHoverStart && this.props.onHoverStart(ev);
  };

  onHoverStop = (ev: SyntheticEvent<*>) => {
    this.props.onHoverStop && this.props.onHoverStop(ev);
  };
}

// ==========================================
const ThemedNotification = (props: PublicProps) => (
  <ThemeContext.Consumer>
    {theme => <Notification {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
// Public
// ==========================================
export default ThemedNotification;
