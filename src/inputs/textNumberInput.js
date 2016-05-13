import React                from 'react';
import { omit, merge }      from 'timm';
import {
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import { isNumber }         from '../gral/validators';
import input                from '../hocs/input';

const NULL_VALUE = '';
const classOptions = {
  text: {
    toInternalValue: val => (val != null ? val : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? val : null),
    isNull: val => val === NULL_VALUE,
  },
  number: {
    toInternalValue: val => (val != null ? String(val) : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? Number(val) : null),
    isNull: val => val === NULL_VALUE,
    defaultValidators: { isNumber: isNumber() },
  },
};

const PROP_TYPES = {
  disabled:               React.PropTypes.bool,
  style:                  React.PropTypes.object,
  // Input HOC
  curValue:               React.PropTypes.any.isRequired,
  errors:                 React.PropTypes.array.isRequired,
  registerOuterRef:       React.PropTypes.func.isRequired,
  registerFocusableRef:   React.PropTypes.func.isRequired,
  // all others are passed through unchanged
};
const PROP_KEYS = Object.keys(PROP_TYPES);

// ==========================================
// Component
// ==========================================
function createClass(name, inputType) {
  const Klass = class extends React.Component {
    static displayName = name;
    static propTypes = PROP_TYPES;

    // ==========================================
    // Render
    // ==========================================
    render() {
      const { curValue, disabled, registerFocusableRef } = this.props;
      const otherProps = omit(this.props, PROP_KEYS);
      return (
        <input ref={registerFocusableRef}
          className={`giu-${inputType}-input`}
          type={inputType}
          value={curValue}
          {...otherProps}
          tabIndex={disabled ? -1 : undefined}
          style={style.field(this.props)}
        />
      );
    }
  };

  return input(Klass, classOptions[inputType]);
}

// ==========================================
// Styles
// ==========================================
const style = {
  fieldBase: inputReset(),
  field: ({ style: styleField, disabled }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, styleField);
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
const TextInput = createClass('TextInput', 'text');
const NumberInput = createClass('NumberInput', 'number');

export {
  TextInput, NumberInput,
};
