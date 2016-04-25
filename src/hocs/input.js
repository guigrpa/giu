import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';

const PROP_TYPES = {
  value:                  React.PropTypes.any,
  errors:                 React.PropTypes.array,
  onChange:               React.PropTypes.func,
  // all others are passed through unchanged
};
const PROP_KEYS = Object.keys(PROP_TYPES);

function input(ComposedComponent, {
  toInternalValue,
  toExternalValue,
  valueAttr = 'value',
}) {
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
      };
      bindAll(this, ['onChange']);
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
    focus() { this._refInput.focus(); }
    blur() { this._refInput.blur(); }

    // ==========================================
    // Render
    // ==========================================
    render() {
      const otherProps = omit(this.props, PROP_KEYS);
      return (
        <ComposedComponent ref={c => { this._refInput = c; }}
          {...otherProps}
          errors={this.props.errors}
          curValue={this.state.curValue}
          onChange={this.onChange}
        />
      );
    }

    // ==========================================
    // Handlers
    // ==========================================
    onChange(ev) {
      const curValue = ev.currentTarget[valueAttr];
      this.setState({ curValue });
      const { onChange } = this.props;
      if (onChange) onChange(ev, toExternalValue(curValue));
    }
  };
}

// ==========================================
// Public API
// ==========================================
export default input;
