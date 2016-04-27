import React                from 'react';

// ==========================================
// Component
// ==========================================
class Backdrop extends React.Component {
  // All props are forwarded to the child `<div>`
  render() {
    return (
      <div
        className="giu-backdrop"
        {...this.props}
        style={style.backdrop}
      />
    );
  }
};

// ==========================================
// Styles
// ==========================================
const style = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    opacity: 0.7,
  },
};

// ==========================================
// Public API
// ==========================================
export default Backdrop;
