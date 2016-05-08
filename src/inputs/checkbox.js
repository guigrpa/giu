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
    style:                  React.PropTypes.object,
    // Input HOC
    curValue:               React.PropTypes.bool.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    return this.props.label ? this.renderWithLabel() : this.renderStandalone();
  }

  renderStandalone() {
    const {
      id,
      curValue,
      registerFocusableRef,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={registerFocusableRef}
        className="giu-checkbox"
        id={id}
        type="checkbox"
        checked={curValue}
        {...otherProps}
      />
    );
  }

  renderWithLabel() {
    const {
      id, label,
      curValue,
      registerOuterRef,
      registerFocusableRef,
      style: baseStyle,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <span ref={registerOuterRef}
        className="giu-checkbox"
      >
        <input ref={registerFocusableRef}
          id={id}
          type="checkbox"
          checked={curValue}
          {...otherProps}
        />
        <label
          htmlFor={id}
          style={baseStyle}
        >
          {label}
        </label>
      </span>
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
