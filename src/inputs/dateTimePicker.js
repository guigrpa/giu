import React                from 'react';
import { merge }            from 'timm';
import moment               from 'moment';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import {
  getTimeInSecs,
  getUtcFlag,
  startOfDefaultDay,
}                           from '../gral/dates';
import {
  flexContainer,
}                           from '../gral/styles';
import { COLORS, KEYS }     from '../gral/constants';
import input                from '../hocs/input';
import FocusCapture         from '../components/focusCapture';
import DatePicker           from '../inputs/datePicker';
import TimePickerDigital    from '../inputs/timePickerDigital';
import TimePickerAnalog     from '../inputs/timePickerAnalog';

const TRAPPED_KEYS = [
  KEYS.home, KEYS.end,
  KEYS.up, KEYS.down, KEYS.left, KEYS.right,
  KEYS.pageUp, KEYS.pageDown,
  KEYS.backspace, KEYS.del,
];

// External value: `Date?`
// Internal value: `Moment?` (used by DateTimePicker and all its picker-descendants)
function toInternalValue(val) { return val != null ? moment(val) : null; }
function toExternalValue(val) { return val != null ? val.clone().toDate() : null; }

// ==========================================
// Component
// ==========================================
class BaseDateTimePicker extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    focusable:              React.PropTypes.bool,
    date:                   React.PropTypes.bool,
    time:                   React.PropTypes.bool,
    analogTime:             React.PropTypes.bool,
    seconds:                React.PropTypes.bool,
    utc:                    React.PropTypes.bool,
    todayName:              React.PropTypes.string,
    onKeyDown:              React.PropTypes.func,
    cmds:                   React.PropTypes.array,
    style:                  React.PropTypes.object,
    accentColor:            React.PropTypes.string,
    // Input HOC
    curValue:               React.PropTypes.object,   // a moment object
    onChange:               React.PropTypes.func.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    onFocus:                React.PropTypes.func.isRequired,
    onBlur:                 React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    disabled:               false,
    focusable:              true,
    date:                   true,
    time:                   false,
    analogTime:             true,
    seconds:                false,
    todayName:              'Today',
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.state = {
      cmdRouting: props.date ? 'date' : 'time',
    };
    this.cmdsToPickers = [];
    bindAll(this, [
      'registerOuterRef',
      'registerFocusableRef',
      'onMouseDown',
      'onKeyDown',
      'onChange',
    ]);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      curValue, style: baseStyle,
      date, time, utc,
    } = this.props;
    this.utc = getUtcFlag(date, time, utc);
    if (curValue != null && this.utc) curValue.utc();
    return (
      <div ref={this.registerOuterRef}
        className="giu-date-time-picker"
        style={merge(style.outer(this.props), baseStyle)}
        onMouseDown={this.onMouseDown}
      >
        {this.renderFocusCapture()}
        {this.renderDate()}
        {this.renderSeparator()}
        {this.renderTime()}
      </div>
    );
  }

  renderFocusCapture() {
    const { focusable, onFocus, onBlur } = this.props;
    if (!focusable) return null;
    return (
      <FocusCapture
        registerRef={this.registerFocusableRef}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderDate() {
    const {
      curValue,
      disabled, focusable,
      date,
      todayName,
      accentColor,
    } = this.props;
    if (!date) return null;
    let cmds;
    if (!disabled && this.state.cmdRouting === 'date') {
      cmds = focusable ? this.cmdsToPickers : this.props.cmds;
    }
    return (
      <DatePicker
        disabled={disabled}
        curValue={curValue}
        onChange={this.onChange('date')}
        utc={this.utc}
        todayName={todayName}
        cmds={cmds}
        accentColor={accentColor}
      />
    );
  }

  renderSeparator() {
    const { date, time } = this.props;
    if (!date || !time) return null;
    return <div style={style.separator} />;
  }

  renderTime() {
    const {
      curValue,
      disabled, focusable,
      time, analogTime, seconds,
      accentColor,
    } = this.props;
    if (!time) return null;
    let cmds;
    if (!disabled && this.state.cmdRouting === 'time') {
      cmds = focusable ? this.cmdsToPickers : this.props.cmds;
    }
    const Component = analogTime ? TimePickerAnalog : TimePickerDigital;
    return (
      <Component
        disabled={disabled}
        curValue={curValue}
        onChange={this.onChange('time')}
        utc={this.utc}
        seconds={seconds}
        cmds={cmds}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerOuterRef(c) {
    this.refOuter = c;
    this.props.registerOuterRef(c);
  }

  registerFocusableRef(c) {
    this.refFocus = c;
    this.props.registerFocusableRef(c);
  }

  onMouseDown(ev) {
    const { disabled, focusable } = this.props;
    cancelEvent(ev);
    if (!disabled && focusable && this.refFocus) this.refFocus.focus();
  }

  // Keystrokes from FocusCapture
  onKeyDown(ev) {
    if (TRAPPED_KEYS.indexOf(ev.which) >= 0) {
      cancelEvent(ev);
      this.cmdsToPickers = [{ type: 'KEY_DOWN', which: ev.which }];
      this.forceUpdate();
    }
  }

  onChange(cmdRouting) {
    return (ev, nextValue0) => {
      const { date, time } = this.props;
      let nextValue = nextValue0;
      if (nextValue != null && !(date && time)) {
        if (!time) {
          nextValue = nextValue.clone().startOf('day');
        }
        if (!date) {
          nextValue = startOfDefaultDay(this.utc);
          nextValue.add(moment.duration(getTimeInSecs(nextValue0), 'seconds'));
        }
      }
      this.props.onChange(ev, nextValue);
      this.redirectCommands(cmdRouting);
    };
  }

  redirectCommands(cmdRouting) {
    if (cmdRouting === this.state.cmdRouting) return;
    this.cmdsToPickers = [];
    this.setState({ cmdRouting });
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: ({ fFocused }) => {
    const out = flexContainer('row', {
      paddingTop: 3,
      paddingBottom: 3,
      overflowY: 'auto',
      border: `1px solid ${COLORS.line}`,
    });
    if (fFocused) {
      out.boxShadow = COLORS.focusGlow;
      out.border = `1px solid ${COLORS.focus}`;
    }
    return out;
  },
  separator: {
    marginLeft: 4,
    marginRight: 2,
    width: 1,
    borderRight: `1px solid ${COLORS.line}`,
  },
};

// ==========================================
// Public API
// ==========================================
const DateTimePicker = input(BaseDateTimePicker, { toInternalValue, toExternalValue });

export {
  DateTimePicker,
  TRAPPED_KEYS,
}