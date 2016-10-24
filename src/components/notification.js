// @flow

import React                from 'react';
import { merge }            from 'timm';
import {
  flexContainer, flexItem,
  boxWithShadow,
  isDark, darken,
}                           from '../gral/styles';
import { COLORS }           from '../gral/constants';
import hoverable            from '../hocs/hoverable';
import type { HoverablePropsT } from '../hocs/hoverable';
import Icon                 from './icon';

// ==========================================
// Component
// ==========================================
type NotificationTypeT = string; // 'info' | 'success' | 'warn' | 'error';

type PublicPropsT = {
  id?: string,
  type?: NotificationTypeT,
  icon?: string,
  iconSpin?: boolean,
  title?: string,
  msg?: string,
  onClick?: (ev: SyntheticMouseEvent) => void,
  style?: Object,
  noStylePosition?: boolean,
  noStyleShadow?: boolean,
};
type PropsT = PublicPropsT & HoverablePropsT;

type DefaultPropsT = {
  type: NotificationTypeT,
  icon: string,
};

class Notification extends React.PureComponent {
  props: PropsT;
  static defaultProps: DefaultPropsT;

  static defaultProps = {
    type:                   'info',
    icon:                   'exclamation',
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      id,
      icon, iconSpin, title, msg,
      onClick, onHoverStart, onHoverStop,
    } = this.props;
    return (
      <div
        className="giu-notification"
        id={id}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverStop}
        onClick={onClick}
        style={style.outer(this.props)}
      >
        <div style={style.icon}>
          <Icon icon={icon} size="2x" spin={iconSpin} />
        </div>
        <div style={style.body}>
          <div style={style.title}>{title}</div>
          <div style={style.msg}>{msg}</div>
        </div>
      </div>
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: ({
    type,
    hovering,
    onClick,
    style: baseStyle, noStylePosition, noStyleShadow,
  }) => {
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

/* eslint-disable */
const a = <HoverableNotification />;
