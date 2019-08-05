/* eslint-disable global-require, no-console, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/prefer-stateless-function, react/jsx-boolean-value */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/no-string-refs, react/no-unescaped-entities, react/no-danger, react/no-array-index-key */
import React from 'react';
import Head from 'next/head';
import marked from 'marked';
import hljs from 'highlight.js';
import { merge } from 'timm';
import moment from 'moment';
import {
  Select,
  DateInput,
  Textarea,
  Checkbox,
  TextInput,
  PasswordInput,
  NumberInput,
  RangeInput,
  FileInput,
  RadioGroup,
  ColorInput,
  LIST_SEPARATOR,
  DropDownMenu,
  Button,
  Progress,
  Icon,
  Spinner,
  LargeMessage,
  Floats,
  Modals,
  modalPush,
  modalPop,
  Notifications,
  notify as createNotif,
  Hints,
  hintDefine,
  hintShow,
  flexContainer,
  isRequired,
  isEmail,
  isGte,
  isLte,
  isOneOf,
  isDate,
  IS_IOS,
} from 'giu';
import 'giu/lib/css/reset.css';
import 'giu/lib/css/giu.css';
import 'giu/lib/css/colorInput.css';

let FontFaceObserver;
try {
  FontFaceObserver = require('fontfaceobserver');
} catch (err) {
  /* ignore */
}

// hljs.configure({ languages: ['js', 'html'] });
// const highlight = code => hljs.highlightAuto(code).value;
const highlight = (code, lang) => {
  if (!lang) return code;
  return hljs.highlight(lang, code).value;
};
// const highlight = code => Prism.highlight(code, Prism.languages.javascript);
marked.setOptions({ highlight });

const LANG_OPTIONS = [
  { value: 'en-us', label: 'English (US)' },
  { value: 'en-gb', label: 'English (UK)' },
  { value: 'ca', label: 'Català' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];
const TODAY = {
  ca: 'Avui',
  es: 'Hoy',
  fr: "Aujourd'hui",
  de: 'Heute',
};
const changeLang = lang => moment.locale(lang);
changeLang('en-us');

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

// -----------------------------------------------
// Main
// -----------------------------------------------
class App extends React.Component {
  props: { md?: string };

  constructor(props) {
    super(props);
    this.state = { fFontsLoaded: false };
  }

  componentDidMount() {
    const font = new FontFaceObserver('Open Sans');
    font
      .load()
      .then(() => this.setState({ fFontsLoaded: true }))
      .catch(err => console.error('Error loading font', err));
  }

  render() {
    const { md } = this.props;
    const contentPieces = [];
    if (md) {
      md.split(/\[\[\[(.+)\]\]\]/).forEach((segment, i) => {
        if (i % 2) {
          contentPieces.push(<Contents key={i} id={segment} />);
        } else {
          contentPieces.push(<Markdown key={i} md={segment} />);
        }
      });
    }
    return (
      <div style={this.style()}>
        <Floats />
        <Modals />
        <Notifications />
        <Hints />
        <section className="page-header">
          <h1 className="project-name">Giu</h1>
          <h2 className="project-tagline">
            An opinionated Swiss-army knife for building React application GUIs.
          </h2>
        </section>

        <section className="main-content">
          {contentPieces}
          <footer className="site-footer">
            <span className="site-footer-owner">
              <a href="https://github.com/guigrpa/giu">Giu</a> is maintained by{' '}
              <a href="https://github.com/guigrpa">guigrpa</a>.
            </span>
            <span className="site-footer-credits">
              This page uses the{' '}
              <a href="https://github.com/jasonlong/cayman-theme">
                Cayman theme
              </a>{' '}
              by <a href="https://twitter.com/jasonlong">Jason Long</a>.
            </span>
          </footer>
        </section>
      </div>
    );
  }

  style() {
    return {
      fontFamily: this.state.fFontsLoaded
        ? 'Open Sans, sans-serif'
        : 'Helvetica, Arial, sans-serif',
    };
  }
}

const Contents = ({ id }) => {
  let el;
  const idx = id.indexOf('demo:');
  const finalId = idx >= 0 ? id.slice(idx) : id;
  switch (finalId) {
    case 'demo:intro':
      el = <DemoIntro />;
      break;
    case 'demo:input-intro-age':
      el = <InputIntroAge />;
      break;
    case 'demo:input-types':
      el = <InputTypes />;
      break;
    case 'demo:validation-intro':
      el = <ValidationIntro />;
      break;
    case 'demo:validation-intro2':
      el = <ValidationIntro2 />;
      break;
    case 'demo:validation-predefined':
      el = <ValidationPredefined />;
      break;
    case 'demo:validation-custom-message':
      el = <ValidationCustomMessage />;
      break;
    case 'demo:validation-custom-validator':
      el = <ValidationCustomValidator />;
      break;
    case 'demo:imperative-api':
      el = <ImperativeApi />;
      break;
    case 'demo:inputs-simple':
      el = <InputsSimple />;
      break;
    case 'demo:checkboxes':
      el = <Checkboxes />;
      break;
    case 'demo:date-inputs':
      el = <DateInputs />;
      break;
    case 'demo:selects':
      el = <Selects />;
      break;
    case 'demo:radio-groups':
      el = <RadioGroups />;
      break;
    case 'demo:color-inputs':
      el = <ColorInputs />;
      break;
    case 'demo:file-inputs':
      el = <FileInputs />;
      break;
    case 'demo:drop-down-menus':
      el = <DropDownMenus />;
      break;
    case 'demo:modals':
      el = <ModalDemo />;
      break;
    case 'demo:notifications':
      el = <Buttons />;
      break;
    case 'demo:hints':
      el = <HintDemo />;
      break;
    case 'demo:buttons':
      el = <Buttons fIncludeDisabled />;
      break;
    case 'demo:icons':
      el = <Icons />;
      break;
    case 'demo:large-messages':
      el = <LargeMessages />;
      break;
    case 'demo:progress':
      el = <ProgressDemo />;
      break;
    default:
      el = (
        <div>
          <b>MISSING DEMO: {id}</b>
        </div>
      );
      break;
  }
  return <div>{el}</div>;
};

// -----------------------------------------------
// Demos
// -----------------------------------------------
const DemoIntro = () => (
  <div>
    <p>
      <b>All of the examples in this page are interactive</b> and use Giu's
      components and helpers. Feel free to play with them!
    </p>
    <p>
      You can also check out this <a href="compact/">compact demo</a>.
    </p>
  </div>
);

class InputIntroAge extends React.Component {
  render() {
    return (
      <Centered>
        Try it:{' '}
        <NumberInput
          ref="age"
          min={0}
          step={1}
          value={15}
          placeholder="age"
          required
          validators={[isGte(18)]}
          style={{ width: 80 }}
        />{' '}
        <Button
          onClick={() =>
            this.refs.age.validateAndGetValue().then(age =>
              createNotif({
                type: 'success',
                icon: 'save',
                title: 'Saved!',
                msg: `Your age is ${age}`,
              })
            )
          }
        >
          <Icon icon="save" /> Save
        </Button>
      </Centered>
    );
  }
}

class InputTypes extends React.Component {
  render() {
    return (
      <div>
        <h3>Input types</h3>
        <p>
          Giu inputs cover most (if not all) of their native HTML counterparts:
        </p>
        <ul>
          <li>
            <a href="#textinput-passwordinput-numberinput-rangeinput-textarea">
              TextInput
            </a>: <TextInput />
          </li>
          <li>
            <a href="#textinput-passwordinput-numberinput-rangeinput-textarea">
              PasswordInput
            </a>: <PasswordInput />
          </li>
          <li>
            <a href="#textinput-passwordinput-numberinput-rangeinput-textarea">
              NumberInput
            </a>: <NumberInput step="0.1" />
          </li>
          <li>
            <a href="#dateinput">DateInput</a>:{' '}
            <DateInput time seconds style={{ width: 220 }} />
          </li>
          <li>
            <a href="#checkbox">Checkbox</a>:{' '}
            <Checkbox value={true} label="Try me" />
          </li>
          <li>
            <a href="#select">Select</a>:{' '}
            <Select items={getExampleItems()} value="blueberries" required />{' '}
            (native){' '}
            <Select
              required
              type="dropDownPicker"
              items={getExampleItems({ fSeparator: true })}
              value="blueberries"
            />{' '}
            (custom)
          </li>
          <li>
            <a href="#radiogroup">RadioGroup</a>:
            <div>
              <RadioGroup id="group-example-a" items={getExampleItems()} value="cherries" />
            </div>
          </li>
          <li>
            <a href="#colorinput">ColorInput</a>:{' '}
            <ColorInput value="aadc54ab" /> (<a href="#color-inputs">
              more details
            </a>)
          </li>
          <li>
            <a href="#fileinput">FileInput</a>: <FileInput />
          </li>
          <li>
            <a href="#textinput-passwordinput-numberinput-rangeinput-textarea">
              RangeInput
            </a>:{' '}
            <RangeInput
              value="55"
              min={0}
              max={100}
              step={5}
              style={{ position: 'relative', top: 4 }}
            />
          </li>
          <li>
            <a href="#textinput-passwordinput-numberinput-rangeinput-textarea">
              Textarea
            </a>{' '}
            (auto-resizing):
            <Textarea
              placeholder="Write something really long..."
              style={{ minHeight: '1.8em' }}
            />
          </li>
        </ul>
      </div>
    );
  }
}

const ValidationIntro = () => (
  <Centered>
    <DateInput />
    <div>
      <i>
        (just focus, enter a valid/invalid date and focus elsewhere to trigger
        validation)
      </i>
    </div>
  </Centered>
);

const ValidationIntro2 = () => (
  <CenteredFlex>
    <DateInput required />
    <TextInput placeholder="email" validators={[isEmail()]} />
    <NumberInput
      placeholder="5 <= x <= 10"
      validators={[isGte(5), isLte(10)]}
    />
  </CenteredFlex>
);

const ValidationPredefined = () => (
  <CenteredFlex>
    <TextInput
      placeholder="rabbit | cow | eagle"
      required
      validators={[isOneOf(['rabbit', 'cow', 'eagle'])]}
    />
    <TextInput placeholder="email" required validators={[isEmail()]} />
    <NumberInput placeholder=">= 10" required validators={[isGte(10)]} />
  </CenteredFlex>
);

const ValidationCustomMessage = () => (
  <div>
    <CenteredFlex>
      <TextInput
        placeholder="email"
        required
        validators={[
          isEmail("please write your email address (it's safe with us!)"),
        ]}
      />
      <TextInput
        placeholder="name"
        validators={[isRequired('please write your name')]}
      />
    </CenteredFlex>
    <CenteredFlex>
      <TextInput
        placeholder="email"
        required
        validators={[
          isEmail(
            (defaultMsg, value) =>
              `'${value}' no es una dirección electrónica válida`
          ),
        ]}
      />
      <DateInput
        validators={[
          isDate((defaultMsg, value, { fmt }) => `follow this format: ${fmt}`),
        ]}
      />
    </CenteredFlex>
    <CenteredFlex>
      <NumberInput
        placeholder=">= 15"
        validators={[
          isGte(15, (defaultMsg, value, { min }) => `must be >= ${min}`),
        ]}
      />
    </CenteredFlex>
  </div>
);

const ValidationCustomValidator = () => (
  <CenteredFlex>
    <TextInput
      placeholder="custom sync validator"
      required
      validators={[
        val =>
          val.toLowerCase() === 'unicorn' ? undefined : "must be a 'unicorn'",
      ]}
      style={{ width: 250 }}
    />
    <TextInput
      placeholder="custom promise validator"
      required
      validators={[
        val =>
          new Promise(resolve =>
            setTimeout(
              () =>
                val.toLowerCase() === 'unicorn'
                  ? resolve()
                  : resolve("checked the database; must be a 'unicorn'"),
              1000
            )
          ),
      ]}
      style={{ width: 250 }}
    />
  </CenteredFlex>
);

// class InputValidation extends React.Component {
//   render() {
//     return (
//       <div>
//         <p>And you can provide your own validators, synchronous or asynchronous (Promise):</p>
//         <div style={{ textAlign: 'center' }}>
//           <TextInput placeholder="custom sync validator"
//             required validators={[
//               o => (o.toLowerCase() === 'unicorn' ? undefined : 'must be \'unicorn\''),
//             ]}
//             style={{ width: 250 }}
//           /><br />
//           <TextInput placeholder="custom promise validator"
//             required validators={[
//               o => new Promise((resolve) =>
//                 setTimeout(() =>
//                   (o.toLowerCase() === 'unicorn' ? resolve(undefined) : resolve('checked the database; must be \'unicorn\''))
//                 , 1000)
//               ),
//             ]}
//             style={{ width: 250 }}
//           />
//         </div>
//       </div>
//     );
//   }
// }

class ImperativeApi extends React.Component {
  refInput: any = React.createRef();

  render() {
    return (
      <Centered>
        <TextInput ref={this.refInput} value="Initial value" />{' '}
        <Button
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
          onClick={() => {
            const target = this.refInput.current;
            if (!target) return;
            target.revert();
            target.blur();
          }}
        >
          Revert & blur
        </Button>
      </Centered>
    );
  }
}

const InputsSimple = () => (
  <div>
    <CenteredFlex>
      <div>
        <TextInput placeholder="TextInput" />
        <br />
        <PasswordInput placeholder="PasswordInput" />
        <br />
        <NumberInput step="5" placeholder="NumberInput" />
        <br />
        <RangeInput
          value={55}
          min={0}
          max={100}
          step={5}
          style={{ width: '100%', marginTop: 4 }}
        />
        <Textarea placeholder="Textarea" style={{ minHeight: 32 }} />
      </div>
      <div>
        <RangeInput
          value={55}
          min={0}
          max={100}
          step={5}
          vertical
          style={{ height: 150, width: 25 }}
        />
      </div>
    </CenteredFlex>
  </div>
);

const Checkboxes = () => (
  <Centered>
    <Checkbox value={true} label="Simple, huh?" />
  </Centered>
);

class DateInputs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialDate: new Date(),
      curDate: new Date(),
      lang: 'en-us',
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ curDate: new Date() });
    }, 1000);
  }

  render() {
    const { lang, initialDate, curDate } = this.state;
    const todayName = TODAY[lang];
    return (
      <div>
        <p>
          You can have date-only (default), time-only and date-time pickers:
        </p>

        <CenteredFlex>
          <DateInput
            type="inlinePicker"
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
          <DateInput
            type="inlinePicker"
            date={false}
            time
            seconds
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
          <DateInput
            type="inlinePicker"
            time
            seconds
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
        </CenteredFlex>

        <p>
          If you use{' '}
          <a href="https://github.com/moment/moment">
            <i>moment</i>
          </a>, your date picker and date/time formats will be automatically
          translated when you choose a different locale, e.g.{' '}
          <code>moment.locale('es')</code>:
        </p>

        <Centered>
          <Select
            type="dropDownPicker"
            items={LANG_OPTIONS}
            required
            value={lang}
            onChange={(ev, newLang) => {
              changeLang(newLang);
              this.setState({ lang: newLang });
            }}
          />
        </Centered>

        <p>
          <b>UTC vs. local time:</b> By default, date-time pickers use local
          time, whereas time-only pickers use UTC and date-only pickers provide
          dates with time set to 00:00UTC. You can change this specifying the{' '}
          <code>utc</code> prop; for example, a local-time time picker:
        </p>

        <CenteredFlex>
          <DateInput
            type="inlinePicker"
            date={false}
            time
            seconds
            utc={false}
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
        </CenteredFlex>

        <p>
          <b>Keyboard shortcuts:</b> In date pickers, press the arrow keys to
          change the date/time, and the page-up/page-down keys to show the
          previous/next month. In time pickers, press the arrow keys to move the
          minute hand, and the page-up/page-down keys to move the hour hand.
        </p>

        <p>
          <b>Variants:</b> DateInputs can be of three types:
        </p>

        <ul>
          <li>
            A simple field (<code>type="onlyField"</code>):{' '}
            <DateInput type="onlyField" lang={lang} todayName={todayName} />
          </li>
          <li>
            A field with a dropdown (<code>type="dropDownPicker"</code>), the
            default one: <DateInput lang={lang} todayName={todayName} /> (press
            ESC to show/hide the picker)
          </li>
          <li>
            An inline date or time picker (<code>type="inlinePicker"</code>):
          </li>
          <div style={{ marginTop: '1em' }}>
            <CenteredFlex>
              <DateInput
                type="inlinePicker"
                lang={lang}
                todayName={todayName}
              />
            </CenteredFlex>
          </div>
        </ul>

        <p>
          If you are including a time picker, you can choose between an analogue
          one (with or without second hand) and a digital one
          {IS_IOS && (
            <span>
              (<i>
                note that, by default, Giu pickers are replaced by the native
                HTML ones on iOS.
              </i>)
            </span>
          )}
          :
        </p>

        <CenteredFlex>
          <DateInput
            type="inlinePicker"
            date={false}
            time
            utc={false}
            seconds
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
          <DateInput
            type="inlinePicker"
            date={false}
            time
            utc={false}
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
          <DateInput
            type="inlinePicker"
            date={false}
            time
            analogTime={false}
            utc={false}
            seconds
            value={initialDate}
            lang={lang}
            todayName={todayName}
          />
        </CenteredFlex>

        <p>Customise your picker&#39;s accent color:</p>

        <CenteredFlex>
          <DateInput
            type="inlinePicker"
            time
            seconds
            value={initialDate}
            accentColor="olive"
            lang={lang}
            todayName={todayName}
          />
          <DateInput
            type="inlinePicker"
            time
            seconds
            analogTime={false}
            value={initialDate}
            accentColor="lightgreen"
            lang={lang}
            todayName={todayName}
          />
        </CenteredFlex>

        <p>And this is what disabled DateInputs look like:</p>

        <CenteredFlex style={{ alignItems: 'flex-start', marginBottom: '1em' }}>
          <DateInput
            time
            seconds
            value={curDate}
            disabled
            checkIos={false}
            lang={lang}
            todayName={todayName}
          />
          <DateInput
            type="inlinePicker"
            time
            seconds
            value={curDate}
            disabled
            checkIos={false}
            lang={lang}
            todayName={todayName}
          />
        </CenteredFlex>
      </div>
    );
  }
}

const Selects = () => (
  <div>
    <p>Selects can be of three types:</p>
    <ul>
      <li>
        The native HTML select (<code>type="native"</code>), the default one:{' '}
        <Select items={getExampleItems()} value="blueberries" required />
      </li>
      <li>
        A custom select with a drop-down (<code>type="dropDownPicker"</code>):{' '}
        <Select
          type="dropDownPicker"
          items={getExampleItems({ fSeparator: true })}
          value="blueberries"
          required
        />{' '}
        (press ESC to show/hide the picker)
      </li>
      <li>
        An inline picker (<code>type="inlinePicker"</code>):
      </li>
      <div style={{ marginTop: '1em' }}>
        <CenteredFlex>
          <Select
            type="inlinePicker"
            items={getExampleItems({
              fSeparator: true,
              fKeys: true,
              modifier: 'alt',
            })}
            value="blueberries"
            required
          />
        </CenteredFlex>
      </div>
    </ul>
    <p>
      Custom Selects are faster (they only render options when open), support
      separators and keyboard shortcuts, and are much more similar across
      browsers and platforms than the native Selects.
    </p>

    <p>
      <b>Variants:</b> Here is an example enabling the{' '}
      <code>twoStageStyle</code> prop; hover and you'll see the difference:
    </p>

    <CenteredFlex>
      <Select
        type="inlinePicker"
        twoStageStyle
        items={getExampleItems({ fSeparator: true })}
        value="blueberries"
        required
      />
    </CenteredFlex>

    <p>Customise your picker's accent color:</p>

    <CenteredFlex>
      <Select
        type="inlinePicker"
        items={getExampleItems({ fSeparator: true })}
        value="blueberries"
        required
        accentColor="olive"
      />
      <Select
        type="inlinePicker"
        items={getExampleItems({ fSeparator: true })}
        value="blueberries"
        required
        accentColor="lightgreen"
      />
    </CenteredFlex>

    <p>And this is what disabled Selects look like:</p>

    <CenteredFlex style={{ alignItems: 'flex-start' }}>
      <Select
        type="dropDownPicker"
        items={getExampleItems({ fSeparator: true })}
        value="blueberries"
        required
        disabled
      />
      <Select
        type="inlinePicker"
        items={getExampleItems({ fSeparator: true })}
        value="blueberries"
        required
        disabled
      />
    </CenteredFlex>
  </div>
);

const RadioGroups = () => (
  <CenteredFlex>
    <RadioGroup id="group-example-zzz" items={getExampleItems()} value="cherries" />
  </CenteredFlex>
);

const ColorInputs = () => (
  <div>
    <p>ColorInputs can be of two types:</p>
    <ul>
      <li>
        A field with a dropdown, the default one:{' '}
        <ColorInput value="aadc54ab" /> (press ESC to show/hide the picker)
      </li>
      <li>
        An inline color picker (add the <code>inlinePicker</code> prop):
      </li>
    </ul>
    <div style={{ marginTop: '1em' }}>
      <CenteredFlex>
        <ColorInput value="aa66be52" inlinePicker />
      </CenteredFlex>
    </div>

    <p>Customise your picker's accent color:</p>

    <CenteredFlex>
      <ColorInput value="aabe5282" inlinePicker accentColor="olive" />
      <ColorInput value="aabe5282" inlinePicker accentColor="lightgreen" />
    </CenteredFlex>

    <p>And this is what disabled ColorInputs look like:</p>

    <CenteredFlex>
      <ColorInput value="aa52b6be" disabled />
      <ColorInput value="aa52b6be" disabled inlinePicker />
    </CenteredFlex>
  </div>
);

const FileInputs = () => (
  <CenteredFlex>
    <FileInput>
      <Icon icon="file-o" /> Choose a file...
    </FileInput>
    <FileInput disabled>
      <Icon icon="file-o" /> Disabled FileInput
    </FileInput>
  </CenteredFlex>
);

class DropDownMenus extends React.Component {
  render() {
    return (
      <Centered>
        <DropDownMenu
          items={getExampleItems({
            fSeparator: true,
            fKeys: true,
            modifier: 'mod',
          })}
          onClickItem={(ev, fruits) =>
            createNotif({
              title: 'Got it!',
              msg: `I'll fetch some ${fruits}!`,
              icon: 'shopping-cart',
              type: 'success',
            })
          }
          style={{ padding: '3px 8px' }}
        >
          <Icon icon="shopping-basket" />&nbsp; Which fruit?
        </DropDownMenu>
      </Centered>
    );
  }
}

class ModalDemo extends React.Component {
  render() {
    return (
      <Centered>
        <Button onClick={() => this.addModal()}>
          <Icon icon="comments" />&nbsp; Let&#39;s talk!
        </Button>
      </Centered>
    );
  }

  addModal() {
    const title = "Hi, what's your name?";
    const children = (
      <div>
        <CenteredFlex>
          <TextInput
            ref={c => {
              this.refName = c;
            }}
            autoFocus
            required
            errorZ={52}
          />
          <DateInput placeholder="date of birth" floatZ={55} required />
        </CenteredFlex>
        <div>
          <i>Try typing an invalid date...</i>
        </div>
      </div>
    );
    modalPush({
      title,
      children,
      buttons: [
        {
          label: 'Hello!',
          onClick: () => this.addModal2(),
          defaultButton: true,
        },
        { label: 'Back', onClick: modalPop, left: true },
      ],
      onEsc: modalPop,
    });
  }

  addModal2() {
    const name = this.refName.getValue();
    const title = name ? `Nice to meet you, ${name}!` : 'Nice to meet you!';
    const children = (
      <div>
        Modals can be scrolled:<br />
        <br />
        <p>{LONG_TEXT}</p>
        <p>{LONG_TEXT}</p>
        <p>{LONG_TEXT}</p>
        <p>{LONG_TEXT}</p>
        <p>{LONG_TEXT}</p>
      </div>
    );
    modalPush({
      title,
      children,
      buttons: [{ label: 'Back', onClick: modalPop, defaultButton: true }],
      onEsc: modalPop,
      style: { width: 500 },
    });
  }
}

class HintDemo extends React.Component {
  componentDidMount() {
    hintDefine('hintExample', {
      elements: () => {
        const out = [];
        const ref = this.refs.buttonShowHint;
        if (ref) {
          const bcr = ref.getBoundingClientRect();
          const x = bcr.right + 90;
          const fTop = bcr.top > 130;
          const y = fTop ? bcr.top - 80 : bcr.bottom + 80;
          out.push({
            type: 'LABEL',
            x,
            y,
            children: 'Just shows a pre-defined hint',
          });
          out.push({
            type: 'ARROW',
            from: { x, y },
            to: {
              x: (bcr.left + bcr.right) / 2,
              y: fTop ? bcr.top - 5 : bcr.bottom + 5,
            },
            counterclockwise: fTop,
          });
        }
        return out;
      },
    });
  }
  render() {
    return (
      <span ref="buttonShowHint">
        <Button onClick={() => hintShow('hintExample', true)}>
          <Icon icon="hand-scissors-o" />&nbsp; Show me an example
        </Button>
      </span>
    );
  }
}

const Buttons = ({ fIncludeDisabled }) => (
  <Centered>
    <Button
      onClick={() =>
        createNotif({
          icon: 'cutlery',
          msg: 'What about some sushi?',
        })
      }
    >
      <Icon icon="lightbulb-o" /> Inspire me!
    </Button>&nbsp;&nbsp;
    <Button
      onClick={() =>
        createNotif({
          type: 'success',
          icon: 'heart',
          msg: "You're welcome!",
        })
      }
      plain
    >
      OK, thanks!
    </Button>&nbsp;&nbsp;
    {fIncludeDisabled && <Button disabled>I&#39;m disabled</Button>}
  </Centered>
);

const Icons = () => (
  <Centered>
    <Icon size="2x" icon="globe" />&nbsp;&nbsp;
    <Icon size="2x" icon="group" />&nbsp;&nbsp;
    <Icon size="2x" icon="hand-spock-o" />&nbsp;&nbsp;
    <Icon size="2x" icon="music" />&nbsp;&nbsp;
    <Icon size="2x" icon="cog" spin />&nbsp;&nbsp;
    <Spinner size="2x" />
  </Centered>
);

class LargeMessages extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0 };
  }
  componentDidMount() {
    setInterval(() => {
      this.setState({ value: this.state.value + 1 });
    }, 4000);
  }
  render() {
    let el;
    switch (this.state.value % 3) {
      case 0:
        el = (
          <span>
            <Icon icon="exclamation-circle" /> No matches found
          </span>
        );
        break;
      case 1:
        el = (
          <span>
            Use the <Icon icon="cog" spin /> button to configure the application
          </span>
        );
        break;
      case 2:
        el = (
          <span>
            <Icon icon="bars" /> Choose one of the options above
          </span>
        );
        break;
      default:
        break;
    }
    return <LargeMessage style={{ minHeight: 110 }}>{el}</LargeMessage>;
  }
}

class ProgressDemo extends React.Component {
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
      <Centered>
        <Progress value={this.state.value} />
        <Progress />
      </Centered>
    );
  }
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
const Markdown = ({ md }) => (
  <div dangerouslySetInnerHTML={{ __html: marked(md) }} />
);
const CenteredFlex = ({ style, children }) => (
  <div
    className="giu-demo-flex-row"
    style={flexContainer(
      'row',
      merge(
        {
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 8,
        },
        style
      )
    )}
  >
    {children}
  </div>
);
const Centered = ({ children }) => (
  <div style={{ textAlign: 'center', marginBottom: 8 }}>{children}</div>
);

const getExampleItems = ({ fSeparator, fKeys, modifier } = {}) => {
  const out = [
    { label: 'Apples', value: 'apples' },
    { label: 'Cherries', value: 'cherries' },
    { label: 'Peaches', value: 'peaches' },
    { label: 'Blueberries', value: 'blueberries' },
  ];
  if (fKeys) {
    out[0].keys = `${modifier}+a`;
    out[1].keys = [`${modifier}+h`, `${modifier}+e`];
    out[2].keys = `${modifier}+p`;
    out[3].keys = `${modifier}+b`;
  }
  if (fSeparator) out.splice(2, 0, LIST_SEPARATOR);
  return out;
};

// // Normal render
// if (typeof document !== 'undefined') {
//   const mainEl = <App md={window.appBootstrap.md} />;
//   ReactDOM.render(mainEl, document.getElementById('app'));
//
//   // SSR
// } else {
//   module.exports = function render(locals, callback) {
//     const mainEl = <App md={locals.readme} />;
//     const ssrBootstrap = `
//       <script>
//         window.appBootstrap = ${JSON.stringify({ md: locals.readme })}
//       </script>
//     `.trim();
//     const ssrHtml = ReactDOMServer.renderToString(mainEl);
//     /* eslint-disable prefer-template */
//     const ssrCss =
//       require('giu/lib/all.css') +
//       '\n' +
//       require('highlight.js/styles/github.css');
//     /* eslint-enable prefer-template */
//     let rendered = locals.template;
//     rendered = rendered.replace('<!-- ssrBootstrap -->', ssrBootstrap);
//     rendered = rendered.replace('<!-- ssrHtml -->', ssrHtml);
//     rendered = rendered.replace('<!-- ssrCss -->', ssrCss);
//     callback(null, rendered);
//   };
// }

// -----------------------------------------------
// Public
// -----------------------------------------------
class AppWrapper extends React.Component {
  static async getInitialProps({ req }) {
    const out = {};
    if (req) {
      const extractDocs = require('extract-docs'); // eslint-disable-line
      out.readmeMarkdown = extractDocs({
        template: '../../docsPrivate/templates/README.md',
        basePath: '../..',
        missingRefs: true,
        skipConditional: true,
      });
      out.baseUrl = process.env.BASE_URL || '';
    }
    return out;
  }

  render() {
    const { baseUrl } = this.props;
    return (
      <div>
        <Head>
          <title>Giu by guigrpa | docs and demo</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/font-awesome/css/font-awesome.min.css`}
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/typeface-gloria-hallelujah/index.css`}
          />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:400,700"
            rel="stylesheet"
            type="text/css"
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/stylesheets/normalize.css`}
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/stylesheets/stylesheet.css`}
          />
          <link
            rel="icon"
            type="image/ico"
            href={`${baseUrl}/static/favicon.ico`}
          />
        </Head>
        <App md={this.props.readmeMarkdown} />
        <style jsx global>{`
          .giu-date-time-picker {
            font-size: 14px !important;
          }
          .giu-demo-flex-row > * {
            margin-right: 1em;
          }
          body {
            background-color: #f4f4f4;
          }
        `}</style>
      </div>
    );
  }
}

export default AppWrapper;
