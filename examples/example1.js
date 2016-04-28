import React                from 'react';
import ReactDOM             from 'react-dom';
import {
  Select, TextInput, NumberInput, DateInput, Textarea, Checkbox,
  Button,
  Icon, Spinner, LargeMessage,
  Floats,
  Modals, Modal, modalPush, modalPop,
  Notifications, Notification, notify,
  hoverable,
  flexItem,
  flexContainer,
  merge,
}                           from '../src';

const { floor, random } = Math;
const randomInt = (min, max) => min + floor(random()*(max-min+1));
const sample = (arr) => arr[randomInt(0, arr.length - 1)];

// -----------------------------------------------
// Examples
// -----------------------------------------------
const App = () => (
  <div>
    <Floats />
    <Modals />
    <Notifications />
    <NotificationExample />
    <MessageExample />
    <IconExample />
    <FormExample />
    <HoverableExample />
    <FlexRow>
      <span>Left</span>
      <FlexSpacer />
      <span>Right</span>
    </FlexRow>
  </div>
);

const NotificationExample = () =>
  <Notification
    icon="cog" iconSpin
    title="Wow!"
    msg="Standalone notification"
    style={style.example}
    noStyleShadow noStylePosition
  />;

const MessageExample = () =>
  <div style={style.example}>
    <LargeMessage>Hello there!</LargeMessage>
  </div>;

let cntNotif = 1;
const IconExample = () =>
  <div style={style.example}>
    <Icon icon="heart" id="a" />
    {' '}
    <Spinner />
    {' '}
    <Icon icon="spinner" spin />
    {' '}
    <Icon icon="arrow-left" id="a" />
    {' '}
    <Icon
      icon="arrow-right"
      onClick={() => notify({ 
        msg: `Notification #${cntNotif++}`,
        type: sample(['info', 'success', 'warn', 'error']),
        icon: sample(['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down']),
      })}
    />
  </div>;

const SELECT_OPTIONS = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
];
let cntModal = 1;

class FormExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fEmbeddedModal: false,
      fShowDateInput: true,
    };
  }

  render() {
    return (
      <div style={style.example}>
        <div>
          <Select
            value="a"
            options={SELECT_OPTIONS}
          />
          {' '}
          <Select
            value={null}
            options={SELECT_OPTIONS}
            allowNull
            onChange={(_, value) => console.log(value)}
          />
          {' '}
          <TextInput
            value="a"
            placeholder="text"
            onChange={(_, value) => console.log(value)}
          />
          {' '}
          <NumberInput
            step="0.1"
            value={null}
            placeholder="number"
            onChange={(_, value) => console.log(value)}
          />
          {' '}
          <Checkbox id="myCheck" value />
          <label htmlFor="myCheck">Label</label>
          {' '}
          <Button onClick={this.addModal.bind(this)}>
            Add modal
          </Button>
          {' '}
          <Button 
            plain
            onClick={() => this.setState({ fEmbeddedModal: true })}
          >
            Embed modal
          </Button>
          { this.state.fEmbeddedModal && this.renderEmbeddedModal() }
        </div>
        <br />
        <Textarea value="En un lugar de la Mancha..." />
        <div>
          {
            this.state.fShowDateInput && <DateInput placeholder="date" />
          }
          <Button onClick={() => this.setState({ fShowDateInput: !this.state.fShowDateInput })}>
            Toggle date input
          </Button>
        </div>
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
        style={{width: 500}}
      >
        What's your name?{' '}
        <TextInput ref={o => { this.refInput = o; }} autoFocus />
        <Textarea />
      </Modal>
    );
  }

  addModal() {
    const title = 'Hello, what\'s your name?';
    const children = <TextInput ref={o => { this.refName = o; }} autoFocus />;
    modalPush({
      title,
      children,
      buttons: [
        { label: 'Hello!', onClick: this.addModal2.bind(this), defaultButton: true },
        { label: 'Back', onClick: modalPop, left: true },
      ],
      onEsc: modalPop,
    });
  }

  addModal2() {
    const title = 'Introduction';
    const children = <span>Nice to meet you, {this.refName.getValue()}!</span>;
    modalPush({
      title,
      children,
      buttons: [
        { label: 'Back', onClick: modalPop, defaultButton: true },
      ],
      onEsc: modalPop,
    });
  }
}

const HoverableExample = hoverable(({ hovering, onHoverStart, onHoverStop }) => (
  <div
    onMouseEnter={onHoverStart}
    onMouseLeave={onHoverStop}
    style={merge(style.example, style.hoverable(hovering))}
  >
    Hoverable
  </div>
));

const FlexRow = ({ children }) => (
  <div style={merge(style.example, flexContainer('row'))}>
    {children}
  </div>
);

const FlexSpacer = ({ children }) => <div style={flexItem('1')}>{children}</div>;

// -----------------------------------------------
// Styles
// -----------------------------------------------
const style = {
  example: {
    marginBottom: 5,
    width: 700,
    border: '1px solid #ccc',
    padding: 5,
  },
  hoverable: hovering => ({
    backgroundColor: hovering ? '#ccc' : undefined,
  }),
};

// -----------------------------------------------
// Render main
// -----------------------------------------------
ReactDOM.render(<App />, document.getElementById('app'));
