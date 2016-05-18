# Giu [![npm version](https://img.shields.io/npm/v/giu.svg)](https://www.npmjs.com/package/giu)

## What?

A collection of React components and utilities.
**WORK IN PROGRESS**

## Why?

- Flexibility:
    + If you use the ES6 sources and Webpack 2, you can bundle only the components you need, nothing more. For example, if you `import Modal`, you will not embed Redux, which you will if you `import Modals`.
    + If you need a simple confirmation modal, use `Modal` directly. If you need stacked modals and more state control, include a `Modals` component at the top of your app and use the provided API. If you need even more control, use the exported `modalReducer` and `modalActions` (action creators) with your own application's Redux store. Same for `Notifications`and `Floats`.
    + In form components (`TextInput`, `Select`, `Textarea`...), choose whether you want Giu to handle state for you (and then retrieve the component's value when e.g. the user clicks on Submit) or you want full control from outside.
    + Styles: lightweight styles are included for some components, but you can always customise the appearance including your own `style` attributes.
- Nice touches:
    + Textarea with auto-resize
    + Keyboard shortcuts, autofocus, default buttons on Modals
    + Sticky/retainable notifications
- Completeness:
    + Basic components: Button, Icon, Spinner, LargeMessage...
    + Form components: TextInput, NumberInput, Select, Textarea, Checkbox...
    + Not-so-basic ones: Modal(s), Notification(s)...
    + Higher-order components: Hoverable
    + Style helpers: ...
    + Other helpers: ...

## How?

### Installation

Giu is intended to be bundled with [*webpack*](https://webpack.github.io/), so it is recommended to include it in your `devDependencies`:

```
> npm install --save-dev giu
```

Make sure you also install the required `peerDependencies` ([*react*](https://github.com/facebook/react), [*react-addons-pure-render-mixin*](https://www.npmjs.com/package/react-addons-pure-render-mixin) and [*moment*](https://github.com/moment/moment)).

Installation notes: 

* *moment* will not be included in your production bundle if you don't use `DateInput` and set up *webpack*'s' [*tree shaking*](http://www.2ality.com/2015/12/webpack-tree-shaking.html). However, it should be installed since *webpack* will look for it in development mode.

* Why is *moment* part of `peerDependencies` and not `dependencies`? For i18n reasons: we want to make sure the user's `moment` object and the one used internally by Giu are exactly the same, so that `DateInput`'s strings and other locale-specific attributes (e.g. first day of the week) are shown correctly. If the version specified by the user and by Giu were incompatible, we would end up with two different `moment` objects.

### Components

TBW

### Higher-order components (HOCs)

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

#### Hoverable

[[[./src/hocs/hoverable.js]]]

#### Input

TBW

### Input validation

Some validators are already enabled by default:

```js
// Shows an error if the provided value is an invalid date.
// Will NOT complain if left blank; by default, Giu inputs can be left blank.
<DateInput />
```

Enabling additional validators is also simple:

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

As we saw above, some of these validators are automatically enabled for certain components, e.g. `isDate()` in `DateInput`s and `isNumber()` in `NumberInput`s. However, you can include them in your `validators` list for customization (e.g. i18n), as you'll see next.

Customize a validator by passing it an additional argument upon instantiation. This argument can be a string or a function returning the desired error message (e.g. for i18n) based on the following arguments:

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
import _t from 'mady';  // a translation function
<TextInput validators={[
  isEmail((defaultMsg, value) => _t("'{VALUE}' is not a valid email address", { VALUE })),
]} />

// The error message function may use the extra context parameter:
<DateInput validators={[
  isDate((defaultMsg, value, { fmt }) => `follow this format: ${fmt}`),
]} />
<NumberInput validators={[
  isGte(15, (defaultMsg, value, { min }) => `ha de ser >= ${min}`),
]} />
```

-- custom validators, sync and async

-- on blur


### Helpers

#### Styles

[[[./src/gral/styles.js]]]

#### DOM element visibility

TBW

#### Miscellaneous

[[[./src/gral/helpers.js]]]

[[[./src/gral/constants.js]]]


## [What's changed since version X?](https://github.com/guigrpa/giu/blob/master/CHANGELOG.md)


## Shall I? — The MIT license

Copyright (c) [Guillermo Grau Panea](https://github.com/guigrpa) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
