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
import hoverable from '../hocs/hoverable';
/* eslint-disable no-unused-vars */
import type { HoverableProps } from '../hocs/hoverable';
import type { NotificationType, NotificationPars } from './notificationTypes';
/* eslint-enable no-unused-vars */
import Icon from './icon';

// ==========================================
// Component
// ==========================================
type Props = {
  ...$Exact<NotificationPars>,
  ...$Exact<HoverableProps>,
  type: NotificationType,
};

class Notification extends React.PureComponent {
  props: Props;

  static defaultProps = {
    type: ('info': NotificationType),
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { theme } = this.context;
    const icon =
      this.props.icon || (theme === 'mdl' ? 'announcement' : 'exclamation');
    return (
      <div
        className="giu-notification"
        id={this.props.id}
        onMouseEnter={this.props.onHoverStart}
        onMouseLeave={this.props.onHoverStop}
        onClick={this.props.onClick}
        style={style.outer(this.props, this.context.theme)}
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
}

Notification.contextTypes = { theme: React.PropTypes.any };

// ==========================================
// Styles
// ==========================================
const style = {
  outer: (
    {
      type,
      hovering,
      onClick,
      style: baseStyle,
      noStylePosition,
      noStyleShadow,
    },
    theme
  ) => {
    let bgColor = COLORS.notifs[type] || COLORS.notifs.info;
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
  icon: flexItem('0 1 auto', {
    paddingRight: 20,
  }),
  body: flexItem('1 1 50px'),
  title: {
    fontWeight: 'bold',
  },
  msg: {
    wordWrap: 'break-word',
    fontWeight: 'normal',
  },
};

// ==========================================
// Public API
// ==========================================
const HoverableNotification = hoverable(Notification);
export default HoverableNotification;
