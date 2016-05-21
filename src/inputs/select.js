import React                from 'react';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';
import SelectNative         from '../inputs/selectNative';
import { SelectCustom }     from '../inputs/selectCustom';

// ==========================================
// Component
// ==========================================
// -- * **type** *string(`native`|`inlinePicker`|`dropDownPicker`)? = `native`*
// -- * **items** *array(object)*: each item has the following attributes:
// --   - **value** *any*: any value that can be converted to JSON. Values should be unique
// --   - **label** *string*: descriptive string that will be shown to the user
// --   - **keys** *array(string)?*: keyboard shortcuts for this option, e.g.
// --     `mod+a` (= `cmd+a` in OS X, `ctrl+a` in Windows), `alt+backspace`, `shift+up`...
// --     **Only supported in non-native Selects**
// -- * **required** *boolean?*: apart from its use for [validation](#input-validation),
// --   enabling this flag disables the addition of a `null` option to the `items` list
// -- * **style** *object?*: merged with the outermost `div` style (if `type` is `inlinePicker`),
// --   or with the `input` style (if `type` is `native`)
// --
// -- You can also include a separator between `items` by including the special
// -- `LIST_SEPARATOR` item (**only in non-native Selects**):
// --
// -- ```js
// -- import { Select, LIST_SEPARATOR } from 'giu';
// -- <Select required items={[
// --   { value: 1, label: '1', keys: ['mod+1'] },
// --   { value: 2, label: '2', keys: ['mod+2'] },
// --   LIST_SEPARATOR,
// --   { value: 3, label: '3', keys: ['mod+3'] },
// --   { value: 4, label: '4', keys: ['mod+4'] },
// -- ]} />
// -- ```
// --
// -- Additional props for non-native Selects:
// -- * **twoStageStyle** *boolean?*: when enabled, two different visual styles are applied
// --   to an item depending on whether it is just *hovered* or also *selected*. If disabled,
// --   a single style is used to highlight the selected or the hovered item
// -- * **accentColor** *string?*: CSS color descriptor (e.g. `darkgray`, `#ccffaa`...)
class Select extends React.Component {
  static propTypes = {
    type:                   React.PropTypes.oneOf([
      'native',
      'inlinePicker',
      'dropDownPicker',
    ]),
    // all others are passed through unchanged
  };
  static defaultProps = {
    type:                   'native',
  };

  constructor(props) {
    super(props);
    bindAll(this, ['registerInputRef']);
  }

  // ==========================================
  // Imperative API
  // ==========================================
  getValue() { return this.refInput ? this.refInput.getValue() : null; }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { type } = this.props;
    const props = omit(this.props, PROP_KEYS);
    const Component = type === 'native' ? SelectNative : SelectCustom;
    const inlinePicker = type === 'inlinePicker';
    return (
      <Component ref={this.registerInputRef}
        {...props}
        inlinePicker={inlinePicker}
      />
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerInputRef(c) { this.refInput = c; }
}

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Select.propTypes);

// ==========================================
// Public API
// ==========================================
export default Select;
