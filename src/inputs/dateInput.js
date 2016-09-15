import React                from 'react';
import {
  omit, merge,
  set as timmSet,
  addDefaults,
}                           from 'timm';
import moment               from 'moment';
import {
  bindAll,
  cancelEvent,
  stopPropagation,
}                           from '../gral/helpers';
import {
  COLORS, KEYS,
  IS_IOS,
}                           from '../gral/constants';
import {
  HIDDEN_FOCUS_CAPTURE,
  HIDDEN_FOCUS_CAPTURE_IOS,
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import {
  dateTimeFormat, dateTimeFormatNative,
  dateFormat,
  timeFormat,
  getUtcFlag,
  startOfDefaultDay,
}                           from '../gral/dates';
import { isDate }           from '../gral/validators';
import input                from '../hocs/input';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
}                           from '../components/floats';
import {
  DateTimePicker,
  TRAPPED_KEYS,
}                           from '../inputs/dateTimePicker';
import IosFloatWrapper      from '../inputs/iosFloatWrapper';

// External value: `Date?`
// Internal value: `String` (introduced by the user, copied & pasted, via dropdown...)
// External<->internal conversion uses props, since there are a number of cases
const NULL_VALUE = '';
function toInternalValue(extDate, props) {
  if (extDate == null) return NULL_VALUE;
  const { type, date, time, seconds, utc } = props;
  const mom = moment(extDate);
  if (getUtcFlag(date, time, utc)) mom.utc();
  const fmt = type === 'native'
    ? dateTimeFormatNative(date, time)
    : dateTimeFormat(date, time, seconds);
  return mom.format(fmt);
}
function toExternalValue(str, props) {
  const mom = displayToMoment(str, props);
  return mom !== null ? mom.toDate() : null;
}
function isNull(val) { return val === NULL_VALUE; }

function momentToDisplay(mom, props) {
  if (mom == null) return NULL_VALUE;
  const { type, date, time, seconds } = props;
  const fmt = type === 'native'
    ? dateTimeFormatNative(date, time)
    : dateTimeFormat(date, time, seconds);
  return mom.format(fmt);
}
function displayToMoment(str, props) {
  if (str === NULL_VALUE) return null;
  const { type, date, time, utc } = props;
  const fUtc = getUtcFlag(date, time, utc);
  let mom;
  if (!date) {
    // Add missing date info
    mom = startOfDefaultDay(fUtc);
    mom.add(moment.duration(str));
  } else {
    // Parse string, including seconds (even if props.seconds may be false)
    let fmt;
    if (type === 'native') {
      fmt = undefined; // automatic format detection for native HTML inputs
    } else {
      fmt = date && time
        ? `${dateFormat()} ${timeFormat(true)}`
        : dateFormat();
    }
    const fnMoment = fUtc ? moment.utc : moment;
    mom = fnMoment(str, fmt);
  }
  return mom.isValid() ? mom : null;
}

// ==========================================
// Wrapper
// ==========================================
// -- Props:
// --
// -- * **type** *string(`native` | `onlyField` | `inlinePicker` | `dropDownPicker`)? =
// --   `dropDownPicker`*
// -- * **checkIos** *boolean? = true*: whether Giu should check for iOS in order to
// --   simplify certain components (e.g. do not use analogue time picker)
// -- * **placeholder** *string?*: when unspecified, the expected date/time
// --   format will be used
// -- * **date** *boolean? = true*: whether the date is part of the value
// -- * **time** *boolean?*: whether the time is part of the value
// -- * **analogTime** *boolean? = true*: whether the time picker should be
// --   analogue (traditional clock) or digital (list)
// -- * **seconds** *boolean?*: whether seconds should be included in the time value
// -- * **utc** *boolean?*: by default, it is `true` *unless* `date` and `time` are both `true`.
// --   In other words, local time is only used by default if both `date` and `time` are enabled
// -- * **todayName** *string? = 'Today'*: label for the *Today* button
// -- * **lang** *string?*: current language (NB: just used to make sure the component is
// --   refreshed). Use it to inform Giu that you have changed `moment`'s language.
// -- * **style** *object?*: merged with the `input` style
// -- * **styleOuter** *object?*: when `type === 'inlinePicker'`,
// --   merged with the outermost `span` style
// -- * **accentColor** *string?*: CSS color descriptor (e.g. `darkgray`, `#ccffaa`...)
const DEFAULT_PROPS = {
  type:                   'dropDownPicker',
  checkIos:               true,
  date:                   true,
  time:                   false,
  analogTime:             true,
  seconds:                false,
  todayName:              'Today',
  accentColor:            COLORS.accent,
};

const DateInputWrapper = props0 => {
  let props = addDefaults(props0, DEFAULT_PROPS);
  if (IS_IOS && props.checkIos) {
    props = timmSet(props, 'analogTime', false);
  }
  props = omit(props, ['checkIos']);
  return <DateInput {...props} />;
};

DateInputWrapper.propTypes = {
  type:                     React.PropTypes.oneOf([
    'native',
    'onlyField',
    'inlinePicker',
    'dropDownPicker',
  ]),
  checkIos:              React.PropTypes.bool,
};

// ==========================================
// Component
// ==========================================
class BaseDateInput extends React.Component {
  static propTypes = {
    type:                   React.PropTypes.oneOf([
      'native',
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
    lang:                   React.PropTypes.string,
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    style:                  React.PropTypes.object,
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

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    this.cmdsToPicker = null;
    this.keyDown = undefined;
    this.lastExtValue = toExternalValue(props.curValue, props);
    bindAll(this, [
      'registerInputRef',
      'onMouseDown',
      'onClick',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onChangePicker',
    ]);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.curValue !== this.props.curValue) {
      this.lastExtValue = toExternalValue(nextProps.curValue, nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    this.renderFloat();
    const { lang, onChange } = this.props;

    // When the external language changes, we must update the internal value (a string)
    // to reflect the new date format
    if (prevProps.lang !== lang && this.lastExtValue != null) {
      onChange(
        null,
        toInternalValue(this.lastExtValue, this.props),
        { fDontFocus: true },
      );
    }
  }
  componentWillUnmount() { floatDelete(this.floatId); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { type } = this.props;
    let out;
    if (type === 'native') {
      out = this.renderNativeField();
    } else if (type === 'inlinePicker') {
      out = (
        <span
          className="giu-date-input giu-date-input-inline-picker"
          style={style.outerInline(this.props)}
        >
          {this.renderField(true)}
          {this.renderPicker(true)}
        </span>
      );
    } else {  // 'only-field' || 'dropDownPicker'
      const elField = this.renderField();
      if (IS_IOS && type === 'dropDownPicker') {
        out = (
          <span style={style.wrapperForIos}>
            {elField}
            {this.renderFloatForIos()}
          </span>
        );
      } else {
        out = elField;
      }
    }
    return out;
  }

  renderNativeField() {
    const {
      curValue, onChange, placeholder,
      date, time,
      disabled,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT);
    let htmlInputType;
    if (date && time) {
      htmlInputType = 'datetime-local';
    } else if (date) {
      htmlInputType = 'date';
    } else {
      htmlInputType = 'time';
    }
    return (
      <input ref={this.registerInputRef}
        className="giu-date-input"
        type={htmlInputType}
        value={curValue}
        {...otherProps}
        placeholder={placeholder || dateTimeFormatNative(date, time)}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChange={onChange}
        tabIndex={disabled ? -1 : undefined}
        style={style.field(this.props)}
      />
    );
  }

  renderField(fHidden) {
    const {
      curValue, onChange, placeholder,
      date, time, seconds,
      disabled,
      onCopy, onCut, onPaste,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT);
    return (
      <input ref={this.registerInputRef}
        className={fHidden ? undefined : 'giu-date-input'}
        type="text"
        value={curValue}
        {...otherProps}
        placeholder={placeholder || dateTimeFormat(date, time, seconds)}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onCopy={fHidden ? onCopy : undefined}
        onCut={fHidden ? onCut : undefined}
        onPaste={fHidden ? onPaste : undefined}
        onChange={onChange}
        onKeyDown={this.onKeyDown}
        tabIndex={disabled ? -1 : undefined}
        style={fHidden ? style.fieldHidden : style.field(this.props)}
      />
    );
  }

  renderFloat() {
    if (this.props.type !== 'dropDownPicker') return;
    if (IS_IOS) return;
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

  renderFloatForIos() {
    if (!this.state.fFloat) return null;
    const { floatPosition, floatAlign, floatZ } = this.props;
    return (
      <IosFloatWrapper
        floatPosition={floatPosition}
        floatAlign={floatAlign}
        floatZ={floatZ}
      >
        {this.renderPicker(false)}
      </IosFloatWrapper>
    );
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
        onMouseDown={this.onMouseDown}
        onClick={this.onClick}
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

  onMouseDown(ev) {
    cancelEvent(ev);
    if (!this.props.fFocused) this.refInput.focus();
  }

  // Cancel bubbling of click events; they may reach Modals
  // on their way up and cause the element to blur.
  // Allow free propagation if the element is disabled.
  onClick(ev) {
    if (!this.props.disabled) stopPropagation(ev);
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
      const { keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
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
  outerInline: ({ styleOuter }) => {
    let out = styleOuter;
    if (IS_IOS) out = timmSet(out, 'position', 'relative');
    return out;
  },
  fieldBase: inputReset(),
  field: ({ style: styleField, disabled }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, styleField);
    return out;
  },
  fieldHidden: IS_IOS ? HIDDEN_FOCUS_CAPTURE_IOS : HIDDEN_FOCUS_CAPTURE,
  wrapperForIos: { position: 'relative' },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS_TO_REMOVE_FROM_INPUT = Object.keys(BaseDateInput.propTypes).concat([
  'cmds', 'keyDown', 'onResizeOuter',
]);

// ==========================================
// Public API
// ==========================================
const DateInput = input(BaseDateInput, {
  toInternalValue, toExternalValue, isNull,
  defaultValidators: { isDate: isDate() },
  validatorContext: { moment },
  fIncludeClipboardProps: true,
});

export default DateInputWrapper;
