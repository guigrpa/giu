import React                from 'react';
import ReactDOM             from 'react-dom';
import ReactDOMServer       from 'react-dom/server';
import { merge }            from 'timm';
require('babel-polyfill');
import {
  Select, DateInput, Textarea, Checkbox,
  TextInput, PasswordInput, NumberInput, RangeInput,
  FileInput, RadioGroup, ColorInput,
  LIST_SEPARATOR,
  DropDownMenu,
  Button,
  Progress,
  Icon, Spinner, LargeMessage,
  Floats, floatReposition,
  Modals, Modal, modalPush, modalPop,
  Notifications, Notification, notify as createNotif,
  Hints, HintScreen, hintDefine, hintShow, hintHide, hintDisableAll, hintReset,
  hoverable,
  flexContainer, flexItem, boxWithShadow,
  cancelEvent,
  isRequired, isEmail, isOneOf, isDate,
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
  { label: 'A long, really long, very very very very very very long option', value: 'a' },
  { label: 'Another long, really long, very very long option', value: 2 },
  LIST_SEPARATOR,
  { label: 'B', value: 'b' },
  { label: 'true', value: true },
  { label: 'C', value: 'c' },
];

const LONG_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
  mi tortor, sagittis in ultricies ullamcorper, feugiat quis
  mauris. Nam dapibus velit nec dictum vulputate. Morbi tincidunt
  diam eu velit gravida, vel consequat ante luctus. Integer ut
  consequat sem, dictum eleifend nunc. Quisque elit massa,
  gravida non tortor sed, condimentum pulvinar lorem. Duis
  ullamcorper placerat mi sed tempor. Praesent sed justo ut leo
  congue pharetra sed sit amet libero. Suspendisse odio velit, mattis
  non pulvinar non, posuere sit amet quam. Etiam lacinia lobortis
  tincidunt.`;

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
    case 5:
      out = (
        <div>
          <Floats />
          <RangeInput value="55" min={0} max={100} step={5} onChange={onChange} />
          <RangeInput disabled value="34" min={0} max={100} step={5} onChange={onChange} />
        </div>
      );
      break;
    case 6:
      out = (
        <div>
          <NativeDateInput />
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
            <Hints />
            <div style={flexItem(1)}>
              {EVERYTHING && <NotificationExample />}
              {EVERYTHING && <MessageExample />}
              {EVERYTHING && <IconExample />}
              {EVERYTHING && <ButtonExample />}
              {EVERYTHING && <HoverableExample />}
              {EVERYTHING && <StyleUtilsExample />}
              {EVERYTHING && <DropDownExample />}
              {EVERYTHING && <ModalExample />}
              {EVERYTHING && <HintExample />}
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

class NativeDateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: new Date() };
  }

  render() {
    return (
      <div>
        <DateInput type="native"
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput type="native" utc={false}
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput type="native" time
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput type="native" date={false} time
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput type="native" date={false} time utc={false}
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <span>{this.state.value ? this.state.value.toString() : 'none'}</span>
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
      onClickItem={onChangeJson}
      style={{padding: "3px 8px"}}
    >
      <Icon icon="bars" /> Menu
    </DropDownMenu>
    <DropDownMenu
      items={TALL_OPTIONS}
      onClickItem={onChangeJson}
      accentColor="darkgreen"
      style={{padding: "3px 8px"}}
    >
      <Icon icon="bullseye" /> Long menu
    </DropDownMenu>
    <DropDownMenu
      items={WIDE_OPTIONS}
      onClickItem={onChangeJson}
      floatAlign="right"
      accentColor="darkblue"
      style={{padding: "3px 8px"}}
    >
      <Icon icon="cube" /> Menu to the left
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
          placeholder="date of birth"
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
          placeholder="date of birth"
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
      buttons: [
        { label: 'Back', onClick: modalPop, defaultButton: true },
      ],
      onEsc: modalPop,
      style: { width: 500 },
    });
  }
}

class HintExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fEmbeddedHint: false };
  }

  componentWillMount() {
    hintDefine('hintExample', {
      elements: () => {
        const out = [];
        const ref = this.refs.buttonShowHint;
        if (ref) {
          const bcr = ref.getBoundingClientRect();
          const x = bcr.right + 90;
          const y = bcr.top - 80;
          out.push({
            type: 'LABEL', x, y,
            children: 'Just shows a pre-defined hint (if not already shown)',
          });
          out.push({
            type: 'ARROW',
            from: { x, y },
            to: { x: (bcr.left + bcr.right) / 2, y: bcr.top - 5 },
            counterclockwise: true,
          });
        }
        return out;
      },
    });
  }

  render() {
    return (
      <div style={style.example}>
        <ExampleLabel>
          Hints (show once, disable-all, reset) and Hint (embedded): simple label positioning,
          even taking into account DOM element positions
        </ExampleLabel>
        <span ref="buttonShowHint">
          <Button onClick={() => hintShow('hintExample')}>
            Show hint (if not already shown)
          </Button>
        </span>
        {' '}
        <Button onClick={() => { hintReset(); alert('Hints have been reset') }}>
          Reset hints
        </Button>
        {' '}
        <Button onClick={() => { hintDisableAll(); alert('Hints have been disabled') }}>
          Disable all
        </Button>
        {' '}<br />
        <span ref="buttonEmbedHint">
          <Button onClick={() => this.setState({ fEmbeddedHint: true })}>
            Embed hint
          </Button>
        </span>
        { this.state.fEmbeddedHint && this.renderEmbeddedHint() }
      </div>
    );
  }

  renderEmbeddedHint() {
    const close = () => this.setState({ fEmbeddedHint: false });
    const elements = () => {
      const out = [
        {
          type: 'LABEL', x: 300, y: 30, align: 'right',
          children: <span>A right-aligned label with an icon: <Icon icon="ambulance" /></span>,
        }, {
          type: 'LABEL', x: 500, y: 60, align: 'center',
          children: <span>A <span style={{ color: 'yellow' }}>center-aligned</span> label</span>,
        }, {
          type: 'LABEL', x: 700, y: 80,
          children: <span>A very, very, very, very, very, very, very, very long label</span>,
        },
        { type: 'ARROW', from: { x: 300, y: 30 }, to: { x: 420, y: 60 } },
        { type: 'ARROW', from: { x: 550, y: 120 }, to: { x: 700, y: 140 }, counterclockwise: true },
      ];
      const ref = this.refs.buttonEmbedHint;
      if (ref) {
        const bcr = ref.getBoundingClientRect();
        const y = (bcr.top + bcr.bottom) / 2;
        const to = y >= 130
          ? { x: bcr.right + 10, y }
          : { x: (bcr.left + bcr.right) / 2, y: bcr.bottom + 10 };
        const counterclockwise = y >= 130;
        out.push({
          type: 'LABEL', x: 160, y: Math.max(130, (bcr.top + bcr.bottom) / 2),
          children: <span>This is <i>the</i> button</span>,
        });
        out.push({ type: 'ARROW', from: { x: 160, y: Math.max(130, y) }, to, counterclockwise });
      }
      return out;
    };
    return <HintScreen onClose={close} elements={elements} />;
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
      {LONG_TEXT}<br />
      {LONG_TEXT}<br />
      {LONG_TEXT}<br />
      <DateInput placeholder="date" />
      <br />
      {LONG_TEXT}<br />
      {LONG_TEXT}<br />
      {LONG_TEXT}<br />
      {LONG_TEXT}<br />
      <DateInput placeholder="date" />
    </div>
  </div>;

class ProgressExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0.3 };
  }
  componentDidMount() {
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
          <NumberInput
            step="0.1"
            value={null} onChange={onChange}
            placeholder="number" style={{width: 80}}
          />
          <NumberInput disabled value={6.5} style={{width: 80}} />
          &nbsp;&nbsp;
          <TextInput
            value="a" onChange={onChange}
            placeholder="text"
            errors={["Example error above"]}
            errorPosition="above" errorAlign="right"
            style={{width: 80}}
          />
          <TextInput disabled value="Disabled" style={{width: 80}} />
          &nbsp;&nbsp;
          <PasswordInput
            required
            onChange={onChange}
            placeholder="password"
            style={{width: 80}}
          />
          &nbsp;&nbsp;
          <Checkbox
            value={true} onChange={onChange}
            label="checkbox"
            errors={["Example error below"]}
          />&nbsp;
          <Checkbox disabled value={true} label="checkbox"/>
        </div>
        <div>
          <FileInput />
          <FileInput disabled />
        </div>
        <br />
        <div style={flexContainer('row')}>
          <div>
            <ExampleLabel>RadioGroup (flexible labels, clipboard)</ExampleLabel>
            <div style={flexContainer('row')}>
              <RadioGroup items={NORMAL_OPTIONS} required onChange={onChange} />
              <RadioGroup items={NORMAL_OPTIONS} value="a" disabled />
              <RadioGroup 
                items={[
                  { value: 1, label: "A simple text label" },
                  { value: 2, label: <span>A label with <i>some</i> <b>formatting</b></span> },
                  { value: 3, label: <span>A multiline label</span>, 
                    labelExtra: <div>because yes, we can <Icon icon="smile-o" /></div>
                  },
                  { value: 4, label: "Another normal label" },
                  { value: 5, label: <span>A label with a <Button onClick={() => console.log('hi!')}>button</Button></span> },
                ]}
              />
            </div>
          </div>
          <div style={{marginLeft: 10}}>
            <ExampleLabel>RangeInput (horizontal/vertical)</ExampleLabel>
            <div style={flexContainer('row')}>
              <div style={{marginLeft: 5}}>
                <RangeInput
                  value={25} onChange={onChange}
                  min={0} max={100} step={5}
                  style={{display: 'block'}}
                />
                <RangeInput disabled
                  value={55} onChange={onChange}
                  min={0} max={100} step={5}
                  style={{display: 'block'}}
                />
              </div>
              <RangeInput
                value={55} onChange={onChange}
                min={0} max={100} step={5}
                vertical
                style={{marginLeft: 20, height: 100, width: 25}}
              />
            </div>
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>Input validation</ExampleLabel>
          <TextInput placeholder="no validation" />
          <TextInput placeholder="required (shortcut)"
            required />
          <TextInput placeholder="isRequired, custom"
            validators={[isRequired('please write something!')]} />
          <TextInput placeholder="isEmail"
            required validators={[isEmail()]} />
          <TextInput placeholder="isEmail (custom msg)"
            required validators={[isEmail('please write your e-mail!')]} />
          <TextInput placeholder="isEmail (custom msg 2)"
            required validators={[isEmail((msg, val) => `'${val}' is not an email!`)]} />
          <TextInput placeholder="custom sync validator"
            required validators={[
              o => o.toLowerCase() === 'unicorn' ? undefined : 'must be \'unicorn\''
            ]} />
          <TextInput placeholder="custom promise validator"
            required validators={[
              o => new Promise((resolve, reject) =>
                setTimeout(() => 
                  o.toLowerCase() === 'unicorn' ? resolve(undefined) : resolve('checked the database; you must be a \'unicorn\'')
                , 1000)
              )
            ]} />
          <DateInput type="onlyField" placeholder="MM/DD/YYYY" />
          <DateInput type="onlyField" date={false} time seconds placeholder="HH:MM:ss" />
          <DateInput type="onlyField" date={false} time seconds placeholder="HH:MM:ss"
            required validators={[isDate((msg, val, { fmt }) => 
              `ha de ser una hora correcta: ${fmt}`
            )]} />
        </div>
        <br />
        <div>
          <ExampleLabel>Textarea (with auto-resize)</ExampleLabel>
          <Textarea value="En un lugar de la Mancha..." style={{minHeight: '1.5em'}} />
          <Textarea disabled value="En un lugar de la Mancha..."  style={{minHeight: '1.5em'}} />
        </div>
        <br />
        <div>
          <ExampleLabel>
            Select: native, or with inline/dropdown ListPicker
            (keyboard-controlled, shortcuts, clipboard, one/two-stage, autoscroll)
          </ExampleLabel>
          <div>
            <Select
              value="a"
              items={NORMAL_OPTIONS} required
            />
            <Select
              value={null} onChange={onChangeJson}
              items={NORMAL_OPTIONS}
            />
            <Select disabled value="a" items={NORMAL_OPTIONS} />
            &nbsp;&nbsp;
            <Select type="dropDownPicker" required
              value="a" onChange={onChangeJson}
              items={NORMAL_OPTIONS}
            />
            <Select type="dropDownPicker"
              value={null} onChange={onChangeJson}
              items={NORMAL_OPTIONS}
            />
            <Select type="dropDownPicker"
              value={28} onChange={onChangeJson}
              items={TALL_OPTIONS}
            />
            <Select disabled type="dropDownPicker" value={28} items={TALL_OPTIONS}/>
          </div>
          <div style={flexContainer('row')}>
            <Select type="inlinePicker" required
              items={NORMAL_OPTIONS}
              onChange={onChangeJson}
              styleOuter={flexItem(1, { marginRight: 4 })}
              style={{height: 150}}
              accentColor="gray"
            />
            <Select type="inlinePicker"
              items={TALL_OPTIONS}
              value={33} onChange={onChangeJson}
              twoStageStyle 
              styleOuter={flexItem(1, { marginRight: 4 })}
              style={{height: 150}}
              accentColor="lightGray"
            />
            <Select type="inlinePicker"
              items={[]}
              onChange={onChangeJson}
              styleOuter={flexItem(1, { marginRight: 4 })}
              style={{height: 150}}
            />
            <Select type="inlinePicker" disabled
              items={TALL_OPTIONS}
              value={33} onChange={onChangeJson}
              styleOuter={flexItem(1)}
              style={{height: 150}}
              accentColor="lightGray"
            />
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>
            DateInput: field-only, or with inline/dropdown DateTimePicker
            (keyboard-controlled, clipboard; local for date+time, UTC otherwise)
          </ExampleLabel>
          <div>
            <DateInput onChange={onChange}
              style={{width: 130}}
            />&nbsp;&nbsp;
            <DateInput date time onChange={onChange}
              style={{width: 180}}
            />&nbsp;&nbsp;
            <DateInput date={false} time onChange={onChange}
              style={{width: 70}}
            />&nbsp;&nbsp;
            <DateInput date={false} time seconds analogTime={false} onChange={onChange}
              style={{width: 70}}
            />
            &nbsp;dropDownPicker (default)
          </div>
          <div>
            <DateInput type="onlyField" onChange={onChange}
              style={{width: 130}}
            />&nbsp;&nbsp;
            <DateInput type="onlyField" date time onChange={onChange}
              style={{width: 180}}
            />&nbsp;&nbsp;
            <DateInput type="onlyField" date={false} time onChange={onChange}
              style={{width: 70}}
            />&nbsp;&nbsp;
            <DateInput type="onlyField" date={false} time seconds analogTime={false} onChange={onChange}
              style={{width: 70}}
            />
            &nbsp;onlyField
          </div>
          <div>
            <DateInput type="native" onChange={onChange}
              style={{fontSize: 10, width: 130}}
            />&nbsp;&nbsp;
            <DateInput type="native" date time onChange={onChange}
              style={{fontSize: 10, width: 180}}
            />&nbsp;&nbsp;
            <DateInput type="native" date={false} time onChange={onChange}
              style={{fontSize: 10, width: 70}}
            />&nbsp;&nbsp;
            <DateInput type="native" date={false} time seconds analogTime={false} onChange={onChange}
              style={{fontSize: 10, width: 70}}
            />
            &nbsp;native
          </div>
          <div>
            <DateInput disabled value={new Date()} type="onlyField"
              style={{width: 130}}
            />&nbsp;&nbsp;
            <DateInput disabled value={new Date()} type="onlyField" date time
              style={{width: 180}}
            />&nbsp;&nbsp;
            <DateInput disabled value={new Date()} type="onlyField" date={false} time
              style={{width: 70}}
            />&nbsp;&nbsp;
            <DateInput disabled value={new Date()} type="onlyField" date={false} time seconds analogTime={false}
              style={{width: 70}}
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
          <ExampleLabel>
            ColorInput: with inline/dropdown ColorPicker (RGB/HSV, alpha, clipboard)
          </ExampleLabel>
          <div style={flexContainer('row')}>
            <ColorInput value="aadc5400" accentColor="darkmagenta" onChange={onChange} />
            <ColorInput value="ffdc5400" disabled />
            <div>&nbsp;</div>
            <ColorInput inlinePicker value="ffcca500" accentColor="lightGray" onChange={onChange} />
            <ColorInput inlinePicker value="ffcca500" disabled accentColor="lightGray" onChange={onChange} />
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
  }
  componentDidMount() {
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
const mainEl = <App />;

// Normal render
if (typeof document !== 'undefined') {
  ReactDOM.render(mainEl, document.getElementById('app'));

// SSR
} else {
  module.exports = function render(locals, callback) {
    const ssrHtml = ReactDOMServer.renderToString(mainEl);
    const ssrCss = require('../src/all.css');
    let rendered = locals.template;
    rendered = rendered.replace('<!-- ssrHtml -->', ssrHtml);
    rendered = rendered.replace('<!-- ssrCss -->', ssrCss);
    callback(null, rendered);
  };
}
