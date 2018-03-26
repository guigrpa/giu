// @flow

import React from 'react';
import { merge } from 'timm';
import moment from '../vendor/moment';
import { getTimeInSecs, getUtcFlag, startOfDefaultDay } from '../gral/dates';
import {
  flexContainer,
  inputReset,
  INPUT_DISABLED,
  GLOW,
} from '../gral/styles';
import { COLORS, KEYS } from '../gral/constants';
import type { Moment, KeyboardEventPars } from '../gral/types';
import DatePicker from '../inputs/datePicker';
import TimePickerDigital from '../inputs/timePickerDigital';
import TimePickerAnalog from '../inputs/timePickerAnalog';

const TRAPPED_KEYS = [
  KEYS.home,
  KEYS.end,
  KEYS.up,
  KEYS.down,
  KEYS.left,
  KEYS.right,
  KEYS.pageUp,
  KEYS.pageDown,
  KEYS.backspace,
  KEYS.del,
];

// ==========================================
// Declarations
// ==========================================
type PublicProps = {|
  registerOuterRef?: Function,
  curValue: ?Moment,
  keyDown?: KeyboardEventPars,
  disabled?: boolean,
  date?: boolean,
  time?: boolean,
  analogTime?: boolean,
  seconds?: boolean,
  utc?: boolean,
  todayName?: string,
  onMouseDown?: Function,
  onClick?: Function,
  onChange: (ev: ?SyntheticEvent<*>, nextValue: ?Moment) => any,
  fFocused?: boolean,
  style?: Object,
  accentColor?: string,
|};

type DefaultProps = {
  disabled: boolean,
  date: boolean,
  time: boolean,
  analogTime: boolean,
  seconds: boolean,
  todayName: string,
  accentColor: string,
};

type Props = {
  ...PublicProps,
  ...$Exact<DefaultProps>,
};

type State = {
  focusedSubpicker: Picker,
};

type Picker = 'date' | 'time';

// ==========================================
// Component
// ==========================================
class DateTimePicker extends React.Component<Props, State> {
  keyDown: void | KeyboardEventPars;
  utc: boolean;
  refOuter: ?Object;

  static defaultProps: DefaultProps = {
    disabled: false,
    date: true,
    time: false,
    analogTime: true,
    seconds: false,
    todayName: 'Today',
    accentColor: COLORS.accent,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      focusedSubpicker: props.date ? 'date' : 'time',
    };
    this.keyDown = undefined;
  }

  // In order to route the `keyDown` to the DatePicker or
  // the TimePicker, depending on the last user action,
  // we keep a local variable with the value that will be passed
  // down. When the subpicker focus changes, we set this value to null.
  // When the owner component updates this prop, we update this value.
  componentWillReceiveProps(nextProps: Props) {
    const { keyDown } = nextProps;
    if (keyDown !== this.props.keyDown) {
      this.keyDown = keyDown;
    }
  }

  // ==========================================
  render() {
    const {
      curValue,
      style: baseStyle,
      date,
      time,
      utc,
      onMouseDown,
      onClick,
    } = this.props;
    this.utc = getUtcFlag(date, time, utc);
    if (curValue != null && this.utc) curValue.utc();
    return (
      <div
        ref={this.registerOuterRef}
        className="giu-date-time-picker"
        onMouseDown={onMouseDown}
        onClick={onClick}
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
    const { curValue, disabled, todayName, accentColor } = this.props;
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
      time,
      analogTime,
      seconds,
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
  registerOuterRef = (c: ?Object) => {
    this.refOuter = c;
    this.props.registerOuterRef && this.props.registerOuterRef(c);
  };

  onChange = (focusedSubpicker: Picker) => (ev: any, nextValue0: ?Moment) => {
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

  changeFocusedSubpicker(focusedSubpicker: Picker) {
    if (focusedSubpicker === this.state.focusedSubpicker) return;
    this.keyDown = undefined;
    this.setState({ focusedSubpicker });
  }
}

// ==========================================
const style = {
  outerBase: inputReset(
    flexContainer('row', {
      paddingTop: 3,
      paddingBottom: 3,
      overflowY: 'auto',
    })
  ),
  outerDisabled: INPUT_DISABLED,
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

// ==========================================
// Public
// ==========================================
export { DateTimePicker, TRAPPED_KEYS };
