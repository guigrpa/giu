import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import { COLORS, MISC }     from '../gral/constants';
import { scrollIntoView }   from '../gral/visibility';
import { isDark }           from '../gral/styles';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';
import FocusCapture         from '../components/focusCapture';

const PROP_TYPES = {
  value:                  React.PropTypes.any,
  errors:                 React.PropTypes.array,  // also passed through
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
  valueAttr = 'value',
  fIncludeFocusCapture = false,
  trappedKeys = [],
  className,
} = {}) {
  return class extends React.Component {
    static displayName = `Input(${ComposedComponent.name})`;
    static propTypes = PROP_TYPES;
    static defaultProps = {
      errors:                 [],
    };

    constructor(props) {
      super(props);
      this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
      this.state = {
        curValue: toInternalValue(props.value, props),
        fFocused: false,
        keyDown: null,
      };
      bindAll(this, [
        'registerOuterRef',
        'registerFocusableRef',
        'renderErrorFloat',
        'onChange',
        'onFocus',
        'onBlur',
        'onMouseDownWrapper',
        'onKeyDown',
      ]);
    }

    componentWillReceiveProps(nextProps) {
      const { value, cmds } = nextProps;
      if (value !== this.props.value) {
        this.setState({ curValue: toInternalValue(value, nextProps) });
      }
      if (cmds !== this.props.cmds) this.processCmds(cmds);
    }

    componentDidMount() {
      warnFloats(this.constructor.name);
      this.renderErrorFloat();
    }

    componentDidUpdate(prevProps, prevState) {
      const { cmds, errors, value } = this.props;
      const { curValue } = this.state;
      if (errors !== prevProps.errors ||
          value !== prevProps.value ||
          curValue !== prevState.curValue) {
        this.renderErrorFloat();
      }
      if (this.pendingFocusBlur) {
        this[this.pendingFocusBlur]();
        this.pendingFocusBlur = null;
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

    // e.g. user clicks a button that replaces the temporary value being edited
    // setValue(val, cb) { this.setState({ curValue: toInternalValue(val, this.props) }, cb); }

    // e.g. user clicks a button that reverts all changes to the input
    // revert(cb) {
    //   this.setState({ curValue: toInternalValue(this.props.value, this.props) }, cb);
    // }
    // focus() { if (this.refFocusable && this.refFocusable.focus) this.refFocusable.focus(); }
    // blur() { if (this.refFocusable && this.refFocusable.blur) this.refFocusable.blur(); }


    // ==========================================
    // Render
    // ==========================================
    render() {
      const otherProps = omit(this.props, PROP_KEYS);
      // `cmds` are both used by this HOC and passed through
      let registerFocusableRef;
      let onFocus;
      let onBlur;
      if (!fIncludeFocusCapture) {
        registerFocusableRef = this.registerFocusableRef;
        onFocus = this.onFocus;
        onBlur = this.onBlur;
      }
      const el = (
        <ComposedComponent
          registerOuterRef={this.registerOuterRef}
          registerFocusableRef={registerFocusableRef}
          {...otherProps}
          curValue={this.state.curValue}
          errors={this.props.errors}
          cmds={this.props.cmds}
          keyDown={this.state.keyDown}
          disabled={this.props.disabled}
          fFocused={this.state.fFocused}
          floatZ={this.props.floatZ}
          floatPosition={this.props.floatPosition}
          onChange={this.onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onResizeOuter={this.renderErrorFloat}
          styleOuter={fIncludeFocusCapture ? undefined : this.props.styleOuter}
        />
      );
      if (fIncludeFocusCapture) {
        const { styleOuter } = this.props;
        return (
          <span
            className={className}
            onMouseDown={this.onMouseDownWrapper}
            style={styleOuter}
          >
            <FocusCapture
              registerRef={this.registerFocusableRef}
              onFocus={this.onFocus} onBlur={this.onBlur}
              onKeyDown={this.onKeyDown}
            />
            {el}
          </span>
        );
      } else {
        return el;
      }
    }

    renderErrorFloat() {
      const { errors } = this.props;

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
      const { value } = this.props;
      const extCurValue = toExternalValue(this.state.curValue, this.props);
      const fModified = value != null ? (extCurValue !== value) : (extCurValue != null);
      return (
        <div style={style.errors(fModified)}>
          {errors.join(' | ')}
        </div>
      );
    }

    // ==========================================
    // Handlers
    // ==========================================
    registerOuterRef(c) { this.refOuter = c; }
    registerFocusableRef(c) { this.refFocusable = c; }

    onChange(ev, providedValue, providedProps) {
      const { onChange, disabled } = this.props;
      if (disabled) return;
      let curValue = providedValue;
      if (curValue === undefined) {
        curValue = ev.currentTarget[valueAttr];
      }
      this.setState({ curValue });
      if (onChange) {
        const propsForConverter = providedProps || this.props;
        onChange(ev, toExternalValue(curValue, propsForConverter));
      }
      if (!this.state.fFocused) this._focus();
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


    // ==========================================
    // Helpers
    // ==========================================
    _focus() {
      if (this.refFocusable && this.refFocusable.focus) this.refFocusable.focus();
    }

    _blur() {
      if (this.refFocusable && this.refFocusable.blur) this.refFocusable.blur();
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
  errors: fModified => ({
    backgroundColor: fModified ? errorBgColorModified : errorBgColorBase,
    color: fModified ? errorFgColorModified : errorFgColorBase,
    padding: '1px 3px',
  }),
};

// ==========================================
// Public API
// ==========================================
export default input;
