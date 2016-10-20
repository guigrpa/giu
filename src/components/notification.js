import React                from 'react';
import { merge }            from 'timm';
import {
  flexContainer, flexItem,
  boxWithShadow,
  isDark, darken,
}                           from '../gral/styles';
import { COLORS }           from '../gral/constants';
import hoverable            from '../hocs/hoverable';
import Icon                 from './icon';

// ==========================================
// Component
// ==========================================
class Notification extends React.PureComponent {
  static propTypes = {
    id:                     React.PropTypes.string,
    type:                   React.PropTypes.string,
    icon:                   React.PropTypes.string,
    iconSpin:               React.PropTypes.bool,
    title:                  React.PropTypes.string,
    msg:                    React.PropTypes.string,
    onClick:                React.PropTypes.func,
    style:                  React.PropTypes.object,
    noStylePosition:        React.PropTypes.bool,
    noStyleShadow:          React.PropTypes.bool,
    // From Hoverable:
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
  };
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
export default hoverable(Notification);
