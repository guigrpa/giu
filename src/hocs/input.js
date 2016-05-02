import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';

const PROP_TYPES = {
  value:                  React.PropTypes.any,
  errors:                 React.PropTypes.array,
  onChange:               React.PropTypes.func,
  onFocus:                React.PropTypes.func,
  onBlur:                 React.PropTypes.func,
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
      ]);
    }

    componentWillReceiveProps(nextProps) {
      const { value } = nextProps;
      if (value !== this.props.value) {
        this.setState({ curValue: toInternalValue(value) });
      }
    }

    // ==========================================
    // Imperative API
    // ==========================================
    getValue() { return toExternalValue(this.state.curValue); }
    setValue(val, cb) { this.setState({ curValue: toInternalValue(val) }, cb); }
    revert(cb) { this.setState({ curValue: toInternalValue(this.props.value) }, cb); }
    focus() { if (this.refFocusable && this.refFocusable.focus) this.refFocusable.focus(); }
    blur() { if (this.refFocusable && this.refFocusable.blur) this.refFocusable.blur(); }

    // ==========================================
    // Render
    // ==========================================
    render() {
      const otherProps = omit(this.props, PROP_KEYS);
      return (
        <ComposedComponent
          registerFocusableRef={c => { this.refFocusable = c; }}
          {...otherProps}
          curValue={this.state.curValue}
          errors={this.props.errors}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          fFocused={this.state.fFocused}
        />
      );
    }

    // ==========================================
    // Handlers
    // ==========================================
    onChange(ev, providedValue) {
      let curValue = providedValue;
      if (providedValue == null) {
        curValue = ev.currentTarget[valueAttr];
      }
      this.setState({ curValue });
      const { onChange } = this.props;
      if (onChange) onChange(ev, toExternalValue(curValue));
    }

    onFocus(ev) {
      this.setState({ fFocused: true });
      if (this.props.onFocus) this.props.onFocus(ev);
    }

    onBlur(ev) {
      this.setState({ fFocused: false });
      if (this.props.onBlur) this.props.onBlur(ev);
    }
  };
}

// ==========================================
// Public API
// ==========================================
export default input;
