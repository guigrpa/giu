import React                from 'react';
import { merge }            from 'timm';
import moment               from 'moment';
import { bindAll }          from '../gral/helpers';
import {
  getTimeInSecs,
  getUtcFlag,
  startOfDefaultDay,
}                           from '../gral/dates';
import {
  flexContainer,
  inputReset, INPUT_DISABLED,
  GLOW,
}                           from '../gral/styles';
import { COLORS, KEYS }     from '../gral/constants';
import DatePicker           from '../inputs/datePicker';
import TimePickerDigital    from '../inputs/timePickerDigital';
import TimePickerAnalog     from '../inputs/timePickerAnalog';

const TRAPPED_KEYS = [
  KEYS.home, KEYS.end,
  KEYS.up, KEYS.down, KEYS.left, KEYS.right,
  KEYS.pageUp, KEYS.pageDown,
  KEYS.backspace, KEYS.del,
];

// ==========================================
// Component
// ==========================================
class DateTimePicker extends React.Component {
  static propTypes = {
    registerOuterRef:       React.PropTypes.func,
    curValue:               React.PropTypes.object,   // a moment object
    keyDown:                React.PropTypes.object,
    disabled:               React.PropTypes.bool,
    date:                   React.PropTypes.bool,
    time:                   React.PropTypes.bool,
    analogTime:             React.PropTypes.bool,
    seconds:                React.PropTypes.bool,
    utc:                    React.PropTypes.bool,
    todayName:              React.PropTypes.string,
    onMouseDown:            React.PropTypes.func,
    onChange:               React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool,
    style:                  React.PropTypes.object,
    accentColor:            React.PropTypes.string,
  };
  static defaultProps = {
    disabled:               false,
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
      focusedSubpicker: props.date ? 'date' : 'time',
    };
    this.keyDown = null;
    bindAll(this, [
      'registerOuterRef',
      'onChange',
    ]);
  }

  // In order to route the `keyDown` to the DatePicker or
  // the TimePicker, depending on the last user action,
  // we keep a local variable with the value that will be passed
  // down. When the subpicker focus changes, we set this value to null.
  // When the owner component updates this prop, we update this value.
  componentWillReceiveProps(nextProps) {
    const { keyDown } = nextProps;
    if (keyDown !== this.props.keyDown) {
      this.keyDown = keyDown;
    }
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      curValue, style: baseStyle,
      date, time, utc,
      onMouseDown,
    } = this.props;
    this.utc = getUtcFlag(date, time, utc);
    if (curValue != null && this.utc) curValue.utc();
    return (
      <div ref={this.registerOuterRef}
        className="giu-date-time-picker"
        onMouseDown={onMouseDown}
        style={merge(style.outer(this.props), baseStyle)}
      >
        {this.renderDate()}
        {this.renderSeparator()}
        {this.renderTime()}
      </div>
    );
  }

  renderDate() {
    if (!this.props.date) return null;
    const {
      curValue,
      disabled,
      todayName,
      accentColor,
    } = this.props;
    let keyDown;
    if (!disabled && this.state.focusedSubpicker === 'date') {
      keyDown = this.keyDown;
    }
    return (
      <DatePicker
        disabled={disabled}
        curValue={curValue}
        onChange={this.onChange('date')}
        utc={this.utc}
        todayName={todayName}
        keyDown={keyDown}
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
      disabled,
      time, analogTime, seconds,
      accentColor,
    } = this.props;
    if (!time) return null;
    let keyDown;
    if (!disabled && this.state.focusedSubpicker === 'time') {
      keyDown = this.keyDown;
    }
    const Component = analogTime ? TimePickerAnalog : TimePickerDigital;
    return (
      <Component
        disabled={disabled}
        curValue={curValue}
        onChange={this.onChange('time')}
        utc={this.utc}
        seconds={seconds}
        keyDown={keyDown}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerOuterRef(c) {
    this.refOuter = c;
    this.props.registerOuterRef && this.props.registerOuterRef(c);
  }

  onChange(focusedSubpicker) {
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
      this.changeFocusedSubpicker(focusedSubpicker);
    };
  }

  changeFocusedSubpicker(focusedSubpicker) {
    if (focusedSubpicker === this.state.focusedSubpicker) return;
    this.keyDown = null;
    this.setState({ focusedSubpicker });
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outerBase: inputReset(flexContainer('row', {
    paddingTop: 3,
    paddingBottom: 3,
    overflowY: 'auto',
  })),
  outer: ({ disabled, fFocused }) => {
    let out = style.outerBase;
    if (disabled) out = merge(out, style.outerDisabled);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  separator: {
    marginLeft: 4,
    marginRight: 2,
    width: 1,
    borderRight: `1px solid ${COLORS.line}`,
  },
};
style.outerDisabled = merge(INPUT_DISABLED, {
  border: style.outerBase.border,
});

// ==========================================
// Public API
// ==========================================
export {
  DateTimePicker,
  TRAPPED_KEYS,
};
