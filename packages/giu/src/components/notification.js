// @flow

import React from 'react';
import { merge } from 'timm';
import {
  flexContainer,
  flexItem,
  boxWithShadow,
  isDark,
  darken,
} from '../gral/styles';
import { COLORS, FONTS } from '../gral/constants';
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
type State = {
  hovering: boolean,
};

// ==========================================
// Component
// ==========================================
class Notification extends React.PureComponent<Props, State> {
  state = { hovering: false };

  // ==========================================
  render() {
    const { theme } = this.props;
    const icon =
      this.props.icon || (theme.id === 'mdl' ? 'announcement' : 'exclamation');
    return (
      <div
        className="giu-notification"
        id={this.props.id}
        onMouseEnter={this.onHoverStart}
        onMouseLeave={this.onHoverStop}
        onClick={this.props.onClick}
        style={style.outer(this.props, this.state)}
      >
        <div style={style.icon}>
          <Icon icon={icon} size="2x" spin={this.props.iconSpin} />
        </div>
        <div style={style.body}>
          <div style={style.title}>{this.props.title}</div>
          <div style={style.msg}>{this.props.msg}</div>
        </div>
      </div>
    );
  }

  // ==========================================
  onHoverStart = (ev: SyntheticEvent<*>) => {
    this.setState({ hovering: true });
    this.props.onHoverStart && this.props.onHoverStart(ev);
  };

  onHoverStop = (ev: SyntheticEvent<*>) => {
    this.setState({ hovering: false });
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
const style = {
  outer: (
    { type, onClick, style: baseStyle, noStylePosition, noStyleShadow, theme },
    { hovering }
  ) => {
    const finalType = type || 'info';
    let bgColor = COLORS.notifs[finalType] || COLORS.notifs.info;
    if (hovering && onClick) bgColor = darken(bgColor, 10);
    const fgColor = COLORS[isDark(bgColor) ? 'lightText' : 'darkText'];
    let out = flexContainer('row', {
      alignItems: 'center',
      WebkitAlignItems: 'center',
      overflow: 'hidden',
      padding: '7px 13px',
      cursor: onClick ? 'pointer' : undefined,
      backgroundColor: bgColor,
      color: fgColor,
      fontFamily: theme.id === 'mdl' ? FONTS.mdl : undefined,
    });
    if (!noStyleShadow) out = boxWithShadow(out);
    if (!noStylePosition) {
      out = merge(out, {
        position: 'fixed',
        bottom: 20,
        right: 20,
        maxWidth: 350,
      });
    }
    if (baseStyle) out = merge(out, baseStyle);
    return out;
  },
  icon: flexItem('0 1 auto', { paddingRight: 20 }),
  body: flexItem('1 1 50px'),
  title: { fontWeight: 'bold' },
  msg: {
    wordWrap: 'break-word',
    fontWeight: 'normal',
  },
};

// ==========================================
// Public
// ==========================================
export default ThemedNotification;
