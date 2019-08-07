// @flow

import React from 'react';
import { omit } from 'timm';
import classnames from 'classnames';
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
  className?: string,
  id?: string,
  disabled?: boolean,
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
    refMdl: any = React.createRef();

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
          className={classnames(
            `giu-input-reset giu-${inputType}-input`,
            { 'giu-input-disabled': disabled },
            this.props.className
          )}
          id={this.props.id}
          type={inputType}
          value={curValue}
          {...otherProps}
          orient={vertical ? 'vertical' : undefined}
          tabIndex={disabled ? -1 : undefined}
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
      const internalId = `giu-${inputType}-input-${id}`;
      return (
        <div
          ref={this.refMdl}
          className={classnames(
            `giu-${inputType}-input`,
            `giu-${inputType}-input-mdl`,
            'mdl-textfield mdl-js-textfield mdl-textfield--floating-label',
            {
              'is-dirty': curValue !== '' || fFocused,
              disabled,
            },
            this.props.className
          )}
          id={id}
        >
          <input
            ref={registerFocusableRef}
            className="mdl-textfield__input"
            type={inputType === 'password' ? 'password' : 'text'}
            value={curValue}
            id={internalId}
            {...otherProps}
            tabIndex={disabled ? -1 : undefined}
          />
          <label className="mdl-textfield__label" htmlFor={internalId}>
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
          className={classnames(
            `giu-${inputType}-input giu-${inputType}-input-mdl`,
            'mdl-slider mdl-js-slider',
            this.props.className
          )}
          id={this.props.id}
          type={inputType}
          value={curValue}
          {...otherProps}
          tabIndex={disabled ? -1 : undefined}
        />
      );
    }
  };

  // ==========================================
  const hocOptions = {
    componentName,
    ...CLASS_OPTIONS[inputType],
    className: `giu-${inputType}-input-wrapper`,
  };
  const render = props => <BaseKlass {...props} />;
  // $FlowFixMe
  const Klass = React.forwardRef((publicProps: PublicProps, ref) => (
    <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
  ));

  return Klass;
}

// ==========================================
// Public
// ==========================================
const TextInput = createClass('TextInput', 'text');
const PasswordInput = createClass('PasswordInput', 'password');
const NumberInput = createClass('NumberInput', 'number');
const RangeInput = createClass('RangeInput', 'range');

export { TextInput, PasswordInput, NumberInput, RangeInput };
