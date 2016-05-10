import React                from 'react';
import { omit, merge }      from 'timm';
import { COLORS }           from '../gral/constants';
import input                from '../hocs/input';

const NULL_VALUE = '';
const converters = {
  text: {
    toInternalValue: val => (val != null ? val : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? val : null),
  },
  number: {
    toInternalValue: val => (val != null ? String(val) : NULL_VALUE),
    toExternalValue: val => (val !== NULL_VALUE ? Number(val) : null),
  },
};

const PROP_TYPES = {
  styleField:             React.PropTypes.object,
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
        curValue, registerFocusableRef,
        styleField,
      } = this.props;
      const otherProps = omit(this.props, PROP_KEYS);
      return (
        <input ref={registerFocusableRef}
          className={`giu-${inputType}-input`}
          type={inputType}
          value={curValue}
          {...otherProps}
          style={merge(style.field, styleField)}
        />
      );
    }
  };

  return input(Klass, converters[inputType]);
}

// ==========================================
// Styles
// ==========================================
const style = {
  field: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    border: `1px solid ${COLORS.line}`,
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
