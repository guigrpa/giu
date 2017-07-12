// @flow

import React from 'react';
import { omit, merge, set as timmSet } from 'timm';
import { inputReset, INPUT_DISABLED } from '../gral/styles';
import { isNumber } from '../gral/validators';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';

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

let cntId = 0;

// ==========================================
// Types
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  disabled?: boolean,
  style?: Object, // merged with the `input`/`textarea` style
  skipTheme?: boolean,
  vertical?: boolean, // only for RangeInput
  // all others are passed through to the `input` unchanged
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  curValue: any,
  errors: Array<string>,
  registerOuterRef: Function,
  registerFocusableRef: Function,
  fFocused: boolean,
};

const FILTERED_OUT_PROPS = [
  'disabled',
  'skipTheme',
  'vertical',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];

const FILTERED_OUT_PROPS_MDL = FILTERED_OUT_PROPS.concat(['placeholder']);

// ==========================================
// Component
// ==========================================
function createClass(name, inputType) {
  const Klass = class extends React.Component {
    static displayName = name;
    props: Props;
    static defaultProps = {};
    labelId: string;
    refMdl: ?Object;

    constructor(props: Props) {
      super(props);
      this.labelId = this.props.id || `giu-${inputType}-input_${cntId}`;
      cntId += 1;
    }

    componentDidMount() {
      if (this.context.theme === 'mdl' && this.refMdl) {
        window.componentHandler.upgradeElement(this.refMdl);
      }
    }

    // ==========================================
    // Render
    // ==========================================
    render() {
      if (
        !this.props.skipTheme &&
        this.context.theme === 'mdl' &&
        !this.props.vertical
      ) {
        return this.renderMdl();
      }
      const {
        curValue,
        disabled,
        registerFocusableRef,
        // For ranges
        vertical,
      } = this.props;
      const otherProps = omit(this.props, FILTERED_OUT_PROPS);
      return (
        <input
          ref={registerFocusableRef}
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

    renderMdl() {
      if (inputType === 'range') return this.renderMdlSlider();
      const { curValue, disabled, registerFocusableRef, fFocused } = this.props;
      const otherProps = omit(this.props, FILTERED_OUT_PROPS_MDL);
      let className = `giu-${inputType}-input mdl-textfield mdl-js-textfield mdl-textfield--floating-label`;
      if (curValue !== '' || fFocused) className += ' is-dirty';
      return (
        <div
          ref={c => {
            this.refMdl = c;
          }}
          className={className}
          style={style.mdlField(this.props)}
        >
          <input
            ref={registerFocusableRef}
            className="mdl-textfield__input"
            type={inputType === 'password' ? 'password' : 'text'}
            value={curValue}
            id={this.labelId}
            {...otherProps}
            tabIndex={disabled ? -1 : undefined}
          />
          <label className="mdl-textfield__label" htmlFor={this.labelId}>
            {this.props.placeholder || ''}
          </label>
        </div>
      );
    }

    renderMdlSlider() {
      const { curValue, disabled, registerFocusableRef } = this.props;
      const otherProps = omit(this.props, FILTERED_OUT_PROPS);
      return (
        <input
          ref={registerFocusableRef}
          className={`giu-${inputType}-input mdl-slider mdl-js-slider`}
          type={inputType}
          value={curValue}
          {...otherProps}
          tabIndex={disabled ? -1 : undefined}
          style={style.mdlField(this.props)}
        />
      );
    }
  };

  Klass.contextTypes = { theme: React.PropTypes.any };

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
  mdlField: ({ style: styleField, disabled }) => {
    let out = { width: 150 };
    if (disabled) {
      out = merge(out, { cursor: 'default', pointerEvents: 'none' });
    }
    out = merge(out, styleField);
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

export { TextInput, PasswordInput, NumberInput, RangeInput };
