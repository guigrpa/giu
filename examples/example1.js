import React                from 'react';
import ReactDOM             from 'react-dom';
import {
  Select, TextInput, NumberInput, Textarea, Checkbox,
  Button,
  Icon, LargeMessage,
  Modals, pushModal, popModal,
  Modal,
  hoverable,
  flexItem,
  flexContainer,
  merge,
}                           from '../src';

// -----------------------------------------------
// Examples
// -----------------------------------------------
const App = () => (
  <div>
    <Modals />
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

const MessageExample = () => (
  <div style={style.example}>
    <LargeMessage>Hello there!</LargeMessage>
  </div>
);

const IconExample = () => (
  <div style={style.example}>
    <Icon icon="heart" id="a" />
    {' '}
    <Icon icon="circle-o-notch" />
    {' '}
    <Icon icon="spinner" spin />
    {' '}
    <Icon icon="arrow-left" id="a" />
  </div>
);

const SELECT_OPTIONS = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
];
let cntModal = 1;

class FormExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fEmbeddedModal: false };
  }

  render() {
    return (
      <div style={style.example}>
        <div>
          <Select
            value="a"
            options={SELECT_OPTIONS}
          />
          <Select
            value={null}
            options={SELECT_OPTIONS}
            allowNull
            onChange={(_, value) => console.log(value)}
          />
          <TextInput
            type="text"
            value="a"
            placeholder="text"
            onChange={(_, value) => console.log(value)}
          />
          <NumberInput
            type="number"
            step="0.1"
            value={null}
            placeholder="number"
            onChange={(_, value) => console.log(value)}
          />
          <Checkbox id="myCheck" value />
          <label htmlFor="myCheck">Label</label>
          <Button onClick={this.addModal.bind(this)}>
            Add modal
          </Button>
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
      </div>
    );
  }

  renderEmbeddedModal() {
    const close = () => this.setState({ fEmbeddedModal: false });
    const buttons = [
      {
        label: 'Got it!',
        onClick: close,
      },
    ];
    return (
      <Modal 
        title="Embedded modal"
        buttons={buttons}
        onClickBackdrop={close}
      />
    );
  }

  addModal() {
    pushModal({
      title: `Modal ${cntModal++}`,
      buttons: [
        { label: 'Push another one!', onClick: this.addModal.bind(this) },
        { label: 'Close', onClick: popModal },
      ],
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
