// @flow

import React from 'react';
import { omit } from 'timm';
import classnames from 'classnames';
import { preventDefault, stopPropagation } from '../gral/helpers';
import { KEYS } from '../gral/constants';
import { isAnyModifierPressed } from '../gral/keys';
import type { Theme } from '../gral/themeContext';
import Input from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';

const NULL_VALUE = '';
const toInternalValue = val => (val != null ? val : NULL_VALUE);
const toExternalValue = val => (val !== NULL_VALUE ? val : null);
const isNull = val => val === NULL_VALUE;

const getPlaceholderText = val => {
  const lines = val.split('\n');
  const out = !lines[lines.length - 1].length ? `${val}x` : val;
  return out;
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
  skipTheme?: boolean,
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  placeholder?: string,
  // Input HOC
  theme: Theme,
  curValue: string,
  disabled?: boolean,
  registerOuterRef: Function,
  registerFocusableRef: Function,
  fFocused: boolean,
  onResizeOuter: Function,
};

// ==========================================
// Component
// ==========================================
class BaseTextarea extends React.Component<Props> {
  refInput: ?Object;
  refOuter: ?Object;

  refTaPlaceholder: any = React.createRef();

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    if (this.props.theme.id === 'mdl' && this.refOuter) {
      window.componentHandler.upgradeElement(this.refOuter);
    }
  }
  componentDidUpdate() {
    this.resize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  // ==========================================
  render() {
    if (!this.props.skipTheme && this.props.theme.id === 'mdl') {
      return this.renderMdl();
    }
    const { curValue, disabled } = this.props;
    return (
      <div
        ref={this.registerOuterRef}
        className={classnames('giu-textarea', this.props.classname)}
        id={this.props.id}
      >
        <div
          ref={this.refTaPlaceholder}
          className="giu-textarea-field giu-textarea-placeholder"
        >
          {getPlaceholderText(curValue)}
        </div>
        <textarea
          ref={this.registerInputRef}
          className={classnames('giu-input-reset giu-textarea-field', {
            'giu-input-disabled': disabled,
          })}
          value={curValue}
          onKeyDown={this.onKeyDown}
          tabIndex={disabled ? -1 : undefined}
        />
      </div>
    );
  }

  renderMdl() {
    const { id, curValue, disabled, fFocused } = this.props;
    const internalId = `giu-date-input-${id}`;
    return (
      <div
        ref={this.registerOuterRef}
        className={classnames(
          'giu-textarea giu-textarea-mdl',
          'mdl-textfield mdl-js-textfield mdl-textfield--floating-label',
          { 'is-dirty': curValue !== '' || fFocused },
          this.props.className
        )}
        id={id}
      >
        <textarea
          ref={this.registerInputRef}
          className="mdl-textfield__input"
          value={curValue}
          id={internalId}
          onKeyDown={this.onKeyDown}
          rows={3}
          tabIndex={disabled ? -1 : undefined}
        />
        <label className="mdl-textfield__label" htmlFor={internalId}>
          {this.props.placeholder || ''}
        </label>
      </div>
    );
  }

  // ==========================================
  registerOuterRef = c => {
    this.refOuter = c;
    this.props.registerOuterRef(c);
  };

  registerInputRef = c => {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  };

  resize = () => {
    if (!this.refTaPlaceholder.current) return;

    // Auto-resize is not supported in the MDL theme
    if (!this.props.skipTheme && this.props.theme.id === 'mdl') return;

    // Determine the height of the placeholder and apply it to the input
    const height = this.refTaPlaceholder.current.offsetHeight;
    if (!this.refInput) return;
    this.refInput.style.height = `${height}px`;
    if (this.props.onResizeOuter) this.props.onResizeOuter();
  };

  // shift-enter should not insert a new line (it should be bubbled up);
  // enter (with no modifier) should insert a new line (and not bubble)
  onKeyDown = ev => {
    if (ev.which === KEYS.return) {
      if (isAnyModifierPressed(ev)) {
        preventDefault(ev);
      } else {
        stopPropagation(ev);
      }
    }
  };
}

// ==========================================
const hocOptions = {
  componentName: 'Textarea',
  toInternalValue,
  toExternalValue,
  isNull,
  className: 'giu-textarea-wrapper',
};
const render = props => <BaseTextarea {...props} />;
// $FlowFixMe
const Textarea = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export default Textarea;
