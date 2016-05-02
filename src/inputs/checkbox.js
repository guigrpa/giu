import React                from 'react';
import { omit }             from 'timm';
import input                from '../hocs/input';

function toInternalValue(val) { return val != null ? val : false; }
function toExternalValue(val) { return val; }

// ==========================================
// Component
// ==========================================
class Checkbox extends React.Component {
  static propTypes = {
    // Input HOC
    curValue:               React.PropTypes.bool.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, registerFocusableRef } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={registerFocusableRef}
        className="giu-checkbox"
        type="checkbox"
        checked={curValue}
        {...otherProps}
      />
    );
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
export default input(Checkbox, {
  toInternalValue, toExternalValue,
  valueAttr: 'checked',
});
