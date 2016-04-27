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
    curValue:               React.PropTypes.bool.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    // all others are passed through unchanged
  };

  // ==========================================
  // Imperative API
  // ==========================================
  focus() { this._refInput.focus(); }
  blur() { this._refInput.blur(); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={c => { this._refInput = c; }}
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
