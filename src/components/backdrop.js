import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';

// ==========================================
// Component
// ==========================================
class Backdrop extends React.Component {

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

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
}

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
