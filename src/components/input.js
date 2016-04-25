import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';

const NULL_VALUE = '';
const converters = {
  text: {
    toInternalValue: val => (val != null ? val : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? val : null),
  },
  number: {
    toInternalValue: val => (val != null ? String(val) : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? Number(val) : null),
  },
};

// ==========================================
// Component
// ==========================================
class Input extends React.Component {
  static propTypes = {
    type:                   React.PropTypes.string.isRequired,
    value:                  React.PropTypes.any,
    errors:                 React.PropTypes.array,
    onChange:               React.PropTypes.func,
  };
  static defaultProps = {
    errors:                 [],
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {
      curValue: converters[props.type].toInternalValue(props.value),
    };
    bindAll(this, ['onChange']);
  }

  componentWillReceiveProps(nextProps) {
    const { type, value } = nextProps;
    if (value !== this.props.value) {
      this.setState({ curValue: converters[type].toInternalValue(value) });
    }
  }

  getValue() { return converters[this.props.type].toExternalValue(this.state.curValue); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { type } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input
        type={type}
        value={this.state.curValue}
        onChange={this.onChange}
        {...otherProps}
      />
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  onChange(ev) {
    const { value } = ev.currentTarget;
    this.setState({ curValue: value });
    const { type, onChange } = this.props;
    // TODO: numbers, check NaNs!!!!
    if (onChange) onChange(ev, converters[type].toExternalValue(value));
  }
}

// ==========================================
// Styles
// ==========================================
// const style = {};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Input.propTypes);

// ==========================================
// Public API
// ==========================================
export default Input;
