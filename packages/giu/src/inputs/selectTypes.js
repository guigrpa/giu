// @flow

import type { FloatPosition, FloatAlign } from '../components/floats';
import type { Choice } from '../gral/types';

// -- Props:
// -- START_DOCS
export type SelectProps = {
  // Both SelectCustom and SelectNative
  // ----------------------------------
  className?: string,
  id?: string,
  type: SelectPickerType, // see below (default: 'native')
  // Items with the following attributes:
  // - **value** *any*: any value that can be converted to JSON. Values should be unique
  // - **label** *string*: descriptive string that will be shown to the user
  // - **keys** *array(string)?*: keyboard shortcuts for this option, e.g.
  //   `mod+a` (= `cmd+a` in OS X, `ctrl+a` in Windows), `alt+backspace`, `shift+up`...
  //   **Only supported in non-native Selects**
  items: Array<Choice>,
  lang?: string, // current language (used just for force-render).
  // Apart from its use for [validation](#input-validation),
  // enabling this flag disables the addition of a `null` option to the `items` list
  required?: boolean,
  disabled?: boolean,

  // SelectCustom only
  // -----------------
  children?: any,
  onClickItem?: Function,
  onCloseFloat?: Function,
  floatPosition?: FloatPosition,
  floatAlign?: FloatAlign,
  floatZ?: number,
  // When enabled, two different visual styles are applied
  // to an item depending on whether it is just *hovered* or also *selected*. If disabled,
  // a single style is used to highlight the selected or the hovered item
  twoStageStyle?: boolean,
};

export type SelectPickerType = 'native' | 'inlinePicker' | 'dropDownPicker';
// -- END_DOCS

/* --
You can also include a separator between `items` by including the special
`LIST_SEPARATOR` item (**only in non-native Selects**):

```js
import { Select, LIST_SEPARATOR } from 'giu';

<Select required items={[
  { value: 'apples', label: 'Apples', keys: 'alt+a' },
  { value: 'cherries', label: 'Cherries', keys: ['alt+h', 'alt+e'] },
  LIST_SEPARATOR,
  { value: 'peaches', label: 'Peaches', keys: 'alt+p' },
  { value: 'blueberries', label: 'Blueberries', keys: 'alt+b' },
]} />
```
-- */
