// @flow

import React from 'react';
import { omit, merge } from 'timm';
import { preventDefault, stopPropagation } from '../gral/helpers';
import { KEYS } from '../gral/constants';
import { inputReset, INPUT_DISABLED } from '../gral/styles';
import { isAnyModifierPressed } from '../gral/keys';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';

const DEBUG = false && process.env.NODE_ENV !== 'production';

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
  style?: Object,
  skipTheme?: boolean,
  // all others are passed through unchanged
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  id?: string,
  placeholder?: string,
  // Context
  theme: Theme,
  // Input HOC
  curValue: string,
  disabled?: boolean,
  registerOuterRef: Function,
  registerFocusableRef: Function,
  fFocused: boolean,
  onResizeOuter: Function,
};

const FILTERED_OUT_PROPS = [
  'style',
  'skipTheme',
  'required',
  'theme',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];
const FILTERED_OUT_PROPS_MDL = [...FILTERED_OUT_PROPS, 'placeholder'];

// ==========================================
// Component
// ==========================================
class Textarea extends React.Component<Props> {
  refInput: ?Object;
  refOuter: ?Object;

  static defaultProps = {};
  refTaPlaceholder = React.createRef();

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
    const { curValue, disabled, style: styleField } = this.props;
    const otherProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <div
        ref={this.registerOuterRef}
        className="giu-textarea"
        style={style.taWrapper}
      >
        <div
          ref={this.refTaPlaceholder}
          style={merge(style.hiddenPlaceholder, styleField)}
        >
          {getPlaceholderText(curValue)}
        </div>
        <textarea
          ref={this.registerInputRef}
          value={curValue}
          onKeyDown={this.onKeyDown}
          style={style.field(this.props)}
          tabIndex={disabled ? -1 : undefined}
          {...otherProps}
        />
      </div>
    );
  }

  renderMdl() {
    const { id, curValue, disabled, fFocused } = this.props;
    const otherProps = omit(this.props, FILTERED_OUT_PROPS_MDL);
    let className =
      'giu-textarea mdl-textfield mdl-js-textfield mdl-textfield--floating-label';
    if (curValue !== '' || fFocused) className += ' is-dirty';
    return (
      <div ref={this.registerOuterRef} className={className}>
        <textarea
          ref={this.registerInputRef}
          className="mdl-textfield__input"
          value={curValue}
          id={id}
          onKeyDown={this.onKeyDown}
          rows={3}
          {...otherProps}
          tabIndex={disabled ? -1 : undefined}
        />
        <label className="mdl-textfield__label" htmlFor={id}>
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
const ThemedTextarea = props => (
  <ThemeContext.Consumer>
    {theme => <Textarea {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
const style = {
  taWrapper: {
    position: 'relative',
  },
  fieldBase: inputReset({
    display: 'block',
    width: '100%',
    lineHeight: 'inherit',
    height: 1, // initial value; for sure < than the placeholder
    overflow: 'hidden',
    cursor: 'beam',
    resize: 'none',
    padding: 2,
  }),
  field: ({ disabled, style: styleField }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, styleField);
    return out;
  },
  mdlField: ({ disabled, style: styleField }) => {
    let out = {
      width: '100%',
      lineHeight: 'inherit',
      cursor: 'beam',
      padding: 2,
    };
    if (disabled) {
      out = merge(out, { cursor: 'default', pointerEvents: 'none' });
    }
    out = merge(out, styleField);
    return out;
  },

  // hidden placeholder
  hiddenPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    opacity: DEBUG ? 1 : 0,
    padding: 2,
    border: '1px solid red',
    color: 'red',
    cursor: 'beam',
    whiteSpace: 'pre-wrap',
    zIndex: DEBUG ? +50 : -50,

    // If the user specifies a `maxHeight`, we don't want
    // the (hidden) text to overflow vertically
    overflowY: 'hidden',
  },
};

// ==========================================
// Public
// ==========================================
export default input(ThemedTextarea, {
  toInternalValue,
  toExternalValue,
  isNull,
});
