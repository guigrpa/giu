// @flow

import * as React from 'react';
import { omit } from 'timm';
import Input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';
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
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  id?: string,
  label?: React.Node, // React components to be included in the checkbox's `label` element
  disabled?: boolean,
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
    const { disabled } = this.props;
    const inputProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <span ref={this.props.registerOuterRef} className="giu-checkbox">
        <input
          ref={this.props.registerFocusableRef}
          id={this.props.id}
          className="giu-checkbox-input"
          type="checkbox"
          checked={this.props.curValue}
          tabIndex={disabled ? -1 : undefined}
          {...inputProps}
          disabled={disabled}
        />
        <label className="giu-checkbox-label" htmlFor={this.props.id}>
          {this.props.label}
        </label>
      </span>
    );
  }

  renderMdl() {
    const inputProps = omit(this.props, FILTERED_OUT_PROPS);
    const { id } = this.props;
    return (
      <label
        ref={this.registerOuterRefMdl}
        className="giu-checkbox-mdl mdl-switch mdl-js-switch mdl-js-ripple-effect"
        htmlFor={id}
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
        <span className="giu-checkbox-mdl-label mdl-switch__label">
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
// $FlowFixMe
const Checkbox = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export default Checkbox;
