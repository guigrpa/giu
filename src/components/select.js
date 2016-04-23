import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { addFirst, omit }   from 'timm';
import { bindAll }          from '../gral/helpers';

const NULL_VALUE = '__NULL__';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }

// ==========================================
// Component
// ==========================================
class Select extends React.Component {
  static propTypes = {
    value:                  React.PropTypes.string,
    errors:                 React.PropTypes.array,
    onChange:               React.PropTypes.func,

    options:                React.PropTypes.array.isRequired,
    fAllowNull:             React.PropTypes.bool,
  };
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

  getValue() { return toExternalValue(this.state.curValue); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { options, fAllowNull } = this.props;
    const finalOptions = fAllowNull
      ? addFirst(options, { value: NULL_VALUE, label: '' })
      : options;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <select
        value={this.state.curValue}
        onChange={this.onChange}
        {...otherProps}
      >
        {finalOptions.map(o => (
          <option key={o.value} id={String(o.value)} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  onChange(ev) {
    const { value } = ev.currentTarget;
    this.setState({ curValue: value });
    const { onChange } = this.props;
    if (onChange) onChange(ev, toExternalValue(value));
  }
}

// ==========================================
// Styles
// ==========================================
// const style = {};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Select.propTypes);

// ==========================================
// Public API
// ==========================================
export default Select;
