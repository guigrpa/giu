import React                from 'react';
import { omit }             from 'timm';
import input                from '../hocs/input';
import { bindAll }          from '../gral/helpers';
import {
  floatAdd,
  floatDelete,
  isFloatsMounted,
}                           from '../components/floats';

const NULL_VALUE = '';
function toInternalValue(val) { return val != null ? val : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? val : null; }

let fCheckedFloats = false;
const floatsWarning = name => `<${name}> requires a <Floats> component to be \
included in your application. It will not work properly otherwise.`;

// ==========================================
// Component
// ==========================================
class DateInput extends React.Component {
  static propTypes = {
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    // From input HOC
    curValue:               React.PropTypes.string.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    onFocus:                React.PropTypes.func.isRequired,
    onBlur:                 React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };
  static defaultProps = {
    floatPosition:          'below',
    floatAlign:             'left',
    floatZ:                 undefined,
  }

  constructor(props) {
    super(props);
    bindAll(this, [
      'onFocus',
      'onBlur',
    ]);
  }

  componentDidMount() {
    if (!fCheckedFloats) {
      fCheckedFloats = true;
      /* eslint-disable no-console */
      if (!isFloatsMounted()) console.warn(floatsWarning(this.constructor.name));
      /* eslint-enable no-console */
    }
  }

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
      <input ref={c => { this.refInput = c; }}
        className="giu-date-input"
        type="text"
        value={curValue}
        {...otherProps}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }

  renderPicker() {
    return (
      <div
        className="giu-date-picker"
        style={style.float}
      >
        Date picker<br />
        Very long, very long, very long, very long, very long, very long, line
        Date picker<br />
        Date picker<br />
        <button onClick={window.alert}>hello</button><br />
        Date picker<br />
        Date picker<br />
        Date picker<br />
        Date picker<br />
        Date picker
      </div>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  onFocus(ev) {
    this.mountFloat();
    this.props.onFocus(ev);
  }

  onBlur(ev) {
    this.unmountFloat();
    this.props.onBlur(ev);
  }

  mountFloat() {
    if (this.floatId != null) return;
    this.floatId = floatAdd({
      position: this.props.floatPosition,
      align: this.props.floatAlign,
      zIndex: this.props.floatZ,
      getAnchorNode: () => this.refInput,
      children: this.renderPicker(),
    });
  }

  unmountFloat() {
    if (this.floatId == null) return;
    floatDelete(this.floatId);
    this.floatId = null;
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  float: {
    padding: '4px 10px',
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
