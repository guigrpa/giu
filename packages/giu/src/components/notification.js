// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { merge } from 'timm';
import {
  flexContainer,
  flexItem,
  boxWithShadow,
  isDark,
  darken,
} from '../gral/styles';
import { COLORS, FONTS } from '../gral/constants';
import type { NotificationPars } from './notificationTypes';
import Icon from './icon';

// ==========================================
// Declarations
// ==========================================
type Props = {
  ...NotificationPars,
  onHoverStart?: (ev: SyntheticEvent<*>) => any,
  onHoverStop?: (ev: SyntheticEvent<*>) => any,
};
type State = {
  hovering: boolean,
};

// ==========================================
// Component
// ==========================================
class Notification extends React.PureComponent<Props, State> {
  static defaultProps = {};
  state = { hovering: false };

  // ==========================================
  render() {
    const { theme } = this.context;
    const icon =
      this.props.icon || (theme === 'mdl' ? 'announcement' : 'exclamation');
    return (
      <div
        className="giu-notification"
        id={this.props.id}
        onMouseEnter={this.onHoverStart}
        onMouseLeave={this.onHoverStop}
        onClick={this.props.onClick}
        style={style.outer(this.props, this.state, this.context.theme)}
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

Notification.contextTypes = { theme: PropTypes.any };

// ==========================================
const style = {
  outer: (
    { type, onClick, style: baseStyle, noStylePosition, noStyleShadow },
    { hovering },
    theme
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
      fontFamily: theme === 'mdl' ? FONTS.mdl : undefined,
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
export default Notification;
