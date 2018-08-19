// @flow

/* eslint-disable no-underscore-dangle, max-len, react/default-props-match-prop-types */

import * as React from 'react';
import { omit, merge, addDefaults } from 'timm';
import { cancelEvent, stopPropagation } from '../gral/helpers';
import { COLORS, MISC, IS_IOS, FONTS } from '../gral/constants';
import { scrollIntoView } from '../gral/visibility';
import { isDark } from '../gral/styles';
import { isRequired } from '../gral/validators';
import type { Validator } from '../gral/validators';
import type { Command } from '../gral/types';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  floatReposition,
  warnFloats,
} from '../components/floats';
import type { FloatPosition, FloatAlign } from '../components/floats';
import FocusCapture from '../components/focusCapture';
import IosFloatWrapper from '../inputs/iosFloatWrapper';

const fnIdentity = (o: any, hocProps: Object) => o; // eslint-disable-line

// ==========================================
// Declarations
// ==========================================
type HocOptions = {|
  componentName: string,
  toInternalValue?: (extValue: any, hocProps: Object) => any,
  toExternalValue?: (intValue: any, hocProps: Object) => any,
  isNull: (intValue: any) => boolean,
  valueAttr?: string,
  fIncludeFocusCapture?: boolean,
  defaultValidators?: { [key: string]: Validator },
  validatorContext?: any,
  trappedKeys?: Array<number>,
  className?: string, // wrapper class name
  fIncludeClipboardProps?: boolean,
|};

export type InputHocPublicProps = {
  // Public props (all optional)
  // Some of these are passed down unmodified (see list),
  // others *might* be modified, others are simply *not passed*.
  // Note that other props provided by the user are always passed through.
  value?: any,
  errors?: Array<string>,
  required?: boolean, // passed through unchanged
  validators?: Array<Validator>,
  noErrors?: boolean, // don't show errors, no matter what
  cmds?: Array<Command>, // passed through unchanged
  disabled?: boolean, // passed through unchanged
  floatZ?: number, // passed through unchanged
  floatPosition?: FloatPosition, // passed through unchanged
  focusOnChange?: boolean,
  errorZ?: number,
  errorPosition?: FloatPosition,
  errorAlign?: FloatAlign,
  onChange?: (ev: SyntheticEvent<*>, extValue: any) => any,
  onFocus?: (ev: SyntheticEvent<*>) => any,
  onBlur?: (ev: SyntheticEvent<*>) => any,
  styleOuter?: Object,
};

type Props = {
  ...$Exact<InputHocPublicProps>,

  // Configured by the specific input
  hocOptions: HocOptions,
  render: (props: ChildProps, ref?: Object) => React.Element<any>,

  // Context
  theme: Theme, // passed through unchanged

  // all others are passed through unchanged
};

type ChildProps = {
  theme: Theme,
  registerOuterRef: Function,
  registerFocusableRef: ?Function,
  curValue: any,
  fFocused: boolean,
  onChange: (
    ev: SyntheticEvent<*>,
    providedValue: any,
    options?: { fDontFocus?: boolean }
  ) => any,
  onFocus: Function,
  onBlur: Function,
  onCopy: Function,
  onCut: Function,
  onPaste: Function,
  onResizeOuter: Function,
  styleOuter: Object,
};

const HOC_PUBLIC_PROPS = [
  'hocOptions',
  'render',
  // ... and now all keys in InputHocPublicProps
  'value',
  'errors',
  'required',
  'validators',
  'noErrors',
  'cmds',
  'disabled',
  'floatZ',
  'floatPosition',
  'focusOnChange',
  'errorZ',
  'errorPosition',
  'errorAlign',
  'onChange',
  'onFocus',
  'onBlur',
  'styleOuter',
];

// Don't pass these HOC props to an <input>
const INPUT_HOC_INVALID_HTML_PROPS = [
  'curValue',
  'registerOuterRef',
  'registerFocusableRef',
  'cmds',
  'errors',
  'fFocused',
  'floatZ',
  'floatPosition',
  'onResizeOuter',
  'styleOuter',
  'theme',
];

// ==========================================
// HOC
// ==========================================
class Input extends React.PureComponent<Props> {
  fInitialised: boolean;
  prevExtValue: any;
  prevExtErrors: any;
  curValue: any;
  validationErrors: Array<?string>;
  errors: Array<?string>; // = this.props.errors (user-provided) + this.validationErrors
  fDirtyErrorFloat: boolean;
  errorFloatId: ?string;
  lastValidatedValue: any;
  fFocused: boolean;
  pendingFocusBlur: null | 'FOCUS' | 'BLUR';
  refOuter: ?Object;
  refFocusable: ?Object;
  refChild = React.createRef();

  constructor(props: Props) {
    super(props);
    this.fDirtyErrorFloat = false;
    this.fFocused = false;
    this.fInitialised = false;
  }

  componentDidMount() {
    warnFloats(this.props.hocOptions.componentName);
    this.renderErrorFloat();
  }

  // componentWillReceiveProps(nextProps: Props) {
  //   const { cmds } = nextProps;
  //   if (cmds !== this.props.cmds) this.processCmds(cmds, nextProps);
  // }

  componentDidUpdate() {
    if (this.fDirtyErrorFloat) {
      this.fDirtyErrorFloat = false;
      this.renderErrorFloat();
    }
    if (this.pendingFocusBlur) {
      // execute `FOCUS` and `BLUR` commands asynchronously, so that the owner
      // of the Input component doesn't find a `null` ref in a `focus`/`blur` handler
      setTimeout(() => {
        if (!this.pendingFocusBlur) return;
        if (this.pendingFocusBlur === 'FOCUS') this._focus();
        else if (this.pendingFocusBlur === 'BLUR') this._blur();
        this.pendingFocusBlur = null;
      });
    }
  }

  componentWillUnmount() {
    if (this.errorFloatId != null) floatDelete(this.errorFloatId);
  }

  // ==========================================
  // Imperative API (via props or directly)
  // ==========================================
  processCmds(cmds: ?Array<Command>, nextProps: Props) {
    if (cmds == null) return;
    const { toInternalValue = fnIdentity } = nextProps.hocOptions;
    cmds.forEach(cmd => {
      switch (cmd.type) {
        case 'SET_VALUE':
          this.setCurValue(toInternalValue(cmd.value, nextProps));
          break;
        case 'REVERT':
          this.resetErrors(nextProps);
          this.setCurValue(toInternalValue(nextProps.value, nextProps));
          break;
        case 'VALIDATE':
          this._validate().catch(() => {});
          break;
        case 'FOCUS':
          this.pendingFocusBlur = 'FOCUS';
          break;
        case 'BLUR':
          this.pendingFocusBlur = 'BLUR';
          break;
        default:
          break;
      }
    });
  }

  // Alternative to using the `onChange` prop (e.g. if we want to delegate
  // state handling to the input and only want to retrieve the value when submitting a form)
  getValue() {
    const { toExternalValue = fnIdentity } = this.props.hocOptions;
    return toExternalValue(this.curValue, this.props);
  }
  getErrors() {
    return this.errors;
  }
  async validateAndGetValue() {
    await this._validate(); // may throw
    return this.getValue();
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { hocOptions } = this.props;

    // Process external prop changes (value, errors)
    const { value, errors } = this.props;
    if (!this.fInitialised || value !== this.prevExtValue) {
      const { toInternalValue = fnIdentity } = hocOptions;
      this.curValue = toInternalValue(value, this.props);
      this.prevExtValue = value;
      this.fDirtyErrorFloat = true;
    }
    if (!this.fInitialised || errors !== this.prevExtErrors) {
      this.recalcErrors(this.props);
      this.prevExtErrors = errors;
      this.fDirtyErrorFloat = true;
    }
    this.fInitialised = true;

    const { fIncludeFocusCapture } = hocOptions;
    return (
      <span
        className={hocOptions.className}
        onMouseDown={fIncludeFocusCapture ? this.onMouseDownWrapper : undefined}
        onClick={fIncludeFocusCapture ? this.onClickWrapper : undefined}
        style={style.wrapper(this.props)}
      >
        {fIncludeFocusCapture ? this.renderFocusCapture() : null}
        {this.renderIosErrors()}
        {this.renderComponent()}
      </span>
    );
  }

  renderFocusCapture() {
    return (
      <FocusCapture
        registerRef={this.registerFocusableRef}
        disabled={this.props.disabled}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onCopy={this.onCopyCut}
        onCut={this.onCopyCut}
        onPaste={this.onPaste}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderIosErrors() {
    if (!IS_IOS) return null;
    const { errors } = this;
    if (!errors.length) return null;
    const { position, align, zIndex } = this.calcFloatPosition();
    return (
      <IosFloatWrapper
        floatPosition={position}
        floatAlign={align}
        floatZ={zIndex}
      >
        {this.renderErrors()}
      </IosFloatWrapper>
    );
  }

  renderComponent() {
    const { hocOptions, render } = this.props;
    const otherProps = omit(this.props, HOC_PUBLIC_PROPS);
    const { fIncludeFocusCapture } = hocOptions;
    let { fIncludeClipboardProps } = hocOptions;
    if (fIncludeClipboardProps == null)
      fIncludeClipboardProps = fIncludeFocusCapture;
    const childProps = {
      registerOuterRef: this.registerOuterRef,
      registerFocusableRef: fIncludeFocusCapture
        ? undefined
        : this.registerFocusableRef,
      ...otherProps,
      curValue: this.curValue,
      errors: this.errors,
      required: this.props.required,
      cmds: this.props.cmds,
      disabled: this.props.disabled,
      fFocused: this.fFocused,
      floatZ: this.props.floatZ,
      floatPosition: this.props.floatPosition,
      onChange: this.onChange,
      onFocus: fIncludeFocusCapture ? undefined : this.onFocus,
      onBlur: fIncludeFocusCapture ? undefined : this.onBlur,
      onCopy: fIncludeClipboardProps ? this.onCopyCut : undefined,
      onCut: fIncludeClipboardProps ? this.onCopyCut : undefined,
      onPaste: fIncludeClipboardProps ? this.onPaste : undefined,
      onResizeOuter: floatReposition,
      styleOuter: fIncludeFocusCapture ? undefined : this.props.styleOuter,
    };
    return render(childProps, this.refChild);
  }

  renderErrorFloat = () => {
    if (IS_IOS) return;
    const { errors } = this;

    // Remove float
    if (!errors.length && this.errorFloatId != null) {
      floatDelete(this.errorFloatId);
      this.errorFloatId = null;
      return;
    }

    // Create or update float
    // (if the `errorX` props are not set, spy on the pass-through `floatX` props for
    // hints on how to properly position the error float; e.g. if another float
    // will open `below`, position the error float `above`; also adjust `z-index`
    // to be below another float's level, so that it doesn't obscure the main float).
    if (errors.length) {
      const floatOptions = {
        ...this.calcFloatPosition(),
        getAnchorNode: () => this.refOuter || this.refFocusable,
        children: this.renderErrors(),
      };
      if (this.errorFloatId == null) {
        this.errorFloatId = floatAdd(floatOptions);
      } else {
        floatUpdate(this.errorFloatId, floatOptions);
      }
    }
  };

  renderErrors() {
    const { errors, curValue, lastValidatedValue } = this;
    const { toInternalValue = fnIdentity } = this.props.hocOptions;
    // console.log(`Rendering; lastValidatedValue=${lastValidatedValue}, curValue=${curValue}, ` +
    //   `internal value for props.value=${toInternalValue(this.props.value, this.props)}`);
    const fModified =
      lastValidatedValue !== undefined
        ? curValue !== lastValidatedValue
        : curValue !== toInternalValue(this.props.value, this.props);
    return (
      <div style={style.errors(fModified, this.props.theme.id)}>
        {errors.join(' | ')}
      </div>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerOuterRef = (c: ?Object) => {
    this.refOuter = c;
  };
  registerFocusableRef = (c: ?Object) => {
    this.refFocusable = c;
  };

  setCurValue(curValue: any) {
    if (curValue === this.curValue) return;
    this.curValue = curValue;
    this.fDirtyErrorFloat = true;
    this.forceUpdate();
  }

  onChange = (
    ev: SyntheticEvent<*>,
    providedValue: any,
    options: { fDontFocus?: boolean } = {}
  ) => {
    if (this.props.disabled) return;
    const { onChange, hocOptions } = this.props;
    const { valueAttr = 'value', toExternalValue = fnIdentity } = hocOptions;
    let curValue = providedValue;
    if (curValue === undefined) {
      const currentTarget: any = ev.currentTarget; // eslint-disable-line
      curValue = currentTarget[valueAttr];
    }
    this.setCurValue(curValue);
    if (onChange) onChange(ev, toExternalValue(curValue, this.props));
    if (!this.fFocused && !options.fDontFocus) {
      const { focusOnChange = true } = this.props;
      if (focusOnChange) this._focus();
    }
  };

  onFocus = (ev: SyntheticEvent<*>) => {
    const { onFocus, disabled } = this.props;
    if (disabled) {
      this._blur();
      return;
    }
    if (this.refOuter) scrollIntoView(this.refOuter);
    this.changedFocus(true);
    if (onFocus) onFocus(ev);
  };

  onBlur = (ev: SyntheticEvent<*>) => {
    const { onBlur } = this.props;
    this._validate().catch(() => {});
    this.changedFocus(false);
    if (onBlur) onBlur(ev);
  };

  onMouseDownWrapper = (ev: SyntheticEvent<*>) => {
    // Always cancel mousedowns: they blur the component. If they are interesting,
    // capture them at a lower level
    cancelEvent(ev);

    // If not focused, a mouse-down should focus the component and cancel the event
    if (this.fFocused) return;
    this._focus();
  };

  // Cancel bubbling of click events; they may reach Modals
  // on their way up and cause the element to blur.
  // Allow free propagation if the element is disabled.
  onClickWrapper = (ev: SyntheticEvent<*>) => {
    if (!this.props.disabled) stopPropagation(ev);
  };

  onKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    const { which, keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
    const { trappedKeys = [] } = this.props.hocOptions;
    if (trappedKeys.indexOf(which) < 0) return;
    const keyDown = { which, keyCode, metaKey, shiftKey, altKey, ctrlKey };
    cancelEvent(ev);
    const target = this.refChild.current;
    if (target && target.doKeyDown) target.doKeyDown(keyDown);
  };

  onCopyCut = (ev: SyntheticClipboardEvent<*>) => {
    ev.clipboardData.setData('text/plain', this.curValue);
    ev.preventDefault();
  };

  onPaste = (ev: SyntheticClipboardEvent<*>) => {
    const nextValue = ev.clipboardData.getData('text/plain');
    ev.preventDefault();
    this.onChange(ev, nextValue);
  };

  // ==========================================
  // Helpers
  // ==========================================
  _focus() {
    if (this.refFocusable && this.refFocusable.focus) {
      this.refFocusable.focus();
    }
  }

  _blur() {
    if (this.refFocusable && this.refFocusable.blur) {
      this.refFocusable.blur();
    }
  }

  changedFocus(fFocused: boolean) {
    if (fFocused === this.fFocused) return;
    this.fFocused = fFocused;
    this.forceUpdate();
  }

  _validate() {
    if (this.props.noErrors) return Promise.resolve();
    const { validators: userValidators, hocOptions } = this.props;
    const {
      defaultValidators = {},
      toExternalValue = fnIdentity,
      isNull,
      validatorContext,
    } = hocOptions;
    let validators = defaultValidators;
    if (userValidators) {
      const extraValidators = {};
      let cnt = 0;
      userValidators.forEach(validator => {
        extraValidators[validator.id || `anon_${cnt}`] = validator;
        cnt += 1;
      });
      if (cnt) validators = merge(validators, extraValidators);
    }
    const { curValue: internalValue } = this;
    const externalValue = toExternalValue(internalValue, this.props);
    const fRequired = this.props.required || validators.isRequired != null;
    const fIsNull = isNull(internalValue);

    // If `null` is allowed and input is `null`, bail out
    if (!fRequired && fIsNull) return Promise.resolve();

    const pErrors: any = []; // promised errors

    // If input is null (unallowed), get the corresponding message and bail out
    if (fIsNull) {
      const validator = validators.isRequired || isRequired();
      if (validator.getErrorMessage) {
        pErrors.push(validator.getErrorMessage(internalValue));
      }

      // Otherwise, collect all validator errors (skipping `isRequired`)
    } else {
      Object.keys(validators).forEach(id => {
        if (id === 'isRequired') return;
        const validator: Validator = validators[id];
        const validate =
          typeof validator === 'function' ? validator : validator.validate;
        if (typeof validate === 'function') {
          const value = validator.fInternal ? internalValue : externalValue;
          const pError = validate(value, this.props, validatorContext);
          if (pError != null) pErrors.push(pError);
        }
      });
    }

    // When all promises have resolved, change the current state
    return Promise.all(pErrors).then(validationErrors0 => {
      const validationErrors = validationErrors0.filter(o => o != null);
      const prevLastValidatedValue = this.lastValidatedValue;
      this.lastValidatedValue = internalValue;
      if (
        this.lastValidatedValue !== prevLastValidatedValue ||
        validationErrors.join('') !== this.validationErrors.join('') // string compare
      ) {
        this.validationErrors = validationErrors;
        this.recalcErrors(this.props);
        this.forceUpdate();
      }
      if (validationErrors.length) {
        const exception = new Error('VALIDATION_ERROR');
        // $FlowFixMe (piggybacking data on an exception might not be a good idea)
        exception.errors = validationErrors;
        throw exception;
      }
    });
  }

  resetErrors(props: Props) {
    this.validationErrors = [];
    this.lastValidatedValue = undefined;
    this.recalcErrors(props);
  }

  recalcErrors(props: Props) {
    this.errors = (props.errors || []).concat(this.validationErrors || []);
    this.fDirtyErrorFloat = true;
  }

  calcFloatPosition() {
    const { floatZ } = this.props;
    let zIndex = this.props.errorZ;
    if (zIndex == null) {
      zIndex =
        floatZ != null ? floatZ - MISC.zErrorFloatDelta : MISC.zErrorFloatDelta;
    }
    let position = this.props.errorPosition;
    if (position == null) {
      position = this.props.floatPosition === 'below' ? 'above' : 'below';
    }
    return { position, align: this.props.errorAlign, zIndex };
  }
}

// ==========================================
// $FlowFixMe
const ThemedInput = React.forwardRef((props, ref) => (
  <ThemeContext.Consumer>
    {theme => <Input {...props} theme={theme} ref={ref} />}
  </ThemeContext.Consumer>
));

// ==========================================
// Styles
// ==========================================
const errorBgColorBase = COLORS.notifs.error;
const errorFgColorBase =
  COLORS[isDark(errorBgColorBase) ? 'lightText' : 'darkText'];
const errorBgColorModified = COLORS.notifs.warn;
const errorFgColorModified =
  COLORS[isDark(errorBgColorModified) ? 'lightText' : 'darkText'];
const style = {
  wrapper: ({ styleOuter }) => {
    let out = styleOuter || {};
    out = addDefaults(out, {
      position: 'relative',
      display: 'inline-block',
    });
    return out;
  },
  errors: (fModified, theme) => ({
    padding: '1px 3px',
    backgroundColor: fModified ? errorBgColorModified : errorBgColorBase,
    color: fModified ? errorFgColorModified : errorFgColorBase,
    fontFamily: theme === 'mdl' ? FONTS.mdl : undefined,
  }),
};

// ==========================================
// Public
// ==========================================
export default ThemedInput;
export { INPUT_HOC_INVALID_HTML_PROPS };
