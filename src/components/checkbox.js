import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';

function toInternalValue(val) { return val != null ? val : false; }
function toExternalValue(val) { return val; }

// ==========================================
// Component
// ==========================================
class Checkbox extends React.Component {
  static propTypes = {
    value:                  React.PropTypes.bool,
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
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input
        type="checkbox"
        checked={this.state.curValue}
        onChange={this.onChange}
        {...otherProps}
      />
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  onChange(ev) {
    const { checked: value } = ev.currentTarget;
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
const PROP_KEYS = Object.keys(Checkbox.propTypes);

// ==========================================
// Public API
// ==========================================
export default Checkbox;
