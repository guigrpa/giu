// @flow

import React from 'react';
import { omit } from 'timm';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import { ThemeContext } from '../gral/themeContext';
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
  id?: string,
  label?: any, // React components to be included in the checkbox's `label` element
  disabled?: boolean,
  styleLabel?: Object, // merged with the `label` style
  skipTheme?: boolean,
  // all others are passed through to the `input` unchanged
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
  // Input HOC
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
class Checkbox extends React.Component<Props> {
  refCheckbox: ?Object;

  static defaultProps = {};

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
    const { label, registerOuterRef, styleLabel } = this.props;
    return (
      <span
        ref={registerOuterRef}
        className="giu-checkbox"
        style={style.wrapper}
      >
        {this.renderInput()}
        <label htmlFor={this.props.id} style={styleLabel}>
          {label}
        </label>
      </span>
    );
  }

  renderInput(className?: string) {
    const { curValue, disabled, registerFocusableRef } = this.props;
    const inputProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <input
        ref={registerFocusableRef}
        id={this.props.id}
        className={className}
        type="checkbox"
        checked={curValue}
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
const ThemedCheckbox = props => (
  <ThemeContext.Consumer>
    {theme => <Checkbox {...props} theme={theme} />}
  </ThemeContext.Consumer>
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
export default input(ThemedCheckbox, {
  toInternalValue,
  toExternalValue,
  isNull,
  valueAttr: 'checked',
});
