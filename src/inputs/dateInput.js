import React                from 'react';
import {
  omit,
  merge,
  addDefaults,
}                           from 'timm';
import moment               from 'moment';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import { COLORS, KEYS }     from '../gral/constants';
import {
  HIDDEN_FOCUS_CAPTURE,
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
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
function toInternalValue(extDate, props) {
  if (extDate == null) return NULL_VALUE;
  const { date, time, seconds, utc } = addDefaults(props, DEFAULT_PROPS);
  const mom = moment(extDate);
  if (getUtcFlag(date, time, utc)) mom.utc();
  return mom.format(dateTimeFormat(date, time, seconds));
}
function toExternalValue(str, props) {
  const mom = displayToMoment(str, props);
  return mom !== null ? mom.toDate() : null;
}

function momentToDisplay(mom, props) {
  if (mom == null) return NULL_VALUE;
  const { date, time, seconds } = addDefaults(props, DEFAULT_PROPS);
  return mom.format(dateTimeFormat(date, time, seconds));
}
function displayToMoment(str, props) {
  if (str === NULL_VALUE) return null;
  const { date, time, utc } = addDefaults(props, DEFAULT_PROPS);
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
  return mom.isValid() ? mom : null;
}

const DEFAULT_PROPS = {
  type:                   'dropDownPicker',
  date:                   true,
  time:                   false,
  analogTime:             true,
  seconds:                false,
  todayName:              'Today',
  accentColor:            COLORS.accent,
};

// ==========================================
// Component
// ==========================================
class DateInput extends React.Component {
  static propTypes = {
    type:                   React.PropTypes.oneOf([
      'onlyField',
      'inlinePicker',
      'dropDownPicker',
    ]),
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
    styleField:             React.PropTypes.object,
    styleOuter:             React.PropTypes.object,
    accentColor:            React.PropTypes.string,
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
  static defaultProps = DEFAULT_PROPS;

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    this.cmdsToPicker = null;
    this.keyDown = undefined;
    bindAll(this, [
      'registerInputRef',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onChangePicker',
    ]);
  }

  componentDidMount() {
    if (this.props.type === 'dropDownPicker') {
      warnFloats(this.constructor.name);
    }
  }

  componentDidUpdate() { this.renderFloat(); }
  componentWillUnmount() { floatDelete(this.floatId); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    let out;
    if (this.props.type === 'inlinePicker') {
      out = (
        <span 
          className='giu-date-input giu-date-input-inline-picker'
          style={this.props.styleOuter}
        >
          {this.renderField(true)}
          {this.renderPicker(true)}
        </span>
      );
    } else {
      out = this.renderField();
    }
    return out;
  }

  renderField(fHidden) {
    const {
      type,
      curValue, placeholder,
      date, time, seconds,
    } = this.props;
    const className = fHidden ? undefined : 'giu-date-input';
    const finalPlaceholder = placeholder || dateTimeFormat(date, time, seconds);
    const otherProps = omit(this.props, PROP_KEYS);
    const styleField = fHidden
      ? style.fieldHidden
      : style.field(this.props);
    return (
      <input ref={this.registerInputRef}
        className={className}
        type="text"
        value={curValue}
        {...otherProps}
        style={styleField}
        placeholder={finalPlaceholder}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChange={this.props.onChange}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderFloat() {
    if (this.props.type !== 'dropDownPicker') return;
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

  renderPicker(fInline) {
    const {
      type,
      curValue,
      disabled, fFocused,
      date, time, analogTime, seconds, utc, 
      todayName,
      accentColor,
    } = this.props;
    const mom = displayToMoment(curValue, this.props);
    const registerOuterRef = type === 'inlinePicker'
      ? this.props.registerOuterRef
      : undefined;
    return (
      <DateTimePicker
        registerOuterRef={registerOuterRef}
        disabled={disabled}
        fFocused={fInline && fFocused}
        curValue={mom}
        onChange={this.onChangePicker}
        date={date}
        time={time}
        analogTime={analogTime}
        seconds={seconds}
        utc={utc}
        todayName={todayName}
        cmds={this.cmdsToPicker}
        keyDown={this.keyDown}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerInputRef(c) {
    this.refInput = c;
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
    const { type } = this.props;
    if (type === 'onlyField') return;
    const { which } = ev;
    const { fFloat } = this.state;
    if (which === KEYS.esc) {
      cancelEvent(ev);
      this.setState({ fFloat: !fFloat });
      this.keyDown = undefined;
      return;
    }

    if ((fFloat || type === 'inlinePicker') &&
        TRAPPED_KEYS.indexOf(which) >= 0) {
      cancelEvent(ev);
      const { which, keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
      this.keyDown = { which, keyCode, metaKey, shiftKey, altKey, ctrlKey };
      this.forceUpdate();
    }
  }

  onChangePicker(ev, nextValue) {
    this.props.onChange(ev, momentToDisplay(nextValue, this.props));
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outerInline: undefined,
  fieldBase: inputReset(),
  field: ({ styleField, disabled }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, styleField);
    return out;
  },
  fieldHidden: HIDDEN_FOCUS_CAPTURE,
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(DateInput.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(DateInput, { toInternalValue, toExternalValue });
