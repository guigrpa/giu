import React                from 'react';
import ReactDOM             from 'react-dom';
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


// -----------------------------------------------
// Examples
// -----------------------------------------------
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialDate: new Date(),
    };
  }

  render() {
    return (
      <section>
        <Floats />
        <Modals />
        <Notifications />
        <Hints />

        <DateTimeInputs />
      </section>
    );
  }
}

class DateTimeInputs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialDate: new Date(),
    };
  }

  render() {
    return (
      <section>
        <h2>Date and time inputs</h2>

        <p>You can have date (default), time and date-time pickers:</p>

        <div style={flexContainer('row', { flexWrap: 'wrap', justifyContent: 'center' })}>
          <DateInput type="inlinePicker"
            value={this.state.initialDate}
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker" date={false} time utc={false} seconds
            value={this.state.initialDate}
            styleOuter={{ marginRight: '1em' }}
          />
          <DateInput type="inlinePicker"
            value={this.state.initialDate}
            time seconds
          />
        </div>

        <p>In date pickers, press the arrow keys to change the date/time, and the
        page-up/page-down keys to show the previous/next month. In time
        pickers, press the arrow keys to move the minute hand, and the page-up/page-down
        keys to move the hour hand.</p>

        <p> You can also choose between an analogue time picker
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

        -- Disabled (with current time)
        -- Accent color
        -- Explain UTC variants

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

      </section>
    );
  }
}

// -----------------------------------------------
// Render main
// -----------------------------------------------
ReactDOM.render(<App />, document.getElementById('app'));
