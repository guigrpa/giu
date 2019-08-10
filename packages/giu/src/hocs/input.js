// @flow

/* eslint-disable no-underscore-dangle, max-len, react/default-props-match-prop-types */

import * as React from 'react';
import { omit, merge } from 'timm';
import classnames from 'classnames';
import { cancelEvent, stopPropagation, prefixClasses } from '../gral/helpers';
import { IS_IOS } from '../gral/constants';
import { scrollIntoView } from '../gral/visibility';
import { isRequired } from '../gral/validators';
import type { Validator } from '../gral/validators';
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
  className: string, // wrapper class name
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
  disabled?: boolean, // passed through unchanged
  floatPosition?: FloatPosition, // passed through unchanged
  focusOnChange?: boolean,
  errorPosition?: FloatPosition,
  errorAlign?: FloatAlign,
  onChange?: (ev: SyntheticEvent<*>, extValue: any) => any,
  onFocus?: (ev: SyntheticEvent<*>) => any,
  onBlur?: (ev: SyntheticEvent<*>) => any,
};

type Props = {
  ...$Exact<InputHocPublicProps>,

  // Configured by the specific input
  hocOptions: HocOptions,
  render: (props: ChildProps, ref?: Object) => React.Element<any>,

  // Context
  theme: Theme, // passed through unchanged

  // all others are passed through unchanged; we define here some,
  // since they are used in the HOC
  className?: string,
  id?: string,
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
  'disabled',
  'floatPosition',
  'focusOnChange',
  'errorPosition',
  'errorAlign',
  'onChange',
  'onFocus',
  'onBlur',
];

// Don't pass these HOC props to an <input>
const INPUT_HOC_INVALID_HTML_PROPS = [
  'curValue',
  'registerOuterRef',
  'registerFocusableRef',
  'errors',
  'fFocused',
  'floatPosition',
  'onResizeOuter',
  'theme',
];

// ==========================================
// HOC
// ==========================================
class Input extends React.PureComponent<Props> {
  fInit = false;
  prevExtValue: any;
  prevExtErrors: ?Array<string>;
  curValue: any;
  validationErrors: Array<string>;
  errors: Array<string>; // = this.props.errors (user-provided) + this.validationErrors
  fDirtyErrorFloat = false;
  errorFloatId: ?string;
  lastValidatedValue: any;
  fFocused = false;
  refOuter: ?Object;
  refFocusable: ?Object;
  refChild: any = React.createRef();

  componentDidMount() {
    warnFloats(this.props.hocOptions.componentName);
    this.renderErrorFloat();
  }

  componentDidUpdate() {
    if (this.fDirtyErrorFloat) {
      this.fDirtyErrorFloat = false;
      this.renderErrorFloat();
    }
  }

  componentWillUnmount() {
    if (this.errorFloatId != null) floatDelete(this.errorFloatId);
  }

  // ==========================================
  // Imperative API
  // ==========================================
  // Alternative to using the `onChange` prop (e.g. if we want to delegate
  // state handling to the input and only want to retrieve the value when submitting a form)
  getValue() {
    const { toExternalValue = fnIdentity } = this.props.hocOptions;
    return toExternalValue(this.curValue, this.props);
  }
  // Modify the input's value without going through the `value` prop
  setValue(value) {
    const { toInternalValue = fnIdentity } = this.props.hocOptions;
    this.setCurValue(toInternalValue(value, this.props));
  }
  // Reset the input to the `value` prop
  revert() {
    this.resetErrors();
    const { toInternalValue = fnIdentity } = this.props.hocOptions;
    this.setCurValue(toInternalValue(this.props.value, this.props));
  }
  getErrors() {
    return this.errors;
  }
  async validate() {
    try {
      this._validate();
    } catch (err) {
      console.error(err); // eslint-disable-line
    }
  }
  async validateAndGetValue() {
    await this._validate(); // may throw
    return this.getValue();
  }
  focus() {
    const target = this.refFocusable;
    if (target && target.focus) target.focus();
  }
  blur() {
    const target = this.refFocusable;
    if (target && target.blur) target.blur();
  }
  runCommand(cmd: Object) {
    const target = this.refChild.current;
    if (target && target.runCommand) target.runCommand(cmd);
  }

  // ==========================================
  prepareRender() {
    const { value, errors } = this.props;
    if (!this.fInit || value !== this.prevExtValue) {
      const { toInternalValue = fnIdentity } = this.props.hocOptions;
      this.curValue = toInternalValue(value, this.props);
      this.prevExtValue = value;
      this.fDirtyErrorFloat = true;
    }
    if (!this.fInit || errors !== this.prevExtErrors) {
      this.recalcErrors();
      this.prevExtErrors = errors;
      this.fDirtyErrorFloat = true;
    }
    this.fInit = true;
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    this.prepareRender();
    const { hocOptions } = this.props;
    const { fIncludeFocusCapture } = hocOptions;
    return (
      <span
        className={classnames('giu-input', hocOptions.className)}
        onMouseDown={fIncludeFocusCapture ? this.onMouseDownWrapper : undefined}
        onClick={fIncludeFocusCapture ? this.onClickWrapper : undefined}
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
    const { position, align } = this.calcFloatPosition();
    return (
      <IosFloatWrapper floatPosition={position} floatAlign={align}>
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
      disabled: this.props.disabled,
      fFocused: this.fFocused,
      floatPosition: this.props.floatPosition,
      onChange: this.onChange,
      onFocus: fIncludeFocusCapture ? undefined : this.onFocus,
      onBlur: fIncludeFocusCapture ? undefined : this.onBlur,
      onCopy: fIncludeClipboardProps ? this.onCopyCut : undefined,
      onCut: fIncludeClipboardProps ? this.onCopyCut : undefined,
      onPaste: fIncludeClipboardProps ? this.onPaste : undefined,
      onResizeOuter: floatReposition,
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
    // will open `below`, position the error float `above`.
    if (errors.length) {
      const { id, className } = this.props;
      const floatOptions = {
        className: classnames(
          'giu-float-error',
          prefixClasses(className, 'giu-float-error')
        ),
        id: id ? `giu-float-error-${id}` : undefined,
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
      <div
        className={classnames('giu-error', {
          'giu-error-modified': fModified,
          'giu-error-mdl': this.props.theme.id === 'mdl',
        })}
      >
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
      if (focusOnChange) this.focus();
    }
  };

  onFocus = (ev: SyntheticEvent<*>) => {
    const { onFocus, disabled } = this.props;
    if (disabled) {
      this.blur();
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
    this.focus();
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
      userValidators.forEach((validator: any) => {
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
      const validator: any = validators.isRequired || isRequired();
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
        this.recalcErrors();
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

  resetErrors() {
    this.validationErrors = [];
    this.lastValidatedValue = undefined;
    this.recalcErrors();
  }

  recalcErrors() {
    this.errors = (this.props.errors || []).concat(this.validationErrors || []);
    this.fDirtyErrorFloat = true;
  }

  calcFloatPosition() {
    let position = this.props.errorPosition;
    if (position == null) {
      position = this.props.floatPosition === 'below' ? 'above' : 'below';
    }
    return { position, align: this.props.errorAlign };
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
// Public
// ==========================================
export default ThemedInput;
export { INPUT_HOC_INVALID_HTML_PROPS };
