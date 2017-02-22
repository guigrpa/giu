import React                from 'react';
import { omit, merge }      from 'timm';
import {
  bindAll,
  preventDefault, stopPropagation,
}                           from '../gral/helpers';
import { KEYS }             from '../gral/constants';
import {
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import {
  isAnyModifierPressed,
}                           from '../gral/keys';
import input                from '../hocs/input';

const DEBUG = false && process.env.NODE_ENV !== 'production';

const NULL_VALUE = '';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }
function isNull(val) { return val === NULL_VALUE; }

function getPlaceHolderText(val) {
  const lines = val.split('\n');
  const out = !lines[lines.length - 1].length
    ? `${val}x`
    : val;
  return out;
}

let cntId = 0;

// ==========================================
// Component
// ==========================================
class Textarea extends React.Component {
  static propTypes = {
    style:                  React.PropTypes.object,
    skipTheme:              React.PropTypes.bool,
    // Input HOC
    curValue:               React.PropTypes.any.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    onResizeOuter:          React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };

  constructor(props) {
    super(props);
    this.labelId = this.props.id || `giu-textarea_${cntId}`;
    cntId += 1;
    bindAll(this, [
      'registerOuterRef',
      'registerInputRef',
      'resize',
      'onKeyDown',
    ]);
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    if (this.context.theme === 'mdl' && this.refOuter) window.componentHandler.upgradeElement(this.refOuter);
  }
  componentDidUpdate() { this.resize(); }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    if (!this.props.skipTheme && this.context.theme === 'mdl') return this.renderMdl();
    const {
      curValue, disabled,
      style: styleField,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT);
    return (
      <div ref={this.registerOuterRef}
        className="giu-textarea"
        style={style.taWrapper}
      >
        <div ref={(c) => { this.refTaPlaceholder = c; }}
          style={merge(style.hiddenPlaceholder, styleField)}
        >
          {getPlaceHolderText(curValue)}
        </div>
        <textarea ref={this.registerInputRef}
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
    const {
      curValue, disabled,
      fFocused,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT_MDL);
    let className = 'giu-textarea mdl-textfield mdl-js-textfield mdl-textfield--floating-label';
    if (curValue !== '' || fFocused) className += ' is-dirty';
    return (
      <div ref={this.registerOuterRef} className={className}>
        <textarea ref={this.registerInputRef}
          className="mdl-textfield__input"
          value={curValue}
          id={this.labelId}
          onKeyDown={this.onKeyDown}
          rows={3}
          {...otherProps}
          tabIndex={disabled ? -1 : undefined}
        />
        <label className="mdl-textfield__label" htmlFor={this.labelId}>{this.props.placeholder || ''}</label>
      </div>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerOuterRef(c) {
    this.refOuter = c;
    this.props.registerOuterRef(c);
  }

  registerInputRef(c) {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  }

  resize() {
    if (!this.refTaPlaceholder) return;
    if (!this.props.skipTheme && this.context.theme === 'mdl') return;
    const height = this.refTaPlaceholder.offsetHeight;
    if (!this.refInput) return;
    this.refInput.style.height = `${height}px`;
    if (this.props.onResizeOuter) this.props.onResizeOuter();
  }

  // shift-enter should not insert a new line (it should be bubbled up);
  // enter (with no modifier) should insert a new line (and not bubble)
  onKeyDown(ev) {
    if (ev.which === KEYS.return) {
      if (isAnyModifierPressed(ev)) {
        preventDefault(ev);
      } else {
        stopPropagation(ev);
      }
    }
  }
}

Textarea.contextTypes = { theme: React.PropTypes.any };

// ==========================================
// Styles
// ==========================================
const style = {
  taWrapper: {
    position: 'relative',
  },
  fieldBase: inputReset({
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
    if (disabled) out = merge(out, { cursor: 'default', pointerEvents: 'none' });
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
// Miscellaneous
// ==========================================
const PROP_KEYS_TO_REMOVE_FROM_INPUT = Object.keys(Textarea.propTypes).concat([
  'cmds', 'keyDown', 'floatZ', 'floatPosition', 'styleOuter', 'required',
]);
const PROP_KEYS_TO_REMOVE_FROM_INPUT_MDL = PROP_KEYS_TO_REMOVE_FROM_INPUT.concat(['placeholder']);

// ==========================================
// Public API
// ==========================================
export default input(Textarea, { toInternalValue, toExternalValue, isNull });
