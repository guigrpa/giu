import React                from 'react';
import { omit, merge }      from 'timm';
import isFunction           from 'lodash/isFunction';
import { NULL_STRING }      from '../gral/constants';
import {
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import input                from '../hocs/input';
import { LIST_SEPARATOR_KEY } from '../inputs/listPicker';

function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_STRING; }
function toExternalValue(val) {
  if (val === NULL_STRING) return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('SelectNative: error parsing JSON', val);
    return null;
  }
}

function isNull(val) { return val === NULL_STRING; }

// ==========================================
// Component
// ==========================================
class SelectNative extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    lang:                   React.PropTypes.string,
    required:               React.PropTypes.bool,
    disabled:               React.PropTypes.bool,
    style:                  React.PropTypes.object,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through to the `select` unchanged
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      curValue, items,
      lang,
      required, disabled,
      registerFocusableRef,
    } = this.props;
    const finalItems = [];
    if (!required) finalItems.push({ value: NULL_STRING, label: '' });
    items.forEach(option => {
      if (option.label !== LIST_SEPARATOR_KEY) finalItems.push(option);
    });
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT);
    return (
      <select ref={registerFocusableRef}
        className="giu-select-native"
        value={curValue}
        {...otherProps}
        tabIndex={disabled ? -1 : undefined}
        style={style.field(this.props)}
      >
        {finalItems.map(o => {
          const value = o.value === NULL_STRING ? o.value : toInternalValue(o.value);
          const label = isFunction(o.label) ? o.label(lang) : o.label;
          return <option key={value} id={value} value={value}>{label}</option>;
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
  field: ({ disabled, style: base }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, base);
    return out;
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS_TO_REMOVE_FROM_INPUT = Object.keys(SelectNative.propTypes).concat([
  'registerOuterRef', 'inlinePicker', 'errors', 'cmds', 'keyDown', 'fFocused',
  'floatZ', 'floatPosition', 'onResizeOuter', 'styleOuter',
]);

// ==========================================
// Public API
// ==========================================
export default input(SelectNative, { toInternalValue, toExternalValue, isNull });
