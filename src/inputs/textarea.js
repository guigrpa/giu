import React                from 'react';
import { omit, merge }      from 'timm';
import { bindAll }          from '../gral/helpers';
import { KEYS, COLORS }     from '../gral/constants';
import input                from '../hocs/input';

const NULL_VALUE = '';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }

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
    onKeyUp:                React.PropTypes.func,
    fieldStyle:             React.PropTypes.object,
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
      'onKeyUp',
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
      curValue,
      registerOuterRef,
      fieldStyle,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <div ref={registerOuterRef}
        className="giu-textarea"
        style={style.taWrapper}
      >
        <div ref={c => { this.refTaPlaceholder = c; }}
          style={merge(style.hiddenPlaceholder, fieldStyle)}
        >
          {getPlaceHolderText(curValue)}
        </div>
        <textarea ref={this.registerInputRef}
          value={curValue}
          onKeyUp={this.onKeyUp}
          style={merge(style.field, fieldStyle)}
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
    const height = this.refTaPlaceholder.offsetHeight;
    this.refInput.style.height = `${height}px`;
    if (this.props.onResizeOuter) this.props.onResizeOuter();
  }

  onKeyUp(ev) {
    if (ev.which === KEYS.return) {
      ev.stopPropagation();
    } else {
      if (this.props.onKeyUp) this.props.onKeyUp(ev);
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
  field: {
    border: `1px solid ${COLORS.line}`,
    width: '100%',
    overflow: 'hidden',
    cursor: 'beam',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    background: 'transparent',
    resize: 'none',
    padding: 2,
  },

  // hidden placeholder
  hiddenPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    opacity: 0,
    padding: 2,
    border: '1px solid red',
    color: 'red',
    cursor: 'beam',
    whiteSpace: 'pre-wrap',
    zIndex: -50,

    // If the user specifies a `maxHeight`, we don't want
    // the (hidden) text to overflow vertically
    overflowY: 'hidden',
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Textarea.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(Textarea, { toInternalValue, toExternalValue });
