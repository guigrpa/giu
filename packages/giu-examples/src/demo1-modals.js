// @flow

/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import {
  Modal,
  modalPush,
  modalPop,
  TextInput,
  DateInput,
  ColorInput,
  Textarea,
  Select,
  Button,
  Icon,
  DropDownMenu,
} from 'giu';
import {
  ExampleLabel,
  exampleStyle,
  NORMAL_OPTIONS,
  LONG_TEXT,
  onChange,
} from './demo1-common';

class ModalExample extends React.Component {
  state: { fEmbeddedModal: boolean };
  refInput: Object;
  refName: Object;

  constructor() {
    super();
    this.state = { fEmbeddedModal: false };
  }

  render() {
    return (
      <div style={exampleStyle}>
        <ExampleLabel>
          Modals (stackable) and Modal (embedded): focusable, keyboard-controlled
        </ExampleLabel>
        <Button onClick={this.addModal.bind(this)}>
          Add modal
        </Button>
        {' '}
        <Button onClick={() => this.setState({ fEmbeddedModal: true })}>
          Embed modal
        </Button>
        {this.state.fEmbeddedModal && this.renderEmbeddedModal()}
      </div>
    );
  }

  renderEmbeddedModal() {
    const close = () => this.setState({ fEmbeddedModal: false });
    const buttons = [
      { label: 'Close', onClick: close },
      {
        label: 'Introduce me',
        onClick: () => {
          alert(this.refInput.getValue());
          close();
        },
        defaultButton: true,
      },
    ];
    return (
      <Modal
        title="Embedded modal"
        buttons={buttons}
        onClickBackdrop={close}
        onEsc={close}
        style={{ width: 500 }}
      >
        {'What\'s your name?'}{' '}
        <TextInput
          ref={o => {
            this.refInput = o;
          }}
          autoFocus
          required
          errorZ={52}
        />
        <DateInput placeholder="date of birth" floatZ={55} required />
        <Textarea
          placeholder="Write something..."
          required
          errorZ={52}
          style={{ maxHeight: 100 }}
        />
        <br />
        <TextInput required errorZ={52} placeholder="Another text input" />
        <br />
        <br />
        <br />
        <div
          style={{
            marginLeft: 20,
          }} /* useful margin for debugging with visible FocusCaptures */
        >
          <ExampleLabel>
            Some examples to see that everything works correctly in a modal
          </ExampleLabel>
          <ColorInput floatZ={55} />
          <ColorInput floatZ={55} disabled />
          <Select
            floatZ={55}
            type="dropDownPicker"
            value="a"
            items={NORMAL_OPTIONS}
          />
          <Select
            floatZ={55}
            type="dropDownPicker"
            value="a"
            items={NORMAL_OPTIONS}
            disabled
          />
          <DropDownMenu
            floatZ={55}
            items={NORMAL_OPTIONS}
            onClickItem={onChange}
          >
            <Icon icon={this.context.theme === 'mdl' ? 'menu' : 'bars'} /> Menu
          </DropDownMenu>
        </div>
      </Modal>
    );
  }

  addModal() {
    const title = "Hello, what's your name?";
    const children = (
      <div>
        <TextInput
          ref={o => {
            this.refName = o;
          }}
          autoFocus
          required
          errorZ={52}
        />{' '}
        <DateInput placeholder="date of birth" floatZ={55} required />
      </div>
    );
    modalPush({
      title,
      children,
      buttons: [
        {
          label: 'Hello!',
          onClick: this.addModal2.bind(this),
          defaultButton: true,
        },
        { label: 'Back', onClick: modalPop, left: true },
      ],
      onEsc: modalPop,
    });
  }

  addModal2() {
    const title = 'Introduction';
    const children = (
      <div>
        Nice to meet you, {this.refName.getValue()}!<br />
        This is some really long text:<br />
        {LONG_TEXT}<br />
        {LONG_TEXT}<br />
        {LONG_TEXT}<br />
        {LONG_TEXT}<br />
        {LONG_TEXT}<br />
      </div>
    );
    modalPush({
      title,
      children,
      buttons: [{ label: 'Back', onClick: modalPop, defaultButton: true }],
      onEsc: modalPop,
      style: { width: 500 },
    });
  }
}

ModalExample.contextTypes = { theme: React.PropTypes.any };

export default ModalExample;
