import React                from 'react';
import ReactDOM             from 'react-dom';
import ReactDOMServer       from 'react-dom/server';
import marked               from 'marked';
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
  isRequired, isEmail, isGte, isOneOf, isDate,
}                           from '../src';

let allMarkdown = '';

const Markdown = ({ md }) => {
  allMarkdown += `${md}\n`;
  return <div dangerouslySetInnerHTML={marked(md)} />;
};

// -----------------------------------------------
// Main
// -----------------------------------------------
const App = () => (
  <div>
    <Floats />
    <Modals />
    <Notifications />
    <Hints />
    <section className="page-header">
      <h1 className="project-name">Giu Demo</h1>
    </section>

    <section className="main-content">
      <Contents />

      <footer className="site-footer">
        <span className="site-footer-owner">
          <a href="https://github.com/guigrpa/giu">Giu</a>
          {' '}is maintained by{' '}
          <a href="https://github.com/guigrpa">guigrpa</a>.
        </span>
        <span className="site-footer-credits">
          This page uses the{' '}
          <a href="https://github.com/jasonlong/cayman-theme">Cayman theme</a>
          {' '}by{' '}
          <a href="https://twitter.com/jasonlong">Jason Long</a>.
        </span>
      </footer>

    </section>

  </div>
);

const Contents = () => (
  <div>
    <Inputs />
  </div>
);

// -----------------------------------------------
// Sections
// -----------------------------------------------
class Inputs extends React.Component {
  render() {
    return (
      <div>
        <h2>Inputs</h2>
        <p>
          Giu provides a wide variety of inputs and several useful abstractions over native HTML native elements:
          state delegation (optional), comprehensive validation, JS types and nullability.
          More details on usage can be found in the <a href="http://guigrpa.github.io/giu/">docs</a>.
        </p>
        <InputTypes />
        <InputValidation />
        <DateInputs />
        <Selects />
        <ColorInputs />
      </div>      
    );
  }
}

class InputTypes extends React.Component {
  render() {
    const radioGroupOptions = [
      { label: 'Apples', value: 'apples' },
      { label: 'Cherries', value: 'cherries' },
      { label: 'Peaches', value: 'peaches' },
      { label: 'Blueberries', value: 'blueberries' },
    ];
    const selectOptions = [
      { label: 'Apples', value: 'apples' },
      { label: 'Cherries', value: 'cherries' },
      LIST_SEPARATOR,
      { label: 'Peaches', value: 'peaches' },
      { label: 'Blueberries', value: 'blueberries' },
    ];
    return (
      <div>
        <h3>Input types</h3>
        <p>
          Giu inputs cover most (if not all) of their native HTML counterparts:
        </p>
        <ul>
          <li>TextInput:{' '}<TextInput /></li>
          <li>PasswordInput:{' '}<PasswordInput /></li>
          <li>NumberInput:{' '}<NumberInput step="0.1" /></li>
          <li>DateInput:{' '}<DateInput time seconds style={{ width: 220 }} /> (<a href="#date-inputs">more details</a>)</li>
          <li>Checkbox:{' '}<Checkbox value={true} label="Try me" /></li>
          <li>
            Select:{' '}
            <Select required items={selectOptions} value="blueberries" /> (native){' '}
            <Select required type="dropDownPicker" items={selectOptions} value="blueberries" /> (custom)
            {' '}(<a href="#selects">more details</a>)
          </li>
          <li>
            RadioGroup:
            <div><RadioGroup items={radioGroupOptions} value="cherries" /></div>
          </li>
          <li>ColorInput:{' '}<ColorInput value="aadc5400" /> (<a href="#color-inputs">more details</a>)</li>
          <li>FileInput:{' '}<FileInput /></li>
          <li>RangeInput:{' '}<RangeInput value="55" min={0} max={100} step={5} style={{position: 'relative', top: 4}}/></li>
          <li>Textarea (auto-resizing):<Textarea placeholder="Write something really long..." /></li>
        </ul>
      </div>
    );
  }
}

class InputValidation extends React.Component {
  render() {
    return (
      <div>
        <h3>Input validation</h3>
        <p>
          Here are some examples of predefined validators 
          (just focus on a field, enter a valid/invalid value and focus elsewhere to trigger validation):
        </p>
        <div style={{ textAlign: 'center' }}>
          <TextInput placeholder="no validation" /><br />
          <TextInput placeholder="required" required /><br />
          <TextInput placeholder="email" required validators={[isEmail()]} /><br />
          <TextInput placeholder="apples or peaches" required validators={[isOneOf(['apples', 'peaches'])]} /><br />
          <NumberInput placeholder=">= 10" required validators={[isGte(10)]} />
        </div>
        <p>You can customize the message of a predefined validator, e.g. for i18n:</p>
        <div style={{ textAlign: 'center' }}>
          <TextInput placeholder="email" validators={[
            isRequired('no se puede dejar en blanco'), isEmail('ha de ser una dirección electrónica válida')
          ]} />
        </div>
        <p>And you can provide your own validators, synchronous or asynchronous (Promise):</p>
        <div style={{ textAlign: 'center' }}>
          <TextInput placeholder="custom sync validator"
            required validators={[
              o => o.toLowerCase() === 'unicorn' ? undefined : 'must be \'unicorn\''
            ]} 
            style={{ width: 250 }}
          /><br />
          <TextInput placeholder="custom promise validator"
            required validators={[
              o => new Promise((resolve, reject) =>
                setTimeout(() => 
                  o.toLowerCase() === 'unicorn' ? resolve(undefined) : resolve('checked the database; must be \'unicorn\'')
                , 1000)
              )
            ]}
            style={{ width: 250 }}
          />
        </div>
      </div>
    );
  }
}

class DateInputs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialDate: new Date(),
      curDate: new Date(),
    };
  }

   componentDidMount() {
    setInterval(() => { this.setState({ curDate: new Date() }); }, 1000);
  }

  render() {
    return (
      <div>
        <h3><a name="date-inputs" />DateInputs</h3>

        <p>You can have date (default), time and date-time pickers:</p>

        <div style={flexContainer('row', { flexWrap: 'wrap', justifyContent: 'center' })}>
          <DateInput type="inlinePicker"
            value={this.state.initialDate}
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker" date={false} time seconds
            value={this.state.initialDate}
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker" time seconds
            value={this.state.initialDate}
          />
        </div>

        <p><b>UTC vs. local time:</b> By default, date-time pickers use local time, whereas time-only pickers use UTC and date-only
        pickers provide dates with time set to 00:00UTC. You can change this specifying the `utc` prop;
        for example, a local-time time picker:</p>

        <div style={flexContainer('row', { flexWrap: 'wrap', justifyContent: 'center' })}>
          <DateInput type="inlinePicker" date={false} time seconds utc={false}
            value={this.state.initialDate}
          />
        </div>

        <p><b>Keyboard shortcuts:</b> In date pickers, press the arrow keys to change the date/time, and the
        page-up/page-down keys to show the previous/next month. In time
        pickers, press the arrow keys to move the minute hand, and the page-up/page-down
        keys to move the hour hand.</p>

        <p><b>Variants:</b> You can also choose between an analogue time picker
        (with or without second hand) and a digital one:</p>

        <div style={flexContainer('row', { flexWrap: 'wrap', justifyContent: 'center' })}>
          <DateInput type="inlinePicker" date={false} time utc={false} seconds
            value={this.state.initialDate}
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker" date={false} time utc={false}
            value={this.state.initialDate}
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker" date={false} time analogTime={false} utc={false} seconds
            value={this.state.initialDate}
          />
        </div>

        <p>Date and time pickers can be of three types:</p>

        <ul>
          <li>
            A simple field (<code>type="onlyField"</code>):
            {' '}
            <DateInput type="onlyField" placeholder="MM/DD/YYYY" />
          </li>
          <li>
            A field with a dropdown (<code>type="dropDownPicker"</code>), the default one:
            {' '}
            <DateInput placeholder="MM/DD/YYYY" />
            {' '}(press ESC to show/hide the picker)
          </li>
          <li>
            An inline date or time picker (<code>type="inlinePicker"</code>):
          </li>
          <div style={{ marginTop: '1em', textAlign: 'center' }}>
            <DateInput type="inlinePicker" styleOuter={{ display: 'inline-block' }} />
          </div>
        </ul>

        <p>Customize your picker's accent color:</p>

        <div style={flexContainer('row', { flexWrap: 'wrap', justifyContent: 'center' })}>
          <DateInput type="inlinePicker" time seconds
            value={this.state.initialDate}
            accentColor="olive"
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker" time seconds analogTime={false}
            value={this.state.initialDate}
            accentColor="lightgreen"
          />
        </div>

        <p>Finally, this is what disabled DateInputs look like:</p>

        <div style={flexContainer('row', { flexWrap: 'wrap', justifyContent: 'center' })}>
          <DateInput type="inlinePicker" time seconds
            value={this.state.curDate}
            styleOuter={{ marginRight: '1em' }} disabled
          />
          <DateInput type="inlinePicker" time seconds
            value={this.state.curDate} disabled
          />
        </div>
      </div>
    );
  }
}


class Selects extends React.Component {
  render() {
    const selectOptions = modifier => [
      { label: 'Apples', value: 'apples', keys: `${modifier}+a` },
      { label: 'Cherries', value: 'cherries', keys: [`${modifier}+c`, `${modifier}+h`] },
      LIST_SEPARATOR,
      { label: 'Peaches', value: 'peaches', keys: `${modifier}+p` },
      { label: 'Blueberries', value: 'blueberries', keys: `${modifier}+b` },
    ];
    return (
      <div>
        <h3><a name="selects" />Selects</h3>
        <p>
          You can choose between a native Select (default) and a CustomSelect
          (<code>type="dropDownPicker"</code> or <code>type="inlinePicker"</code>).
          CustomSelects are faster (they only render options when open), support
          separators and keyboard shortcuts, and are much more similar across
          browsers and platforms than the native Selects.
        </p>
        <ul>
          <li>Native select: <Select items={selectOptions} value="blueberries" required /></li>
          <li>Custom select, drop-down: <Select type="dropDownPicker" items={selectOptions('shift+alt')} value="blueberries" required /></li>
          <li>
            Custom select, inline: 
            <Select type="inlinePicker" 
              items={selectOptions('alt')} required
              value="blueberries"
              style={{width: 320}}
            />
          </li>
        </ul>
      </div>
    );
  }
}

class ColorInputs extends React.Component {
  render() {
    return (
      <div>
        <h3><a name="color-inputs" />ColorInputs</h3>
      </div>
    );
  }
}

class DropDownMenus extends React.Component {
  render() {
    return (
      <div>
        <h3>DropDownMenus</h3>
      </div>
    );
  }
}

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
