import React                from 'react';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';
import SelectNative         from '../inputs/selectNative';
import { SelectCustom }     from '../inputs/selectCustom';

// ==========================================
// Component
// ==========================================
class Select extends React.Component {
  static propTypes = {
    type:                   React.PropTypes.oneOf([
      'native',
      'inlinePicker',
      'dropDownPicker',
    ]),
    // all others are passed through unchanged
  };
  static defaultProps = {
    type:                   'native',
  };

  constructor(props) {
    super(props);
    bindAll(this, ['registerInputRef']);
  }

  // ==========================================
  // Imperative API
  // ==========================================
  getValue() { return this.refInput ? this.refInput.getValue() : null; }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { type } = this.props;
    const props = omit(this.props, PROP_KEYS);
    const Component = type === 'native' ? SelectNative : SelectCustom;
    const inlinePicker = type === 'inlinePicker';
    return (
      <Component ref={this.registerInputRef}
        {...props}
        inlinePicker={inlinePicker}
      />
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerInputRef(c) { this.refInput = c; }
}

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Select.propTypes);

// ==========================================
// Public API
// ==========================================
export default Select;
