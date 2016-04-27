import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { merge }            from 'timm';
import tinycolor            from 'tinycolor2';
import {
  flexContainer,
  flexItem,
  boxWithShadow,
}                           from '../gral/styles';
import { bindAll }          from '../gral/helpers';
import hoverable            from '../hocs/hoverable';
import Icon                 from './icon';

// ==========================================
// Component
// ==========================================
class Notification extends React.Component {
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

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {
      id,
      icon, iconSpin, title, msg,
      onClick, onHoverStart, onHoverStop,
      style: baseStyle,
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
    let bgColor;
    switch (type) {
      case 'info':
        bgColor = 'white';
        break;
      case 'success':
        bgColor = '#51a351';
        break;
      case 'warn':
        bgColor = '#f89406';
        break;
      case 'error':
        bgColor = '#bd362f';
        break;
      default:
        bgColor = 'white';
        break;
    }
    if (hovering && onClick) bgColor = tinycolor(bgColor).darken(10).toHexString();
    const fgColor = tinycolor(bgColor).getLuminance() < 0.6 ? 'white' : 'black';
    let style = flexContainer('row', {
      alignItems: 'center',
      WebkitAlignItems: 'center',
      overflow: 'hidden',
      padding: '7px 13px',
      cursor: onClick ? 'pointer' : undefined,
      backgroundColor: bgColor,
      color: fgColor,
    });
    if (!noStyleShadow) style = boxWithShadow(style);
    if (!noStylePosition) style = merge(style, {
      position: 'fixed',
      bottom: 20,
      right: 20,
      maxWidth: 350,
    });
    if (baseStyle) style = merge(style, baseStyle);
    return style;
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
