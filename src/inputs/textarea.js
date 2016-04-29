import React                from 'react';
import { omit, merge }      from 'timm';
import { bindAll }          from '../gral/helpers';
import { KEYS }             from '../gral/constants';
import input                from '../hocs/input';

const NULL_VALUE = '';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }

function getPlaceHolderText(val) {
  const lines = val.split('\n');
  const out = !lines[lines.length-1].length
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
    style:                  React.PropTypes.object,
    // Input HOC
    curValue:               React.PropTypes.any.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    // all others are passed through unchanged
  };

  constructor(props) {
    super(props);
    bindAll(this, [
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
  // Imperative API
  // ==========================================
  focus() { this.refInput.focus(); }
  blur() { this.refInput.blur(); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, style: baseStyle } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <div
        className="giu-textarea"
        style={style.taWrapper}
      >
        <div ref={c => { this.refTaPlaceholder = c; }}
          style={merge(style.taPlaceholder, baseStyle)}
        >
          {getPlaceHolderText(curValue)}
        </div>
        <textarea ref={c => { this.refInput = c; }}
          value={curValue}
          onKeyUp={this.onKeyUp}
          style={merge(style.taInput, baseStyle)}
          {...otherProps}
        />
      </div>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  resize() {
    const height = this.refTaPlaceholder.offsetHeight;
    this.refInput.style.height = `${height}px`;
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
  taInput: {
    width: '100%',
    overflow: 'hidden',
    cursor: 'beam',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    background: 'transparent',
    resize: 'none',
    padding: 2,
  },

  // hidden placeholder
  taPlaceholder: {
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
