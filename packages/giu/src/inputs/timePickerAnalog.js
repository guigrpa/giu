// @flow

import React from 'react';
import classnames from 'classnames';
import { cancelEvent } from '../gral/helpers';
import { startOfToday } from '../gral/dates';
import { KEYS } from '../gral/constants';
import type { Moment, KeyboardEventPars } from '../gral/types';

const PI = Math.PI;
const PI2 = Math.PI * 2;
const cos = Math.cos;
const sin = Math.sin;
const atan2 = Math.atan2;
const round = Math.round;
const sign =
  Math.sign ||
  ((o) => {
    if (o > 0) return 1;
    if (o < 0) return -1;
    return 0;
  });
const DEFAULT_SIZE = 120;
const UP_DOWN_STEP = 5; // [min]
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
// Declarations
// ==========================================
type Props = {
  disabled: boolean,
  curValue: ?Moment,
  onChange: Function,
  seconds?: boolean,
  utc: boolean,
  stepMinutes?: number,
  size?: number,
};

type State = {
  dragging: ?boolean,
  hint: ?{ hours: number, minutes: number, seconds: number },
  hovering: ?string,
};

type Unit = 'hours' | 'minutes' | 'seconds';

// ==========================================
// Component
// ==========================================
class TimePickerAnalog extends React.PureComponent<Props, State> {
  hours: ?number;
  minutes: ?number;
  seconds: ?number;
  radius: number;
  translate: number;
  dragUnits: Unit;
  dragDeltaPhi: number;
  dragSteps: number;

  state = {
    dragging: null,
    hint: null,
    hovering: null,
  };
  refSvg: any = React.createRef();

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMoveHand);
    window.removeEventListener('mouseup', this.onMouseUpHand);
  }

  // ==========================================
  // Imperative API
  // ==========================================
  doKeyDown({ which, shiftKey, ctrlKey, altKey, metaKey }: KeyboardEventPars) {
    if (shiftKey || ctrlKey || altKey || metaKey) return;
    switch (which) {
      case KEYS.pageDown:
        this.changeTimeByMins(+60);
        break;
      case KEYS.pageUp:
        this.changeTimeByMins(-60);
        break;
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
      default:
        break;
    }
  }

  // ==========================================
  render() {
    const { curValue, size = DEFAULT_SIZE } = this.props;
    if (curValue != null) {
      this.hours = curValue.hours();
      this.minutes = curValue.minutes();
      this.seconds = curValue.seconds();
    } else {
      this.hours = null;
      this.minutes = null;
      this.seconds = null;
    }
    this.radius = size / 2 - 2;
    this.translate = size / 2;
    return (
      <div className="giu-time-picker-analog">
        <svg
          ref={this.refSvg}
          onClick={this.onClickBackground}
          onMouseMove={this.onMouseMoveBackground}
          onMouseLeave={this.onMouseLeaveBackground}
          style={{ width: size, height: size }}
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

  renderHands() {
    const { curValue, seconds } = this.props;
    const { dragging, hovering } = this.state;
    const hands = [];
    HAND_NAMES.forEach((name) => {
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

  renderHand(
    name: string,
    val: number,
    fHovered: boolean,
    fDragged: boolean,
    fDragHandle: boolean,
    fHint?: boolean
  ) {
    const phi = PI2 * val - PI / 2;
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
        <line
          key={`hand-${name}`}
          className={classnames('giu-hand', `giu-hand-${name}`, {
            'giu-hand-hovered': fHovered || fDragged,
            'giu-hint': fHint,
          })}
          {...props}
        />
      );
    } else {
      // Wider targets for dragging
      out = (
        <line
          key={`hand-drag-area-${name}`}
          className="giu-hand-drag-area"
          id={name}
          {...props}
          onMouseEnter={this.onHoverStart}
          onMouseLeave={this.onHoverStop}
          onMouseDown={this.onMouseDownHand}
        />
      );
    }
    return out;
  }

  renderCenter() {
    return (
      <circle
        className="giu-center-circle"
        cx={0}
        cy={0}
        r={this.radius * 0.06}
      />
    );
  }

  renderAmPm() {
    if (this.hours == null) return null;
    const { disabled } = this.props;
    return (
      <div
        className={classnames('giu-am-pm', {
          'giu-am-pm-disabled': disabled,
        })}
        onClick={this.onClickAmPm}
      >
        {this.hours >= 12 ? 'PM' : 'AM'}
      </div>
    );
  }

  // ==========================================
  onMouseLeaveBackground = () => {
    if (!this.state.hint) return;
    this.setState({ hint: null });
  };

  onMouseMoveBackground = (ev: SyntheticMouseEvent<*>) => {
    if (this.props.curValue) return;
    const phi = this.getPhiFromMousePosition(ev);
    if (phi == null) return;
    const hours = positiveRemainder(round((phi + PI / 2) / (PI2 / 12)), 12);
    this.setState({
      hint: { hours, minutes: 0, seconds: 0 },
    });
  };

  onClickBackground = (ev: SyntheticMouseEvent<*>) => {
    if (this.props.disabled || this.hours != null) return;
    const phi = this.getPhiFromMousePosition(ev);
    if (phi == null) return;
    let hours = positiveRemainder(round((phi + PI / 2) / (PI2 / 12)), 12);
    // Assume the user wants hours >= 7 by default
    if (hours < 7) hours += 12;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.setUnits(ev, hours, 'hours');
  };

  onMouseDownHand = (ev: SyntheticMouseEvent<*>) => {
    cancelEvent(ev);
    if (this.props.disabled) return;
    if (!(ev.target instanceof Element)) return;
    const name: any = ev.target.id;
    this.setState({ dragging: name });
    this.dragUnits = name;
    this.dragSteps = name === 'hours' ? 12 : 60;
    this.dragDeltaPhi = ((this.getUnits(name) % 1) * PI2) / this.dragSteps;
    window.addEventListener('mousemove', this.onMouseMoveHand);
    window.addEventListener('mouseup', this.onMouseUpHand);
  };

  onMouseMoveHand = (ev: SyntheticMouseEvent<*>) => {
    cancelEvent(ev);
    const { dragUnits, dragDeltaPhi, dragSteps } = this;
    const phi = this.getPhiFromMousePosition(ev) - dragDeltaPhi;
    if (phi == null) return;
    let val = positiveRemainder(
      round((phi + PI / 2) / (PI2 / dragSteps)),
      dragSteps
    );
    const curVal = (this: any)[dragUnits];
    val = correctLeaps(curVal, val, dragSteps);
    if (val !== curVal) this.setUnits(ev, val, dragUnits);
  };

  onMouseUpHand = (ev: SyntheticMouseEvent<*>) => {
    cancelEvent(ev);
    window.removeEventListener('mousemove', this.onMouseMoveHand);
    window.removeEventListener('mouseup', this.onMouseUpHand);
    this.setState({ dragging: null });
  };

  onClickAmPm = (ev: SyntheticMouseEvent<*>) => {
    if (this.hours == null) return;
    const nextHours = this.hours >= 12 ? this.hours - 12 : this.hours + 12;
    this.setUnits(ev, nextHours, 'hours');
  };

  onHoverStart = (ev: SyntheticMouseEvent<*>) => {
    this.setState({ hovering: ev.currentTarget.id });
  };

  onHoverStop = () => {
    this.setState({ hovering: null });
  };

  // ==========================================
  changeTimeByMins(mins: number) {
    if (this.props.curValue == null) {
      this.setUnits(null, 12, 'hours');
      return;
    }
    this.setUnits(null, this.minutes + mins, 'minutes');
  }

  getNormalisedUnits(units: string, options?: { fHint: boolean }) {
    let val = this.getUnits(units, options);
    val /= units === 'hours' ? 12 : 60;
    return val;
  }

  getUnits(units: string, { fHint }: { fHint: boolean } = {}) {
    let out;
    const base: any = fHint ? this.state.hint : this;
    switch (units) {
      case 'hours':
        out = base.hours + base.minutes / 60 + base.seconds / 3600;
        out = positiveRemainder(out, 12);
        break;
      case 'minutes':
        out = base.minutes + base.seconds / 60;
        out = positiveRemainder(out, 60);
        break;
      case 'seconds':
        out = positiveRemainder(base.seconds, 60);
        break;
      default:
        out = 0;
        break;
    }
    return out;
  }

  setUnits(ev: ?SyntheticEvent<*>, val: number, units: string) {
    const { curValue, utc, onChange } = this.props;
    const nextValue = curValue != null ? curValue.clone() : startOfToday(utc);
    nextValue[units](val);
    onChange(ev, nextValue);
  }

  getPhiFromMousePosition(ev: SyntheticMouseEvent<*>) {
    const refSvg = this.refSvg.current;
    if (!refSvg) return 0;
    const bcr = refSvg.getBoundingClientRect();
    const x = ev.clientX - bcr.left - refSvg.clientLeft - this.translate;
    const y = ev.clientY - bcr.top - refSvg.clientTop - this.translate;
    let phi = atan2(y, x);
    if (phi < 0) phi += PI2;
    return phi;
  }
}

// ==========================================
// WatchFace
// ==========================================
/* eslint-disable react/no-multi-comp */
type WatchFaceProps = {
  radius: number,
};

class WatchFace extends React.PureComponent<WatchFaceProps> {
  render() {
    const { radius: r } = this.props;
    let idx = 0;
    let phi = 0;
    let dMinor = '';
    let dMajor = '';
    while (phi < PI2) {
      const x1 = r * cos(phi);
      const y1 = r * sin(phi);
      const isMajor = idx % 5 === 0;
      const factor = isMajor ? 0.93 : 0.97;
      const x2 = x1 * factor;
      const y2 = y1 * factor;
      const segment = `M${x1},${y1}L${x2},${y2}`;
      if (isMajor) dMajor += segment;
      else dMinor += segment;
      idx += 1;
      phi += PI2 / 60;
    }
    return (
      <g>
        <path className="giu-tick-minor" d={dMinor} />
        <path className="giu-tick-major" d={dMajor} />
      </g>
    );
  }
}

// ==========================================
// Public
// ==========================================
export default TimePickerAnalog;
