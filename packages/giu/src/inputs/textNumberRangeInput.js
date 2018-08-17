// @flow

import React from 'react';
import { omit, merge, set as timmSet } from 'timm';
import { inputReset, INPUT_DISABLED } from '../gral/styles';
import { isNumber } from '../gral/validators';
import type { Theme } from '../gral/themeContext';
import Input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';

const NULL_VALUE = '';
const CLASS_OPTIONS = {
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

// ==========================================
// Declarations
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  disabled?: boolean,
  style?: Object, // merged with the `input`/`textarea` style
  skipTheme?: boolean,
  vertical?: boolean, // only for RangeInput
  // all others are passed through to the `input` unchanged
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  id?: string,
  placeholder?: string,
  // Input HOC
  theme: Theme,
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
  'required',
  'theme',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];

const FILTERED_OUT_PROPS_MDL = FILTERED_OUT_PROPS.concat(['placeholder']);

// ==========================================
// Component
// ==========================================
function createClass(componentName, inputType) {
  const BaseKlass = class extends React.Component<Props> {
    static displayName = componentName;
    refMdl = React.createRef();

    componentDidMount() {
      if (this.props.theme.id === 'mdl' && this.refMdl.current) {
        window.componentHandler.upgradeElement(this.refMdl.current);
      }
    }

    // ==========================================
    render() {
      if (
        !this.props.skipTheme &&
        this.props.theme.id === 'mdl' &&
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
      const {
        id,
        curValue,
        disabled,
        registerFocusableRef,
        fFocused,
      } = this.props;
      const otherProps = omit(this.props, FILTERED_OUT_PROPS_MDL);
      let className = `giu-${inputType}-input mdl-textfield mdl-js-textfield mdl-textfield--floating-label`;
      if (curValue !== '' || fFocused) className += ' is-dirty';
      return (
        <div
          ref={this.refMdl}
          className={className}
          style={style.mdlField(this.props)}
        >
          <input
            ref={registerFocusableRef}
            className="mdl-textfield__input"
            type={inputType === 'password' ? 'password' : 'text'}
            value={curValue}
            id={id}
            {...otherProps}
            tabIndex={disabled ? -1 : undefined}
          />
          <label className="mdl-textfield__label" htmlFor={id}>
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

  // ==========================================
  const hocOptions = {
    componentName,
    ...CLASS_OPTIONS[inputType],
  };
  const render = props => <BaseKlass {...props} />;
  // $FlowFixMe
  const Klass = React.forwardRef((publicProps: PublicProps, ref) => (
    <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
  ));

  return Klass;
}

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
// Public
// ==========================================
const TextInput = createClass('TextInput', 'text');
const PasswordInput = createClass('PasswordInput', 'password');
const NumberInput = createClass('NumberInput', 'number');
const RangeInput = createClass('RangeInput', 'range');

export { TextInput, PasswordInput, NumberInput, RangeInput };
