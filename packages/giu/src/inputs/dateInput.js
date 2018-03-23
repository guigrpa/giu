// @noflow

/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';
import { omit, merge, set as timmSet, addDefaults } from 'timm';
import moment from '../vendor/moment';
import { cancelEvent, stopPropagation } from '../gral/helpers';
import { COLORS, KEYS, IS_IOS } from '../gral/constants';
import {
  HIDDEN_FOCUS_CAPTURE,
  HIDDEN_FOCUS_CAPTURE_IOS,
  inputReset,
  INPUT_DISABLED,
} from '../gral/styles';
import {
  dateTimeFormat,
  dateTimeFormatNative,
  dateFormat,
  timeFormat,
  getUtcFlag,
  startOfDefaultDay,
} from '../gral/dates';
import type { Command, KeyboardEventPars, Moment } from '../gral/types';
import { isDate } from '../gral/validators';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import { floatAdd, floatDelete, floatUpdate } from '../components/floats';
import type { FloatPosition, FloatAlign } from '../components/floats';
import { DateTimePicker, TRAPPED_KEYS } from '../inputs/dateTimePicker';
import IosFloatWrapper from '../inputs/iosFloatWrapper';

// External value: `Date?`
// Internal value: `String` (introduced by the user, copied & pasted, via dropdown...)
// External<->internal conversion uses props, since there are a number of cases
const NULL_VALUE = '';
const toInternalValue = (extDate, props) => {
  if (extDate == null) return NULL_VALUE;
  const { type, date, time, seconds, utc } = props;
  const mom = moment(extDate);
  if (getUtcFlag(date, time, utc)) mom.utc();
  const fmt =
    type === 'native'
      ? dateTimeFormatNative(date, time)
      : dateTimeFormat(date, time, seconds);
  return mom.format(fmt);
};
const toExternalValue = (str, props) => {
  const mom = displayToMoment(str, props);
  return mom !== null ? mom.toDate() : null;
};
const isNull = val => val === NULL_VALUE;

const momentToDisplay = (mom, props) => {
  if (mom == null) return NULL_VALUE;
  const { type, date, time, seconds } = props;
  const fmt =
    type === 'native'
      ? dateTimeFormatNative(date, time)
      : dateTimeFormat(date, time, seconds);
  return mom.format(fmt);
};
const displayToMoment = (str, props) => {
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
      fmt = date && time ? `${dateFormat()} ${timeFormat(true)}` : dateFormat();
    }
    const fnMoment = fUtc ? moment.utc : moment;
    mom = fnMoment(str, fmt);
  }
  return mom.isValid() ? mom : null;
};

let cntId = 0;

// ==========================================
// DateInput
// ==========================================
//------------------------------------------
// Types
//------------------------------------------
// -- Props:
// -- START_DOCS
type PublicProps = {
  type?: PickerType, // see below (default: 'dropDownPicker')
  // Whether Giu should check for iOS in order to simplify certain components
  // (e.g. do not use analogue time picker) -- default: true
  checkIos?: boolean,
  disabled?: boolean,
  placeholder?: string, // when unspecified, the expected date/time format will be used
  date?: boolean, // whether the date is part of the value (default: true)
  time?: boolean, // whether the time is part of the value (default: false)
  // Whether the time picker should be analogue (traditional clock)
  // or digital (list) (default: true)
  analogTime?: boolean,
  seconds?: boolean, // whether seconds should be included in the time value (default: false)
  // UTC mode; by default, it is `true` *unless* `date` and `time` are both `true`.
  // In other words, local time is only used by default if both `date` and `time` are enabled
  utc?: boolean,
  todayName?: string, // label for the *Today* button (default: 'Today')
  // Current language (used just for force-render).
  // Use it to inform Giu that you have changed `moment`'s language.
  lang?: string,
  floatPosition?: FloatPosition,
  floatAlign?: FloatAlign,
  floatZ?: number,
  style?: Object, // merged with the `input` style
  styleOuter?: Object, // when `type === 'inlinePicker'`, merged with the outermost `span` style
  skipTheme?: boolean,
  accentColor?: string, // CSS color descriptor (e.g. `darkgray`, `#ccffaa`...)
  // all others are passed through to the `input` unchanged
};

type PickerType = 'native' | 'onlyField' | 'inlinePicker' | 'dropDownPicker';
// -- END_DOCS

const DEFAULT_PROPS = {
  type: 'dropDownPicker',
  checkIos: true,
  date: true,
  time: false,
  analogTime: true,
  seconds: false,
  todayName: 'Today',
  accentColor: COLORS.accent,
};

type DefaultProps = {
  type: PickerType,
  date: boolean,
  time: boolean,
  analogTime: boolean,
  seconds: boolean,
  todayName: string,
  accentColor: string,
};

type Props = {
  ...$Exact<PublicProps>,
  ...$Exact<DefaultProps>,
  // Input HOC
  curValue: string,
  errors: Array<string>,
  registerOuterRef: Function,
  registerFocusableRef: Function,
  fFocused: boolean,
  onFocus: Function,
  onBlur: Function,
  onChange: Function,
  onCopy: Function,
  onCut: Function,
  onPaste: Function,
};

const FILTERED_OUT_PROPS = [
  'type',
  'disabled',
  'placeholder',
  'date',
  'time',
  'analogTime',
  'seconds',
  'utc',
  'todayName',
  'lang',
  'floatPosition',
  'floatAlign',
  'floatZ',
  'style',
  'styleOuter',
  'skipTheme',
  'accentColor',
  ...INPUT_HOC_INVALID_HTML_PROPS,
  'required',
];

const FILTERED_OUT_PROPS_MDL = FILTERED_OUT_PROPS.concat(['placeholder']);

//------------------------------------------
// Component
//------------------------------------------
class BaseDateInput extends React.Component {
  props: Props;
  static defaultProps = {};
  state: {
    fFloat: boolean,
  };
  cmdsToPicker: ?Array<Command>;
  keyDown: void | KeyboardEventPars;
  lastExtValue: ?Moment;
  labelId: string;
  floatId: ?string;
  refMdl: ?Object;
  refInput: ?Object;

  constructor(props: Props) {
    super(props);
    this.state = { fFloat: false };
    this.cmdsToPicker = null;
    this.keyDown = undefined;
    this.lastExtValue = toExternalValue(props.curValue, props);
    this.labelId = this.props.id || `giu-date-input_${cntId}`;
    cntId += 1;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.curValue !== this.props.curValue) {
      this.lastExtValue = toExternalValue(nextProps.curValue, nextProps);
    }
  }

  componentDidMount() {
    if (this.context.theme === 'mdl' && this.refMdl)
      window.componentHandler.upgradeElement(this.refMdl);
  }

  componentDidUpdate(prevProps) {
    this.renderFloat();
    const { lang, onChange } = this.props;

    // When the external language changes, we must update the internal value (a string)
    // to reflect the new date format
    if (prevProps.lang !== lang && this.lastExtValue != null) {
      onChange(null, toInternalValue(this.lastExtValue, this.props), {
        fDontFocus: true,
      });
    }
  }
  componentWillUnmount() {
    if (this.floatId != null) floatDelete(this.floatId);
  }

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
    } else {
      // 'only-field' || 'dropDownPicker'
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
      curValue,
      onChange,
      placeholder,
      date,
      time,
      disabled,
    } = this.props;
    const otherProps = omit(this.props, FILTERED_OUT_PROPS);
    let htmlInputType;
    if (date && time) {
      htmlInputType = 'datetime-local';
    } else if (date) {
      htmlInputType = 'date';
    } else {
      htmlInputType = 'time';
    }
    return (
      <input
        ref={this.registerInputRef}
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
    if (!fHidden && !this.props.skipTheme && this.context.theme === 'mdl') {
      return this.renderFieldMdl();
    }
    const {
      curValue,
      onChange,
      placeholder,
      date,
      time,
      seconds,
      disabled,
      onCopy,
      onCut,
      onPaste,
    } = this.props;
    const otherProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <input
        ref={this.registerInputRef}
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

  renderFieldMdl() {
    const {
      curValue,
      onChange,
      placeholder,
      date,
      time,
      seconds,
      disabled,
      fFocused,
    } = this.props;
    const otherProps = omit(this.props, FILTERED_OUT_PROPS_MDL);
    let className =
      'giu-date-input mdl-textfield mdl-js-textfield mdl-textfield--floating-label';
    if (curValue !== '' || fFocused) className += ' is-dirty';
    return (
      <div
        ref={c => {
          this.refMdl = c;
        }}
        className={className}
        style={style.mdlField(this.props)}
      >
        <input
          ref={this.registerInputRef}
          className="mdl-textfield__input"
          type="text"
          value={curValue}
          id={this.labelId}
          {...otherProps}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={onChange}
          onKeyDown={this.onKeyDown}
          tabIndex={disabled ? -1 : undefined}
        />
        <label className="mdl-textfield__label" htmlFor={this.labelId}>
          {placeholder || dateTimeFormat(date, time, seconds)}
        </label>
      </div>
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
      disabled,
      fFocused,
      date,
      time,
      analogTime,
      seconds,
      utc,
      todayName,
      accentColor,
    } = this.props;
    const mom = displayToMoment(curValue, this.props);
    const registerOuterRef =
      type === 'inlinePicker' ? this.props.registerOuterRef : undefined;
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
  registerInputRef = c => {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  };

  onMouseDown = ev => {
    cancelEvent(ev);
    if (!this.props.fFocused && this.refInput) this.refInput.focus();
  };

  // Cancel bubbling of click events; they may reach Modals
  // on their way up and cause the element to blur.
  // Allow free propagation if the element is disabled.
  onClick = ev => {
    if (!this.props.disabled) stopPropagation(ev);
  };

  onFocus = ev => {
    this.setState({ fFloat: true });
    this.props.onFocus(ev);
  };

  onBlur = ev => {
    this.setState({ fFloat: false });
    this.props.onBlur(ev);
  };

  onKeyDown = ev => {
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

    if (
      (fFloat || type === 'inlinePicker') &&
      TRAPPED_KEYS.indexOf(which) >= 0
    ) {
      cancelEvent(ev);
      const { keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
      this.keyDown = { which, keyCode, metaKey, shiftKey, altKey, ctrlKey };
      this.forceUpdate();
    }
  };

  onChangePicker = (ev, nextValue) => {
    this.props.onChange(ev, momentToDisplay(nextValue, this.props));
  };
}

BaseDateInput.contextTypes = { theme: PropTypes.any };

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
  mdlField: ({ style: styleField, disabled }) => {
    let out = { width: 150 };
    if (disabled)
      out = merge(out, { cursor: 'default', pointerEvents: 'none' });
    out = merge(out, styleField);
    return out;
  },
  fieldHidden: IS_IOS ? HIDDEN_FOCUS_CAPTURE_IOS : HIDDEN_FOCUS_CAPTURE,
  wrapperForIos: { position: 'relative' },
};

// ==========================================
const DateInput = input(BaseDateInput, {
  toInternalValue,
  toExternalValue,
  isNull,
  defaultValidators: { isDate: isDate() },
  validatorContext: { moment },
  fIncludeClipboardProps: true,
});

// ==========================================
// DateInputWrapper
// ==========================================
// Wrapper to adapt props (adding defaults) to the DateInput.
// Also wires the imperative API through
class DateInputWrapper extends React.Component {
  props: PublicProps;
  refInput: ?Object;

  // ==========================================
  getValue() {
    return this.refInput ? this.refInput.getValue() : null;
  }
  getErrors() {
    return this.refInput ? this.refInput.getErrors() : null;
  }
  validateAndGetValue() {
    return this.refInput ? this.refInput.validateAndGetValue() : null;
  }

  // ==========================================
  render() {
    let props = addDefaults(this.props, DEFAULT_PROPS);
    if (IS_IOS && props.checkIos) {
      props = timmSet(props, 'analogTime', false);
    }
    props = omit(props, ['checkIos']);
    return <DateInput ref={this.registerInputRef} {...props} />;
  }

  // ==========================================
  registerInputRef = (c: ?Object) => {
    this.refInput = c;
  };
}

// ==========================================
// Public
// ==========================================
export default DateInputWrapper;
