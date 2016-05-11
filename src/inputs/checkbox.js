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
    id:                     React.PropTypes.string,
    label:                  React.PropTypes.string,
    disabled:               React.PropTypes.bool,
    styleLabel:             React.PropTypes.object,
    // Input HOC
    curValue:               React.PropTypes.bool.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through to the `input` unchanged
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    return this.props.label
      ? this.renderWithLabel()
      : this.renderInput('giu-checkbox');
  }

  renderWithLabel() {
    const { id, label, registerOuterRef, styleLabel } = this.props;
    return (
      <span ref={registerOuterRef} className="giu-checkbox">
        {this.renderInput()}
        <label htmlFor={id} style={styleLabel}>{label}</label>
      </span>
    );
  }

  renderInput(className) {
    const { id, curValue, registerFocusableRef } = this.props;
    const inputProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={registerFocusableRef}
        id={id} className={className}
        type="checkbox"
        checked={curValue}
        {...inputProps}
      />
    );
  }
}

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
