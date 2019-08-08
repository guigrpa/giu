/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function, react/jsx-no-target-blank */
import React from 'react';
import Head from 'next/head';
import moment from 'moment';

import {
  Giu,
  DateInput,
  Select,
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
  TextInput,
  ColorInput,
  COLORS,
  isDark,
} from 'giu';
import {
  NORMAL_OPTIONS,
  TALL_OPTIONS,
  WIDE_OPTIONS,
  LONG_TEXT,
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

// Protect with try .. catch, since MDL assumes that it lives in the
// browser and crashes during SSR
try {
  require('material-design-lite'); // eslint-disable-line global-require
} catch (err) {
  /* ignore */
}

const { floor, random } = Math;
const randomInt = (min, max) => min + floor(random() * (max - min + 1));
const sample = arr => arr[randomInt(0, arr.length - 1)];

let cntNotif = 1;
const notify = msg =>
  createNotif({
    msg: msg || `Notification #${cntNotif++}`, // eslint-disable-line no-plusplus
    type: sample(['info', 'success', 'warn', 'error']),
    icon: sample(['cached', 'favorite', 'lock']),
  });

// -----------------------------------------------
// Examples
// -----------------------------------------------
const TEST = 0;
const EVERYTHING = true;
class App extends React.Component {
  state = {
    accentColor: COLORS.accent,
    accentColorFg: 'white',
  };

  // -----------------------------------------------
  render() {
    let out;
    const lang = getLang();
    switch (TEST) {
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
                {EVERYTHING && <DeferredExample />}
              </div>
              <div className="right">
                {EVERYTHING && <FormExample lang={lang} />}
                {EVERYTHING && <FormExample2 />}
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
    return <Giu themeId="mdl">{out}</Giu>;
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
    <ColorInput value={accentColor} onChange={onChangeColor} />
  </span>
);

const NotificationExample = () => (
  <div className="example">
    <div className="example-label">Notification (embedded)</div>
    <Notification
      icon="favorite"
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
    <Icon icon="cached" id="a" size="lg" /> <Spinner size="lg" />{' '}
    <Icon icon="favorite" id="a" size="lg" />{' '}
    <Icon icon="lock" size="lg" onClick={() => notify()} />
  </div>
);

const ButtonExample = () => (
  <div className="example">
    <div className="example-label">Button</div>
    <Button onClick={() => notify('Normal button pressed')} colored>
      Colored
    </Button>{' '}
    <Button onClick={() => notify('Normal button pressed')} primary>
      Primary
    </Button>{' '}
    <Button onClick={() => notify('Normal button pressed')} accent>
      Accent
    </Button>{' '}
    <Button onClick={() => notify('Plain button pressed')} disabled>
      Disabled
    </Button>
    <br />
    <Button onClick={() => notify('Plain button pressed')} plain>
      Flat
    </Button>{' '}
    <Button onClick={() => notify('Plain button pressed')} plain disabled>
      Flat (disabled)
    </Button>{' '}
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
    <DropDownMenu items={NORMAL_OPTIONS} lang={lang} onClickItem={onChangeJson}>
      <Icon icon="build" /> Menu
    </DropDownMenu>
    <DropDownMenu
      items={TALL_OPTIONS}
      onClickItem={onChangeJson}
      accentColor="darkgreen"
    >
      <Icon icon="cached" /> Long menu
    </DropDownMenu>
    <DropDownMenu
      items={WIDE_OPTIONS}
      onClickItem={onChangeJson}
      floatAlign="right"
      accentColor="darkblue"
    >
      <Icon icon="lock" /> Menu to the left
    </DropDownMenu>
  </div>
);

const ScrollingExample = () => (
  <div className="example">
    <div className="example-label">
      Scrollable (with translateZ(0)) with floats
    </div>
    <div className="inner" onScroll={floatReposition}>
      <DateInput placeholder="date" date time required />
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      <DateInput placeholder="date" required />
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      {LONG_TEXT}
      <br />
      <DateInput placeholder="date" required />
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

class DeferredExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { shown: false };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ shown: true });
    }, 2000);
  }
  render() {
    if (!this.state.shown) return null;
    return (
      <div className="example">
        <div className="example-label">Deferred example</div>
        <div>
          This demonstrates that MDL styles are applied correctly even if the
          component is instantiated later.
        </div>
        <TextInput placeholder="Write something" />
        <Button>Example button</Button>
      </div>
    );
  }
}

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
            href={`${baseUrl}/static/deps/typeface-roboto/index.css`}
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/deps/material-design-lite/material.min.css`}
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
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
