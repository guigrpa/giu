/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function, react/jsx-no-target-blank */
import React                from 'react';
import ReactDOM             from 'react-dom';
import ReactDOMServer       from 'react-dom/server';
import { merge }            from 'timm';
import moment               from 'moment';

import {
  DateInput, TextInput, RangeInput, Select,
  DropDownMenu,
  Button, Progress, Icon, Spinner, LargeMessage,
  Floats, floatReposition,
  Modals,
  Notifications, Notification, notify as createNotif,
  Hints,
  hoverable,
  flexContainer, flexItem, boxWithShadow,
}                           from '../src';
import DataTableExample from './demo1-dataTables';
import ModalExample from './demo1-modals';
import HintExample from './demo1-hints';
import FormExample from './demo1-forms';
import {
  ExampleLabel, exampleStyle,
  NORMAL_OPTIONS, TALL_OPTIONS, WIDE_OPTIONS,
  LONG_TEXT,
  onChange, onChangeJson,
  getLang, setLang,
} from './demo1-common';

require('babel-polyfill');

const { floor, random } = Math;
const randomInt = (min, max) => min + floor(random() * (max - min + 1));
const sample = (arr) => arr[randomInt(0, arr.length - 1)];

let cntNotif = 1;
const notify = (msg) => createNotif({
  msg: msg || `Notification #${cntNotif++}`, // eslint-disable-line no-plusplus
  type: sample(['info', 'success', 'warn', 'error']),
  icon: sample(['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down']),
});

// -----------------------------------------------
// Examples
// -----------------------------------------------
const TEST = 0;
const EVERYTHING = true;
class App extends React.Component {
  render() {
    let out;
    const lang = getLang();
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
          <div style={{ padding: 5 }}>
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
      default:
        out = (
          <div style={style.outer}>
            <Modals />
            <Floats />
            <Notifications />
            <Hints />
            <div style={{ padding: 10, fontSize: '1.8em', fontWeight: 'bold' }}>
              <a target="_blank" href="http://github.com/guigrpa/giu">Giu</a> demo page
              <LangSelector
                lang={lang}
                onChange={(ev, newLang) => {
                  setLang(newLang);
                  moment.locale(newLang);
                  this.forceUpdate();
                }}
              />
            </div>
            <div style={flexContainer('row')}>
              <div style={flexItem('1 0 500px')}>
                {EVERYTHING && <NotificationExample />}
                {EVERYTHING && <MessageExample />}
                {EVERYTHING && <IconExample />}
                {EVERYTHING && <ButtonExample />}
                {EVERYTHING && <HoverableExample />}
                {EVERYTHING && <StyleUtilsExample />}
                {EVERYTHING && <DropDownExample lang={lang} />}
                {EVERYTHING && <ModalExample />}
                {EVERYTHING && <HintExample />}
                {EVERYTHING && <ScrollingExample />}
                {EVERYTHING && <ProgressExample />}
                {EVERYTHING && <DataTableExample lang={lang} />}
              </div>
              <div style={flexItem('1 0 500px')}>
                {EVERYTHING && <FormExample lang={lang} />}
              </div>
            </div>
            <div style={{ textAlign: 'right', padding: 10, fontSize: '1.2em' }}>
              by <a target="_blank" href="http://github.com/guigrpa">Guillermo Grau Panea</a> 2016
            </div>
          </div>
        );
        break;
    }
    return out;
  }
}

const LangSelector = ({ lang, onChange: onValueChange }) =>
  <span style={{ fontWeight: 'normal', fontSize: 12, width: 80, whiteSpace: 'nowrap' }}>
    &nbsp;&nbsp;
    Show some examples in:
    {' '}
    <Select
      items={[
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
      ]}
      value={lang}
      onChange={onValueChange}
      required
    />
  </span>;

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
    <div style={boxWithShadow({ padding: 3 })}>
      A box with a shadow
    </div>
  </div>;

const FlexSpacer = ({ children }) => <div style={flexItem('1')}>{children}</div>;

const DropDownExample = ({ lang }) =>
  <div style={style.example}>
    <ExampleLabel>DropDownMenu (focusable, keyboard-controlled, embedded ListPicker)</ExampleLabel>
    <DropDownMenu
      items={NORMAL_OPTIONS}
      lang={lang}
      onClickItem={onChangeJson}
      style={{ padding: '3px 8px' }}
    >
      <Icon icon="bars" /> Menu
    </DropDownMenu>
    <DropDownMenu
      items={TALL_OPTIONS}
      onClickItem={onChangeJson}
      accentColor="darkgreen"
      style={{ padding: '3px 8px' }}
    >
      <Icon icon="bullseye" /> Long menu
    </DropDownMenu>
    <DropDownMenu
      items={WIDE_OPTIONS}
      onClickItem={onChangeJson}
      floatAlign="right"
      accentColor="darkblue"
      style={{ padding: '3px 8px' }}
    >
      <Icon icon="cube" /> Menu to the left
    </DropDownMenu>
  </div>;

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


// -----------------------------------------------
// Styles
// -----------------------------------------------
const style = {
  outer: {
    fontSize: 12,
  },
  example: exampleStyle,
  scrolling: {
    maxHeight: 120,
    overflow: 'auto',
    transform: 'translateZ(0)',
  },
  hoverable: (hovering) => ({
    backgroundColor: hovering ? '#ccc' : undefined,
  }),
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
    /* eslint-disable global-require */
    const ssrCss = require('../src/all.css');
    /* eslint-enable global-require */
    let rendered = locals.template;
    rendered = rendered.replace('<!-- ssrHtml -->', ssrHtml);
    rendered = rendered.replace('<!-- ssrCss -->', ssrCss);
    callback(null, rendered);
  };
}
