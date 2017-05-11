/* eslint-disable no-console */
/* eslint-disable react/no-multi-comp, react/no-did-mount-set-state */

import 'babel-polyfill'; // eslint-disable-line
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { set as timmSet, merge, omit } from 'timm';
import {
  Floats,
  Notifications,
  DataTable,
  TextInput,
  DateInput,
  Select,
  Checkbox,
  Icon,
  flexContainer,
  flexItem,
  Button,
  HeightMeasurer,
} from 'giu';
import faker from 'faker';

const SIDEBAR_WIDTH = 200;
const TOP_HEIGHT = 80;
const DATATABLE_HEADER_HEIGHT = 40;
const AUTOFOCUS_ATTR = 'name';

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

// ================================================
// External store
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

const createEmptyItem = id => ({
  id,
  confirmed: false,
  type: 'User',
});

let seqCid = 0;

// ================================================
// App, Top, Sidebar
// ================================================
const App = () => (
  <div style={style.app}>
    <Floats />
    <Notifications />
    <Top />
    <Sidebar />
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

// ================================================
// Contents
// ================================================
class Contents extends React.Component {
  constructor() {
    super();
    this.state = {
      // items would normally come from props
      itemsById: sampleDataTableItems(1000, 0),
      isEditing: false,
      isValidating: false,
      isDirty: false,
      selectedIds: [],
      filterValue: '',
      cntKey: 0, // reset datatable by just changing this
    };
    this.inputRefs = {};
    this.commonCellProps = {
      isEditing: this.state.isEditing,
      onChange: this.onChange,
      registerInputRef: this.registerInputRef,
    };
  }

  render() {
    return (
      <div style={style.contents}>
        {this.renderControlStrip()}
        <div style={style.contentTable}>
          <HeightMeasurer>
            {this.renderDataTable}
          </HeightMeasurer>
        </div>
      </div>
    );
  }

  renderControlStrip() {
    const { isEditing, isValidating, isDirty, selectedIds } = this.state;
    return (
      <div style={style.controlStrip}>
        {!isEditing &&
          this.renderButton({
            icon: 'remove',
            label: 'Delete...',
            disabled: !selectedIds.length,
            onClick: this.onDelete,
          })}
        {isEditing &&
          this.renderButton({
            icon: 'chevron-left',
            label: 'Cancel',
            disabled: isValidating,
            onClick: this.onCancel,
          })}
        <div style={flexItem(1)} />
        {!isEditing && this.renderFilter()}
        <div style={style.separator} />
        {!isEditing &&
          this.renderButton({
            icon: 'pencil',
            label: 'Edit',
            disabled: selectedIds.length !== 1,
            onClick: this.onEdit,
          })}
        <div style={style.separator} />
        {!isEditing &&
          this.renderButton({
            icon: 'plus',
            label: 'Create',
            onClick: this.onCreate,
          })}
        {isEditing &&
          this.renderButton({
            icon: 'save',
            label: 'Save',
            disabled: !isDirty,
            onClick: this.onSave,
          })}
      </div>
    );
  }

  renderButton({ icon, label, disabled, onClick }) {
    return (
      <Button disabled={disabled} onClick={onClick}>
        <Icon icon={icon} />{' '}{label}
      </Button>
    );
  }

  renderFilter() {
    return (
      <TextInput
        placeholder="🔍 Quick filter"
        value={this.state.filterValue}
        onChange={(ev, filterValue) => {
          this.setState({ filterValue });
        }}
      />
    );
  }

  // Called by HeightMeasurer
  renderDataTable = height => {
    const { itemsById, isEditing } = this.state;
    const finalHeight = height ? height - DATATABLE_HEADER_HEIGHT : undefined;
    this.commonCellProps = timmSet(
      this.commonCellProps,
      'isEditing',
      isEditing
    );
    return (
      <DataTable
        key={this.state.cntKey}
        itemsById={itemsById}
        shownIds={Object.keys(itemsById)}
        alwaysRenderIds={this.state.selectedIds}
        filterValue={this.state.filterValue}
        cols={this.getCols()}
        commonCellProps={this.commonCellProps}
        headerClickForSorting={!isEditing}
        selectedIds={this.state.selectedIds}
        onChangeSelection={this.onChangeSelection}
        height={finalHeight}
        uniformRowHeight
        accentColor="lightgray"
        styleHeader={style.dataTableHeader}
      />
    );
  };

  getCols() {
    return [
      {
        attr: 'name',
        minWidth: 150,
        flexGrow: 1,
        render: ctx => (
          <TextInput
            ref={c => ctx.registerInputRef(ctx.id, ctx.attr, c)}
            disabled={!(ctx.isEditing && ctx.isItemSelected)}
            value={ctx.item[ctx.attr]}
            onChange={ctx.onChange}
            required
            skipTheme
            style={style.input(ctx.isEditing && ctx.isItemSelected)}
          />
        ),
      },
      {
        attr: 'type',
        minWidth: 150,
        render: ctx => (
          <Select
            ref={c => ctx.registerInputRef(ctx.id, ctx.attr, c)}
            disabled={!(ctx.isEditing && ctx.isItemSelected)}
            type="dropDownPicker"
            items={USER_TYPES}
            value={ctx.item[ctx.attr]}
            onChange={ctx.onChange}
            required
            styleOuter={style.input(ctx.isEditing && ctx.isItemSelected)}
            styleTitle={style.input(ctx.isEditing && ctx.isItemSelected)}
          />
        ),
      },
      {
        attr: 'lastModified',
        minWidth: 150,
        render: ctx => (
          <DateInput
            ref={c => ctx.registerInputRef(ctx.id, ctx.attr, c)}
            disabled={!(ctx.isEditing && ctx.isItemSelected)}
            value={ctx.item[ctx.attr]}
            onChange={ctx.onChange}
            required
            skipTheme
            style={style.input(ctx.isEditing && ctx.isItemSelected)}
          />
        ),
      },
      {
        attr: 'confirmed',
        labelLevel: 1,
        minWidth: 30,
        render: ctx => (
          <Checkbox
            ref={c => ctx.registerInputRef(ctx.id, ctx.attr, c)}
            disabled={!(ctx.isEditing && ctx.isItemSelected)}
            value={ctx.item[ctx.attr]}
            onChange={ctx.onChange}
          />
        ),
      },
      {
        attr: 'phone',
        minWidth: 150,
        render: ctx => (
          <TextInput
            ref={c => ctx.registerInputRef(ctx.id, ctx.attr, c)}
            disabled={!(ctx.isEditing && ctx.isItemSelected)}
            value={ctx.item[ctx.attr]}
            onChange={ctx.onChange}
            required
            skipTheme
            style={style.input(ctx.isEditing && ctx.isItemSelected)}
          />
        ),
      },
    ];
  }

  // -----------------------------------------------
  registerInputRef = (id, attr, ref) => {
    if (!this.inputRefs[id]) this.inputRefs[id] = {};
    this.inputRefs[id][attr] = ref;
  };

  onChangeSelection = ids => {
    const selectedIds = this.state.isEditing
      ? [...this.state.selectedIds] // recreate the list, to prevent DataTable changes
      : ids;
    this.setState({ selectedIds });
  };

  onDelete = () => {
    const itemsById = omit(this.state.itemsById, this.state.selectedIds);
    this.setState({ itemsById });
  };

  onChange = () => {
    this.setState({ isDirty: true });
  };

  onCancel = () => {
    const id = this.state.selectedIds[0];
    const isCreate = id[0] === 'c';
    const prevItemsById = this.state.itemsById;
    let itemsById = omit(prevItemsById, [id]);
    // FIXME: Cancel edit: add item back
    if (!isCreate) {
      itemsById = timmSet(itemsById, id, { ...prevItemsById[id] });
      console.log(itemsById[id] !== prevItemsById[id]);
    }
    this.setState({ itemsById, isEditing: false, isDirty: false });
  };

  onEdit = () => {
    this.setState({ isEditing: true }, () => {
      const id = this.state.selectedIds[0];
      this.focusOnEdit(id);
    });
  };

  onCreate = () => {
    const cid = `c${seqCid}`;
    seqCid += 1;
    const itemsById = timmSet(this.state.itemsById, cid, createEmptyItem(cid));
    this.setState(
      {
        itemsById,
        isEditing: true,
        isDirty: true,
        selectedIds: [cid],
      },
      () => {
        this.focusOnEdit(cid);
      }
    );
  };

  focusOnEdit = id => {
    if (id == null) return;
    const rowRefs = this.inputRefs[id];
    if (!rowRefs) return;
    const ref = rowRefs[AUTOFOCUS_ATTR];
    if (!ref) return;
    ref._focus(); // HACK: less bad with `cmds`
  };

  onSave = async () => {
    const id = this.state.selectedIds[0];
    const data = {};
    try {
      this.setState({ isValidating: true });
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
      const prevItemsById = this.state.itemsById;
      const itemsById = timmSet(
        prevItemsById,
        id,
        merge(prevItemsById[id], data)
      );
      this.setState({
        itemsById,
        isEditing: false,
        isDirty: false,
        isValidating: false,
      });
    } catch (err) {
      this.setState({ isValidating: false });
    }
  };
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const style = {
  // App, Top, Sidebar
  // -----------------
  app: {
    fontSize: 16,
    height: '100vh',
    width: '100vw',
    paddingTop: TOP_HEIGHT,
    paddingLeft: SIDEBAR_WIDTH,
    paddingRight: 0,
    paddingBottom: 0,
  },
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
  section: {
    marginBottom: 10,
  },

  // Contents
  // --------
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
  controlStrip: flexContainer('row', {
    marginBottom: 10,
    alignItems: 'center',
  }),
  separator: {
    width: 10,
  },
  dataTableHeader: { height: DATATABLE_HEADER_HEIGHT },
  input: isEditing => ({
    width: '100%',
    borderColor: isEditing ? undefined : 'transparent',
    backgroundColor: isEditing ? undefined : 'transparent',
  }),
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
