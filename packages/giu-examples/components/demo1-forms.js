// @flow

/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import {
  TextInput,
  PasswordInput,
  NumberInput,
  RangeInput,
  FileInput,
  RadioGroup,
  ColorInput,
  DateInput,
  Checkbox,
  Textarea,
  Select,
  Button,
  flexContainer,
  flexItem,
  isRequired,
  isEmail,
  isDate,
  cancelEvent,
} from 'giu';
import {
  ExampleLabel,
  exampleStyle,
  NORMAL_OPTIONS,
  TALL_OPTIONS,
  WIDE_OPTIONS,
  onChange,
  onChangeJson,
} from './demo1-common';

class FormExample extends React.Component<
  { lang: string },
  { fixedDate: Date }
> {
  refInput = React.createRef();

  state = { fixedDate: new Date() };

  render() {
    const { lang } = this.props;
    return (
      <div style={exampleStyle}>
        <div>
          <ExampleLabel>Inputs</ExampleLabel>
          <NumberInput
            step="0.1"
            value={null}
            onChange={onChange}
            placeholder="number"
            style={{ width: 80 }}
          />
          <NumberInput disabled value={6.5} style={{ width: 80 }} />
          &nbsp;&nbsp;
          <TextInput
            value="a"
            onChange={onChange}
            placeholder="text"
            errors={['Example error above']}
            errorPosition="above"
            errorAlign="right"
            style={{ width: 80 }}
          />
          <TextInput disabled value="Disabled" style={{ width: 80 }} />
          &nbsp;&nbsp;
          <PasswordInput
            required
            onChange={onChange}
            placeholder="password"
            style={{ width: 80 }}
          />
          &nbsp;&nbsp;
          <Checkbox
            value={true}
            onChange={onChange}
            id="checkbox"
            label="checkbox"
            errors={['Example error below']}
          />&nbsp;
          <Checkbox disabled value={true} label="checkbox" />
        </div>
        <div>
          <FileInput />
          <FileInput disabled />
        </div>
        <br />
        <table>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                <ExampleLabel>
                  RadioGroup (flexible labels, clipboard)
                </ExampleLabel>
                <div style={flexContainer('row')}>
                  <RadioGroup
                    id="group-a"
                    items={NORMAL_OPTIONS}
                    lang={lang}
                    required
                    onChange={onChange}
                  />
                  <RadioGroup
                    id="group-b"
                    items={NORMAL_OPTIONS}
                    lang={lang}
                    value="a"
                    disabled
                  />
                  <RadioGroup
                    id="group-c"
                    items={[
                      { value: 1, label: 'A simple text label' },
                      {
                        value: 2,
                        label: (
                          <span>
                            <i>Some</i> <b>formatting</b>
                          </span>
                        ),
                      },
                      {
                        value: 3,
                        label: <span>A multiline label</span>,
                        labelExtra: <div>because yes, we can ;)</div>,
                      },
                      { value: 4, label: 'Another normal label' },
                      {
                        value: 5,
                        label: (
                          <span>
                            A label with a{' '}
                            <Button onClick={() => console.log('hi!')}>
                              button
                            </Button>
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              </td>
              <td style={{ verticalAlign: 'top', paddingLeft: 10 }}>
                <ExampleLabel>RangeInput (horizontal/vertical)</ExampleLabel>
                <div style={flexContainer('row')}>
                  <div style={{ marginLeft: 5 }}>
                    <RangeInput
                      value={25}
                      onChange={onChange}
                      min={0}
                      max={100}
                      step={5}
                      style={{ display: 'block', width: 100 }}
                    />
                    <RangeInput
                      disabled
                      value={55}
                      onChange={onChange}
                      min={0}
                      max={100}
                      step={5}
                      style={{ display: 'block', width: 100 }}
                    />
                  </div>
                  <RangeInput
                    value={55}
                    onChange={onChange}
                    min={0}
                    max={100}
                    step={5}
                    vertical
                    style={{ marginLeft: 20, height: 100, width: 25 }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <div>
          <ExampleLabel>Input validation</ExampleLabel>
          <TextInput placeholder="no validation" />
          <TextInput placeholder="required (shortcut)" required />
          <TextInput
            placeholder="isRequired, custom"
            validators={[isRequired('please write something!')]}
          />
          <TextInput placeholder="isEmail" required validators={[isEmail()]} />
          <TextInput
            placeholder="isEmail (custom msg)"
            required
            validators={[isEmail('please write your e-mail!')]}
          />
          <TextInput
            placeholder="isEmail (custom msg 2)"
            required
            validators={[isEmail((msg, val) => `'${val}' is not an email!`)]}
          />
          <TextInput
            placeholder="custom sync validator"
            required
            validators={[
              (o: string): ?string =>
                o.toLowerCase() === 'unicorn' ? undefined : "must be 'unicorn'",
            ]}
          />
          <TextInput
            placeholder="custom promise validator"
            required
            validators={[
              (o: string): Promise<?string> =>
                new Promise(resolve =>
                  setTimeout(
                    () =>
                      o.toLowerCase() === 'unicorn'
                        ? resolve(undefined)
                        : resolve(
                            "checked the database; you must be a 'unicorn'"
                          ),
                    1000
                  )
                ),
            ]}
          />
          <DateInput type="onlyField" lang={lang} placeholder="MM/DD/YYYY" />
          <DateInput
            type="onlyField"
            lang={lang}
            date={false}
            time
            seconds
            placeholder="HH:MM:ss"
          />
          <DateInput
            type="onlyField"
            lang={lang}
            date={false}
            time
            seconds
            placeholder="HH:MM:ss"
            required
            validators={[
              isDate(
                (msg, val, { fmt }) => `ha de ser una hora correcta: ${fmt}`
              ),
            ]}
          />
        </div>
        <br />
        <div>
          <ExampleLabel>Textarea (with auto-resize)</ExampleLabel>
          <Textarea
            value="En un lugar de la Mancha..."
            styleOuter={{ display: 'block' }}
            style={{ display: 'block', minHeight: '1.5em' }}
            required
          />
          <Textarea
            disabled
            value="En un lugar de la Mancha..."
            styleOuter={{ display: 'block' }}
            style={{ display: 'block', minHeight: '1.5em' }}
          />
        </div>
        <br />
        <div>
          <ExampleLabel>
            Select: native, or with inline/dropdown ListPicker
            (keyboard-controlled, shortcuts, clipboard, one/two-stage,
            autoscroll)
          </ExampleLabel>
          <div>
            <Select value="a" items={NORMAL_OPTIONS} required lang={lang} />
            <Select
              value={null}
              onChange={onChangeJson}
              items={NORMAL_OPTIONS}
              lang={lang}
            />
            <Select disabled value="a" items={NORMAL_OPTIONS} lang={lang} />
            &nbsp;&nbsp;
            <Select
              type="dropDownPicker"
              required
              value="a"
              onChange={onChangeJson}
              items={WIDE_OPTIONS}
              lang={lang}
              styleTitle={{ maxWidth: 100 }}
            />
            <Select
              type="dropDownPicker"
              required
              value="a"
              onChange={onChangeJson}
              items={NORMAL_OPTIONS}
              lang={lang}
            />
            <Select
              type="dropDownPicker"
              value={null}
              onChange={onChangeJson}
              items={NORMAL_OPTIONS}
              lang={lang}
            />
            <Select
              type="dropDownPicker"
              value={28}
              onChange={onChangeJson}
              items={TALL_OPTIONS}
            />
            <Select
              disabled
              type="dropDownPicker"
              value={28}
              items={TALL_OPTIONS}
            />
          </div>
          <div style={flexContainer('row')}>
            <Select
              type="inlinePicker"
              required
              items={NORMAL_OPTIONS}
              lang={lang}
              onChange={onChangeJson}
              styleOuter={flexItem(1, { marginRight: 4 })}
              style={{ height: 150 }}
            />
            <Select
              type="inlinePicker"
              items={TALL_OPTIONS}
              value={33}
              onChange={onChangeJson}
              twoStageStyle
              styleOuter={flexItem(1, { marginRight: 4 })}
              style={{ height: 150 }}
            />
            <Select
              type="inlinePicker"
              items={[]}
              onChange={onChangeJson}
              styleOuter={flexItem(1, { marginRight: 4 })}
              style={{ height: 150 }}
            />
            <Select
              type="inlinePicker"
              disabled
              items={TALL_OPTIONS}
              value={33}
              onChange={onChangeJson}
              styleOuter={flexItem(1)}
              style={{ height: 150 }}
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
            <DateInput onChange={onChange} lang={lang} style={{ width: 130 }} />&nbsp;&nbsp;
            <DateInput
              date
              time
              onChange={onChange}
              lang={lang}
              style={{ width: 180 }}
            />&nbsp;&nbsp;
            <DateInput
              date={false}
              time
              onChange={onChange}
              lang={lang}
              style={{ width: 70 }}
            />&nbsp;&nbsp;
            <DateInput
              date={false}
              time
              seconds
              analogTime={false}
              onChange={onChange}
              lang={lang}
              style={{ width: 70 }}
            />
            &nbsp;dropDownPicker (default)
          </div>
          <div>
            <DateInput
              type="onlyField"
              onChange={onChange}
              lang={lang}
              style={{ width: 130 }}
            />&nbsp;&nbsp;
            <DateInput
              type="onlyField"
              date
              time
              onChange={onChange}
              lang={lang}
              style={{ width: 180 }}
            />&nbsp;&nbsp;
            <DateInput
              type="onlyField"
              date={false}
              time
              onChange={onChange}
              lang={lang}
              style={{ width: 70 }}
            />&nbsp;&nbsp;
            <DateInput
              type="onlyField"
              date={false}
              time
              seconds
              analogTime={false}
              onChange={onChange}
              lang={lang}
              style={{ width: 70 }}
            />
            &nbsp;onlyField
          </div>
          <div>
            <DateInput
              type="native"
              onChange={onChange}
              lang={lang}
              style={{ fontSize: 10, width: 130 }}
            />&nbsp;&nbsp;
            <DateInput
              type="native"
              date
              time
              onChange={onChange}
              lang={lang}
              style={{ fontSize: 10, width: 180 }}
            />&nbsp;&nbsp;
            <DateInput
              type="native"
              date={false}
              time
              onChange={onChange}
              lang={lang}
              style={{ fontSize: 10, width: 70 }}
            />&nbsp;&nbsp;
            <DateInput
              type="native"
              date={false}
              time
              seconds
              analogTime={false}
              onChange={onChange}
              lang={lang}
              style={{ fontSize: 10, width: 70 }}
            />
            &nbsp;native
          </div>
          <div>
            <DateInput
              disabled
              value={new Date()}
              type="onlyField"
              lang={lang}
              style={{ width: 130 }}
            />&nbsp;&nbsp;
            <DateInput
              disabled
              value={new Date()}
              type="onlyField"
              date
              time
              lang={lang}
              style={{ width: 180 }}
            />&nbsp;&nbsp;
            <DateInput
              disabled
              value={new Date()}
              type="onlyField"
              date={false}
              time
              lang={lang}
              style={{ width: 70 }}
            />&nbsp;&nbsp;
            <DateInput
              disabled
              value={new Date()}
              type="onlyField"
              date={false}
              time
              seconds
              analogTime={false}
              lang={lang}
              style={{ width: 70 }}
            />
            &nbsp;disabled
          </div>
          <div>Inline pickers with date:</div>
          <div style={flexContainer('row')}>
            <DateInput
              type="inlinePicker"
              onChange={onChange}
              time
              analogTime={false}
              lang={lang}
              styleOuter={{ flexShrink: 0 }}
            />
            &nbsp;&nbsp;
            <DateInput
              type="inlinePicker"
              value={this.state.fixedDate}
              onChange={onChange}
              lang={lang}
              styleOuter={{ flexShrink: 0 }}
            />
          </div>
          <div>Analogue and digital time pickers:</div>
          <div style={flexContainer('row')}>
            <DateInput
              type="inlinePicker"
              date={false}
              time
              seconds
              value={this.state.fixedDate}
              onChange={onChange}
              lang={lang}
              styleOuter={{ flexShrink: 0 }}
            />
            &nbsp;&nbsp;
            <DateInput
              type="inlinePicker"
              onChange={onChange}
              date={false}
              time
              analogTime={false}
              lang={lang}
              styleOuter={{ flexShrink: 0 }}
            />
          </div>
          <div style={flexContainer('row', { marginTop: 5 })}>
            <TimePickerNow lang={lang} />
            <DateInput
              type="inlinePicker"
              onChange={onChange}
              date
              time
              lang={lang}
              styleOuter={{ flexShrink: 0 }}
            />
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>
            ColorInput: with inline/dropdown ColorPicker (RGB/HSV, alpha,
            clipboard)
          </ExampleLabel>
          <div style={flexContainer('row')}>
            <ColorInput
              value="dc5400aa"
              onChange={onChange}
              styleOuter={{ flexShrink: 0 }}
            />
            <ColorInput
              value="dc5400ff"
              disabled
              styleOuter={{ flexShrink: 0 }}
            />
            &nbsp;&nbsp;
            <ColorInput
              inlinePicker
              value="cca500ff"
              onChange={onChange}
              styleOuter={{ flexShrink: 0 }}
            />
          </div>
          <div style={flexContainer('row')}>
            <ColorInput
              inlinePicker
              value="cca500ff"
              onChange={onChange}
              disabled
              styleOuter={{ flexShrink: 0 }}
            />
          </div>
        </div>
        <br />
        <div>
          <ExampleLabel>Imperative example</ExampleLabel>
          <TextInput
            ref={this.refInput}
            value="Initial value"
            onFocus={() => console.log('focus')}
            onBlur={() => console.log('blur')}
          />{' '}
          <Button
            onMouseDown={cancelEvent}
            onClick={() => {
              const target = this.refInput.current;
              if (!target) return;
              target.setValue('Different value');
              target.focus();
            }}
          >
            Change & focus
          </Button>{' '}
          <Button
            onMouseDown={cancelEvent}
            onClick={() => {
              const target = this.refInput.current;
              if (!target) return;
              target.revert();
              target.blur();
            }}
          >
            Revert & blur
          </Button>
        </div>
      </div>
    );
  }
}

class TimePickerNow extends React.Component<
  { lang: string },
  { curDate: Object }
> {
  state = {
    curDate: new Date(),
  };
  componentDidMount() {
    setInterval(() => {
      this.setState({ curDate: new Date() });
    }, 1000);
  }

  render() {
    return (
      <DateInput
        type="inlinePicker"
        value={this.state.curDate}
        time
        seconds
        checkIos={false}
        disabled
        lang={this.props.lang}
        styleOuter={{ flexShrink: 0 }}
      />
    );
  }
}

export default FormExample;
