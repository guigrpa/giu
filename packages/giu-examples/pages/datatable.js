// NO LONGER MAINTAINED

/* eslint-disable no-console */
/* eslint-disable react/no-multi-comp, react/no-did-mount-set-state */

import React from 'react';
import Head from 'next/head';
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
  Spinner,
} from 'giu';
import faker from 'faker';

faker.seed(0);

const SIDEBAR_WIDTH = 200;
const TOP_HEIGHT = 80;
const DATATABLE_HEADER_HEIGHT = 40;

const NUM_ITEMS = 2000;

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
    const id = String(idStart + 1 + i);
    const name = i === 0 ? 'Mª Antonia Pérez Ñandú' : faker.name.findName();
    out[id] = {
      id,
      name,
      age: 20 + Math.ceil(Math.random() * 10),
      confirmed: Math.random() > 0.5,
      phone: faker.phone.phoneNumber(),
      lastModified: new Date(),
      type: Math.random() > 0.5 ? 'Guest' : 'User',
      notes: faker.lorem
        .sentences(2)
        .split('\n')
        .join(' '),
    };
  }
  return out;
};

const createEmptyItem = id => ({
  id,
  name: '',
  confirmed: false,
  type: 'User',
});

let seqCid = 0; // use for item creation

const COLS = [
  {
    attr: 'id',
    minWidth: 40,
    render: ctx => <div style={{ paddingTop: 2 }}>{ctx.item.id}</div>,
  },
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
        cmds={ctx.cmds}
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
        cmds={ctx.cmds}
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
        type="dropDownPicker"
        disabled={!(ctx.isEditing && ctx.isItemSelected)}
        value={ctx.item[ctx.attr]}
        onChange={ctx.onChange}
        cmds={ctx.cmds}
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
        cmds={ctx.cmds}
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
        cmds={ctx.cmds}
        required
        skipTheme
        style={style.input(ctx.isEditing && ctx.isItemSelected)}
      />
    ),
  },
];

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
    const itemsById = sampleDataTableItems(NUM_ITEMS, 0);
    this.state = {
      hasPagination: false,
      // items would normally come from props
      itemsById,
      shownIds: Object.keys(itemsById),
      numItems: NUM_ITEMS,
      isFetching: false,
      customPositions: {},
      isEditing: false,
      isValidating: false,
      isDirty: false,
      selectedIds: [],
      inputCmds: [],
      filterValue: '',
    };
    this.inputRefs = {};
    this.commonCellProps = {
      isEditing: this.state.isEditing,
      onChange: this.onChange,
      registerInputRef: this.registerInputRef,
      cmds: this.state.inputCmds,
    };
  }

  render() {
    return (
      <div style={style.contents}>
        {this.renderControlStrip()}
        <div style={style.contentTable}>
          <HeightMeasurer>{this.renderDataTable}</HeightMeasurer>
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
        {this.renderStats()}
        {!isEditing && this.renderPaginationToggle()}{' '}
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
        <Icon icon={icon} /> {label}
      </Button>
    );
  }

  renderStats() {
    return (
      <div>
        # items: <b>{this.state.numItems}</b>
        {this.state.isFetching ? <Spinner /> : null}
      </div>
    );
  }

  renderPaginationToggle() {
    return (
      <Checkbox
        label="Pagination (disables quick filter)"
        value={this.state.hasPagination}
        onChange={(ev, hasPagination) => {
          this.setState({ hasPagination, filterValue: '' });
        }}
        style={{ marginLeft: 10 }}
      />
    );
  }

  renderFilter() {
    if (this.state.hasPagination) return null;
    return (
      <TextInput
        placeholder="🔍 Quick filter"
        value={this.state.filterValue}
        onChange={(ev, filterValue) => {
          this.setState({ filterValue });
        }}
        style={{ marginLeft: 10 }}
      />
    );
  }

  // Called by HeightMeasurer
  renderDataTable = height => {
    const { isEditing, hasPagination } = this.state;
    const finalHeight = height ? height - DATATABLE_HEADER_HEIGHT : undefined;
    this.commonCellProps = merge(this.commonCellProps, {
      isEditing,
      cmds: this.state.inputCmds,
    });
    return (
      <DataTable
        ref={c => {
          this.refDataTable = c;
        }}
        key={String(hasPagination)}
        itemsById={this.state.itemsById}
        shownIds={this.state.shownIds}
        alwaysRenderIds={this.state.selectedIds}
        neverFilterIds={isEditing ? this.state.selectedIds : undefined}
        customPositions={this.state.customPositions}
        fetchMoreItems={hasPagination && this.fetchMore}
        fetching={hasPagination && this.state.isFetching}
        FetchRowComponent={FetchRowComponent}
        filterValue={this.state.filterValue}
        cols={COLS}
        commonCellProps={this.commonCellProps}
        selectedIds={this.state.selectedIds}
        onChangeSelection={this.onChangeSelection}
        onRowDoubleClick={this.onRowDoubleClick}
        height={finalHeight}
        uniformRowHeight
        accentColor="lightgray"
        styleHeader={style.dataTableHeader}
      />
    );
  };

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
    const shownIds = Object.keys(itemsById);
    this.setState({ itemsById, shownIds, selectedIds: [] });
  };

  onChange = () => {
    this.setState({ isDirty: true });
  };

  onCancel = () => {
    const id = this.state.selectedIds[0];
    const nextState = { isEditing: false, isDirty: false };

    // If it was a create operation (local 'cid', or client ID), delete row
    if (id[0] === 'c') {
      nextState.itemsById = omit(this.state.itemsById, [id]);
      nextState.shownIds = Object.keys(nextState.itemsById);
      nextState.customPositions = omit(this.state.customPositions, [id]);

      // If it was an update, send a REVERT command to all fields
      // [it'd be better if only the targeted row would receive them, but anyway...]
    } else {
      nextState.inputCmds = [{ type: 'REVERT' }];
    }
    this.setState(nextState);
  };

  onRowDoubleClick = () => {
    if (this.state.selectedIds.length === 1) this.onEdit();
  };

  onEdit = () => {
    this.setState({ isEditing: true }, () => {
      const id = this.state.selectedIds[0];
      this.focusOnFirstEditableField(id);
    });
  };

  onCreate = () => {
    const cid = `c${seqCid}`;
    seqCid += 1;
    const itemsById = timmSet(this.state.itemsById, cid, createEmptyItem(cid));
    const customPositions = timmSet(
      this.state.customPositions,
      cid,
      this.calculateSuitablePositionForNewItem()
    );
    const shownIds = Object.keys(itemsById);
    this.setState(
      {
        itemsById,
        shownIds,
        customPositions,
        isEditing: true,
        isDirty: true,
        selectedIds: [cid],
      },
      () => {
        this.focusOnFirstEditableField(cid);
      }
    );
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
        customPositions: {},
        isEditing: false,
        isDirty: false,
        isValidating: false,
      });
      setTimeout(this.scrollSelectedIntoView, 400);
    } catch (err) {
      this.setState({ isValidating: false });
    }
  };

  fetchMore = id => {
    console.log(`Fetch items after ${id}`);
    this.setState({ isFetching: true });
    setTimeout(() => {
      const numNewItems = 20;
      const newItems = sampleDataTableItems(numNewItems, this.state.numItems);
      const itemsById = merge(this.state.itemsById, newItems);
      this.setState({
        numItems: this.state.numItems + numNewItems,
        itemsById,
        shownIds: Object.keys(itemsById),
        isFetching: false,
      });
    }, 800);
  };

  // -----------------------------------------------
  calculateSuitablePositionForNewItem() {
    const { selectedIds } = this.state;
    if (!selectedIds.length) return null; // at the top
    return selectedIds[0]; // below the first selected row
  }

  focusOnFirstEditableField = id => {
    const rowNode = document.querySelector(`#giu-vertical-manager-${id}`);
    if (!rowNode) return;
    const fieldNode = rowNode.querySelector('input, select, textarea');
    if (fieldNode) fieldNode.focus();
    // Bye-bye, HACK! (no refs needed any more)
  };

  scrollSelectedIntoView = () => {
    if (this.refDataTable) this.refDataTable.scrollSelectedIntoView();
  };
}

// -----------------------------------------------
// Helper components
// -----------------------------------------------
const FetchRowComponent = () => (
  <div style={{ padding: '5px 10px', backgroundColor: 'gray', color: 'white' }}>
    <Spinner /> Fetching...
  </div>
);

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
  // Use constant objects for better performance with PureComponents
  input: isEditing => (isEditing ? style.inputEdit : style.inputBrowse),
  inputEdit: { width: '100%' },
  inputBrowse: {
    width: '100%',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
};

// ================================================
// Public
// ================================================
class AppWrapper extends React.Component {
  static async getInitialProps({ req }) {
    const out = {};
    if (req) out.baseUrl = process.env.BASE_URL || '';
    return out;
  }

  render() {
    const { baseUrl } = this.props;
    return (
      <div>
        <Head>
          <title>Giu demos</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link
            rel="stylesheet"
            href={`${baseUrl}/static/font-awesome/css/font-awesome.min.css`}
          />
          <link
            rel="icon"
            type="image/ico"
            href={`${baseUrl}/static/favicon.ico`}
          />
        </Head>
        <App />
        <style jsx global>{`
          body {
            font-family: 'Futura Std', Tahoma, sans-serif;
            font-size: 12px;
            padding: 10px;
            margin: 0;
            background: lavender;
          }
          .giu-date-picker {
            font-size: 12px;
          }
          .giu-list-picker {
            font-size: 12px !important;
          }
        `}</style>
      </div>
    );
  }
}

export default AppWrapper;
