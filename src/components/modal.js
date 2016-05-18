import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { merge }            from 'timm';
import {
  COLORS,
  KEYS,
  MISC,
}                           from '../gral/constants';
import {
  bindAll,
  cancelEvent,
  cancelBodyScrolling,
}                           from '../gral/helpers';
import {
  flexContainer,
  flexItem,
  boxWithShadow,
}                           from '../gral/styles';
import Button               from './button';
import Backdrop             from './backdrop';
import FocusCapture         from './focusCapture';

const FOCUSABLE = ['input', 'textarea', 'select'];

// ==========================================
// Component
// ==========================================
// **Warning**: an embedded `Modal` in a component
// with `translateZ(0)` or similar (which creates a stacking context and
// a containing block) will not be properly positioned and may even be cropped.
// In such a case, use `Modals` instead.
class Modal extends React.Component {
  static propTypes = {
    id:                     React.PropTypes.string,
    title:                  React.PropTypes.string,
    children:               React.PropTypes.any,
    buttons:                React.PropTypes.array,
    onClickBackdrop:        React.PropTypes.func,
    onKeyUp:                React.PropTypes.func,
    onEsc:                  React.PropTypes.func,
    style:                  React.PropTypes.object,
    zIndex:                 React.PropTypes.number,
  };
  static defaultProps = {
    zIndex:                 MISC.zModalBase,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
      'onKeyUp',
      'onClickOuter',
    ]);
  }

  // ==========================================
  // Imperative API
  // ==========================================
  focus() { this.refFocusCapture.focus(); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    return (
      <div
        className="giu-modal"
        id={this.props.id}
        onKeyUp={this.onKeyUp}
        onClick={this.onClickOuter}
        style={style.outer(this.props.zIndex)}
      >
        { this.renderBackdrop() }
        { this.renderModal() }
      </div>
    );
  }

  renderBackdrop() {
    return <Backdrop onClick={this.props.onClickBackdrop} />;
  }

  renderModal() {
    const { title, children, buttons, style: baseStyle } = this.props;
    return (
      <div style={style.modalWrapper}>
        {this.renderSpacer()}
        <div
          onWheel={cancelBodyScrolling}
          style={merge(style.modal, baseStyle)}
        >
          <FocusCapture
            registerRef={c => { this.refFocusCapture = c; }}
            autoFocus
          />
          { title && this.renderTitle(title) }
          { children }
          { buttons && this.renderButtons(buttons) }
        </div>
        {this.renderSpacer()}
      </div>
    );
  }

  renderTitle(title) {
    return <div>{title}</div>;
  }

  renderSpacer() {
    return (
      <div 
        onClick={this.props.onClickBackdrop}
        onWheel={cancelEvent}
        style={flexItem(1)}
      />
    );
  }

  renderButtons(buttons) {
    return (
      <div style={style.buttons}>
        { buttons.filter(o => !!o.left).map(this.renderButton) }
        <div style={flexItem(1)} />
        { buttons.filter(o => !o.left).map(this.renderButton) }
      </div>
    );
  }

  renderButton(btn, idx) {
    const { label, onClick } = btn;
    return (
      <Button key={idx}
        onClick={onClick}
        style={style.button(btn)}
      >
        {label}
      </Button>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  onKeyUp(ev) {
    const { which } = ev;
    let buttons;
    switch (which) {
      case KEYS.esc:
        if (this.props.onEsc) this.props.onEsc(ev);
        break;
      case KEYS.return:
        buttons = this.props.buttons;
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          if (button.defaultButton && button.onClick) {
            button.onClick(ev);
            break;
          }
        }
        break;
      default:
        break;
    }
    if (this.props.onKeyUp) this.props.onKeyUp(ev);
    cancelEvent(ev);
  }

  // Except when clicking on an embedded focusable node, refocus on this modal
  onClickOuter(ev) {
    const { tagName, disabled } = ev.target;
    if (FOCUSABLE.indexOf(tagName.toLowerCase()) >= 0 && !disabled) return;
    this.focus();
  }
}


// ==========================================
// Styles
// ==========================================
const style = {
  outer: (zIndex) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex,
  }),
  modalWrapper: flexContainer('row', {
    position: 'fixed',
    top: '5vh',
    left: 0,
    width: '100%',
  }),
  modal: boxWithShadow({
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: 20,
  }),
  buttons: flexContainer('row', {
    marginTop: 10,
    borderTop: `1px solid ${COLORS.line}`,
    paddingTop: 10,
  }),
  button: ({ left, defaultButton }) => ({
    marginRight: left ? 5 : undefined,
    marginLeft: left ? undefined : 5,
    border: defaultButton ? '1px solid black' : undefined,
  }),
};

// ==========================================
// Public API
// ==========================================
export default Modal;
