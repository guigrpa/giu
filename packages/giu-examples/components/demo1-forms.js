// @flow

/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import {
  Icon,
  Spinner,
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
  DropDownMenu,
  isRequired,
  isEmail,
  isDate,
  cancelEvent,
} from 'giu';
import {
  NORMAL_OPTIONS,
  TALL_OPTIONS,
  WIDE_OPTIONS,
  onChange,
  onChangeJson,
} from './demo1-common';

class FormExample extends React.Component {
  state = { fixedDate: new Date() };

  render() {
    const { lang, paragraphExample } = this.props;
    return (
      <div className="example">
        <BasicInputs />
        <br />
        <RadioGroupsAndRangeInputs lang={lang} />
        <br />
        <InputValidation lang={lang} />
        <br />
        <Textareas />
        <br />
        <Selects lang={lang} />
        <br />
        <DateInputs lang={lang} date={this.state.fixedDate} />
        <br />
        <ColorInputs />
        <br />
        <ImperativeExample />
        <br />
        {paragraphExample && <ParagraphExample />}
      </div>
    );
  }
}

const BasicInputs = () => (
  <React.Fragment>
    <div className="input-row">
      <div className="example-label">Inputs</div>
      <NumberInput
        step="0.1"
        value={null}
        onChange={onChange}
        placeholder="number"
      />
      <NumberInput disabled value={6.5} />
      &nbsp;&nbsp;
      <TextInput
        value="a"
        onChange={onChange}
        placeholder="text"
        errors={['Example error above']}
        errorPosition="above"
        errorAlign="right"
      />
      <TextInput disabled value="Disabled" />
      &nbsp;&nbsp;
      <PasswordInput required onChange={onChange} placeholder="password" />
      &nbsp;&nbsp;
      <Checkbox
        value={true}
        onChange={onChange}
        id="checkbox"
        label="checkbox"
        errors={['Example error below']}
      />
      &nbsp;
      <Checkbox disabled value={true} label="checkbox" />
    </div>
    <div>
      <FileInput />
      <FileInput disabled />
    </div>
    <style jsx global>
      {`
        .input-row .giu-text-input,
        .input-row .giu-number-input,
        .input-row .giu-password-input,
        .input-row .giu-text-input-mdl,
        .input-row .giu-number-input-mdl,
        .input-row .giu-password-input-mdl {
          width: 80px;
        }
      `}
    </style>
  </React.Fragment>
);

const RadioGroupsAndRangeInputs = ({ lang }) => (
  <table>
    <tbody>
      <tr>
        <td style={{ verticalAlign: 'top' }}>
          <div className="example-label">
            RadioGroup (flexible labels, clipboard)
          </div>
          <div style={{ display: 'flex' }}>
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
                      <Button onClick={() => console.log('hi!')}>button</Button>
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </td>
        <td style={{ verticalAlign: 'top', paddingLeft: 10 }}>
          <div className="example-label">RangeInput</div>
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
        </td>
      </tr>
    </tbody>
  </table>
);

const InputValidation = ({ lang }) => (
  <div>
    <div className="example-label">Input validation</div>
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
        (o) =>
          o.toLowerCase() === 'unicorn' ? undefined : "must be 'unicorn'",
      ]}
    />
    <TextInput
      placeholder="custom promise validator"
      required
      validators={[
        (o) =>
          new Promise(resolve =>
            setTimeout(
              () =>
                o.toLowerCase() === 'unicorn'
                  ? resolve(undefined)
                  : resolve("checked the database; you must be a 'unicorn'"),
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
        isDate((msg, val, { fmt }) => `ha de ser una hora correcta: ${fmt}`),
      ]}
    />
  </div>
);

const Textareas = () => (
  <div className="textarea-examples">
    <div className="example-label">Textarea (with auto-resize)</div>
    <Textarea value="En un lugar de la Mancha..." required />
    <Textarea disabled value="En un lugar de la Mancha..." />
    <style jsx global>{`
      .textarea-examples .giu-textarea-field {
        min-height: 2rem;
      }
    `}</style>
  </div>
);

const Selects = ({ lang }) => (
  <div className="example-selects">
    <div className="example-label">
      Select: native, or with inline/dropdown ListPicker (keyboard-controlled,
      shortcuts, clipboard, one/two-stage, autoscroll)
    </div>
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
      <Select disabled type="dropDownPicker" value={28} items={TALL_OPTIONS} />
    </div>
    <div className="inline-pickers">
      <Select
        type="inlinePicker"
        required
        items={NORMAL_OPTIONS}
        lang={lang}
        onChange={onChangeJson}
      />
      <Select
        type="inlinePicker"
        items={TALL_OPTIONS}
        value={33}
        onChange={onChangeJson}
        twoStageStyle
      />
      <Select type="inlinePicker" items={[]} onChange={onChangeJson} />
      <Select
        type="inlinePicker"
        disabled
        items={TALL_OPTIONS}
        value={33}
        onChange={onChangeJson}
      />
    </div>
    <style jsx global>{`
      .example-selects .giu-select-custom {
        max-width: 100px;
      }
      .inline-pickers {
        display: flex;
      }
      .inline-pickers .giu-list-picker {
        height: 150px;
      }
      .inline-pickers {
        margin: 0px -2px;
      }
      .inline-pickers .giu-select-custom-wrapper {
        flex: 1 1 0px;
        margin: 0 2px;
      }
    `}</style>
  </div>
);

const DateInputs = ({ lang, date }) => (
  <div>
    <div className="example-label">
      DateInput: field-only, or with inline/dropdown DateTimePicker
      (keyboard-controlled, clipboard; local for date+time, UTC otherwise)
    </div>
    <div className="date-row dates-drop-down-picker">
      <DateInput onChange={onChange} lang={lang} style={{ width: 130 }} />
      <DateInput date time onChange={onChange} lang={lang} />
      <DateInput date={false} time onChange={onChange} lang={lang} />
      <DateInput
        date={false}
        time
        seconds
        analogTime={false}
        onChange={onChange}
        lang={lang}
      />
      dropDownPicker (default)
    </div>
    <div className="date-row dates-only-field">
      <DateInput type="onlyField" onChange={onChange} lang={lang} />
      <DateInput type="onlyField" date time onChange={onChange} lang={lang} />
      <DateInput
        type="onlyField"
        date={false}
        time
        onChange={onChange}
        lang={lang}
      />
      <DateInput
        type="onlyField"
        date={false}
        time
        seconds
        analogTime={false}
        onChange={onChange}
        lang={lang}
      />
      onlyField
    </div>
    <div className="date-row dates-native">
      <DateInput type="native" onChange={onChange} lang={lang} />
      <DateInput type="native" date time onChange={onChange} lang={lang} />
      <DateInput
        type="native"
        date={false}
        time
        onChange={onChange}
        lang={lang}
      />
      <DateInput
        type="native"
        date={false}
        time
        seconds
        analogTime={false}
        onChange={onChange}
        lang={lang}
      />
      native
    </div>
    <div className="date-row dates-disabled">
      <DateInput disabled value={new Date()} type="onlyField" lang={lang} />
      <DateInput
        disabled
        value={new Date()}
        type="onlyField"
        date
        time
        lang={lang}
      />
      <DateInput
        disabled
        value={new Date()}
        type="onlyField"
        date={false}
        time
        lang={lang}
      />
      <DateInput
        disabled
        value={new Date()}
        type="onlyField"
        date={false}
        time
        seconds
        analogTime={false}
        lang={lang}
      />
      disabled
    </div>
    <br />
    <div>Inline pickers with date:</div>
    <div style={{ display: 'flex' }}>
      <DateInput
        type="inlinePicker"
        onChange={onChange}
        time
        analogTime={false}
        lang={lang}
      />
      &nbsp;&nbsp;
      <DateInput
        type="inlinePicker"
        value={date}
        onChange={onChange}
        lang={lang}
      />
    </div>
    <br />
    <div>Analogue and digital time pickers:</div>
    <div style={{ display: 'flex' }}>
      <DateInput
        type="inlinePicker"
        date={false}
        time
        seconds
        value={date}
        onChange={onChange}
        lang={lang}
      />
      &nbsp;&nbsp;
      <DateInput
        type="inlinePicker"
        onChange={onChange}
        date={false}
        time
        analogTime={false}
        lang={lang}
      />
    </div>
    <div style={{ display: 'flex', marginTop: 5 }}>
      <TimePickerNow lang={lang} />
      <DateInput
        type="inlinePicker"
        onChange={onChange}
        date
        time
        lang={lang}
      />
    </div>
    <style jsx global>{`
      .date-row .giu-input:nth-child(1) input {
        width: 130px;
      }
      .date-row .giu-input:nth-child(2) input {
        width: 180px;
      }
      .date-row .giu-input:nth-child(3) input {
        width: 70px;
      }
      .date-row .giu-input:nth-child(4) input {
        width: 70px;
      }
      .date-row > .giu-input {
        margin-right: 2px;
      }
    `}</style>
  </div>
);

const ColorInputs = () => (
  <div>
    <div className="example-label">
      ColorInput: with inline/dropdown ColorPicker (RGB/HSV, alpha, clipboard)
    </div>
    <div className="row">
      <ColorInput value="dc5400aa" onChange={onChange} />
      <ColorInput value="dc5400ff" disabled />
      &nbsp;&nbsp;
      <ColorInput inlinePicker value="cca500ff" onChange={onChange} />
    </div>
    <div className="row">
      <ColorInput inlinePicker value="cca500ff" onChange={onChange} disabled />
    </div>
    <style jsx>{`
      .row {
        display: flex;
        align-items: flex-start;
      }
    `}</style>
  </div>
);

class TimePickerNow extends React.Component {
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
        // styleOuter={{ flexShrink: 0 }}
      />
    );
  }
}

class ImperativeExample extends React.Component {
  refInput = React.createRef();

  render() {
    return (
      <div>
        <div className="example-label">Imperative example</div>
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
    );
  }
}

const ParagraphExample = () => (
  <div style={{ color: 'blue' }}>
    <div className="example-label">Inputs in a paragraph</div>
    <p>
      Here is a text input <TextInput />, a date input <DateInput /> and{' '}
      <Checkbox id="checkbox-in-a-paragraph" label="a checkbox" />. Now
      let&apos;s see a native select <Select items={NORMAL_OPTIONS} /> and a
      custom select: <Select items={NORMAL_OPTIONS} type="dropDownPicker" />.
      Are all correctly baseline-aligned? Now we also check what happens if we
      insert{' '}
      <DropDownMenu items={NORMAL_OPTIONS}>
        <b>a drop-down menu</b>
      </DropDownMenu>{' '}
      and a{' '}
      <Button plain>
        <b>plain button</b>
      </Button>
      , an <Icon icon="cog" /> icon or a <Spinner /> spinner. Finally, we add a
      color input <ColorInput value="#11501388" />.
    </p>
  </div>
);

export default FormExample;
