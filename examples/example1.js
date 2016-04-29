import React                from 'react';
import ReactDOM             from 'react-dom';
require('babel-polyfill');
import {
  Select, TextInput, NumberInput, DateInput, Textarea, Checkbox,
  Button,
  Icon, Spinner, LargeMessage,
  Floats, floatReposition,
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
    <Modals />
    <Floats />
    <Notifications />
    <NotificationExample />
    <MessageExample />
    <IconExample />
    <ScrollingExample />
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
    title="Title"
    msg="Notification message"
    style={style.example}
    noStyleShadow noStylePosition
  />;

const MessageExample = () =>
  <div style={style.example}>
    <LargeMessage>Sample</LargeMessage>
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
        <div>
          {
            this.state.fShowDateInput && 
            <DateInput placeholder="date" />
          }
          <Button onClick={() => this.setState({ fShowDateInput: !this.state.fShowDateInput })}>
            Toggle date input
          </Button>
        </div>
        <Textarea value="En un lugar de la Mancha..." />
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
        <DateInput placeholder="date" floatZ={55} />
        <Textarea placeholder="Write something..." style={{maxHeight: 100}} />
      </Modal>
    );
  }

  addModal() {
    const title = 'Hello, what\'s your name?';
    const children = (
      <div>
        <TextInput ref={o => { this.refName = o; }} autoFocus />{' '}
        <DateInput placeholder="date" floatPosition="above" floatZ={55} />
      </div>
    );
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

class ScrollingExample extends React.Component {
  render() {
    return (
      <div 
        onScroll={floatReposition}
        style={merge(style.example, style.scrolling)}
      >
        <DateInput placeholder="date" floatPosition="above" floatAlign="right" />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin mi tortor, sagittis in ultricies ullamcorper, feugiat quis mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt diam eu velit gravida, vel consequat ante luctus. Integer ut consequat sem, dictum eleifend nunc. Quisque elit massa, gravida non tortor sed, condimentum pulvinar lorem. Duis ullamcorper placerat mi sed tempor. Praesent sed justo ut leo congue pharetra sed sit amet libero. Suspendisse odio velit, mattis non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis tincidunt.
        <br />
        Vivamus porta odio sed ex accumsan tincidunt. Pellentesque nec nisl condimentum, pulvinar erat non, facilisis lectus. Ut vel ultricies dui. Sed eu massa a dui fringilla varius vel sit amet lectus. Nulla ultrices tincidunt orci, non egestas nunc lacinia tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent tristique elementum sapien, vel scelerisque augue placerat et. Suspendisse rhoncus tortor odio, tincidunt fringilla sapien pulvinar eget. Ut posuere nunc eu magna placerat, nec tristique quam laoreet. In molestie iaculis eros at maximus. Maecenas eget tortor luctus, aliquam nibh in, egestas turpis.
        <br />
        Etiam nulla lacus, porta at nunc nec, efficitur ultricies nisi. Vestibulum vel pulvinar erat. Vestibulum eget dapibus leo. Duis viverra id eros vel commodo. Integer pellentesque iaculis sapien. Nullam pellentesque sodales eros, vitae semper nunc placerat a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In sollicitudin urna augue, eget pharetra lectus molestie vel. Pellentesque malesuada est hendrerit, mattis dui nec, cursus ipsum.
        <br />
        <DateInput placeholder="date" />
        <br />
        Etiam nulla lacus, porta at nunc nec, efficitur ultricies nisi. Vestibulum vel pulvinar erat. Vestibulum eget dapibus leo. Duis viverra id eros vel commodo. Integer pellentesque iaculis sapien. Nullam pellentesque sodales eros, vitae semper nunc placerat a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In sollicitudin urna augue, eget pharetra lectus molestie vel. Pellentesque malesuada est hendrerit, mattis dui nec, cursus ipsum.
        <br />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin mi tortor, sagittis in ultricies ullamcorper, feugiat quis mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt diam eu velit gravida, vel consequat ante luctus. Integer ut consequat sem, dictum eleifend nunc. Quisque elit massa, gravida non tortor sed, condimentum pulvinar lorem. Duis ullamcorper placerat mi sed tempor. Praesent sed justo ut leo congue pharetra sed sit amet libero. Suspendisse odio velit, mattis non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis tincidunt.
        <br />
        Vivamus porta odio sed ex accumsan tincidunt. Pellentesque nec nisl condimentum, pulvinar erat non, facilisis lectus. Ut vel ultricies dui. Sed eu massa a dui fringilla varius vel sit amet lectus. Nulla ultrices tincidunt orci, non egestas nunc lacinia tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent tristique elementum sapien, vel scelerisque augue placerat et. Suspendisse rhoncus tortor odio, tincidunt fringilla sapien pulvinar eget. Ut posuere nunc eu magna placerat, nec tristique quam laoreet. In molestie iaculis eros at maximus. Maecenas eget tortor luctus, aliquam nibh in, egestas turpis.
        <br />
        Nam feugiat lobortis libero, sit amet posuere ex ultrices id. Aliquam in felis vel ante semper tincidunt et nec turpis. In sed velit at mi placerat bibendum. Maecenas at consectetur turpis. Quisque dictum, augue sit amet ornare facilisis, orci magna ultrices lectus, a finibus urna elit id lorem. Duis condimentum sapien ac dolor vulputate fermentum. Aliquam blandit, dolor a fringilla rutrum, dolor orci finibus eros, in hendrerit diam metus et dolor. Vestibulum id erat vitae dolor malesuada blandit. Quisque accumsan feugiat mi non bibendum. Cras in diam gravida, hendrerit turpis at, eleifend mauris. Ut nec dolor id odio euismod venenatis. Quisque condimentum consequat imperdiet. Nunc ex risus, ornare ut sollicitudin quis, euismod nec leo. Suspendisse sit amet mauris congue, tempor mi id, rutrum lorem. Vestibulum eget odio suscipit, aliquet nunc et, malesuada orci.
        <DateInput placeholder="date" />
      </div>
    );
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
  scrolling: {
    maxHeight: 120,
    overflow: 'auto',
  },
  hoverable: hovering => ({
    backgroundColor: hovering ? '#ccc' : undefined,
  }),
};

// -----------------------------------------------
// Render main
// -----------------------------------------------
ReactDOM.render(<App />, document.getElementById('app'));
