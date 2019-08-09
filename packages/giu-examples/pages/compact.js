/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function, react/jsx-no-target-blank */
/* eslint-disable react/no-string-refs */
import React from 'react';
import Head from 'next/head';
import moment from 'moment';
import {
  Giu,
  DateInput,
  TextInput,
  NumberInput,
  RangeInput,
  Select,
  Textarea,
  ColorInput,
  FileInput,
  DropDownMenu,
  Button,
  Progress,
  Icon,
  Spinner,
  LargeMessage,
  Floats,
  floatReposition,
  Modals,
  Notifications,
  Notification,
  notify as createNotif,
  Hints,
  flexContainer,
  flexItem,
  AnimatedCounter,
  HeightMeasurer,
  isDark,
} from 'giu';
import {
  NORMAL_OPTIONS,
  TALL_OPTIONS,
  WIDE_OPTIONS,
  LONG_TEXT,
  onChange,
  onChangeJson,
  getLang,
  setLang,
} from '../components/demo1-common';
import DataTableExample from '../components/demo1-dataTables';
import ModalExample from '../components/demo1-modals';
import HintExample from '../components/demo1-hints';
import FormExample from '../components/demo1-forms';
import FormExample2 from '../components/demo1-forms2';
import 'giu/lib/css/giu.css';

const { floor, random } = Math;
const randomInt = (min, max) => min + floor(random() * (max - min + 1));
const sample = (arr): any => arr[randomInt(0, arr.length - 1)];

let cntNotif = 1;
const notify = msg => {
  createNotif({
    msg: msg || `Notification #${cntNotif++}`, // eslint-disable-line no-plusplus
    type: sample(['info', 'success', 'warn', 'error']),
    icon: sample(['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down']),
    onClick: () => console.log('notification clicked'),
  });
};

// -----------------------------------------------
// Examples
// -----------------------------------------------
const TEST = 0;
const EVERYTHING = true;
class App extends React.Component {
  state = {
    accentColor: 'rgb(76, 144, 87)',
    accentColorFg: 'white',
  };

  // -----------------------------------------------
  render() {
    let out;
    const lang = getLang();
    switch (TEST) {
      case 1:
        out = (
          <div>
            <Floats />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            <TextInput
              onChange={onChange}
              errors={['Must be numeric']}
              errorPosition="above"
              errorAlign="right"
            />
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
            Test
            <br />
          </div>
        );
        break;
      case 2:
        out = (
          <div style={{ padding: 5 }}>
            <Floats />
            Date (UTC midnight - default): <DateInput onChange={onChange} />
            <br />
            Date (local midnight): <DateInput onChange={onChange} utc={false} />
            <br />
            Date-time (UTC midnight):{' '}
            <DateInput onChange={onChange} time utc value={new Date()} />
            <br />
            Date-time (local midnight - default):{' '}
            <DateInput onChange={onChange} time value={new Date()} />
            <br />
            Time (UTC midnight - default):{' '}
            <DateInput
              onChange={onChange}
              date={false}
              time
              value={new Date()}
            />
            <br />
            Time (local midnight):{' '}
            <DateInput
              onChange={onChange}
              date={false}
              time
              utc={false}
              value={new Date()}
            />
            <br />
          </div>
        );
        break;
      case 3:
        out = (
          <div>
            <Floats />
            <DropDownMenu items={NORMAL_OPTIONS} onClickItem={onChange}>
              <Icon icon="bars" /> Menu
            </DropDownMenu>
          </div>
        );
        break;
      case 3.5:
        out = (
          <div>
            <Floats />
            <Select
              type="inlinePicker"
              items={TALL_OPTIONS}
              curValue={33}
              onClickItem={onChange}
              style={{ width: 300, height: 150 }}
            />
          </div>
        );
        break;
      case 3.6:
        out = (
          <div>
            <Floats />
            <Select
              type="dropDownPicker"
              items={NORMAL_OPTIONS}
              curValue={33}
              onClickItem={onChange}
              style={{ width: 300, height: 150 }}
            />
          </div>
        );
        break;
      case 4:
        out = (
          <div>
            <Floats />
            <DateInput
              date={false}
              time
              onChange={onChange}
              type="inlinePicker"
            />
          </div>
        );
        break;
      case 5:
        out = (
          <div>
            <Floats />
            <RangeInput
              value="55"
              min={0}
              max={100}
              step={5}
              onChange={onChange}
            />
            <RangeInput
              disabled
              value="34"
              min={0}
              max={100}
              step={5}
              onChange={onChange}
            />
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
      case 7:
        out = (
          <div>
            <Floats />
            <Modals />
            <DataTableExample />
            <ModalExample />
          </div>
        );
        break;
      case 8:
        out = (
          <div>
            <Floats />
            <TextInput
              ref={c => {
                console.log('TextInput ref ', c);
              }}
            />
            <NumberInput
              ref={c => {
                console.log('NumberInput ref ', c);
              }}
            />
            <Textarea
              ref={c => {
                console.log('Textarea ref ', c);
              }}
            />
            <Select
              ref={c => {
                console.log('Select (native) ref ', c);
              }}
              items={[]}
            />
            <Select
              ref={c => {
                console.log('Select (inline) ref ', c);
              }}
              items={[]}
              type="inlinePicker"
            />
            <Select
              ref={c => {
                console.log('Select (dropDown) ref ', c);
              }}
              items={[]}
              type="dropDownPicker"
            />
            <DateInput
              ref={c => {
                console.log('DateInput ref ', c);
              }}
            />
            <DateInput
              ref={c => {
                console.log('DateInput (native) ref ', c);
              }}
              type="native"
            />
            <DateInput
              ref={c => {
                console.log('DateInput (onlyField) ref ', c);
              }}
              type="onlyField"
            />
            <span
              ref={c => {
                console.log('DateInput wrapper ref ', c);
              }}
            >
              <DateInput />
            </span>
            <ColorInput
              ref={c => {
                console.log('ColorInput ref ', c);
              }}
            />
            <FileInput
              ref={c => {
                console.log('FileInput ref ', c);
              }}
            />
          </div>
        );
        break;
      default:
        out = (
          <div>
            <Modals />
            <Floats />
            <Notifications />
            <Hints />
            <div className="title">
              <a target="_blank" href="http://github.com/guigrpa/giu">
                Giu
              </a>{' '}
              demo page
              <Configs
                lang={lang}
                onChangeLang={(ev, newLang) => {
                  setLang(newLang);
                  moment.locale(newLang);
                  this.forceUpdate();
                }}
                accentColor={this.state.accentColor}
                onChangeColor={(ev, accentColor) => {
                  const accentColorFg = isDark(accentColor) ? 'white' : 'black';
                  this.setState({ accentColor, accentColorFg });
                }}
              />
            </div>
            <div className="main">
              <div className="left">
                {EVERYTHING && <NotificationExample />}
                {EVERYTHING && <MessageExample />}
                {EVERYTHING && <IconExample />}
                {EVERYTHING && <ButtonExample />}
                {EVERYTHING && <StyleUtilsExample />}
                {EVERYTHING && <DropDownExample lang={lang} />}
                {EVERYTHING && <ModalExample />}
                {EVERYTHING && <HintExample />}
                {EVERYTHING && <ScrollingExample />}
                {EVERYTHING && <ProgressExample />}
                {EVERYTHING && <DataTableExample lang={lang} />}
              </div>
              <div className="right">
                {EVERYTHING && <FormExample lang={lang} />}
                {EVERYTHING && <FormExample2 />}
                {EVERYTHING && <AnimatedCounterExample />}
                {EVERYTHING && <HeightMeasurerExample />}
              </div>
            </div>
            <div className="author">
              by{' '}
              <a target="_blank" href="http://github.com/guigrpa">
                Guillermo Grau Panea
              </a>{' '}
              2016
            </div>
            <style jsx global>{`
              body {
                --color-accent-bg: ${this.state.accentColor};
                --color-accent-fg: ${this.state.accentColorFg};
              }
            `}</style>
          </div>
        );
        break;
    }
    return <Giu>{out}</Giu>;
  }
}

const Configs = ({ lang, onChangeLang, accentColor, onChangeColor }) => (
  <span
    style={{
      fontWeight: 'normal',
      fontSize: 12,
      width: 80,
      whiteSpace: 'nowrap',
    }}
  >
    &nbsp;&nbsp; Show some examples in:{' '}
    <Select
      items={[
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
      ]}
      value={lang}
      onChange={onChangeLang}
      required
    />
    &nbsp;&nbsp; Theme color:{' '}
    <ColorInput id="theme-color" value={accentColor} onChange={onChangeColor} />
  </span>
);

class NativeDateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: new Date() };
  }

  render() {
    return (
      <div>
        <DateInput
          type="native"
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput
          type="native"
          utc={false}
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput
          type="native"
          time
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput
          type="native"
          date={false}
          time
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <DateInput
          type="native"
          date={false}
          time
          utc={false}
          value={this.state.value}
          onChange={(ev, value) => this.setState({ value })}
        />
        <span>{this.state.value ? this.state.value.toString() : 'none'}</span>
      </div>
    );
  }
}

const NotificationExample = () => (
  <div className="example">
    <div className="example-label">Notification (embedded)</div>
    <Notification
      icon="cog"
      iconSpin
      title="Title"
      msg="Notification message"
      noStylePosition
    />
  </div>
);

const MessageExample = () => (
  <div className="example">
    <div className="example-label">LargeMessage</div>
    <LargeMessage>No items found.</LargeMessage>
  </div>
);

const IconExample = () => (
  <div className="example">
    <div className="example-label">Icon</div>
    <Icon icon="heart" id="a" /> <Spinner /> <Icon icon="spinner" spin />{' '}
    <Icon icon="arrow-left" id="a" />{' '}
    <Icon icon="arrow-right" onClick={() => notify()} />{' '}
    <Icon icon="arrow-down" disabled />
  </div>
);

const ButtonExample = () => (
  <div className="example">
    <div className="example-label">Button</div>
    <Button onClick={() => notify('Normal button pressed')}>
      Notify me!
    </Button>{' '}
    <Button disabled onClick={() => notify('Disabled button pressed!!!')}>
      Disabled button
    </Button>{' '}
    <Button onClick={() => notify('Plain button pressed')} plain>
      Notify me!
    </Button>
  </div>
);

const StyleUtilsExample = () => (
  <div className="example">
    <div className="example-label">Style utilities</div>
    <div className="giu-box-shadow" style={{ padding: 3 }}>
      A box with a shadow
    </div>
  </div>
);

const DropDownExample = ({ lang }) => (
  <div className="example">
    <div className="example-label">
      DropDownMenu (focusable, keyboard-controlled, embedded ListPicker)
    </div>
    <div style={{ display: 'flex' }}>
      <DropDownMenu
        items={NORMAL_OPTIONS}
        lang={lang}
        onClickItem={onChangeJson}
      >
        <Icon icon="bars" /> Menu
      </DropDownMenu>
      <DropDownMenu items={TALL_OPTIONS} onClickItem={onChangeJson}>
        <Icon icon="bullseye" /> Long menu
      </DropDownMenu>
      <div className="giu-flex-space" />
      <DropDownMenu
        items={WIDE_OPTIONS}
        onClickItem={onChangeJson}
        floatPosition="above"
        floatAlign="right"
      >
        <Icon icon="cube" /> Menu above and to the left
      </DropDownMenu>
    </div>
  </div>
);

const ScrollingExample = () => (
  <div className="example">
    <div className="example-label">
      Scrollable (with translateZ(0)) with floats
    </div>
    <div className="inner" onScroll={floatReposition}>
      <DateInput placeholder="date" date time />
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      <DateInput placeholder="date" />
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      <DateInput placeholder="date" />
    </div>
    <style jsx>
      {`
        .inner {
          max-height: 120px;
          overflow: auto;
          transform: translateZ(0);
        }
      `}
    </style>
  </div>
);

class ProgressExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0.3 };
  }
  componentDidMount() {
    setInterval(() => {
      this.setState({ value: Math.random() });
    }, 2000);
  }
  render() {
    return (
      <div className="example">
        <div className="example-label">Progress</div>
        <Progress value={this.state.value} />
        <Progress />
      </div>
    );
  }
}

class AnimatedCounterExample extends React.Component {
  state = { value: 125 };

  render() {
    return (
      <div className="example">
        <div className="example-label">Animated counter</div>
        <NumberInput ref="number" value={this.state.value} />{' '}
        <Button onClick={this.onSet}>Set</Button>{' '}
        <AnimatedCounter value={this.state.value} /> (or with custom formatter:{' '}
        <AnimatedCounter
          value={this.state.value}
          formatter={value => (value != null ? `${value.toFixed(2)} €` : '– €')}
        />
        )
      </div>
    );
  }

  onSet = async () => {
    const ref = this.refs.number;
    if (!ref) return;
    const value = await ref.validateAndGetValue();
    this.setState({ value });
  };
}

const HeightMeasurerExample = () => (
  <div className="example">
    <div className="example-label">HeightMeasurer</div>
    <div style={flexContainer('column', { height: 150 })}>
      <div style={{ height: 30 }}>This takes 30 px</div>
      <div style={flexItem(1)}>
        <HeightMeasurer>{height => <div>{height} px high</div>}</HeightMeasurer>
      </div>
    </div>
  </div>
);

// -----------------------------------------------
// Public
// -----------------------------------------------
class AppWrapper extends React.Component {
  static async getInitialProps({ req }) {
    const out = {};
    if (req) out.baseUrl = process.env.BASE_URL || '';
    return out;
  }

  render() {
    const { baseUrl } = this.props;
    return (
      <div>
        <Head>
          <title>Giu demos</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/deps/font-awesome/css/font-awesome.min.css`}
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/deps/typeface-gloria-hallelujah/index.css`}
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/stylesheets/common.css`}
          />
          <link
            rel="icon"
            type="image/ico"
            href={`${baseUrl}/static/favicon.ico`}
          />
        </Head>
        <App />
      </div>
    );
  }
}

export default AppWrapper;
