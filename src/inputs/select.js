import React                from 'react';
import { omit }             from 'timm';
import input                from '../hocs/input';
import { LIST_SEPARATOR }   from '../inputs/listPicker';

const NULL_VALUE = '__NULL__';
function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? JSON.parse(val) : null; }

// ==========================================
// Component
// ==========================================
class Select extends React.Component {
  static propTypes = {
    options:                React.PropTypes.array.isRequired,
    allowNull:              React.PropTypes.bool,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, options, allowNull, registerFocusableRef } = this.props;
    const finalOptions = [];
    if (allowNull) finalOptions.push({ value: NULL_VALUE, label: '' });
    for (const option of options) {
      if (option.label !== LIST_SEPARATOR.label) finalOptions.push(option);
    }
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <select ref={registerFocusableRef}
        className="giu-select"
        value={curValue}
        {...otherProps}
      >
        {finalOptions.map(o => {
          const value = o.value === NULL_VALUE ? o.value : toInternalValue(o.value);
          return <option key={value} id={value} value={value}>{o.label}</option>;
        })}
      </select>
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
const PROP_KEYS = Object.keys(Select.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(Select, { toInternalValue, toExternalValue });
