# giu [![npm version](https://img.shields.io/npm/v/boilerplate.svg)](https://www.npmjs.com/package/boilerplate)

## What?

A collection of React components and utilities.
**WORK IN PROGRESS**

## Why?

TBW


## How?

### Installation

```
$ npm install --save-dev giu
```

It is recommended to include **giu** among your `devDependencies`, since 


### Higher-order components (HOCs)

Example usage:

```js
import { hoverable } from 'giu';
import { Component } from 'react';

class MyReactComponent extends Component {
    /* ... */
}

export default hoverable(MyReactComponent);
```

HOCs also work fine with functional React components.

#### Hoverable

Keeps track of `hovering` state and passes it as prop to your base
component. Provides `onHoverStart`/`onHoverStop` event handlers
you can attach to any of your base component's DOM elements
(works for multiple elements).
If you attach these handlers to an element with an `id` attribute,
the provided `hovering`
prop will contain the ID of the hovered element (or `null`), otherwise
just `true` (or `null`).

Specific props received from the parent (all other props are
passed down):

* *Function* **[onHoverStart]**: relays the original event to
  the parent component.
* *Function* **[onHoverStop]**: relays the original event to
  the parent component.

Additional props passed to the base component:

* *String|Number|Boolean?* **hovering**: identifies the
  element that is hovered (see description above), or `null` if none
* *Function* **onHoverStart**: `onMouseEnter` event handler you can attach to
  your target DOM elements
* *Function* **onHoverStop**: `onMouseLeave` event handler you can attach to
  your target DOM elements


## [What's changed since version X?](https://github.com/guigrpa/mady/blob/master/CHANGELOG.md)


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
