import React                from 'react';
import ReactDOM             from 'react-dom';
require('babel-polyfill');
import {
  Select, TextInput, NumberInput, DateInput, Textarea, Checkbox,
  FileInput,
  LIST_SEPARATOR,
  DropDownMenu,
  Button,
  Progress,
  Icon, Spinner, LargeMessage,
  Floats, floatReposition,
  Modals, Modal, modalPush, modalPop,
  Notifications, Notification, notify as createNotif,
  hoverable,
  flexContainer, flexItem, boxWithShadow,
  merge,
  cancelEvent,
  isRequired, isEmail, isOneOf,
}                           from '../src';

const { floor, random } = Math;
const randomInt = (min, max) => min + floor(random() * (max - min + 1));
const sample = (arr) => arr[randomInt(0, arr.length - 1)];
const onChange = (ev, o) => console.log(o);
const onChangeJson = (ev, o) => console.log(JSON.stringify(o));

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

let cntNotif = 1;
const notify = (msg) => createNotif({
  msg: msg || `Notification #${cntNotif++}`,
  type: sample(['info', 'success', 'warn', 'error']),
  icon: sample(['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down']),
});

// -----------------------------------------------
// Examples
// -----------------------------------------------
const TEST = 0;
const EVERYTHING = true;
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
            onChange={onChange}
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
            onClickItem={onChange}
          >
            <Icon icon="bars" /> Menu
          </DropDownMenu>
        </div>
      );
      break;
    case 4:
      out = (
        <div>
          <Floats />
          <DateInput date={false} time onChange={onChange} type="inlinePicker" />
        </div>
      );
      break;
    default:
      out = (
        <div>
          <div style={{padding: 10, fontSize: '1.8em', fontWeight: 'bold'}}>
            <a target="_blank" href="http://github.com/guigrpa/giu">Giu</a> demo page
          </div>
          <div style={flexContainer('row')}>
            <Modals />
            <Floats />
            <Notifications />
            <div style={flexItem(1)}>
              {EVERYTHING && <NotificationExample />}
              {EVERYTHING && <MessageExample />}
              {EVERYTHING && <IconExample />}
              {EVERYTHING && <ButtonExample />}
              {EVERYTHING && <HoverableExample />}
              {EVERYTHING && <StyleUtilsExample />}
              {EVERYTHING && <DropDownExample />}
              {EVERYTHING && <ModalExample />}
              {EVERYTHING && <ScrollingExample />}
              {EVERYTHING && <ProgressExample />}
            </div>
            <div style={flexItem(1)}>
              {EVERYTHING && <FormExample />}
            </div>
          </div>
          <div style={{textAlign: 'right', padding: 10, fontSize: '1.2em'}}>
            by <a target="_blank" href="http://github.com/guigrpa">Guillermo Grau Panea</a> 2016
          </div>
        </div>
      );
      break;
  }
  return out;
};

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
    <LargeMessage>No items found.</LargeMessage>
  </div>;

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
      onClick={() => notify()}
    />
  </div>;

const ButtonExample = () =>
  <div style={style.example}>
    <ExampleLabel>Button</ExampleLabel>
    <Button onClick={() => notify('Normal button pressed')}>Notify me!</Button>{' '}
    <Button onClick={() => notify('Plain button pressed')} plain>Notify me!</Button>
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

const StyleUtilsExample = () =>
  <div style={style.example}>
    <ExampleLabel>Style utilities</ExampleLabel>
    <div style={flexContainer('row')}>
      <span>Flex left</span>
      <FlexSpacer />
      <span>Flex right</span>
    </div>
    <div style={flexContainer('row')}>
      <span>Left</span>
      <FlexSpacer />
      <span>Center</span>
      <FlexSpacer />
      <span>Right</span>
    </div>
    <div style={boxWithShadow({padding: 3})}>
      A box with a shadow
    </div>
  </div>;

const FlexSpacer = ({ children }) => <div style={flexItem('1')}>{children}</div>;

const DropDownExample = () =>
  <div style={style.example}>
    <ExampleLabel>DropDownMenu (focusable, keyboard-controlled, embedded ListPicker)</ExampleLabel>
    <DropDownMenu
      items={NORMAL_OPTIONS}
      onClickItem={onChange}
    >
      <Icon icon="bars" /> Menu
    </DropDownMenu>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <DropDownMenu
      items={TALL_OPTIONS}
      onClickItem={onChange}
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
    <ExampleLabel>Scrollable (with translateZ(0)) with floats</ExampleLabel>
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
            value="a" onChange={onChange}
            placeholder="text"
            errors={["Must be numeric"]}
            errorPosition="above" errorAlign="right"
          />
          <TextInput disabled value="Disabled" />
          &nbsp;&nbsp;
          <NumberInput
            step="0.1"
            value={null} onChange={onChange}
            placeholder="number"
          />
          <NumberInput disabled value={6.5} />
          &nbsp;&nbsp;
          <Checkbox
            value={true} onChange={onChange}
            label="checkbox"
            errors={["Must not be null"]}
          />&nbsp;
          <Checkbox disabled value={true} label="checkbox"/>
          &nbsp;&nbsp;
          <FileInput />
          <FileInput disabled />
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
          <ExampleLabel>Input validation</ExampleLabel>
          <TextInput placeholder="no validation" />
          <TextInput placeholder="required (shortcut)"
            required />
          <TextInput placeholder="isRequired"
            validators={[isRequired()]} />
          <TextInput placeholder="isEmail"
            required validators={[isEmail()]} />
          <TextInput placeholder="isEmail (custom msg)"
            required validators={[isEmail('please write your e-mail!')]} />
          <TextInput placeholder="isEmail (custom msg 2)"
            required validators={[isEmail((_, val) => `'${val}' is not an email!`)]} />
          <DateInput type="onlyField" placeholder="MM/DD/YYYY" />
          <DateInput type="onlyField" date={false} time seconds placeholder="HH:MM:ss" />
        </div>
        <br />
        <div>
          <ExampleLabel>Textarea (with auto-resize)</ExampleLabel>
          <Textarea value="En un lugar de la Mancha..." />
          <Textarea disabled value="En un lugar de la Mancha..." />
        </div>
        <br />
        <div>
          <ExampleLabel>
            Select: native, or with inline/dropdown ListPicker
            (keyboard-controlled, shortcuts, one/two-stage, autoscroll)
          </ExampleLabel>
          <div>
            <Select
              value="a"
              items={NORMAL_OPTIONS}
            />
            <Select
              value={null} onChange={onChangeJson}
              items={NORMAL_OPTIONS} allowNull
            />
            <Select disabled value="a" items={NORMAL_OPTIONS} />
            &nbsp;&nbsp;
            <Select type="dropDownPicker"
              value={null} onChange={onChangeJson}
              items={NORMAL_OPTIONS} allowNull
            />
            <Select type="dropDownPicker"
              value="a" onChange={onChangeJson}
              items={NORMAL_OPTIONS} allowNull
            />
            <Select type="dropDownPicker"
              value={28} onChange={onChangeJson}
              items={TALL_OPTIONS} allowNull
            />
            <Select disabled type="dropDownPicker" value={28} items={TALL_OPTIONS}/>
          </div>
          <div style={flexContainer('row')}>
            <Select type="inlinePicker"
              items={NORMAL_OPTIONS}
              onChange={onChangeJson}
              styleOuter={flexItem(1, { marginRight: 4 })}
              styleList={{height: 150}}
              accentColor="gray"
            />
            <Select type="inlinePicker"
              items={TALL_OPTIONS}
              value={33} onChange={onChangeJson}
              twoStageStyle 
              styleOuter={flexItem(1, { marginRight: 4 })}
              styleList={{height: 150}}
              accentColor="lightGray"
            />
            <Select type="inlinePicker"
              items={[]}
              onChange={onChangeJson}
              styleOuter={flexItem(1, { marginRight: 4 })}
              styleList={{height: 150}}
            />
            <Select type="inlinePicker" disabled
              items={TALL_OPTIONS}
              value={33} onChange={onChangeJson}
              styleOuter={flexItem(1)}
              styleList={{height: 150}}
              accentColor="lightGray"
            />
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>
            DateInput: field-only, or with inline/dropdown DateTimePicker
            (keyboard-controlled, local for date+time, UTC otherwise)
          </ExampleLabel>
          <div>
            <DateInput onChange={onChange} />&nbsp;&nbsp;
            <DateInput date time onChange={onChange} />&nbsp;&nbsp;
            <DateInput date={false} time onChange={onChange}
              styleField={{width: 60}}
            />
            <DateInput date={false} time seconds analogTime={false} onChange={onChange}
              styleField={{width: 80}}
            />
            &nbsp;dropDownPicker (default)
          </div>
          <div>
            <DateInput type="onlyField" onChange={onChange} />&nbsp;&nbsp;
            <DateInput type="onlyField" date time onChange={onChange} />&nbsp;&nbsp;
            <DateInput type="onlyField" date={false} time onChange={onChange}
              styleField={{width: 60}}
            />
            <DateInput type="onlyField" date={false} time seconds analogTime={false} onChange={onChange}
              styleField={{width: 80}}
            />
            &nbsp;onlyField
          </div>
          <div>
            <DateInput disabled value={new Date()} type="onlyField" />&nbsp;&nbsp;
            <DateInput disabled value={new Date()} type="onlyField" date time />&nbsp;&nbsp;
            <DateInput disabled value={new Date()} type="onlyField" date={false} time
              styleField={{width: 60}}
            />
            <DateInput disabled value={new Date()} type="onlyField" date={false} time seconds analogTime={false}
              styleField={{width: 80}}
            />
            &nbsp;disabled
          </div>
          <div style={flexContainer('row')}>
            <DateInput type="inlinePicker"
              onChange={onChange}
              time analogTime={false}
              lang="es"
              accentColor="lightgray"
            />
            &nbsp;&nbsp;
            <DateInput type="inlinePicker"
              value={this.state.fixedDate}
              onChange={onChange}
              accentColor="darkblue"
            />
            &nbsp;&nbsp;
            <DateInput type="inlinePicker" date={false} time seconds
              value={this.state.fixedDate}
              onChange={onChange}
              accentColor="darkgreen"
            />
            &nbsp;&nbsp;
            <DateInput type="inlinePicker"
              onChange={onChange}
              date={false} time analogTime={false}
              accentColor="turquoise"
            />
          </div>
          <div style={flexContainer('row', { marginTop: 5 })}>
            <TimePickerNow />
            &nbsp;&nbsp;
            <DateInput type="inlinePicker"
              onChange={onChange}
              date time
            />
          </div>
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
      <DateInput type="inlinePicker"
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
    transform: 'translateZ(0)'
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
