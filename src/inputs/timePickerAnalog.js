import React                from 'react';
import moment               from 'moment';
import { merge }            from 'timm';
import { bindAll }          from '../gral/helpers';
import {
  startOfToday,
  getTimeInSecs,
}                           from '../gral/dates';
import {
  COLORS,
  getScrollbarWidth,
}                           from '../gral/constants';
import hoverable            from '../hocs/hoverable';

const PI = Math.PI;
const PI2 = Math.PI * 2;
const cos = Math.cos;
const sin = Math.sin;
const atan2 = Math.atan2;
const floor = Math.floor;
const sign = Math.sign || (o => {
  if (o > 0) return 1;
  if (o < 0) return -1;
  return 0;
});
const DEFAULT_SIZE = 150;
const HAND_NAMES = ['seconds', 'minutes', 'hours'];
const positiveRemainder = (val, q) => (val + q) % q;

// ==========================================
// Component
// ==========================================
class TimePickerAnalog extends React.Component {
  static propTypes = {
    curValue:               React.PropTypes.object,  // moment object, not start of day
    onChange:               React.PropTypes.func.isRequired,
    utc:                    React.PropTypes.bool.isRequired,
    cmds:                   React.PropTypes.array,
    stepMinutes:            React.PropTypes.number,
    accentColor:            React.PropTypes.string.isRequired,
    size:                   React.PropTypes.number,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    stepMinutes:            5,
    size:                   DEFAULT_SIZE,
  };

  constructor(props) {
    super(props);
    this.state = { draggedHand: null };
    bindAll(this, [
      'onChange',
      'onClickBackground',
    ]);
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
          style={style.svg(size)}
        >
          <g transform={`translate(${this.translate},${this.translate})`}>
            {this.renderWatch()}
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
    return <g>{ticks}</g>
  }

  renderHands() {
    const {
      curValue, seconds,
      hovering, onHoverStart, onHoverStop,
    } = this.props;
    if (!curValue) return null;
    const hands = [];
    for (const name of HAND_NAMES) {
      console.log(name)
      if (name === 'seconds' && !seconds) continue;
      const val = this.getNormalisedUnits(name);
      const phi = PI2 * val - (PI / 2);
      const r = name === 'hours' ? 0.6 * this.radius : 0.83 * this.radius;
      const props = {
        id: name,
        x1: 0,
        y1: 0,
        x2: r * cos(phi),
        y2: r * sin(phi),
      };
      hands.push(
        <line key={`hand-${name}`}
          {...props}
          style={style.hand[name]}
        />
      );
      // Wider targets for dragging
      hands.push(
        <line key={`hand-transparent-${name}`}
          id={name}
          {...props}
          style={style.transparentHand}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverStop}
          onMouseDown={this.onMouseDownHand}
        />
      );
    }
    return <g>{hands}</g>
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
    if (!this.hours) return null;
    return (
      <div
        onClick={this.onClickAmPm}
        style={style.amPm}
      >
        {this.hours >= 12 ? 'PM' : 'AM'}
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onClickBackground(ev) {}

  onChange(ev, secs) {
    const { curValue, utc, onChange } = this.props;
    if (secs == null) {
      onChange(ev, null);
      return;
    }
    let nextValue;
    if (curValue != null) {
      nextValue = curValue.clone().startOf('day');
    } else {
      nextValue = startOfToday(utc);
    }
    nextValue.add(moment.duration(secs, 'seconds'));
    onChange(ev, nextValue);
  }

  // ==========================================
  // Helpers
  // ==========================================
  getNormalisedUnits(units) {
    let val = this.getUnits(units);
    val /= units === 'hours' ? 12 : 60;
    return val;
  }

  getUnits(units) {
    let out;
    switch (units) {
      case 'hours':
        out = this.hours + this.minutes / 60 + this.seconds / 3600;
        out = positiveRemainder(out, 12);
        break;
      case 'minutes' :
        out = this.minutes + this.seconds / 60;
        out = positiveRemainder(out, 60);
        break;
      case 'seconds' :
        out = positiveRemainder(this.seconds, 60);
        break;
      default:
        break;
    }
    return out;
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
  hand: {
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
  transparentHand: {
    stroke: 'red',
    strokeWidth: 15,
    opacity: 0,
  },
  amPm: {
    position: 'absolute',
    top: 0,
    left: 3,
    cursor: 'pointer',
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(TimePickerAnalog);
