import React                from 'react';
import {
  merge,
  set as timmSet,
}                           from 'timm';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import { startOfToday }     from '../gral/dates';
import { COLORS, KEYS }     from '../gral/constants';
import hoverable            from '../hocs/hoverable';

const PI = Math.PI;
const PI2 = Math.PI * 2;
const cos = Math.cos;
const sin = Math.sin;
const atan2 = Math.atan2;
const round = Math.round;
const sign = Math.sign || (o => {
  if (o > 0) return 1;
  if (o < 0) return -1;
  return 0;
});
const DEFAULT_SIZE = 120;
const UP_DOWN_STEP = 5;       // [min]
const HAND_NAMES = ['seconds', 'minutes', 'hours'];
const positiveRemainder = (val, q) => (val + q) % q;
const correctLeaps = (prevVal, nextVal, steps) => {
  let out = nextVal;
  while (Math.abs(out - prevVal) > steps / 2) {
    out -= sign(out - prevVal) * steps;
  }
  return out;
};

// ==========================================
// Component
// ==========================================
class TimePickerAnalog extends React.PureComponent {
  static propTypes = {
    disabled:               React.PropTypes.bool.isRequired,
    curValue:               React.PropTypes.object,  // moment object, not start of day
    onChange:               React.PropTypes.func.isRequired,
    seconds:                React.PropTypes.bool,
    utc:                    React.PropTypes.bool.isRequired,
    keyDown:                React.PropTypes.object,
    accentColor:            React.PropTypes.string.isRequired,
    size:                   React.PropTypes.number,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    size:                   DEFAULT_SIZE,
  };

  constructor(props) {
    super(props);
    this.state = {
      dragging: null,
      hint: null,
    };
    bindAll(this, [
      'onClickBackground',
      'onMouseLeaveBackground',
      'onMouseMoveBackground',
      'onMouseDownHand',
      'onMouseMoveHand',
      'onMouseUpHand',
      'onClickAmPm',
    ]);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMoveHand);
    window.removeEventListener('mouseup', this.onMouseUpHand);
  }

  componentWillReceiveProps(nextProps) {
    const { keyDown } = nextProps;
    if (keyDown && keyDown !== this.props.keyDown) this.doKeyDown(keyDown);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, size } = this.props;
    if (curValue != null) {
      this.hours = curValue.hours();
      this.minutes = curValue.minutes();
      this.seconds = curValue.seconds();
    } else {
      this.hours = this.minutes = this.seconds = null;
    }
    this.radius = size / 2 - 2;
    this.translate = size / 2;
    return (
      <div className="giu-time-picker-analog" style={style.outer}>
        <svg ref={c => { this.refSvg = c; }}
          onClick={this.onClickBackground}
          onMouseMove={this.onMouseMoveBackground}
          onMouseLeave={this.onMouseLeaveBackground}
          style={style.svg(size)}
        >
          <g transform={`translate(${this.translate},${this.translate})`}>
            <WatchFace radius={this.radius} />
            {this.renderHands()}
            {this.renderCenter()}
          </g>
        </svg>
        {this.renderAmPm()}
      </div>
    );
  }

  renderWatch() {
    const r = this.radius;
    const ticks = [];
    let idx = 0;
    let phi = 0;
    while (phi < PI2) {
      const props = { x1: r * cos(phi), y1: r * sin(phi) };
      let factor;
      if (idx % 5) {
        props.style = style.tickMinor;
        factor = 0.97;
      } else {
        props.style = style.tickMajor;
        factor = 0.93;
      }
      props.x2 = props.x1 * factor;
      props.y2 = props.y1 * factor;
      ticks.push(<line key={`tick-${phi}`} {...props} />);
      idx++;
      phi += PI2 / 60;
    }
    return <g>{ticks}</g>;
  }

  renderHands() {
    const {
      curValue, seconds,
      hovering,
    } = this.props;
    const { dragging } = this.state;
    const hands = [];
    HAND_NAMES.forEach(name => {
      if (name === 'seconds' && !seconds) return;
      if (curValue) {
        const fHovered = hovering === name && !dragging;
        const fDragged = dragging === name;
        const val = this.getNormalisedUnits(name);
        hands.push(this.renderHand(name, val, fHovered, fDragged, false));
        hands.push(this.renderHand(name, val, fHovered, fDragged, true));
      } else if (this.state.hint != null) {
        const val = this.getNormalisedUnits(name, { fHint: true });
        hands.push(this.renderHand(name, val, false, false, false, true));
      }
    });
    return <g>{hands}</g>;
  }

  renderHand(name, val, fHovered, fDragged, fDragHandle, fHint) {
    const phi = PI2 * val - (PI / 2);
    const r = name === 'hours' ? 0.6 * this.radius : 0.83 * this.radius;
    const props = {
      id: name,
      x1: 0,
      y1: 0,
      x2: r * cos(phi),
      y2: r * sin(phi),
    };
    let out;
    if (!fDragHandle) {
      out = (
        <line key={`hand-${name}`}
          {...props}
          style={style.hand(name, fHovered, fDragged, fHint, this.props)}
        />
      );
    } else {
      // Wider targets for dragging
      const { onHoverStart, onHoverStop } = this.props;
      out = (
        <line key={`hand-transparent-${name}`}
          id={name}
          {...props}
          style={style.transparentHand(this.props)}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverStop}
          onMouseDown={this.onMouseDownHand}
        />
      );
    }
    return out;
  }

  renderCenter() {
    return (
      <circle
        cx={0} cy={0}
        r={this.radius * 0.06}
        style={style.centerCircle}
      />
    );
  }

  renderAmPm() {
    if (this.hours == null) return null;
    return (
      <div
        onClick={this.onClickAmPm}
        style={style.amPm(this.props)}
      >
        {this.hours >= 12 ? 'PM' : 'AM'}
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onMouseLeaveBackground() {
    if (!this.state.hint) return;
    this.setState({ hint: null });
  }

  onMouseMoveBackground(ev) {
    if (this.props.curValue) return;
    const phi = this.getPhiFromMousePosition(ev);
    if (phi == null) return;
    const hours = positiveRemainder(
      round((phi + PI / 2) / (PI2 / 12)),
      12);
    this.setState({
      hint: { hours, minutes: 0, seconds: 0 },
    });
  }

  onClickBackground(ev) {
    if (this.props.disabled || this.hours != null) return;
    const phi = this.getPhiFromMousePosition(ev);
    if (phi == null) return;
    let hours = positiveRemainder(
      round((phi + PI / 2) / (PI2 / 12)),
      12);
    // Assume the user wants hours >= 7 by default
    if (hours < 7) hours += 12;
    this.hours = this.minutes = this.seconds = 0;
    this.setUnits(ev, hours, 'hours');
  }

  onMouseDownHand(ev) {
    cancelEvent(ev);
    if (this.props.disabled) return;
    const name = ev.target.id;
    this.setState({ dragging: name });
    this.dragUnits = name;
    this.dragSteps = name === 'hours' ? 12 : 60;
    this.dragDeltaPhi = (this.getUnits(name) % 1) * PI2 / this.dragSteps;
    window.addEventListener('mousemove', this.onMouseMoveHand);
    window.addEventListener('mouseup', this.onMouseUpHand);
  }

  onMouseMoveHand(ev) {
    cancelEvent(ev);
    const { dragUnits, dragDeltaPhi, dragSteps } = this;
    const phi = this.getPhiFromMousePosition(ev) - dragDeltaPhi;
    if (phi == null) return;
    let val = positiveRemainder(
      round((phi + PI / 2) / (PI2 / dragSteps)),
      dragSteps);
    const curVal = this[dragUnits];
    val = correctLeaps(curVal, val, dragSteps);
    if (val !== curVal) this.setUnits(ev, val, dragUnits);
  }

  onMouseUpHand(ev) {
    cancelEvent(ev);
    window.removeEventListener('mousemove', this.onMouseMoveHand);
    window.removeEventListener('mouseup', this.onMouseUpHand);
    this.setState({ dragging: null });
  }

  onClickAmPm(ev) {
    const nextHours = this.hours >= 12 ? this.hours - 12 : this.hours + 12;
    this.setUnits(ev, nextHours, 'hours');
  }

  doKeyDown({ which, shiftKey, ctrlKey, altKey, metaKey }) {
    if (shiftKey || ctrlKey || altKey || metaKey) return;
    switch (which) {
      case KEYS.pageDown: this.changeTimeByMins(+60);           break;
      case KEYS.pageUp:   this.changeTimeByMins(-60);           break;
      case KEYS.down:
      case KEYS.right:
        this.changeTimeByMins(+UP_DOWN_STEP);
        break;
      case KEYS.up:
      case KEYS.left:
        this.changeTimeByMins(-UP_DOWN_STEP);
        break;
      case KEYS.del:
      case KEYS.backspace:
        this.props.onChange(null, null);
        break;
      default: break;
    }
  }

  // ==========================================
  // Helpers
  // ==========================================
  changeTimeByMins(mins) {
    if (this.props.curValue == null) {
      this.setUnits(null, 12, 'hours');
      return;
    }
    this.setUnits(null, this.minutes + mins, 'minutes');
  }

  getNormalisedUnits(units, options) {
    let val = this.getUnits(units, options);
    val /= units === 'hours' ? 12 : 60;
    return val;
  }

  getUnits(units, { fHint } = {}) {
    let out;
    const base = fHint ? this.state.hint : this;
    switch (units) {
      case 'hours':
        out = base.hours + base.minutes / 60 + base.seconds / 3600;
        out = positiveRemainder(out, 12);
        break;
      case 'minutes' :
        out = base.minutes + base.seconds / 60;
        out = positiveRemainder(out, 60);
        break;
      case 'seconds' :
        out = positiveRemainder(base.seconds, 60);
        break;
      default:
        break;
    }
    return out;
  }

  setUnits(ev, val, units) {
    const { curValue, utc, onChange } = this.props;
    const nextValue = curValue != null ? curValue.clone() : startOfToday(utc);
    nextValue[units](val);
    onChange(ev, nextValue);
  }

  getPhiFromMousePosition(ev) {
    const refSvg = this.refSvg;
    if (!refSvg) return null;
    const bcr = refSvg.getBoundingClientRect();
    const x = ev.clientX - bcr.left - refSvg.clientLeft - this.translate;
    const y = ev.clientY - bcr.top  - refSvg.clientTop  - this.translate;
    let phi = atan2(y, x);
    if (phi < 0) phi += PI2;
    return phi;
  }
}

// ==========================================
// WatchFace
// ==========================================
/* eslint-disable react/no-multi-comp */
class WatchFace extends React.Component {
  static propTypes = {
    radius:                 React.PropTypes.number.isRequired,
  };

  render() {
    const { radius: r } = this.props;
    const ticks = [];
    let idx = 0;
    let phi = 0;
    while (phi < PI2) {
      const props = { x1: r * cos(phi), y1: r * sin(phi) };
      let factor;
      if (idx % 5) {
        props.style = style.tickMinor;
        factor = 0.97;
      } else {
        props.style = style.tickMajor;
        factor = 0.93;
      }
      props.x2 = props.x1 * factor;
      props.y2 = props.y1 * factor;
      ticks.push(<line key={`tick-${phi}`} {...props} />);
      idx++;
      phi += PI2 / 60;
    }
    return <g>{ticks}</g>;
  }
}


// ==========================================
// Styles
// ==========================================
const lineStyle = {
  stroke: COLORS.darkLine,
  fill: 'none',
};
const style = {
  outer: {
    position: 'relative',
    padding: '0px 3px',
    marginBottom: -3,
    border: 'none',
  },
  svg: size => ({
    width: size,
    height: size,
  }),
  line: lineStyle,
  tickMinor: lineStyle,
  tickMajor: merge(lineStyle, {
    strokeWidth: 2,
  }),
  centerCircle: merge(lineStyle, {
    fill: 'white',
    strokeWidth: 2,
  }),
  handBase: {
    hours: merge(lineStyle, {
      strokeWidth: 2,
      strokeLinecap: 'round',
    }),
    minutes: merge(lineStyle, {
      strokeWidth: 2,
      strokeLinecap: 'round',
    }),
    seconds: lineStyle,
  },
  hand: (name, fHovered, fDragged, fHint, { accentColor, disabled }) => {
    let out = style.handBase[name];
    if (!disabled && (fHovered || fDragged)) {
      out = merge(out, {
        stroke: accentColor,
        strokeWidth: 4,
      });
    }
    if (fHint) out = timmSet(out, 'stroke', COLORS.dim);
    return out;
  },
  transparentHandBase: {
    stroke: 'red',
    strokeWidth: 15,
    opacity: 0,
  },
  transparentHand: ({ disabled }) => {
    let out = style.transparentHandBase;
    if (!disabled) {
      out = merge(out, {
        cursor: 'pointer',
      });
    }
    return out;
  },
  amPm: ({ disabled }) => ({
    position: 'absolute',
    top: 0,
    left: 3,
    cursor: disabled ? undefined : 'pointer',
  }),
};

// ==========================================
// Public API
// ==========================================
export default hoverable(TimePickerAnalog);
