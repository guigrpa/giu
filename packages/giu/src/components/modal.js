// @flow

import React from 'react';
import { merge } from 'timm';
import { KEYS, MISC } from '../gral/constants';
import { cancelEvent, cancelBodyScrolling } from '../gral/helpers';
import { flexContainer, flexItem, boxWithShadow } from '../gral/styles';
import Button from './button';
import Backdrop from './backdrop';
import FocusCapture from './focusCapture';
import { floatReposition } from './floats';
import type { ModalPars, ModalButton } from './modalTypes'; // eslint-disable-line

const FOCUSABLE = ['input', 'textarea', 'select'];

// ==========================================
// Component
// ==========================================
/* --
A simple example with an embedded Modal:

```js
import { Modal, Button } from 'giu';
class ModalExample extends React.Component {
  // state initialization omitted

  render() {
    return (
      <div>
        <Button onClick={() => this.setState({ deleteConfirm: true })}>
          Delete item
        </Button>
        { this.state.deleteConfirm && this.renderDeleteConfirm() }
      </div>
    );
  }

  renderDeleteConfirm() {
    const close = () => this.setState({ deleteConfirm: false });
    const deleteItem = () => { alert('deleted!'); close(); };
    const buttons = [
      { label: 'Close', onClick: close, defaultButton: true },
      { label: 'Delete', onClick: deleteItem, style: { backgroundColor: 'red' } },
    ];
    return (
      <Modal buttons={buttons} onClickBackdrop={close} onEsc={close}>
        Are you sure you want to delete this item?
      </Modal>
    );
  }
}
```
-- */

type DefaultProps = {|
  buttons: Array<ModalButton>,
  zIndex: number,
|};

type Props = {
  /* :: ...ModalPars, */
  /* :: ...DefaultProps, */
};

class Modal extends React.PureComponent {
  props: Props;
  static defaultProps: DefaultProps = {
    buttons: ([]: Array<ModalButton>),
    zIndex: MISC.zModalBase,
  };
  refFocusCapture: any;

  // ==========================================
  // Imperative API
  // ==========================================
  focus() {
    this.refFocusCapture && this.refFocusCapture.focus();
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    return (
      <div
        className="giu-modal"
        id={this.props.id}
        onKeyDown={this.onKeyDown}
        onClick={this.onClickOuter}
        style={style.outer(this.props.zIndex)}
      >
        {this.renderBackdrop()}
        {this.renderModal()}
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
          onScroll={floatReposition}
          style={merge(style.modal, baseStyle)}
        >
          <FocusCapture
            registerRef={c => {
              this.refFocusCapture = c;
            }}
            autoFocus
          />
          {title && this.renderTitle(title)}
          {children}
          {buttons && this.renderButtons(buttons)}
        </div>
        {this.renderSpacer()}
      </div>
    );
  }

  renderTitle(title: string) {
    return <div style={style.title}>{title}</div>;
  }

  renderSpacer() {
    return (
      <div
        onClick={this.props.onClickBackdrop}
        onWheel={cancelEvent}
        onTouchMove={cancelEvent}
        style={flexItem(1)}
      />
    );
  }

  renderButtons(buttons: Array<ModalButton>) {
    return (
      <div style={style.buttons}>
        {buttons.filter(o => !!o.left).map(this.renderButton)}
        <div style={flexItem(1)} />
        {buttons.filter(o => !o.left).map(this.renderButton)}
      </div>
    );
  }

  renderButton = (btn: ModalButton, idx: number) => {
    const { theme } = this.context;
    return (
      <Button
        key={idx}
        onClick={btn.onClick}
        style={style.button(btn, theme)}
        colored
        disabled={btn.disabled}
        primary={theme === 'mdl' && btn.defaultButton ? true : undefined}
        plain={btn.plain != null
          ? btn.plain
          : (theme === 'mdl' && !btn.defaultButton ? true : undefined)}
        accent={btn.accent}
      >
        {btn.label}
      </Button>
    );
  };

  // ==========================================
  // Handlers
  // ==========================================
  onKeyDown = (ev: SyntheticKeyboardEvent) => {
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
      case KEYS.pageUp:
      case KEYS.pageDown:
      case KEYS.home:
      case KEYS.end:
        cancelEvent(ev);
        break;
      default:
        break;
    }
  };

  // Except when clicking on an embedded focusable node, refocus on this modal
  onClickOuter = (ev: SyntheticMouseEvent) => {
    if (ev.target instanceof Element) {
      const target: any = ev.target;
      const { tagName, disabled } = target;
      if (FOCUSABLE.indexOf(tagName.toLowerCase()) >= 0 && !disabled) return;
    }
    this.focus();
  };
}

Modal.contextTypes = { theme: React.PropTypes.any };

// ==========================================
// Styles
// ==========================================
const style = {
  outer: zIndex => ({
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
  title: {
    marginBottom: 10,
    // borderBottom: `1px solid ${COLORS.line}`,
    paddingBottom: 10,
    fontWeight: 'bold',
    fontSize: '1.5em',
  },
  buttons: flexContainer('row', {
    marginTop: 10,
    // borderTop: `1px solid ${COLORS.line}`,
    paddingTop: 10,
  }),
  button: ({ left, defaultButton, style: baseStyle }, theme) =>
    merge(
      {
        marginRight: left ? 5 : undefined,
        marginLeft: left ? undefined : 5,
        border: !theme && defaultButton ? '1px solid black' : undefined,
      },
      baseStyle,
    ),
};

// ==========================================
// Public API
// ==========================================
export default Modal;
