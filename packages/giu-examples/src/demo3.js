/* eslint-disable no-console */
/* eslint-disable react/no-multi-comp, react/no-did-mount-set-state */

import 'babel-polyfill'; // eslint-disable-line
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import {
  Floats,
  Notifications,
  DataTable,
  TextInput,
  DateInput,
  Select,
  Checkbox,
  Icon,
  notify,
  flexContainer,
  flexItem,
  Button,
} from 'giu';
import faker from 'faker';
import throttle from 'lodash/throttle';

const SIDEBAR_WIDTH = 200;
const TOP_HEIGHT = 80;
const NAVBAR_HEIGHT = 50;
const DATATABLE_HEADER_HEIGHT = 40;

// ================================================
// App
// ================================================
const App = () => (
  <div style={style.outer}>
    <Floats />
    <Notifications />
    <Top />
    <Sidebar />
    <Navbar />
    <Contents />
  </div>
);

const Top = () => <div style={style.top}>Top</div>;
const Sidebar = () => (
  <div style={style.sidebar}>
    <div style={style.section}>Section 1</div>
    <div style={style.section}>Section 2</div>
    <div style={style.section}>Section 3</div>
    <div style={style.section}>Section 4</div>
    <div style={style.section}>Section 5</div>
    <div style={style.section}>Section 6</div>
    <div style={style.section}>Section 7</div>
    <div style={style.section}>Section 8</div>
  </div>
);
const Navbar = () => <div style={style.navbar}>Navbar</div>;

class Contents extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedIds: [],
      changedRows: {},
      cntKey: 0,
      hasChanged: false,
    };
    this.itemsById = sampleDataTableItems(1000, 0);
    this.inputRefs = {};
  }

  render() {
    return (
      <div style={style.contents}>
        <div style={{ marginBottom: 10 }}>
          <Button disabled={!this.state.selectedIds.length} onClick={this.onSubmit}>
            <Icon icon="check" />{' '}Submit selected
          </Button>{' '}
          <Button disabled={!this.state.hasChanged} onClick={this.onRevert}>
            <Icon icon="remove" />{' '}Revert changes
          </Button>
        </div>
        <div style={style.contentTable}>
          <AutoHeight>
            {height =>
              <DataTableExample
                key={this.state.cntKey}
                itemsById={this.itemsById}
                alwaysRenderIds={Object.keys(this.state.changedRows)}
                registerInputRef={this.registerInputRef}
                onChangeSelection={this.onChangeSelection}
                onChange={this.onChange}
                height={height}
              />}
          </AutoHeight>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  registerInputRef = (id, attr, ref) => {
    if (!this.inputRefs[id]) this.inputRefs[id] = {};
    this.inputRefs[id][attr] = ref;
  };

  onChangeSelection = ids => {
    this.setState({ selectedIds: ids });
  }

  onChange = id => {
    const { changedRows } = this.state;
    changedRows[id] = true;
    this.setState({ changedRows, hasChanged: true });
  };

  onSubmit = async () => {
    const id = this.state.selectedIds[0];
    const data = {};
    try {
      await Promise.all(
        COLLECT_FIELDS_ON_SUBMIT.map(async attr => {
          const rowRefs = this.inputRefs[id];
          if (!rowRefs) return;
          const ref = rowRefs[attr];
          if (!ref) {
            console.warn(`No ref for attribute ${attr}`);
            return;
          }
          data[attr] = await ref.validateAndGetValue();
        })
      );
      const msg = `name: ${data.name}, phone: ${data.phone}...`;
      notify({
        type: 'success',
        icon: 'check',
        title: 'Updated!',
        msg,
      });
    } catch (err) {
      notify({
        type: 'error',
        icon: 'warning',
        title: 'Could not update',
        msg: 'Check for validation errors',
      });
    }
  };

  onRevert = async () => {
    this.setState({ cntKey: this.state.cntKey + 1, hasChanged: false });
  };
}

// ================================================
// AutoHeight
// ================================================
// AutoHeight MUST BE the direct child of an element with an "extrinsic"
// height (ie. a height that is not determined by its children, but rather
// by its parents, e.g. a flex item with "overflow: hidden")
class AutoHeight extends React.Component {
  constructor() {
    super();
    this.state = { height: undefined };
    this.throttledRecalcHeight = throttle(this.recalcHeight, 100);
  }

  componentDidMount() {
    window.addEventListener('resize', this.throttledRecalcHeight);
    this.recalcHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledRecalcHeight);
  }

  recalcHeight = () => {
    const node = this.refOuter;
    if (node) this.setState({ height: node.parentNode.clientHeight });
  };

  render() {
    return (
      <div
        ref={c => {
          this.refOuter = c;
        }}
      >
        {this.props.children(this.state.height)}
      </div>
    );
  }
}

// ================================================
// DataTable example
// ================================================
const COLLECT_FIELDS_ON_SUBMIT = [
  'name',
  'type',
  'lastModified',
  'confirmed',
  'phone',
];
const USER_TYPES = [
  { value: 'Guest', label: 'Guest' },
  { value: 'User', label: 'User' },
];

class DataTableExample extends React.Component {
  props: {
    itemsById: Object,
    alwaysRenderIds: Array<string>,
    registerInputRef: Function,
    onChange: Function,
    onChangeSelection: Function,
    height: ?number,
  };

  constructor(props) {
    super(props);
    this.state = { changedRows: {} };
    const { registerInputRef, onChange } = props;
    this.commonCellProps = { registerInputRef, onChange };
  }

  // -----------------------------------------------
  render() {
    const { height, itemsById } = this.props;
    const finalHeight = height ? height - DATATABLE_HEADER_HEIGHT : undefined;
    return (
      <DataTable
        itemsById={itemsById}
        shownIds={Object.keys(itemsById)}
        alwaysRenderIds={this.props.alwaysRenderIds}
        cols={this.getCols()}
        commonCellProps={this.commonCellProps}
        onChangeSelection={this.props.onChangeSelection}
        height={finalHeight}
        uniformRowHeight
        accentColor="lightgray"
        styleHeader={{ height: DATATABLE_HEADER_HEIGHT }}
      />
    );
  }

  getCols() {
    return [
      {
        attr: 'name',
        minWidth: 150,
        flexGrow: 1,
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <TextInput
            ref={c => registerInputRef(id, attr, c)}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            skipTheme
            style={{ width: '100%' }}
          />
        ),
      },
      {
        attr: 'type',
        minWidth: 150,
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <Select
            ref={c => registerInputRef(id, attr, c)}
            type="dropDownPicker"
            items={USER_TYPES}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            styleOuter={{ width: '100%' }}
            styleTitle={{ width: '100%' }}
          />
        ),
      },
      {
        attr: 'lastModified',
        minWidth: 150,
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <DateInput
            ref={c => {
              registerInputRef(id, attr, c);
            }}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            skipTheme
            style={{ width: '100%' }}
          />
        ),
      },
      {
        attr: 'confirmed',
        labelLevel: 1,
        minWidth: 30,
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <Checkbox
            ref={c => registerInputRef(id, attr, c)}
            value={item[attr]}
            onChange={() => onChange(id)}
          />
        ),
      },
      {
        attr: 'phone',
        minWidth: 150,
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <TextInput
            ref={c => registerInputRef(id, attr, c)}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            skipTheme
            style={{ width: '100%' }}
          />
        ),
      },
    ];
  }
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const style = {
  outer: {
    fontSize: 16,
    height: '100vh',
    width: '100vw',
    paddingTop: TOP_HEIGHT + NAVBAR_HEIGHT,
    paddingLeft: SIDEBAR_WIDTH,
    paddingRight: 0,
    paddingBottom: 0,
  },
  contents: flexContainer('column', {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    padding: 10,
    overflowX: 'hidden',
    overflowY: 'auto',
    fontSize: 12,
  }),
  contentTable: flexItem(1, {
    overflow: 'hidden',
  }),
  top: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: TOP_HEIGHT,
    width: '100vw',
    padding: 10,
    // backgroundColor: '#903090',
    backgroundColor: '#909090',
    color: 'white',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    height: '100vh',
    width: SIDEBAR_WIDTH,
    padding: `${TOP_HEIGHT + 10}px 10px 10px 10px`,
    backgroundColor: '#dddddd',
  },
  navbar: {
    position: 'fixed',
    top: TOP_HEIGHT,
    left: 0,
    height: NAVBAR_HEIGHT,
    width: '100vw',
    zIndex: -2,
    padding: `10px 10px 10px ${SIDEBAR_WIDTH + 10}px`,
    backgroundColor: '#eeeeee',
  },
  section: {
    marginBottom: 10,
  },
};

// ================================================
// Helpers
// ================================================
const sampleDataTableItems = (num, idStart = 0) => {
  const out = {};
  for (let i = 0; i < num; i++) {
    const id = String(idStart + i);
    const name = i === 0 ? 'Mª Antonia Pérez Ñandú' : faker.name.findName();
    out[id] = {
      id,
      name,
      age: 20 + Math.ceil(Math.random() * 10),
      confirmed: Math.random() > 0.5,
      phone: faker.phone.phoneNumber(),
      lastModified: new Date(),
      type: Math.random() > 0.5 ? 'Guest' : 'User',
      notes: faker.lorem.sentences(2).split('\n').join(' '),
    };
  }
  return out;
};

// ================================================
// Render main
// ================================================
const mainEl = <App />;

// Normal render
if (typeof document !== 'undefined') {
  ReactDOM.render(mainEl, document.getElementById('app'));

  // SSR
} else {
  module.exports = function render(locals: Object, callback: Function) {
    const ssrHtml = ReactDOMServer.renderToString(mainEl);
    /* eslint-disable global-require */
    const ssrCss = require('giu/lib/all.css');
    /* eslint-enable global-require */
    let rendered = locals.template;
    rendered = rendered.replace('<!-- ssrHtml -->', ssrHtml);
    rendered = rendered.replace('<!-- ssrCss -->', ssrCss);
    callback(null, rendered);
  };
}
