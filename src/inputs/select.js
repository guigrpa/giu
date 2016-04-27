import React                from 'react';
import { addFirst, omit }   from 'timm';
import input                from '../hocs/input';

const NULL_VALUE = '__NULL__';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }

// ==========================================
// Component
// ==========================================
class Select extends React.Component {
  static propTypes = {
    curValue:               React.PropTypes.string.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    options:                React.PropTypes.array.isRequired,
    allowNull:              React.PropTypes.bool,
    // all others are passed through unchanged
  };

  // ==========================================
  // Imperative API
  // ==========================================
  focus() { this._refInput.focus(); }
  blur() { this._refInput.blur(); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, options, allowNull } = this.props;
    const finalOptions = allowNull
      ? addFirst(options, { value: NULL_VALUE, label: '' })
      : options;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <select ref={c => { this._refInput = c; }}
        className="giu-select"
        value={curValue}
        {...otherProps}
      >
        {finalOptions.map(o => (
          <option key={o.value} id={String(o.value)} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
}

// ==========================================
// Styles
// ==========================================
// const style = {};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Select.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(Select, { toInternalValue, toExternalValue });
