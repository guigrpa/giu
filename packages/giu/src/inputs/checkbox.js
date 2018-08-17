// @flow

import * as React from 'react';
import { omit } from 'timm';
import Input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import type { InputHocProps } from '../hocs/input';
import type { Theme } from '../gral/themeContext';

const toInternalValue = val => (val != null ? val : false);
const toExternalValue = val => val;
const isNull = val => val == null;

// ==========================================
// Declarations
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  ...$Exact<InputHocProps>,
  id?: string,
  label?: React.Node, // React components to be included in the checkbox's `label` element
  disabled?: boolean,
  styleLabel?: Object, // merged with the `label` style
  skipTheme?: boolean,
  // all others are passed through to the `input` unchanged
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  theme: Theme,
  curValue: boolean,
  registerOuterRef: Function,
  registerFocusableRef: Function,
};

const FILTERED_OUT_PROPS = [
  'id',
  'label',
  'disabled',
  'styleLabel',
  'skipTheme',
  'theme',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];

// ==========================================
// Component
// ==========================================
class BaseCheckbox extends React.Component<Props> {
  refCheckbox: ?Object;

  componentDidMount() {
    if (this.props.theme.id === 'mdl' && this.refCheckbox) {
      window.componentHandler.upgradeElement(this.refCheckbox);
    }
  }

  // ==========================================
  render() {
    if (!this.props.skipTheme && this.props.theme.id === 'mdl') {
      return this.renderMdl();
    }
    return this.props.label
      ? this.renderWithLabel()
      : this.renderInput('giu-checkbox');
  }

  renderWithLabel() {
    return (
      <span
        ref={this.props.registerOuterRef}
        className="giu-checkbox"
        style={style.wrapper}
      >
        {this.renderInput()}
        <label htmlFor={this.props.id} style={this.props.styleLabel}>
          {this.props.label}
        </label>
      </span>
    );
  }

  renderInput(className?: string) {
    const { disabled } = this.props;
    const inputProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <input
        ref={this.props.registerFocusableRef}
        id={this.props.id}
        className={className}
        type="checkbox"
        checked={this.props.curValue}
        tabIndex={disabled ? -1 : undefined}
        {...inputProps}
        disabled={disabled}
      />
    );
  }

  renderMdl() {
    const inputProps = omit(this.props, FILTERED_OUT_PROPS);
    const { id } = this.props;
    return (
      <label
        ref={this.registerOuterRefMdl}
        className="mdl-switch mdl-js-switch mdl-js-ripple-effect"
        htmlFor={id}
        style={style.wrapperMdl}
      >
        <input
          ref={this.props.registerFocusableRef}
          id={id}
          className="mdl-switch__input"
          type="checkbox"
          checked={this.props.curValue}
          {...inputProps}
          disabled={this.props.disabled}
        />
        <span className="mdl-switch__label" style={style.labelMdl(this.props)}>
          {this.props.label}
        </span>
      </label>
    );
  }

  // ==========================================
  registerOuterRefMdl = c => {
    this.refCheckbox = c;
    const { registerOuterRef } = this.props;
    if (registerOuterRef) registerOuterRef(c);
  };
}

// ==========================================
const hocOptions = {
  componentName: 'Checkbox',
  toInternalValue,
  toExternalValue,
  isNull,
  valueAttr: 'checked',
};
const render = props => <BaseCheckbox {...props} />;
const Checkbox = (publicProps: PublicProps) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} />
);

// ==========================================
const style = {
  wrapper: { whiteSpace: 'nowrap' },
  wrapperMdl: {
    whiteSpace: 'nowrap',
    width: 'initial',
    marginRight: 10,
  },
  labelMdl: ({ styleLabel }) => ({
    left: 16,
    ...styleLabel,
  }),
};

// ==========================================
// Public
// ==========================================
export default Checkbox;
