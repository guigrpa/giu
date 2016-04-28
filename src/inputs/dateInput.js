import React                from 'react';
import { omit }             from 'timm';
import {
  floatAdd,
  floatDelete,
}                           from '../components/floats'
import input                from '../hocs/input';

const NULL_VALUE = '';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }

// ==========================================
// Component
// ==========================================
class DateInput extends React.Component {
  static propTypes = {
    curValue:               React.PropTypes.string.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    // all others are passed through unchanged
  };

  componentDidMount() { this.mountFloat(); }
  componentWillUnmount() { this.unmountFloat(); }

  // ==========================================
  // Imperative API
  // ==========================================
  focus() { this.refInput.focus(); }
  blur() { this.refInput.blur(); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <div style={style.poc}>
        <input ref={c => { this.refInput = c; }}
          className="giu-date-input"
          type="text"
          value={curValue}
          {...otherProps}
        />
      </div>
    );
  }

  mountFloat() {
    this.floatId = floatAdd({
      position: 'below',
      getBoundingClientRect: () => this.refInput && this.refInput.getBoundingClientRect(),
      children: <div>Example float</div>,
    });
  }

  unmountFloat() { floatDelete(this.floatId); }
}

// ==========================================
// Styles
// ==========================================
const style = {
  poc: {
    transform: 'translateZ(0)',
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(DateInput.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(DateInput, { toInternalValue, toExternalValue });
