/* eslint-disable no-underscore-dangle */
import React from 'react';
import { omit, merge } from 'timm';
import { cancelEvent, stopPropagation } from '../gral/helpers';
import { COLORS, MISC, IS_IOS, FONTS } from '../gral/constants';
import { scrollIntoView } from '../gral/visibility';
import { isDark } from '../gral/styles';
import { isRequired } from '../gral/validators';
import {
  floatAdd, floatDelete, floatUpdate, floatReposition,
  warnFloats,
} from '../components/floats';
import FocusCapture from '../components/focusCapture';
import IosFloatWrapper from '../inputs/iosFloatWrapper';

const PROP_TYPES = {
  value:                  React.PropTypes.any,
  errors:                 React.PropTypes.array,
  required:               React.PropTypes.bool,   // also passed through
  validators:             React.PropTypes.array,
  noErrors:               React.PropTypes.bool,
  cmds:                   React.PropTypes.array,  // also passed through
  disabled:               React.PropTypes.bool,   // also passed through
  floatZ:                 React.PropTypes.number, // also passed through
  floatPosition:          React.PropTypes.string, // also passed through
  focusOnChange:          React.PropTypes.bool,
  errorZ:                 React.PropTypes.number,
  errorPosition:          React.PropTypes.string,
  errorAlign:             React.PropTypes.string,
  onChange:               React.PropTypes.func,
  onFocus:                React.PropTypes.func,
  onBlur:                 React.PropTypes.func,
  styleOuter:             React.PropTypes.object,
  // all others are passed through unchanged
};
const PROP_KEYS = Object.keys(PROP_TYPES);

// **IMPORTANT**: must be the outermost HOC (i.e. closest to the
// user), for the imperative API to work.
function input(ComposedComponent, {
  toInternalValue = ((o) => o),
  toExternalValue = ((o) => o),
  isNull,
  valueAttr = 'value',
  fIncludeFocusCapture = false,
  defaultValidators = {},
  validatorContext,
  trappedKeys = [],
  className,
  fIncludeClipboardProps: fIncludeClipboardProps0,
} = {}) {
  const fIncludeClipboardProps = fIncludeClipboardProps0 != null
    ? fIncludeClipboardProps0
    : fIncludeFocusCapture;
  const composedComponentName = ComposedComponent.displayName ||
    ComposedComponent.name || 'Component';
  const hocDisplayName = `Input(${composedComponentName})`;

  class Klass extends React.PureComponent {
    static displayName = hocDisplayName;
    static propTypes = PROP_TYPES;
    static defaultProps = {
      focusOnChange:          true,
      errors:                 [],
      validators:             [],
    };

    constructor(props) {
      super(props);
      this.curValue = toInternalValue(props.value, props);
      this.prevValue = this.curValue;
      this.validationErrors = [];
      this.lastValidatedValue = undefined;
      // NOTE: this.errors = this.props.errors (user-provided) + this.validationErrors
      this.recalcErrors(props);
      this.prevErrors = this.errors;
      this.fFocused = false;
      this.keyDown = null;
    }

    componentDidMount() {
      warnFloats(hocDisplayName);
      this.renderErrorFloat();
    }

    componentWillReceiveProps(nextProps) {
      const { value, errors, cmds } = nextProps;
      if (value !== this.props.value) this.setCurValue(toInternalValue(value, nextProps));
      if (errors !== this.props.errors) this.recalcErrors(nextProps);
      if (cmds !== this.props.cmds) this.processCmds(cmds, nextProps);
    }

    componentDidUpdate(prevProps) {
      const { value } = this.props;
      const { curValue, prevValue } = this;
      if (this.errors !== this.prevErrors ||
          value !== prevProps.value ||
          curValue !== prevValue) {
        this.renderErrorFloat();
      }
      if (this.pendingFocusBlur) {
        // execute `FOCUS` and `BLUR` commands asynchronously, so that the owner
        // of the Input component doesn't find a `null` ref in a `focus`/`blur` handler
        setTimeout(() => {
          if (!this.pendingFocusBlur) return;
          if (!this[this.pendingFocusBlur]) return;
          this[this.pendingFocusBlur]();
          this.pendingFocusBlur = null;
        });
      }
      this.prevValue = this.curValue;
      this.prevErrors = this.errors;
    }

    componentWillUnmount() { floatDelete(this.errorFloatId); }

    // ==========================================
    // Imperative API (via props or directly)
    // ==========================================
    processCmds(cmds, nextProps) {
      if (cmds == null) return;
      cmds.forEach((cmd) => {
        switch (cmd.type) {
          case 'SET_VALUE':
            this.setCurValue(toInternalValue(cmd.value, nextProps));
            break;
          case 'REVERT':
            this.setCurValue(toInternalValue(nextProps.value, nextProps));
            break;
          case 'VALIDATE':
            this._validate().catch(() => {});
            break;
          case 'FOCUS':
            this.pendingFocusBlur = '_focus';
            break;
          case 'BLUR':
            this.pendingFocusBlur = '_blur';
            break;
          default:
            break;
        }
      });
    }

    // Alternative to using the `onChange` prop (e.g. if we want to delegate
    // state handling to the input and only want to retrieve the value when submitting a form)
    getValue() { return toExternalValue(this.curValue, this.props); }
    getErrors() { return this.errors; }
    validateAndGetValue() { return this._validate().then(() => this.getValue()); }

    // ==========================================
    // Render
    // ==========================================
    render() {
      const otherProps = omit(this.props, PROP_KEYS);

      // Render the basic wrapped component
      let out = (
        <ComposedComponent
          registerOuterRef={this.registerOuterRef}
          registerFocusableRef={fIncludeFocusCapture ? undefined : this.registerFocusableRef}
          {...otherProps}
          curValue={this.curValue}
          errors={this.errors}
          required={this.props.required}
          cmds={this.props.cmds}
          keyDown={this.keyDown}
          disabled={this.props.disabled}
          fFocused={this.fFocused}
          floatZ={this.props.floatZ}
          floatPosition={this.props.floatPosition}
          onChange={this.onChange}
          onFocus={fIncludeFocusCapture ? undefined : this.onFocus}
          onBlur={fIncludeFocusCapture ? undefined : this.onBlur}
          onCopy={fIncludeClipboardProps ? this.onCopyCut : undefined}
          onCut={fIncludeClipboardProps ? this.onCopyCut : undefined}
          onPaste={fIncludeClipboardProps ? this.onPaste : undefined}
          onResizeOuter={floatReposition}
          styleOuter={fIncludeFocusCapture ? undefined : this.props.styleOuter}
        />
      );

      // Render FocusCapture if needed
      let focusCaptureEl;
      if (fIncludeFocusCapture) {
        focusCaptureEl = (
          <FocusCapture
            registerRef={this.registerFocusableRef}
            disabled={this.props.disabled}
            onFocus={this.onFocus} onBlur={this.onBlur}
            onCopy={this.onCopyCut} onCut={this.onCopyCut} onPaste={this.onPaste}
            onKeyDown={this.onKeyDown}
          />
        );
      }

      // Render errors if needed
      let errorsEl;
      const { errors } = this;
      if (IS_IOS && errors.length) {
        const { position, align, zIndex } = this.calcFloatPosition();
        errorsEl = (
          <IosFloatWrapper
            floatPosition={position}
            floatAlign={align}
            floatZ={zIndex}
          >
            {this.renderErrors()}
          </IosFloatWrapper>
        );
      }

      // Wrap element if needed
      if (focusCaptureEl || errorsEl) {
        out = (
          <span
            className={className}
            onMouseDown={focusCaptureEl ? this.onMouseDownWrapper : undefined}
            onClick={focusCaptureEl ? this.onClickWrapper : undefined}
            style={style.wrapper(this.props)}
          >
            {focusCaptureEl}
            {errorsEl}
            {out}
          </span>
        );
      }

      return out;
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
        const floatOptions = merge(this.calcFloatPosition(), {
          getAnchorNode: () => this.refOuter || this.refFocusable,
          children: this.renderErrors(),
        });
        if (this.errorFloatId == null) {
          this.errorFloatId = floatAdd(floatOptions);
        } else {
          floatUpdate(this.errorFloatId, floatOptions);
        }
      }
    }

    renderErrors() {
      const { errors, curValue, lastValidatedValue } = this;
      // console.log(`Rendering; lastValidatedValue=${lastValidatedValue}, curValue=${curValue}, ` +
      //   `internal value for props.value=${toInternalValue(this.props.value, this.props)}`);
      const fModified = lastValidatedValue !== undefined ?
        curValue !== lastValidatedValue :
        curValue !== toInternalValue(this.props.value, this.props);
      return (
        <div style={style.errors(fModified, this.context.theme)}>
          {errors.join(' | ')}
        </div>
      );
    }

    // ==========================================
    // Handlers
    // ==========================================
    registerOuterRef = (c) => { this.refOuter = c; }
    registerFocusableRef = (c) => { this.refFocusable = c; }

    setCurValue(curValue) {
      if (curValue === this.curValue) return;
      this.curValue = curValue;
      this.forceUpdate();
    }

    onChange = (ev, providedValue, options = {}) => {
      const { onChange, disabled } = this.props;
      if (disabled) return;
      let curValue = providedValue;
      if (curValue === undefined) curValue = ev.currentTarget[valueAttr];
      this.setCurValue(curValue);
      if (onChange) onChange(ev, toExternalValue(curValue, this.props));
      if (this.props.focusOnChange && !this.fFocused && !options.fDontFocus) {
        this._focus();
      }
    }

    onFocus = (ev) => {
      const { onFocus, disabled } = this.props;
      if (disabled) {
        this._blur();
        return;
      }
      if (this.refOuter) scrollIntoView(this.refOuter);
      this.changedFocus(true);
      if (onFocus) onFocus(ev);
    }

    onBlur = (ev) => {
      const { onBlur } = this.props;
      this._validate().catch(() => {});
      this.changedFocus(false);
      if (onBlur) onBlur(ev);
    }

    onMouseDownWrapper = (ev) => {
      // Always cancel mousedowns: they blur the component. If they are interesting,
      // capture them at a lower level
      cancelEvent(ev);

      // If not focused, a mouse-down should focus the component and cancel the event
      if (this.fFocused) return;
      this._focus();
    }

    // Cancel bubbling of click events; they may reach Modals
    // on their way up and cause the element to blur.
    // Allow free propagation if the element is disabled.
    onClickWrapper = (ev) => {
      if (!this.props.disabled) stopPropagation(ev);
    }

    onKeyDown = (ev) => {
      const { which, keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
      if (trappedKeys.indexOf(which) < 0) return;
      this.keyDown = { which, keyCode, metaKey, shiftKey, altKey, ctrlKey };
      this.forceUpdate();
    }

    onCopyCut = (ev) => {
      ev.clipboardData.setData('text/plain', this.curValue);
      ev.preventDefault();
    }

    onPaste = (ev) => {
      const nextValue = ev.clipboardData.getData('text/plain');
      ev.preventDefault();
      this.onChange(ev, nextValue);
    }

    // ==========================================
    // Helpers
    // ==========================================
    _focus() {
      if (this.refFocusable && this.refFocusable.focus) this.refFocusable.focus();
    }

    _blur() {
      if (this.refFocusable && this.refFocusable.blur) this.refFocusable.blur();
    }

    changedFocus(fFocused) {
      if (fFocused === this.fFocused) return;
      this.fFocused = fFocused;
      this.forceUpdate();
    }

    _validate() {
      const { noErrors } = this.props;
      if (noErrors) return Promise.resolve();
      let validators;
      if (this.props.validators.length) {
        validators = merge({}, defaultValidators);
        let cnt = 0;
        this.props.validators.forEach((validator) => {
          validators[validator.id || `anon_${cnt}`] = validator;
          cnt += 1;
        });
      } else {
        validators = defaultValidators;
      }
      const { curValue: internalValue } = this;
      const externalValue = toExternalValue(internalValue, this.props);
      const fRequired = this.props.required || validators.isRequired != null;
      const fIsNull = isNull(internalValue);
      let pErrors; // promised errors

      // If `null` is allowed and input is `null`, bail out
      if (!fRequired && fIsNull) {
        pErrors = [];

      // If input is null (unallowed), get the corresponding message and bail out
      } else if (fIsNull) {
        const validator = validators.isRequired || isRequired();
        pErrors = [validator.getErrorMessage(internalValue)];

      // Otherwise, collect all validator errors (skipping `isRequired`)
      } else {
        pErrors = [];
        Object.keys(validators).forEach((id) => {
          if (id === 'isRequired') return;
          const validator = validators[id];
          const validate = validator.validate || validator;
          const value = validator.fInternal ? internalValue : externalValue;
          const pError = validate(value, this.props, validatorContext);
          if (pError != null) pErrors.push(pError);
        });
      }

      // When all promises have resolved, change the current state
      return Promise.all(pErrors).then((validationErrors0) => {
        const validationErrors = validationErrors0.filter((o) => o != null);
        const prevLastValidatedValue = this.lastValidatedValue;
        this.lastValidatedValue = internalValue;
        if (
          this.lastValidatedValue !== prevLastValidatedValue ||
          validationErrors.join('') !== this.validationErrors.join('')  // string compare
        ) {
          this.validationErrors = validationErrors;
          this.recalcErrors(this.props);
          this.forceUpdate();
        }
        if (validationErrors.length) {
          const exception = new Error('VALIDATION_ERROR');
          exception.errors = validationErrors;
          throw exception;
        }
      });
    }

    recalcErrors(props) {
      this.errors = props.errors.concat(this.validationErrors);
    }

    calcFloatPosition() {
      const {
        floatZ, floatPosition,
        errorZ, errorPosition, errorAlign,
      } = this.props;
      let zIndex = errorZ;
      if (zIndex == null) {
        zIndex = floatZ != null ? floatZ - MISC.zErrorFloatDelta : MISC.zErrorFloatDelta;
      }
      let position = errorPosition;
      if (position == null) {
        position = floatPosition === 'below' ? 'above' : 'below';
      }
      return { position, align: errorAlign, zIndex };
    }
  }

  Klass.contextTypes = { theme: React.PropTypes.any };

  return Klass;
}

// ==========================================
// Styles
// ==========================================
const errorBgColorBase = COLORS.notifs.error;
const errorFgColorBase = COLORS[isDark(errorBgColorBase) ? 'lightText' : 'darkText'];
const errorBgColorModified = COLORS.notifs.warn;
const errorFgColorModified = COLORS[isDark(errorBgColorModified) ? 'lightText' : 'darkText'];
const style = {
  wrapper: ({ styleOuter }) => {
    let out = styleOuter || {};
    out = merge(out, {
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
// Public API
// ==========================================
export default input;
