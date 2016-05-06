import React                from 'react';
import input                from '../hocs/input';
import FocusCapture         from '../components/focusCapture';

// ==========================================
// Component
// ==========================================
class FileInput extends React.Component {
  static propTypes = {
    style:                  React.PropTypes.object,
    // Input HOC
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    onFocus:                React.PropTypes.func.isRequired,
    onBlur:                 React.PropTypes.func.isRequired,
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { style: baseStyle, registerOuterRef } = this.props;
    return (
      <div ref={registerOuterRef}
        className="giu-file-input"
        style={baseStyle}
      >
        {this.renderFocusCapture()}
        {this.renderContents()}
      </div>
    );
  }

  renderFocusCapture() {
    const { onFocus, onBlur, registerFocusableRef } = this.props;
    return (
      <FocusCapture
        registerRef={registerFocusableRef}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  }

  renderContents() {
    return null;
  }
}

// ==========================================
// Styles
// ==========================================
// const style = {};

// ==========================================
// Public API
// ==========================================
export default input(FileInput, { valueAttr: 'files' });
