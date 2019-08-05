// @flow

import React from 'react';
import classnames from 'classnames';
import { KEYS } from '../gral/constants';
import { cancelEvent, cancelBodyScrolling } from '../gral/helpers';
import { flexItem } from '../gral/styles';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';
import Button from './button';
import Backdrop from './backdrop';
import FocusCapture from './focusCapture';
import { floatReposition } from './floats';
import type { ModalPars, ModalButton } from './modalTypes'; // eslint-disable-line

const FOCUSABLE = ['input', 'textarea', 'select'];

// ==========================================
// Declarations
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

type Props = {
  ...ModalPars,
  // Context
  theme: Theme,
};

// ==========================================
// Component
// ==========================================
class Modal extends React.PureComponent<Props> {
  refFocusCapture: any;

  // ==========================================
  // Imperative API
  // ==========================================
  focus() {
    this.refFocusCapture && this.refFocusCapture.focus();
  }

  // ==========================================
  render() {
    return (
      <div
        className="giu-modal"
        id={this.props.id}
        onKeyDown={this.onKeyDown}
        onClick={this.onClickOuter}
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
    const { title, children, buttons } = this.props;
    return (
      <div className="giu-modal-position">
        {this.renderSpacer()}
        <div
          className="giu-modal-box giu-box-shadow"
          onWheel={cancelBodyScrolling}
          onScroll={floatReposition}
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
    return <div className="giu-modal-title">{title}</div>;
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
      <div className="giu-modal-buttons">
        {buttons.filter(o => !!o.left).map(this.renderButton)}
        <div className="giu-flex-space" />
        {buttons.filter(o => !o.left).map(this.renderButton)}
      </div>
    );
  }

  renderButton = (btn: ModalButton, idx: number) => {
    const isMdl = this.props.theme.id === 'mdl';
    return (
      <Button
        key={idx}
        onClick={btn.onClick}
        className={classnames('giu-modal-button', {
          'giu-modal-button-default': btn.defaultButton && !isMdl,
          'giu-modal-button-left': btn.left,
          'giu-modal-button-right': !btn.left,
        })}
        colored
        disabled={btn.disabled}
        primary={true}
        plain={
          btn.plain != null
            ? btn.plain
            : isMdl && !btn.defaultButton
              ? true
              : undefined
        }
        accent={btn.accent}
      >
        {btn.label}
      </Button>
    );
  };

  // ==========================================
  onKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    const { which } = ev;
    switch (which) {
      case KEYS.esc:
        if (this.props.onEsc) this.props.onEsc(ev);
        break;
      case KEYS.return: {
        const { buttons = [] } = this.props;
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          if (button.defaultButton && button.onClick) {
            button.onClick(ev);
            break;
          }
        }
        break;
      }
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
  onClickOuter = (ev: SyntheticMouseEvent<*>) => {
    if (ev.target instanceof Element) {
      const { tagName, disabled } = (ev.target: any);
      if (FOCUSABLE.indexOf(tagName.toLowerCase()) >= 0 && !disabled) return;
    }
    this.focus();
  };
}

// ==========================================
// $FlowFixMe
const ThemedModal = React.forwardRef((props, ref) => (
  <ThemeContext.Consumer>
    {theme => <Modal {...props} theme={theme} ref={ref} />}
  </ThemeContext.Consumer>
));

// ==========================================
// Public
// ==========================================
export default ThemedModal;
