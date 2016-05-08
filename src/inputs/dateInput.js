import React                from 'react';
import { omit, merge }      from 'timm';
import moment               from 'moment';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import { COLORS, KEYS }     from '../gral/constants';
import {
  dateTimeFormat,
  dateFormat,
  timeFormat,
  getUtcFlag,
  startOfDefaultDay,
}                           from '../gral/dates';
import input                from '../hocs/input';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';
import {
  DateTimePicker,
  TRAPPED_KEYS,
}                           from '../inputs/dateTimePicker';

// External value: `Date?`
// Internal value: `String` (introduced by the user, copied & pasted, via dropdown...)
// External<->internal conversion uses props, since there are a number of cases
const NULL_VALUE = '';
function toInternalValue(extDate, { date = true, time, seconds, utc }) {
  if (extDate == null) return NULL_VALUE;
  const mom = moment(extDate);
  if (getUtcFlag(date, time, utc)) mom.utc();
  return mom.format(dateTimeFormat(date, time, seconds));
}
function toExternalValue(str, { date = true, time, utc }) {
  if (str === NULL_VALUE) return null;
  const fUtc = getUtcFlag(date, time, utc);
  let mom;
  if (!date) {
    // Add missing date info
    mom = startOfDefaultDay(fUtc);
    mom.add(moment.duration(str));
  } else {
    // Parse string, including seconds (even if props.seconds may be false)
    const fmt = date && time
      ? `${dateFormat()} ${timeFormat(true)}`
      : dateFormat();
    const fnMoment = fUtc ? moment.utc : moment;
    mom = fnMoment(str, fmt);
  }
  return mom.isValid() ? mom.toDate() : null;
}

// ==========================================
// Component
// ==========================================
class DateInput extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    placeholder:            React.PropTypes.string,
    date:                   React.PropTypes.bool,
    time:                   React.PropTypes.bool,
    analogTime:             React.PropTypes.bool,
    seconds:                React.PropTypes.bool,
    utc:                    React.PropTypes.bool,
    todayName:              React.PropTypes.string,
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    fieldStyle:             React.PropTypes.object,
    accentColor:            React.PropTypes.string,
    onKeyDown:              React.PropTypes.func,
    // From input HOC
    curValue:               React.PropTypes.string.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    onFocus:                React.PropTypes.func.isRequired,
    onBlur:                 React.PropTypes.func.isRequired,
    onChange:               React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };
  static defaultProps = {
    date:                   true,
    time:                   false,
    analogTime:             true,
    seconds:                false,
    todayName:              'Today',
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    this.cmdsToPicker = null;
    bindAll(this, [
      'registerInputRef',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onChangePicker',
    ]);
  }

  componentDidMount() { warnFloats(this.constructor.name); }
  componentDidUpdate() { this.renderFloat(); }
  componentWillUnmount() { floatDelete(this.floatId); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      curValue, placeholder,
      date, time, seconds,
      fieldStyle,
    } = this.props;
    const finalPlaceholder = placeholder || dateTimeFormat(date, time, seconds);
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={this.registerInputRef}
        className="giu-date-input"
        type="text"
        value={curValue}
        {...otherProps}
        style={merge(style.field, fieldStyle)}
        placeholder={finalPlaceholder}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChange={this.props.onChange}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderFloat() {
    const { fFloat } = this.state;

    // Remove float
    if (!fFloat && this.floatId != null) {
      floatDelete(this.floatId);
      this.floatId = null;
      return;
    }

    // Create or update float
    if (fFloat) {
      const { floatZ, floatPosition, floatAlign } = this.props;
      const floatOptions = {
        position: floatPosition,
        align: floatAlign,
        zIndex: floatZ,
        getAnchorNode: () => this.refInput,
        children: this.renderPicker(),
      };
      if (this.floatId == null) {
        this.floatId = floatAdd(floatOptions);
      } else {
        floatUpdate(this.floatId, floatOptions);
      }
    }
  }

  renderPicker() {
    const value = toExternalValue(this.props.curValue, this.props);
    return (
      <DateTimePicker
        disabled={this.props.disabled}
        focusable={false}
        value={value}
        onChange={this.onChangePicker}
        date={this.props.date}
        time={this.props.time}
        analogTime={this.props.analogTime}
        seconds={this.props.seconds}
        utc={this.props.utc}
        todayName={this.props.todayName}
        cmds={this.cmdsToPicker}
        accentColor={this.props.accentColor}
      />
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerInputRef(c) {
    this.refInput = c;
    this.props.registerOuterRef(c);
    this.props.registerFocusableRef(c);
  }

  onFocus(ev) {
    this.setState({ fFloat: true });
    this.props.onFocus(ev);
  }

  onBlur(ev) {
    this.setState({ fFloat: false });
    this.props.onBlur(ev);
  }

  onKeyDown(ev) {
    const { which } = ev;
    const { fFloat } = this.state;
    if (which === KEYS.esc) {
      cancelEvent(ev);
      this.setState({ fFloat: !fFloat });
      return;
    }
    if (fFloat && TRAPPED_KEYS.indexOf(which) >= 0) {
      cancelEvent(ev);
      this.cmdsToPicker = [{ type: 'KEY_DOWN', which }];
      this.forceUpdate();
      if (this.props.onKeyDown) this.props.onKeyDown(ev);
    }
  }

  onChangePicker(ev, nextValue) {
    this.props.onChange(ev, toInternalValue(nextValue, this.props));
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  field: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    border: `1px solid ${COLORS.line}`,
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(DateInput.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(DateInput, { toInternalValue, toExternalValue });
