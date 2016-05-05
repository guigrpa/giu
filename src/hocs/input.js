import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';
import { COLORS, MISC }     from '../gral/constants';
import { isDark }           from '../gral/styles';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';

const PROP_TYPES = {
  value:                  React.PropTypes.any,
  errors:                 React.PropTypes.array,
  cmds:                   React.PropTypes.array,
  onChange:               React.PropTypes.func,
  onFocus:                React.PropTypes.func,
  onBlur:                 React.PropTypes.func,
  disabled:               React.PropTypes.bool,
  floatZ:                 React.PropTypes.number,
  floatPosition:          React.PropTypes.string,
  errorZ:                 React.PropTypes.number,
  errorPosition:          React.PropTypes.string,
  errorAlign:             React.PropTypes.string,
  // all others are passed through unchanged
};
const PROP_KEYS = Object.keys(PROP_TYPES);

// **IMPORTANT**: must be the outermost HOC (i.e. closest to the
// user), for the imperative API to work.
function input(ComposedComponent, {
  toInternalValue = (o => o),
  toExternalValue = (o => o),
  valueAttr = 'value',
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
        curValue: toInternalValue(props.value),
        fFocused: false,
      };
      bindAll(this, [
        'onChange',
        'onFocus',
        'onBlur',
        'renderFloat',
      ]);
    }

    componentWillReceiveProps(nextProps) {
      const { value } = nextProps;
      if (value !== this.props.value) {
        this.setState({ curValue: toInternalValue(value) });
      }
    }

    componentDidMount() {
      warnFloats(this.constructor.name);
      this.renderFloat();
    }

    componentDidUpdate(prevProps) {
      const { cmds, errors } = this.props;
      if (cmds && cmds !== prevProps.cmds) this.processCmds(cmds);
      if (errors !== prevProps.errors) this.renderFloat();
    }

    componentWillUnmount() { floatDelete(this.errorFloatId); }

    // ==========================================
    // Imperative API (via props or directly)
    // ==========================================
    processCmds(cmds) {
      for (const cmd of cmds) {
        switch (cmd.type) {
          case 'SET_VALUE':
            this.setState({ curValue: toInternalValue(cmd.value) });
            break;
          case 'REVERT':
            this.setState({ curValue: toInternalValue(this.props.value) });
            break;
          case 'FOCUS': this._focus(); break;
          case 'BLUR':  this._blur();  break;
          default:
            break;
        }
      }
    }

    // Alternative to using the `onChange` prop (e.g. if we want to delegate
    // state handling to the input and only want to retrieve the value when submitting a form)
    getValue() { return toExternalValue(this.state.curValue); }

    // e.g. user clicks a button that replaces the temporary value being edited
    // setValue(val, cb) { this.setState({ curValue: toInternalValue(val) }, cb); }

    // e.g. user clicks a button that reverts all changes to the input
    // revert(cb) { this.setState({ curValue: toInternalValue(this.props.value) }, cb); }
    // focus() { if (this.refFocusable && this.refFocusable.focus) this.refFocusable.focus(); }
    // blur() { if (this.refFocusable && this.refFocusable.blur) this.refFocusable.blur(); }


    // ==========================================
    // Render
    // ==========================================
    render() {
      const otherProps = omit(this.props, PROP_KEYS);
      // `cmds` are both used by this HOC and passed through
      return (
        <ComposedComponent
          registerOuterRef={c => { this.refInputOuter = c; }}
          registerFocusableRef={c => { this.refFocusable = c; }}
          {...otherProps}
          cmds={this.props.cmds}
          disabled={this.props.disabled}
          floatZ={this.props.floatZ}
          floatPosition={this.props.floatPosition}
          curValue={this.state.curValue}
          errors={this.props.errors}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onResizeOuter={this.renderFloat}
          fFocused={this.state.fFocused}
        />
      );
    }

    renderFloat() {
      const { errors } = this.props;
      const { errorFloatId } = this;

      // Remove float
      if (!errors.length && errorFloatId != null) {
        floatDelete(errorFloatId);
        this.errorFloatId = null;
        return;
      }

      // Create or update float
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
          getAnchorNode: () => this.refInputOuter || this.refFocusable,
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
      return (
        <div style={style.errors}>
          {errors.join(' | ')}
        </div>
      );
    }

    // ==========================================
    // Handlers
    // ==========================================
    onChange(ev, providedValue) {
      const { onChange, disabled } = this.props;
      if (disabled) return;
      let curValue = providedValue;
      if (providedValue === undefined) {
        curValue = ev.currentTarget[valueAttr];
      }
      this.setState({ curValue });
      if (onChange) onChange(ev, toExternalValue(curValue));
      if (!this.state.fFocused) this._focus();
    }

    onFocus(ev) {
      const { onFocus, disabled } = this.props;
      if (disabled) {
        this._blur();
        return;
      }
      this.setState({ fFocused: true });
      this.renderFloat();
      if (onFocus) onFocus(ev);
    }

    onBlur(ev) {
      const { onBlur } = this.props;
      this.setState({ fFocused: false });
      if (onBlur) onBlur(ev);
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
const errorBgColor = COLORS.notifs.error;
const errorFgColor = COLORS[isDark(errorBgColor) ? 'lightText' : 'darkText'];
const style = {
  errors: {
    backgroundColor: errorBgColor,
    color: errorFgColor,
    padding: "1px 3px",
  },
};

// ==========================================
// Public API
// ==========================================
export default input;
