import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
// import { bindAll }          from '../gral/helpers';
import { COLORS }           from '../gral/constants';
import Button               from './button';

// ==========================================
// Component
// ==========================================
class Modal extends React.Component {
  static propTypes = {
    title:                  React.PropTypes.string,
    children:               React.PropTypes.any,
    buttons:                React.PropTypes.array,

    onClickBackdrop:        React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return (
      <div style={style.outer}>
        { this.renderBackdrop() }
        { this.renderModal() }
      </div>
    );
  }

  renderBackdrop() {
    const { onClickBackdrop } = this.props;
    return <div onClick={onClickBackdrop} style={style.backdrop} />;
  }

  renderModal() {
    const { title, children, buttons } = this.props;
    return (
      <div style={style.modal}>
        { title && this.renderTitle(title) }
        { children }
        { buttons && this.renderButtons(buttons) }
      </div>
    );
  }

  renderTitle(title) {
    return <div>{title}</div>;
  }

  renderButtons(buttons) {
    return <div style={style.buttons}>{ buttons.map(this.renderButton) }</div>;
  }

  renderButton(btn, idx) {
    const { label, onClick } = btn;
    return <Button key={idx} onClick={onClick}>{label}</Button>;
  }
}


// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10000,
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    opacity: 0.7,
  },
  modal: {
    position: 'fixed',
    top: '5vh',
    left: '2.5vw',
    right: '2.5vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    zIndex: 10000,
    backgroundColor: 'white',
    padding: 20,
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    borderRadius: 2,
  },
  buttons: {
    marginTop: 10,
    borderTop: `1px solid ${COLORS.line}`,
    paddingTop: 10,
  },
};

// ==========================================
// Public API
// ==========================================
export default Modal;
