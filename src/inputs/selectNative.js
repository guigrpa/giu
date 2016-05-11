import React                from 'react';
import { omit, merge }      from 'timm';
import { NULL_STRING }      from '../gral/constants';
import {
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import input                from '../hocs/input';
import { LIST_SEPARATOR_KEY } from '../inputs/listPicker';

function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_STRING; }
function toExternalValue(val) { return val !== NULL_STRING ? JSON.parse(val) : null; }

// ==========================================
// Component
// ==========================================
class SelectNative extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    allowNull:              React.PropTypes.bool,
    disabled:               React.PropTypes.bool,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through to the `select` unchanged
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, items, allowNull, registerFocusableRef } = this.props;
    const finalItems = [];
    if (allowNull) finalItems.push({ value: NULL_STRING, label: '' });
    for (const option of items) {
      if (option.label !== LIST_SEPARATOR_KEY) finalItems.push(option);
    }
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <select ref={registerFocusableRef}
        className="giu-select-native"
        value={curValue}
        {...otherProps}
        style={style.field(this.props)}
      >
        {finalItems.map(o => {
          const value = o.value === NULL_STRING ? o.value : toInternalValue(o.value);
          return <option key={value} id={value} value={value}>{o.label}</option>;
        })}
      </select>
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  fieldBase: inputReset({
    backgroundColor: 'default',
    border: 'default',
  }),
  field: ({ disabled }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    return out;
  }
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(SelectNative.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(SelectNative, { toInternalValue, toExternalValue });
