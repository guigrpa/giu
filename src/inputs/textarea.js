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

// ==========================================
// Component
// ==========================================
class Textarea extends React.Component {
  static propTypes = {
    style:                  React.PropTypes.object,
    // Input HOC
    curValue:               React.PropTypes.any.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    onResizeOuter:          React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };

  constructor(props) {
    super(props);
    bindAll(this, [
      'registerInputRef',
      'resize',
      'onKeyDown',
    ]);
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }
  componentDidUpdate() { this.resize(); }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      curValue, disabled,
      registerOuterRef,
      style: styleField,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT);
    return (
      <div ref={registerOuterRef}
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

  // ==========================================
  // Handlers
  // ==========================================
  registerInputRef(c) {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  }

  resize() {
    if (!this.refTaPlaceholder) return;
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
  'cmds', 'keyDown', 'fFocused', 'floatZ', 'floatPosition', 'styleOuter',
]);

// ==========================================
// Public API
// ==========================================
export default input(Textarea, { toInternalValue, toExternalValue, isNull });
