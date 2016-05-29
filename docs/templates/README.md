# Giu [![npm version](https://img.shields.io/npm/v/giu.svg)](https://www.npmjs.com/package/giu)

An opinionated Swiss-army knife for building React application GUIs.

Online demos: [an extremely compact one](http://guigrpa.github.io/giu/demo/demo1.html)

## Why?

- Improvements over native HTML inputs: (optional) [state delegation](#inputs), [comprehensive validation](#input-validation), [native JS types and nullability](#input-value-types).
- Support for **Server-Side Rendering**.
- Support for **i18n**: error messages, date inputs, etc.
- Love for detail:
    + [Stackable modals](#modals) with autofocus, default buttons, etc.
    + Sticky/retainable [notifications](#notifications)
    + [Keyboard shortcuts](#select) (cmd/ctrl-J, shift-up...) for options in selects and drop-down menus
    + Keyboard navigation for (almost) everything
    + Automatic scroll-into-view when inputs, even custom ones, are focused
    + Smart positioning of floating pickers (date and color inputs, drop-down menus, validation errors, etc.)
    + Ultra-customisable [date/time inputs](#dateinput)
    + Textarea with auto-resize
    + Uniform, lightweight styles with key accents that can easily be overriden
    + ... and a gorgeous [analog time picker](#dateinput)!
- Easy creation of [hint screens](#hint-screens) with dynamically-positioned labels and arrows
- Lots of [helper functions](#helpers)


## Installation

Giu is intended to be bundled with [*webpack*](https://webpack.github.io/), so it is recommended to include it in your `devDependencies`:

```
$ npm install --save-dev giu
```

Make sure you also install the required `peerDependencies` ([*react*](https://github.com/facebook/react), [*react-addons-pure-render-mixin*](https://www.npmjs.com/package/react-addons-pure-render-mixin) and [*moment*](https://github.com/moment/moment)).

Installation notes: 

* Many Giu components (including all inputs) require that you **include the `<Floats />` component at (or near) the root level of your React tree**. No props are required. If you forget it, you'll see a warning in the console and the components will not work correctly.

* Why is *moment* part of `peerDependencies` and not `dependencies`? For i18n reasons: we want to make sure the user's `moment` object and the one used internally by Giu are exactly the same, so that `DateInput`'s strings and other locale-specific attributes (e.g. first day of the week) are shown correctly. If the version specified by the user and by Giu were incompatible, we would end up with two different `moment` objects.

* *Moment* drags into your production bundle a lot of i18n resources which you probably don't need. Whitelist the languages bundled by Webpack doing something like this (webpack.config.js):

```js
const MOMENT_LANGS = ['en-gb', 'ca', 'es', 'de'];
module.exports = {
  // ...
  plugins: [
    // ..
    new webpack.ContextReplacementPlugin(
      /moment[\\\/]locale$/,
      new RegExp(`.[\\\/](${MOMENT_LANGS.join('|')})`)
    ),
  ],
}
```

## Inputs

Giu provides a wide variety of inputs and several useful abstractions over native HTML native elements: state delegation (optional), comprehensive validation, JS types and nullability.

You'll understand the benefits it brings with an example. Let's say you want to build a form that allows users to modify certain parameters of their registration profile, e.g. their age. With native HTML inputs, you'd use something like this:

```js
<input type="number" id="age"
  min={0} step={1}
  value={this.state.age} onChange={age => this.setState({ age: Number(age) })}
/>
```

It seems simple, right? But in reality you are handling a lot of stuff yourself:

* You must keep track of the original `age` value in the profile (let's assume it was received as `this.props.age`), as well as the modified user value (`this.state.age`).
* You must provide an `onChange` handler and keep your state up to date.
* You must convert back and forth between the input's `string` value and your `number` attribute.
* You must validate input contents before submitting the form.

You *could* use Giu in a similar way:

```js
<NumberInput id="age" 
  min={0} step={1}
  value={this.state.age} onChange={(ev, age) => this.setState({ age })}
/>
```

This approach follows *The React Way™*, but we're already seeing a first benefit: the `onChange` handler will be called (in addition to the native event) with the *converted* input value: either a number or `null`; no need to do the conversion ourselves.

But we can further improve on this:

```js
<NumberInput ref="age" /* or: ref={c => { this.refAge = c; }}*/
  min={0} step={1}
  value={this.props.age}
  required validators={[isGte(18)]}
/>
```

What's happened here? We only pass the original age as `value`, but we delegate keeping track of the value entered by the user. We also drop the `onChange` handler and add some `validators` (see [details below](#input-validation)). When the time comes to submit the form, we can do:

```js
onClickSubmit() {
  this.refs.age.validateAndGetValue().then(age => { ... })
}
```

The promise returned by `validateAndGetValue()` will either resolve with the current value or reject if validation fails.


### Input value types

Most HTML inputs can only hold strings. Giu inputs provide you with JS types and allow `null` values by default (include the `required` flag to change that):

| Components | JS type |
| --- | --- |
| TextInput, PasswordInput, Textarea | *string* |
| NumberInput, RangeInput | *number* |
| Checkbox | *boolean* |
| DateInput | *Date* (see full range of date/time possibilities below) |
| Select, RadioGroup | *any* (depends on the values specified in the `items` prop, see below) |
| ColorInput | *string* (8-digit hex color code) |
| FileInput | *File* |


### Input validation

#### Predefined validators

Some validators are enabled by default:

```js
// Shows an error if the provided value is an invalid date.
// Will NOT complain if left blank; by default, Giu inputs can be left blank.
<DateInput />
```

![Validator screenshot](https://raw.githubusercontent.com/guigrpa/giu/master/docs/Validator1.png)

Validation occurs automatically when the input loses focus (i.e. on `blur`). You can also trigger it imperatively by calling `validateAndGetValue()` (see [Imperative API](#imperative-api)).

Enabling additional validators is easy:

```js
// Shows an error if left blank ('is required')
// OR if the format is not valid ('must be a valid date...').
<DateInput required />

// Shows an error only if a value is specified but it's not valid.
<TextInput validators={[isEmail()]} />
<NumberInput validators={[isGte(5), isLte(10)]} />
```

Here is the list of predefined validators, with some examples:

[[[./src/gral/validators.js]]]

As we saw above, some of these validators are automatically enabled for certain components, e.g. `isDate()` in DateInputs and `isNumber()` in NumberInputs. However, you can include them in your `validators` list for customization (e.g. i18n), as you'll see next.


#### Custom validators

Customize a predefined validator by passing it an additional argument upon instantiation. This argument can be a string or a function returning the desired error message (e.g. for i18n) based on the following arguments:

* Default error message
* Current (internal) input value
* Extra context, including the validator arguments (e.g. the `min` and `max` values for `isWithinRange`) and additional information (e.g. the expected format `fmt` for date/time values).

Some examples:

```js
// Override the message for the `isEmail` validator
<TextInput validators={[
  isEmail("please write your email address (it's safe with us!)"),
]} />

// Override the message for the `required` validator
<TextInput validators={[isRequired('please write your name')]} />

// Specify a function to further customize/translate your message
import i18n from 'mady';  // a translation function
<TextInput validators={[
  isEmail((defaultMsg, value) => i18n("'{VALUE}' is not a valid email address", { VALUE })),
]} />

// The error message function may use the extra context parameter:
<DateInput validators={[
  isDate((defaultMsg, value, { fmt }) => `follow this format: ${fmt}`),
]} />
<NumberInput validators={[
  isGte(15, (defaultMsg, value, { min }) => i18n('must be >= {MIN}', { MIN: min })),
]} />
```

You can also create your own validators, which can be synchronous (returning an error message) or asynchronous (returning a promise of an error message) and should have this signature:

* **value** *any?*: the current internal value of the input component
* **props** *object*: the input component's props (including default props)
* **context** *object?*: additional validator context provided by certain components. For example, `DateInput` injects the `moment` object via context
* **Returns** *Promise(string?)|string?*: error message

A couple of examples:

```js
// A custom sync validator
<TextInput required validators={[
  val => val.toLowerCase() === 'unicorn' ? undefined : 'must be a \'unicorn\''
]} />

// A custom async validator
<TextInput required validators={[
  val => new Promise((resolve, reject) =>
    setTimeout(() => 
      val.toLowerCase() === 'unicorn'
        ? resolve()
        : resolve('checked the database; you must be a \'unicorn\'')
    , 1000)
  ),
]} />
```


### Imperative API

Giu generally follows *The React Way™*. In some particular cases, however, you may need or prefer a more imperative style:

1. Validate and fetch an input value before submitting a form
2. Move focus to an input, or away from it
3. Set an input's value (without affecting the original, reference value in the `value` prop) or revert the input state to the `value` prop

You have already seen how to accomplish task 1, via a direct component call. Assuming you keep a `ref` to the input component:

```js
onClickSubmit() {
  this.refs.age.validateAndGetValue().then(age => { ... })
}
```

This is the only truly *imperative* API provided by Giu, provided for convenience.

Tasks 2 and 3 above are managed via a *pseudo-imperative* API, the `cmds` prop, an array of commands that are executed by the so-called Input Higher-Order Component (HOC). Commands are plain objects with a `type` attribute, plus other attributes as needed. Currently supported commands are:

* `SET_VALUE`: change the current input state (without affecting the original `value` prop). The new value is passed in the command object as `value`.
* `REVERT`: revert the current input state to the original `value` prop.
* `FOCUS`, `BLUR`: move the focus to or away from the input component.

*Important note: Commands in the `cmds` prop are executed when a new array is passed down (strict equality is checked). Take this into account so that your commands are not executed more than once!*


### Common input props

* Basic (see also the [introduction to inputs](#inputs)):
    * **value** *any?*: either the original value to be modified by the user, or the current input value (if you want to manage state yourself). See also the list of [input value types](#input-value-types)
    * **onChange** *function?*: include it if you want to manage state yourself, or if you just want to be informed about user changes
    * **onFocus** *function?*
    * **onBlur** *function?*
    * **disabled** *boolean?*: prevents the input from being interacted with; also affects styles
    * **cmds** *array(object)?*: see [Imperative API](#imperative-api)
* Validation-related (see also [input validation](#input-validation)):
    * **required** *boolean?*: synonym for the `isRequired()` validator
    * **validators** *array(object|function)?*: objects are used for predefined validators, whereas functions are used for custom ones
    * **noErrors** *boolean?*: ignore validation altogether
* Float-related (for all inputs with floating pickers, e.g. Select, DateInput, ColorInput):
    * **floatPosition** *string(`above`|`below`)?*: if unspecified, a suitable position is selected algorithmically
    * **floatAlign** *string(`left`|`right`)? = `left`*: if unspecified, a suitable position is selected algorithmically
    * **floatZ** *number? = 5*
* Error-float-related:
    * **errorPosition** *string(`above`|`below`)?*: if unspecified, Giu chooses `below` except if `floatPosition` is specified (it then chooses the opposite position)
    * **errorAlign** *string(`left`|`right`)? = `left`*
    * **errorZ** *number?*: if unspecified, Giu chooses a suitable z-index algorithmically


### Specific input props

#### TextInput, PasswordInput, NumberInput, RangeInput, Textarea

*Note: out of the box, Textarea resizes automatically as needed. You can limit its maximum height by adding a `style` prop: e.g. `style={{ maxHeight: 100 }}`*

[[[./src/inputs/textNumberRangeInput.js]]]

#### Checkbox

[[[./src/inputs/checkbox.js]]]

#### DateInput

Shown below are some examples of DateInput, one of Giu's most versatile components: date/time/date-time modes, with or without drop-down pickers, inline pickers, custom accent color, digital/analogue time picker, disabled style... Not shown: keyboard navigation, clipboard events.

![DateInput screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/DateInputs.png)

If you use [*moment*](https://github.com/moment/moment), your date picker and date/time formats will be automatically translated when you choose a different locale, e.g. `moment.locale('es')`:

![Translated date picker](https://raw.githubusercontent.com/guigrpa/giu/master/docs/DateInput-i18n.png)

[[[./src/inputs/dateInput.js]]]

#### Select

Shown below are some examples of Select and its features: `native` and custom (`inlinePicker`|`dropDownPicker`) versions, keyboard shortcuts, custom accent color, disabled style. Not shown: keyboard navigation, clipboard events, automatic scrolling.

![Select screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/Selects2.png)

*Recommendation: use `dropDownPicker` for performance, especially if you have hundreds/thousands of Selects with many options: `native` Selects attach all of their `option` subelements to the page, whereas custom Selects only do that when the dropdown is shown.*

[[[./src/inputs/select.js]]]

#### RadioGroup

[[[./src/inputs/radioGroup.js]]]

#### ColorInput

Shown below are some examples of ColorInput and its features: inline and drop-down versions, RGB and HSV pickers, transparency slider, custom accent color, disabled style. Not shown: clipboard events.

![ColorInput screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/ColorInputs.png)

[[[./src/inputs/colorInput.js]]]

#### FileInput

[[[./src/inputs/fileInput.js]]]

## DropDownMenu

![DropDownMenu screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/DropDownMenu.png)

[[[./src/components/dropDownMenu.js]]]

## Modals

![Modal screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/Modal.png)

[[[./src/components/modals.js]]]

## Notifications

![Notifications screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/Notification.png)

[[[./src/components/notifications.js]]]

## Hint screens

Hint screens give tips on how to use your application, through
a combination of labels (icons, images, text) and dynamically-positioned
arrows. You can show hint screens, for example, when the user reaches a
certain part of your application or performs an action for the first time.

![Hint screen screenshots](https://raw.githubusercontent.com/guigrpa/giu/master/docs/Hints.png)

[[[./src/components/hints.js]]]


## Tiny little things

### Button

[[[./src/components/button.js]]]

### Icon and Spinner

[[[./src/components/icon.js]]]

`Spinner` is a convenient shortcut for an `Icon` that, well, spins.

### LargeMessage

[[[./src/components/largeMessage.js]]]

### Progress

[[[./src/components/progress.js]]]


## Higher-order components (HOCs)

[HOCs](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750#.v1zqfc63a) are used internally by Giu components and are also provided in the user API. They work fine with all kinds of base components: [ES6 classes](https://facebook.github.io/react/docs/reusable-components.html#es6-classes), [plain-old `createClass`-style components](https://facebook.github.io/react/docs/multiple-components.html#composition-example) and [stateless functions](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions).

Example usage:

```js
import { hoverable } from 'giu';
import { Component } from 'react';

class MyReactComponent extends Component {
    /* ... */
}

export default hoverable(MyReactComponent);
```

### Hoverable HOC

[[[./src/hocs/hoverable.js]]]


## Helpers

You can find here a wide variety of helper functions, from the very simple (`cancelEvent()`, `flexContainer()`) to the relatively complex (`scrollIntoView()`). This is just an opinionated collection of hopefully useful bits and pieces for building React components.

### DOM node visibility helpers

[[[./src/gral/visibility.js]]]

### Style helpers

[[[./src/gral/styles.js]]]

### Miscellaneous helpers

[[[./src/gral/helpers.js]]]

[[[./src/gral/constants.js]]]


## [Changelog](https://github.com/guigrpa/giu/blob/master/CHANGELOG.md)


## License (MIT)

Copyright (c) [Guillermo Grau Panea](https://github.com/guigrpa) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
