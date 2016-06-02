import React                from 'react';
import {
  omit, merge,
  set as timmSet,
}                           from 'timm';
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
  password: {
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
  range: {
    toInternalValue: val => (val != null ? String(val) : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? Number(val) : null),
    isNull: val => val === NULL_VALUE,
  },
};

// -- Props:
// --
// -- * **style** *object?*: merged with the `input`/`textarea` style
// -- * **vertical** *boolean?*: [only for `RangeInput`]
// -- * *All other props are passed through to the `input` element*
const PROP_TYPES = {
  disabled:               React.PropTypes.bool,
  style:                  React.PropTypes.object,
  vertical:               React.PropTypes.bool,
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
      const {
        curValue, disabled,
        registerFocusableRef,
        // For ranges
        vertical,
      } = this.props;
      const otherProps = omit(this.props, PROP_KEYS);
      return (
        <input ref={registerFocusableRef}
          className={`giu-${inputType}-input`}
          type={inputType}
          value={curValue}
          {...otherProps}
          orient={vertical ? 'vertical' : undefined}
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
  field: ({ style: styleField, disabled, vertical }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, styleField);
    if (vertical) out = timmSet(out, 'WebkitAppearance', 'slider-vertical');
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
const TextInput = createClass('TextInput', 'text');
const PasswordInput = createClass('PasswordInput', 'password');
const NumberInput = createClass('NumberInput', 'number');
const RangeInput = createClass('RangeInput', 'range');

export {
  TextInput, PasswordInput, NumberInput, RangeInput,
};
