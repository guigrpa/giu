import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import {
  omit,
  merge,
  addDefaults,
}                           from 'timm';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import {
  COLORS,
  MISC,
  IS_IDEVICE,
}                           from '../gral/constants';
import { scrollIntoView }   from '../gral/visibility';
import { isDark }           from '../gral/styles';
import { isRequired }       from '../gral/validators';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  floatReposition,
  warnFloats,
}                           from '../components/floats';
import FocusCapture         from '../components/focusCapture';

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
  toInternalValue = (o => o),
  toExternalValue = (o => o),
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

  return class extends React.Component {
    static displayName = `Input(${ComposedComponent.name})`;
    static propTypes = PROP_TYPES;
    static defaultProps = {
      errors:                 [],
      validators:             [],
    };

    constructor(props) {
      super(props);
      this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

      // NOTE: this.errors = this.props.errors + this.state.validationErrors
      this.errors = props.errors;
      this.prevErrors = this.errors;
      this.state = {
        curValue: toInternalValue(props.value, props),
        fFocused: false,
        keyDown: null,
        validationErrors: [],
        lastValidatedValue: toInternalValue(props.value, props),
      };
      bindAll(this, [
        'registerOuterRef',
        'registerFocusableRef',
        'renderErrorFloat',
        'onChange',
        'onFocus',
        'onBlur',
        'onCopyCut',
        'onPaste',
        'onMouseDownWrapper',
        'onKeyDown',
      ]);
    }

    componentDidMount() {
      warnFloats(this.constructor.name);
      this.renderErrorFloat();
    }

    componentWillReceiveProps(nextProps) {
      const { value, cmds } = nextProps;
      if (value !== this.props.value) {
        this.setState({ curValue: toInternalValue(value, nextProps) });
      }
      if (cmds !== this.props.cmds) this.processCmds(cmds);
    }

    componentWillUpdate(nextProps, nextState) {
      const { errors } = nextProps;
      const { validationErrors } = nextState;
      if (errors !== this.props.errors ||
          validationErrors !== this.state.validationErrors) {
        this.errors = errors.concat(validationErrors);
      }
    }

    componentDidUpdate(prevProps, prevState) {
      const { value } = this.props;
      const { curValue } = this.state;
      if (this.errors !== this.prevErrors ||
          value !== prevProps.value ||
          curValue !== prevState.curValue) {
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
    }

    componentWillUnmount() { floatDelete(this.errorFloatId); }

    // ==========================================
    // Imperative API (via props or directly)
    // ==========================================
    processCmds(cmds) {
      if (cmds == null) return;
      cmds.forEach(cmd => {
        switch (cmd.type) {
          case 'SET_VALUE':
            this.setState({ curValue: toInternalValue(cmd.value, this.props) });
            break;
          case 'REVERT':
            this.setState({ curValue: toInternalValue(this.props.value, this.props) });
            break;
          case 'VALIDATE':
            this.validate();
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
    getValue() { return toExternalValue(this.state.curValue, this.props); }
    getErrors() { return this.errors; }
    validateAndGetValue() { return this._validate().then(() => this.getValue()); }

    // ==========================================
    // Render
    // ==========================================
    render() {
      const otherProps = omit(this.props, PROP_KEYS);
      let out = (
        <ComposedComponent
          registerOuterRef={this.registerOuterRef}
          registerFocusableRef={fIncludeFocusCapture ? undefined : this.registerFocusableRef}
          {...otherProps}
          curValue={this.state.curValue}
          errors={this.errors}
          required={this.props.required}
          cmds={this.props.cmds}
          keyDown={this.state.keyDown}
          disabled={this.props.disabled}
          fFocused={this.state.fFocused}
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
      if (fIncludeFocusCapture) focusCaptureEl = (
        <FocusCapture
          registerRef={this.registerFocusableRef}
          disabled={this.props.disabled}
          onFocus={this.onFocus} onBlur={this.onBlur}
          onCopy={this.onCopyCut} onCut={this.onCopyCut} onPaste={this.onPaste}
          onKeyDown={this.onKeyDown}
        />
      );

      // Render errors if needed
      let errorsEl;
      const { errors } = this;
      if (IS_IDEVICE && errors.length) errorsEl = this.renderErrors(this.errors);

      // Wrap element if needed
      if (focusCaptureEl || errorsEl) out = (
        <span
          className={className}
          onMouseDown={focusCaptureEl ? this.onMouseDownWrapper : undefined}
          style={style.wrapper(this.props)}
        >
          {focusCaptureEl}
          {errorsEl}
          {out}
        </span>
      );

      return out;
    }

    renderErrorFloat() {
      if (IS_IDEVICE) return;
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
        const floatOptions = {
          position,
          align: errorAlign,
          zIndex,
          getAnchorNode: () => this.refOuter || this.refFocusable,
          children: this.renderErrors(errors),
        };
        if (this.errorFloatId == null) {
          this.errorFloatId = floatAdd(floatOptions);
        } else {
          floatUpdate(this.errorFloatId, floatOptions);
        }
      }
    }

    renderErrors(errors) {
      const { curValue, lastValidatedValue } = this.state;
      let fModified = false;
      if (curValue != null) fModified = curValue !== lastValidatedValue;
      return (
        <div style={style.errors(fModified, this.props)}>
          {errors.join(' | ')}
        </div>
      );
    }

    // ==========================================
    // Handlers
    // ==========================================
    registerOuterRef(c) { this.refOuter = c; }
    registerFocusableRef(c) { this.refFocusable = c; }

    onChange(ev, providedValue, options) {
      const { onChange, disabled } = this.props;
      if (disabled) return;
      let curValue = providedValue;
      if (curValue === undefined) {
        curValue = ev.currentTarget[valueAttr];
      }
      this.setState({ curValue });
      if (onChange) onChange(ev, toExternalValue(curValue, this.props));
      if (!this.state.fFocused) {
        if (options && !options.fDontFocus) this._focus();
      }
    }

    onFocus(ev) {
      const { onFocus, disabled } = this.props;
      if (disabled) {
        this._blur();
        return;
      }
      if (this.refOuter) scrollIntoView(this.refOuter);
      this.setState({ fFocused: true });
      if (onFocus) onFocus(ev);
    }

    onBlur(ev) {
      const { onBlur } = this.props;
      this._validate();
      this.setState({ fFocused: false });
      if (onBlur) onBlur(ev);
    }

    onMouseDownWrapper(ev) {
      // Always cancel mousedowns: they blur the component. If they are interesting,
      // capture them at a lower level
      cancelEvent(ev);

      // If not focused, a mouse-down should focus the component and cancel the event
      if (this.state.fFocused) return;
      this._focus();
    }

    onKeyDown(ev) {
      const { which, keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
      if (trappedKeys.indexOf(which) < 0) return;
      this.setState({ keyDown: { which, keyCode, metaKey, shiftKey, altKey, ctrlKey } });
    }

    onCopyCut(ev) {
      ev.clipboardData.setData('text/plain', this.state.curValue);
      ev.preventDefault();
    }

    onPaste(ev) {
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

    _validate() {
      const { noErrors } = this.props;
      if (noErrors) return Promise.resolve();
      let validators;
      if (this.props.validators.length) {
        validators = merge({}, defaultValidators);
        let cnt = 0;
        this.props.validators.forEach(validator => {
          validators[validator.id || `anon_${cnt++}`] = validator;
        });
      } else {
        validators = defaultValidators;
      }
      const { curValue: internalValue } = this.state;
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
        Object.keys(validators).forEach(id => {
          if (id === 'isRequired') return;
          const validator = validators[id];
          const validate = validator.validate || validator;
          const value = validator.fInternal ? internalValue : externalValue;
          const pError = validate(value, this.props, validatorContext);
          if (pError != null) pErrors.push(pError);
        });
      }

      // When all promises have resolved, changed the current state
      return Promise.all(pErrors).then(validationErrors0 => {
        const validationErrors = validationErrors0.filter(o => o != null);
        this && this.setState && this.setState({
          validationErrors,
          lastValidatedValue: internalValue,
        });
        if (validationErrors.length) {
          const exception = new Error('VALIDATION_ERROR');
          exception.errors = validationErrors;
          throw exception;
        }
      });
    }
  };
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
  errors: fModified => {
    const out = {
      padding: '1px 3px',
    };
    if (IS_IDEVICE) {
      out.position = 'absolute';
      out.top = '100%';
      out.left = 0;
    }
    out.backgroundColor = fModified ? errorBgColorModified : errorBgColorBase;
    out.color = fModified ? errorFgColorModified : errorFgColorBase;
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
export default input;
