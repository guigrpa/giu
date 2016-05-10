import React                from 'react';
import ReactDOM             from 'react-dom';
require('babel-polyfill');
import {
  Select, TextInput, NumberInput, DateInput, Textarea, Checkbox,
  FileInput,
  LIST_SEPARATOR,
  DateTimePicker,
  DropDownMenu,
  Button,
  Progress,
  Icon, Spinner, LargeMessage,
  Floats, floatReposition,
  Modals, Modal, modalPush, modalPop,
  Notifications, Notification, notify,
  hoverable,
  flexContainer, flexItem,
  merge,
  cancelEvent,
}                           from '../src';

const { floor, random } = Math;
const randomInt = (min, max) => min + floor(random() * (max - min + 1));
const sample = (arr) => arr[randomInt(0, arr.length - 1)];

const NORMAL_OPTIONS = [
  { label: 'A', value: 'a', keys: 'mod+a', onClick: () => console.log('Custom click A') },
  { label: '2', value: 2, keys: 'mod+2' },
  LIST_SEPARATOR,
  { label: 'B', value: 'b', keys: ['shift+b', 'shift+c'] },
  { label: 'true', value: true, keys: 'alt+backspace' },
  { label: 'C', value: 'c', keys: 'shift+up' },
];
const TALL_OPTIONS = [];
for (let i = 0; i < 50; i++) {
  TALL_OPTIONS.push({
    label: `Option ${i}`,
    value: i,
  });
}
const WIDE_OPTIONS = [
  { label: 'A long, really long, very very long option', value: 'a' },
  { label: 'Another long, really long, very very long option', value: 2 },
  LIST_SEPARATOR,
  { label: 'B', value: 'b' },
  { label: 'true', value: true },
  { label: 'C', value: 'c' },
];

// -----------------------------------------------
// Examples
// -----------------------------------------------
const TEST = 0;
const EVERYTHING = true;
const onChange = (ev, o) => console.log(o);
const App = () => {
  let out;
  switch (TEST) {
    case 1:
      out = (
        <div>
          <Floats />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          <TextInput
            onChange={(ev, o) => console.log(o)}
            errors={['Must be numeric']}
            errorPosition="above" errorAlign="right"
          /><br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
          Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />Test<br />
        </div>
      );
      break;
    case 2:
      out = (
        <div style={{padding: 5}}>
          <Floats />
          Date (UTC midnight - default): <DateInput onChange={onChange} /><br />
          Date (local midnight): <DateInput onChange={onChange} utc={false} /><br />
          Date-time (UTC midnight): <DateInput onChange={onChange} time utc value={new Date()} /><br />
          Date-time (local midnight - default): <DateInput onChange={onChange} time value={new Date()} /><br />
          Time (UTC midnight - default): <DateInput onChange={onChange} date={false} time value={new Date()} /><br />
          Time (local midnight): <DateInput onChange={onChange} date={false} time utc={false} value={new Date()} /><br />
        </div>
      );
      break;
    case 3:
      out = (
        <div>
          <Floats />
          <DropDownMenu
            items={NORMAL_OPTIONS}
            onClickItem={(ev, value) => console.log(value)}
          >
            <Icon icon="bars" /> Menu
          </DropDownMenu>
        </div>
      );
      break;
      break;
    default:
      out = (
        <div style={flexContainer('row')}>
          <Modals />
          <Floats />
          <Notifications />
          <div style={flexItem(1)}>
            {EVERYTHING && <ProgressExample />}
            {EVERYTHING && <NotificationExample />}
            {EVERYTHING && <MessageExample />}
            {EVERYTHING && <IconExample />}
            {EVERYTHING && <ButtonExample />}
            {EVERYTHING && <HoverableExample />}
            {EVERYTHING && <FlexExample />}
            {EVERYTHING && <DropDownExample />}
            {EVERYTHING && <ModalExample />}
            {EVERYTHING && <ScrollingExample />}
          </div>
          <div style={flexItem(1)}>
            {EVERYTHING && <FormExample />}
          </div>
        </div>
      );
      break;
  }
  return out;
};

class ProgressExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0.3 };
    setInterval(() => { this.setState({ value: Math.random() }); }, 2000);
  }
  render() {
    return (
      <div style={style.example}>
        <ExampleLabel>Progress</ExampleLabel>
        <Progress value={this.state.value} />
        <Progress />
      </div>
    );
  }
}

const NotificationExample = () =>
  <div style={style.example}>
    <ExampleLabel>Notification (embedded)</ExampleLabel>
    <Notification
      icon="cog" iconSpin
      title="Title"
      msg="Notification message"
      noStylePosition
    />
  </div>;

const MessageExample = () =>
  <div style={style.example}>
    <ExampleLabel>LargeMessage</ExampleLabel>
    <LargeMessage>Sample</LargeMessage>
  </div>;

let cntNotif = 1;
const IconExample = () =>
  <div style={style.example}>
    <ExampleLabel>Icon</ExampleLabel>
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

const ButtonExample = () =>
  <div style={style.example}>
    <ExampleLabel>Button</ExampleLabel>
    <Button onClick={ () => alert('Clicked') }>Normal</Button>{' '}
    <Button onClick={ () => alert('Clicked') } plain>Plain</Button>
  </div>;

const HoverableExample = hoverable(({ hovering, onHoverStart, onHoverStop }) => (
  <div
    onMouseEnter={onHoverStart}
    onMouseLeave={onHoverStop}
    style={merge(style.example, style.hoverable(hovering))}
  >
    <ExampleLabel>Hoverable (HOC)</ExampleLabel>
  </div>
));

const FlexExample = () =>
  <div style={style.example}>
    <ExampleLabel>Flex utilities</ExampleLabel>
    <div style={flexContainer('row')}>
      <span>Left</span>
      <FlexSpacer />
      <span>Right</span>
    </div>
    <div style={flexContainer('row')}>
      <span>Left</span>
      <FlexSpacer />
      <span>Center</span>
      <FlexSpacer />
      <span>Right</span>
    </div>
  </div>;

const FlexSpacer = ({ children }) => <div style={flexItem('1')}>{children}</div>;

const DropDownExample = () =>
  <div style={style.example}>
    <ExampleLabel>DropDownMenu (focusable, keyboard-controlled, embedded ListPicker)</ExampleLabel>
    <DropDownMenu
      items={NORMAL_OPTIONS}
      onClickItem={(ev, value) => console.log(value)}
    >
      <Icon icon="bars" /> Menu
    </DropDownMenu>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <DropDownMenu
      items={TALL_OPTIONS}
      onClickItem={(ev, value) => console.log(value)}
      accentColor="darkgreen"
    >
      <Icon icon="bolt" /> Long menu
    </DropDownMenu>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <DropDownMenu
      items={WIDE_OPTIONS}
      floatAlign="right"
      accentColor="darkblue"
    >
      <Icon icon="bug" /> Menu to the left
    </DropDownMenu>
  </div>;

class ModalExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fEmbeddedModal: false };
  }

  render() {
    return (
      <div style={style.example}>
        <ExampleLabel>
          Modals (stackable) and Modal (embedded): focusable, keyboard-controlled
        </ExampleLabel>
        <Button onClick={this.addModal.bind(this)}>
          Add modal
        </Button>
        {' '}
        <Button
          onClick={() => this.setState({ fEmbeddedModal: true })}
        >
          Embed modal
        </Button>
        { this.state.fEmbeddedModal && this.renderEmbeddedModal() }
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
        What's your name?{' '}
        <TextInput ref={o => { this.refInput = o; }}
          autoFocus
          errors={["Must be non-null"]}
          errorZ={52}
        />
        <DateInput
          placeholder="date"
          floatZ={55}
          errors={["Must be non-null"]}
        />
        <Textarea 
          placeholder="Write something..." 
          errors={["Must write something in the textarea"]}
          errorZ={52}
          style={{ maxHeight: 100 }}
        />
      </Modal>
    );
  }

  addModal() {
    const title = 'Hello, what\'s your name?';
    const children = (
      <div>
        <TextInput ref={o => { this.refName = o; }}
          autoFocus
          errors={["Must be non-null"]}
          errorZ={52}
        />{' '}
        <DateInput
          placeholder="date"
          floatZ={55}
          errors={["Must be non-null"]}
        />
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

const ScrollingExample = () =>
  <div style={style.example}>
    <ExampleLabel>Scrollable with floats</ExampleLabel>
    <div
      onScroll={floatReposition}
      style={style.scrolling}
    >
      <DateInput placeholder="date" date time />
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      <DateInput placeholder="date" />
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
      mi tortor, sagittis in ultricies ullamcorper, feugiat quis
      mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
      diam eu velit gravida, vel consequat ante luctus. Integer ut
      consequat sem, dictum eleifend nunc. Quisque elit massa,
      gravida non tortor sed, condimentum pulvinar lorem. Duis
      ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
      congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
      non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
      tincidunt.
      <br />
      <DateInput placeholder="date" />
    </div>
  </div>;

class FormExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fShowDateInput: true,
      fixedDate: new Date(),
    };
  }

  render() {
    return (
      <div style={style.example}>
        <div>
          <ExampleLabel>Inputs</ExampleLabel>
          <TextInput
            value="a"
            placeholder="text"
            onChange={(_, value) => console.log(value)}
            errors={["Must be numeric"]}
            errorPosition="above" errorAlign="right"
          />
          {' '}
          <NumberInput
            step="0.1"
            value={null}
            placeholder="number"
            onChange={(_, value) => console.log(value)}
          />
          {' '}
          <Checkbox
            id="myCheck"
            value={true}
            label="checkbox"
            errors={["Must not be null"]}
          />
          <FileInput />
        </div>
        <div>
          {
            this.state.fShowDateInput &&
            <DateInput placeholder="date" />
          }
          {' '}
          <Button onClick={() => this.setState({ fShowDateInput: !this.state.fShowDateInput })}>
            Toggle date input
          </Button>
        </div>
        <br />
        <div>
          <ExampleLabel>Textarea (with auto-resize)</ExampleLabel>
          <Textarea
            value="En un lugar de la Mancha..."
          />
        </div>
        <br />
        <div>
          <ExampleLabel>
            Select: native, or with inline/dropdown ListPicker
            (keyboard-controlled, shortcuts, one/two-stage, autoscroll)
          </ExampleLabel>
          <Select
            value="a"
            items={NORMAL_OPTIONS}
          />
          &nbsp;&nbsp;
          <Select
            value={null}
            items={NORMAL_OPTIONS} allowNull
            onChange={(_, value) => console.log(JSON.stringify(value))}
          />
          &nbsp;&nbsp;
          <Select type="dropDownPicker"
            value={null}
            items={NORMAL_OPTIONS} allowNull
            onChange={(_, value) => console.log(JSON.stringify(value))}
          />
          <Select type="dropDownPicker"
            value="a"
            items={NORMAL_OPTIONS} allowNull
            onChange={(_, value) => console.log(JSON.stringify(value))}
          />
          <Select type="dropDownPicker"
            value={28}
            items={TALL_OPTIONS} allowNull
            onChange={(_, value) => console.log(JSON.stringify(value))}
          />
          <div style={flexContainer('row')}>
            <Select type="inlinePicker"
              items={NORMAL_OPTIONS}
              onChange={(_, value) => console.log(JSON.stringify(value))}
              styleOuter={flexItem(1, { marginRight: 4 })}
              styleList={{height: 150}}
              accentColor="gray"
            />
            <Select type="inlinePicker"
              items={TALL_OPTIONS}
              value={33}
              onChange={(_, value) => console.log(JSON.stringify(value))}
              twoStageStyle 
              styleOuter={flexItem(1, { marginRight: 4 })}
              styleList={{height: 150}}
              accentColor="lightGray"
            />
            <Select type="inlinePicker"
              items={[]}
              onChange={(_, value) => console.log(JSON.stringify(value))}
              styleOuter={flexItem(1)}
              styleList={{height: 150}}
            />
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>
            DateTimePicker (focusable, keyboard-controlled, local
            for date+time, UTC otherwise)
          </ExampleLabel>
          <div style={flexContainer('row')}>
            <DateTimePicker
              onChange={(ev, d) => console.log(d)}
              time analogTime={false}
              lang="es"
              accentColor="lightgray"
            />
            &nbsp;&nbsp;
            <DateTimePicker
              value={this.state.fixedDate}
              onChange={(ev, d) => console.log(d)}
              accentColor="darkblue"
            />
            &nbsp;&nbsp;
            <DateTimePicker
              value={this.state.fixedDate}
              onChange={(ev, d) => console.log(d)}
              accentColor="darkgreen"
            />
            &nbsp;&nbsp;
            <DateTimePicker
              onChange={(ev, d) => console.log(d)}
              date={false} time analogTime={false}
              accentColor="turquoise"
            />
          </div>
          <div style={flexContainer('row', { marginTop: 5 })}>
            <TimePickerNow />
            &nbsp;&nbsp;
            <DateTimePicker
              onChange={(ev, d) => console.log(d)}
              date time
            />
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>
            DateInput (focusable, keyboard-controlled, local
            for date+time, UTC otherwise)
          </ExampleLabel>
          <DateInput />&nbsp;&nbsp;
          <DateInput date time />&nbsp;&nbsp;
          <DateInput date={false} time />
          <DateInput date={false} time seconds analogTime={false} />
        </div>
        <br />        
        <div>
          <ExampleLabel>Imperative example</ExampleLabel>
          <TextInput
            value="Initial value"
            cmds={this.cmds}
            onFocus={() => console.log('focus')}
            onBlur={() => console.log('blur')}
          />
          {' '}
          <Button
            onMouseDown={cancelEvent}
            onClick={() => {
              this.cmds = [
                { type: 'SET_VALUE', value: 'Different value' },
                { type: 'FOCUS' },
              ];
              this.forceUpdate();
            }}
          >
            Change & focus
          </Button>
          {' '}
          <Button
            onMouseDown={cancelEvent}
            onClick={() => {
              this.cmds = [
                { type: 'REVERT' },
                { type: 'BLUR' },
              ];
              this.forceUpdate();
            }}
          >
            Revert & blur
          </Button>
        </div>
      </div>
    );
  }
}

class TimePickerNow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curDate: new Date(),
    };
    setInterval(() => {
      this.setState({ curDate: new Date() });
    }, 1000);
  }

  render() {
    return (
      <DateTimePicker
        value={this.state.curDate}
        time seconds disabled
      />
    );
  }
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
const ExampleLabel = ({ children }) => <div style={style.label}>{children}</div>

// -----------------------------------------------
// Styles
// -----------------------------------------------
const style = {
  example: {
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
    border: '1px solid #ccc',
    padding: 10,
    minWidth: 400,
  },
  scrolling: {
    maxHeight: 120,
    overflow: 'auto',
  },
  hoverable: hovering => ({
    backgroundColor: hovering ? '#ccc' : undefined,
  }),
  label: {
    fontWeight: 'bold',
    color: 'darkblue',
  },
};

// -----------------------------------------------
// Render main
// -----------------------------------------------
ReactDOM.render(<App />, document.getElementById('app'));
