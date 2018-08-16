// @flow

/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function, react/no-string-refs */

import React from 'react';
import faker from 'faker';
import { merge, setIn } from 'timm';
import sample from 'lodash/sample';
import {
  DataTable,
  SORT_MANUALLY,
  Textarea,
  Checkbox,
  TextInput,
  DateInput,
  Button,
  Spinner,
  Select,
  Icon,
  Modal,
  flexContainer,
  flexItem,
  COLORS,
  notify,
} from 'giu';
import type { DataTableColumn } from 'giu/lib/components/dataTableRow';
import { ExampleLabel, exampleStyle } from './demo1-common';

faker.seed(0);

const DEBUG = false && process.env.NODE_ENV !== 'production';

const CELL_WITH_ELLIPSIS = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflowX: 'hidden',
};

const USER_TYPES = [
  { value: 'Guest', label: 'Guest' },
  { value: 'User', label: 'User' },
];

// -----------------------------------------------
// Development example
// -----------------------------------------------
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
      notes: faker.lorem
        .sentences(2)
        .split('\n')
        .join(' '),
    };
  }
  return out;
};

let curLang;
const DATA_TABLE_COLS = [
  {
    attr: 'id',
    minWidth: 40,
  },
  {
    attr: 'name',
    label: () => (curLang === 'es' ? 'Nombre' : 'Name'),
    minWidth: 100,
  },
  {
    attr: 'notes',
    label: () => (curLang === 'es' ? 'Notas' : 'Notes'),
    flexGrow: 1,
    minWidth: 100,
    // render: ({ item, id, attr, onChange, onMayHaveChangedHeight }) =>
    render: ({ item, id, attr, onChange }) => (
      <Textarea
        value={item.notes}
        onChange={(ev, value) => onChange(id, attr, value)}
        style={{
          color: 'inherit',
          backgroundColor: 'inherit',
        }}
        styleOuter={{
          display: 'block',
          color: 'inherit',
          backgroundColor: 'inherit',
        }}
        skipTheme
      />
    ),
    sortable: false,
    filterable: false,
  },
  {
    attr: 'confirmed',
    labelLevel: 1,
    label: () => (curLang === 'es' ? 'Confirmado' : 'Confirmed'),
    minWidth: 30,
    render: ({ item, id, attr, onChange }) => (
      <Checkbox
        value={item.confirmed}
        onChange={(ev, value) => onChange(id, attr, value)}
        skipTheme
      />
    ),
  },
  {
    attr: 'phone',
    label: () => (curLang === 'es' ? 'Teléfono' : 'Phone'),
    minWidth: 150,
  },
];

const DATA_TABLE_ALT_LAYOUT_COLS = [
  {
    attr: 'allDetails',
    label: () => (curLang === 'es' ? 'Detalles' : 'Details'),
    flexGrow: 1,
    minWidth: 100,
    render: ({ item, id, onChange }) => (
      <div>
        <div>
          <b>{curLang === 'es' ? 'Nombre:' : 'Name:'}</b> {item.name}
        </div>
        <div>
          <div>
            <b>{curLang === 'es' ? 'Teléfono' : 'Phone'}</b> {item.phone} (
            {item.confirmed
              ? curLang === 'es' ? 'Confirmado' : 'Confirmed'
              : curLang === 'es' ? 'No confirmado' : 'Unconfirmed'}
            )
          </div>
        </div>
        <div>
          <Textarea
            value={item.notes}
            onChange={(ev, value) => onChange(id, 'notes', value)}
            style={{
              color: 'inherit',
              backgroundColor: 'inherit',
            }}
            styleOuter={{
              display: 'block',
            }}
            skipTheme
          />
        </div>
      </div>
    ),
    sortable: false,
    rawValue: ({ name, phone, confirmed, notes }) => ({
      name,
      phone,
      confirmed,
      notes,
    }),
    filterValue: o => `${o.name} ${o.phone}`,
  },
];

const manualSortColLabel = () =>
  curLang === 'es' ? 'Ordenar manualmente' : 'Sort manually';

const FetchRowComponent = () => (
  <div style={{ padding: '5px 10px', backgroundColor: 'gray', color: 'white' }}>
    <Spinner /> Fetching...
  </div>
);

class DevelopmentExample extends React.Component<*, *> {
  commonCellProps: Object;
  selectedIds: Array<string>;

  constructor() {
    super();
    const numItems = 0;
    // this.alwaysRenderIds = ['0', '1', '3'];
    this.state = {
      dataTableKey: 1, // replace key with new one when we have initial data
      numItems, // number of total items
      itemsById: {},
      shownIds: [],
      numShownIds: 0, // number of shown items (depending on filter)
      filterValue: '',
      fFetching: true, // initially fetching...
      fAltLayout: false,
    };
    this.commonCellProps = { onChange: this.onChange };
    this.selectedIds = [];
  }

  componentDidMount() {
    setTimeout(() => {
      const numItems = 50;
      const itemsById = sampleDataTableItems(numItems);
      const shownIds = Object.keys(itemsById);
      DEBUG && console.log('\n\nKEY WILL NOW BE 2');
      this.setState({
        dataTableKey: 2,
        numItems,
        itemsById,
        shownIds,
        numShownIds: numItems,
        fFetching: false,
      });
    }, 1200);
  }

  render() {
    if (DEBUG) return null;
    const { lang } = this.props;
    const { fAltLayout } = this.state;
    curLang = lang;
    const otherProps = {};
    if (fAltLayout) otherProps.sortBy = SORT_MANUALLY;
    return (
      <div>
        {this.renderControls()}
        <DataTable
          key={this.state.dataTableKey}
          itemsById={this.state.itemsById}
          cols={fAltLayout ? DATA_TABLE_ALT_LAYOUT_COLS : DATA_TABLE_COLS}
          lang={lang}
          shownIds={this.state.shownIds}
          onChangeShownIds={this.onChangeShownIds}
          // alwaysRenderIds={this.alwaysRenderIds}
          commonCellProps={this.commonCellProps}
          height={250}
          fetchMoreItems={this.fetchMore}
          fetching={this.state.fFetching}
          FetchRowComponent={FetchRowComponent}
          filterValue={this.state.filterValue}
          manualSortColLabel={manualSortColLabel}
          collectionName="complexDataTableExample"
          onChangeSort={this.logArgs}
          selectedIds={this.selectedIds}
          allowSelect
          multipleSelection
          onChangeSelection={this.logArgs}
          styleHeader={style.header}
          styleRow={style.row}
          animated
          {...otherProps}
        />
      </div>
    );
  }

  renderControls() {
    return (
      <div
        style={flexContainer('row', {
          alignItems: 'baseline',
          marginTop: 4,
          marginBottom: 4,
        })}
      >
        <div>
          <TextInput
            onChange={(ev, filterValue) => this.setState({ filterValue })}
            placeholder="Quick find"
          />{' '}
          <Button onClick={() => this.selectRandomRow()}>
            Select random row
          </Button>
          <Checkbox
            id="demo-data-tables-altLayout"
            label={
              curLang === 'es' ? 'Layout alternativo' : 'Alternative layout'
            }
            value={this.state.fAltLayout}
            onChange={(ev, fAltLayout) => this.setState({ fAltLayout })}
            skipTheme
          />
        </div>
        <div style={flexItem(1)} />
        <div>Items: {this.state.numShownIds}</div>
      </div>
    );
  }

  selectRandomRow() {
    const id = sample(Object.keys(this.state.itemsById));
    this.selectedIds = [id];
    this.forceUpdate();
  }

  fetchMore = id => {
    console.log(`Fetch items after ${id}`);
    if (this.state.numItems > 400) return;
    this.setState({ fFetching: true });
    setTimeout(() => {
      const numNewItems = 20;
      const newItems = sampleDataTableItems(numNewItems, this.state.numItems);
      const itemsById = merge(this.state.itemsById, newItems);
      this.setState({
        numItems: this.state.numItems + numNewItems,
        itemsById,
        shownIds: Object.keys(itemsById),
        fFetching: false,
      });
    }, 800);
  };

  onChange = (id, attr, value) => {
    const itemsById = setIn(this.state.itemsById, [id, attr], value);
    this.setState({ itemsById });
  };

  onChangeShownIds = shownIds => {
    this.setState({ numShownIds: shownIds.length });
  };

  logArgs = (...args) => {
    console.log(...args);
  };
}

const style = {
  header: {
    color: 'white',
    backgroundColor: 'gray',
    borderBottom: '1px solid gray',
  },
  row: {
    borderBottom: '1px solid #ccc',
  },
};

// -----------------------------------------------
// Simple example: minimum attributes
// -----------------------------------------------
const DATA_SIMPLE_EXAMPLE = sampleDataTableItems(1000, 0);
const SimpleExample = () => {
  if (DEBUG) return null;
  const itemsById = DATA_SIMPLE_EXAMPLE;
  return (
    <DataTable
      itemsById={itemsById}
      cols={[
        { attr: 'id' },
        { attr: 'name', minWidth: 100 },
        { attr: 'phone', minWidth: 150 },
        { attr: 'notes', minWidth: 100, flexGrow: 1 },
      ]}
      shownIds={Object.keys(itemsById)}
      collectionName="simpleDataTableExample"
      animated
    />
  );
};

// -----------------------------------------------
// Example with uniform row heights
// -----------------------------------------------
// const UniformHeightsExample = () => {
//   const itemsById = sampleDataTableItems(1000, 0);
//   return (
//     <DataTable
//       itemsById={itemsById}
//       cols={[
//         { attr: 'id' },
//         { attr: 'name', minWidth: 100, flexGrow: 1, style: style.cellWithEllipsis },
//         { attr: 'phone', minWidth: 150, flexGrow: 1, style: style.cellWithEllipsis },
//       ]}
//       shownIds={Object.keys(itemsById)}
//       height={100}
//       uniformRowHeight
//     />
//   );
// };

// -----------------------------------------------
// Example with custom sorting and pagination
// -----------------------------------------------
const NUM_ITEMS = 1000;
const ITEMS_PER_PAGE = 300;
const CUSTOM_SORT_OPTIONS = [
  { value: 'age+name', label: 'Age and name' },
  { value: 'phone', label: 'Phone' },
  { value: SORT_MANUALLY, label: 'Manually' },
];
const COLS = [
  { attr: 'id' },
  { attr: 'name', minWidth: 100, flexGrow: 1, style: CELL_WITH_ELLIPSIS },
  { attr: 'age', minWidth: 50 },
  { attr: 'phone', minWidth: 150, flexGrow: 1, style: CELL_WITH_ELLIPSIS },
];

class CustomSortPaginateExample extends React.Component<
  *,
  { sortBy: ?string, page: number }
> {
  itemsById: Object;
  numPages: number;
  shownIds: Array<string>;

  constructor() {
    super();
    this.itemsById = sampleDataTableItems(NUM_ITEMS, 0);
    this.numPages = Math.ceil(NUM_ITEMS / ITEMS_PER_PAGE);
    this.state = {
      sortBy: 'age+name',
      page: 0,
    };
  }

  render() {
    if (DEBUG) return null;
    this.calcShownIds();
    const { sortBy, page } = this.state;
    const fSortedManually = sortBy === SORT_MANUALLY;
    return (
      <div>
        {this.renderControls(sortBy, page)}
        <DataTable
          ref="dataTable"
          itemsById={this.itemsById}
          cols={COLS}
          shownIds={this.shownIds}
          headerClickForSorting={false}
          allowManualSorting={fSortedManually}
          sortBy={fSortedManually ? SORT_MANUALLY : undefined}
          sortDescending={false}
          height={100}
          uniformRowHeight
          style={style2.outer}
          styleHeader={style2.header}
        />
      </div>
    );
  }

  renderControls(sortBy, page) {
    return (
      <div
        style={flexContainer('row', { alignItems: 'baseline', marginTop: 4 })}
      >
        <div>
          Sort by{' '}
          <Select
            value={sortBy}
            items={CUSTOM_SORT_OPTIONS}
            onChange={(ev, newSortBy) => {
              if (this.refs.dataTable) this.refs.dataTable.scrollToTop();
              this.setState({ sortBy: newSortBy, page: 0 });
            }}
            required
          />
        </div>
        <div style={{ width: 10 }} />
        <div>
          Page:{' '}
          <Icon
            icon="arrow-left"
            disabled={page === 0}
            onClick={() => this.setState({ page: this.state.page - 1 })}
            skipTheme
          />{' '}
          <b
            style={{ display: 'inline-block', width: 25, textAlign: 'center' }}
          >
            {page + 1}
          </b>{' '}
          <Icon
            icon="arrow-right"
            disabled={page === this.numPages - 1}
            onClick={() => this.setState({ page: this.state.page + 1 })}
            skipTheme
          />
        </div>
      </div>
    );
  }

  calcShownIds() {
    const { itemsById } = this;
    let ids = Object.keys(itemsById);
    ids = this.sort(ids);
    const { page } = this.state;
    ids = ids.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    this.shownIds = ids;
  }

  sort(idsIn) {
    const ids = idsIn.slice();
    if (this.state.sortBy === SORT_MANUALLY) return ids;
    const { itemsById } = this;
    let comparator;
    switch (this.state.sortBy) {
      case 'phone':
        comparator = (idA, idB) => {
          const phoneA = itemsById[idA].phone;
          const phoneB = itemsById[idB].phone;
          if (phoneA < phoneB) return -1;
          if (phoneA > phoneB) return +1;
          return idA < idB ? -1 : +1;
        };
        break;
      case 'age+name':
        comparator = (idA, idB) => {
          const itemA = itemsById[idA];
          const itemB = itemsById[idB];
          const ageA = itemA.age;
          const ageB = itemB.age;
          if (ageA < ageB) return -1;
          if (ageA > ageB) return +1;
          const nameA = itemA.name;
          const nameB = itemB.name;
          if (nameA < nameB) return -1;
          if (nameA > nameB) return +1;
          return idA < idB ? -1 : +1;
        };
        break;
      default:
        return ids;
    }
    ids.sort(comparator);
    return ids;
  }
}

const style2 = {
  cellWithEllipsis: CELL_WITH_ELLIPSIS, // quick'n'dirty
  outer: {
    marginTop: 3,
    borderTop: `1px solid ${COLORS.accent}`,
    borderBottom: `1px solid ${COLORS.accent}`,
  },
  header: {
    borderBottom: `1px solid ${COLORS.accent}`,
  },
};

// -----------------------------------------------
// Example with inputs and validation
// -----------------------------------------------
const DATA_EDIT_AND_VALIDATE_EXAMPLE = sampleDataTableItems(15, 0);
const COLLECT_FIELDS_ON_SUBMIT = [
  'name',
  'type',
  'lastModified',
  'confirmed',
  'phone',
];

class EditAndValidateExample extends React.Component<*, *> {
  commonCellProps: Object;
  inputRefs: Object;

  constructor() {
    super();
    this.state = {
      changedRows: {},
    };
    this.commonCellProps = {
      registerInputRef: this.registerInputRef,
      onChange: this.onChange,
      onSubmit: this.onSubmit,
    };
    this.inputRefs = {};
  }

  // -----------------------------------------------
  render() {
    const itemsById = DATA_EDIT_AND_VALIDATE_EXAMPLE;
    return (
      <DataTable
        itemsById={itemsById}
        shownIds={Object.keys(itemsById)}
        alwaysRenderIds={Object.keys(this.state.changedRows)}
        cols={this.getCols()}
        commonCellProps={this.commonCellProps}
        collectionName="editAndValidateExample"
        uniformRowHeight
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
            styleOuter={{ backgroundColor: 'inherit', width: '100%' }}
            style={{ backgroundColor: 'inherit', width: '100%' }}
          />
        ),
      },
      {
        attr: 'type',
        minWidth: 80,
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <Select
            ref={c => registerInputRef(id, attr, c)}
            items={USER_TYPES}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            styleOuter={{ backgroundColor: 'inherit', width: '100%' }}
            style={{ backgroundColor: 'inherit', width: '100%' }}
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
            styleOuter={{ backgroundColor: 'inherit', width: '100%' }}
            style={{ backgroundColor: 'inherit', width: '100%' }}
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
            skipTheme
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
            styleOuter={{ backgroundColor: 'inherit', width: '100%' }}
            style={{ backgroundColor: 'inherit', width: '100%' }}
          />
        ),
      },
      {
        attr: 'submit',
        minWidth: 50,
        render: ({ id, onSubmit }) => (
          <Icon icon="check" onClick={() => onSubmit(id)} />
        ),
      },
    ];
  }

  // -----------------------------------------------
  registerInputRef = (id, attr, ref) => {
    if (!this.inputRefs[id]) this.inputRefs[id] = {};
    this.inputRefs[id][attr] = ref;
  };

  onChange = id => {
    const { changedRows } = this.state;
    if (changedRows[id]) return;
    changedRows[id] = true;
    this.setState({ changedRows });
  };

  onSubmit = async id => {
    const data = {};
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
    console.log(data);
    const msg = `name: ${data.name}, phone: ${data.phone}`;
    notify({
      type: 'success',
      icon: 'check',
      title: 'Updated!',
      msg,
    });
  };
}

// -----------------------------------------------
// Index
// -----------------------------------------------
class AllExamples extends React.PureComponent<*, { fModal: boolean }> {
  itemsById: Object;
  shownIds: Array<string>;
  cols: Array<DataTableColumn>;

  constructor() {
    super();
    this.state = { fModal: false };
    this.itemsById = sampleDataTableItems(1000, 0);
    this.shownIds = Object.keys(this.itemsById);
    this.cols = [
      { attr: 'id' },
      { attr: 'name', minWidth: 80 },
      { attr: 'phone', minWidth: 100 },
      { attr: 'notes', minWidth: 70, flexGrow: 1 },
    ];
  }

  render() {
    return (
      <div style={exampleStyle}>
        <ExampleLabel>
          DataTable (sort, filter, select/multi-select, fetch more,
          keyboard-controlled, clipboard, manual sort with drag-and-drop,
          LocalStorage persistence...)
        </ExampleLabel>
        <p>
          DataTable is based on the <b>VirtualScroller</b> component, whose
          primary function is to render only visible rows. These rows can have
          uniform and well-known heights (at the simplest end of the spectrum),
          uniform but unknown, and also dynamic: different for every row, and
          even changing in time (as a result of passed-down props or their own
          intrinsic state).
        </p>

        <p>
          <b>Complete example</b>
          : editable, filtered, internationalised, <i>inifinite</i>
          (fetch more items by scrolling down to the bottom of the list), custom
          styles, etc.
        </p>
        <DevelopmentExample lang={this.props.lang} />

        <p>
          <b>Example with custom sort and pagination</b>
          : this one is also ultra-fast, thanks to having uniform heights:
        </p>
        <CustomSortPaginateExample />

        <p>
          <b>Example with inline edit and validation</b>
        </p>
        <EditAndValidateExample />

        <p>
          <b>Simplest example</b>: leave everything to the DataTable component
        </p>
        <SimpleExample />

        <p>
          Finally, you can also <b>embed a DataTable in a Modal</b>:{' '}
          <Button onClick={() => this.setState({ fModal: true })}>
            Show me!
          </Button>
        </p>
        {this.renderModal()}
      </div>
    );
  }

  renderModal() {
    if (!this.state.fModal) return null;
    const close = () => this.setState({ fModal: false });
    return (
      <Modal
        title="DataTable in a Modal"
        buttons={[{ label: 'Close', onClick: close }]}
        onClickBackdrop={close}
        onEsc={close}
        style={{ width: 500 }}
      >
        {/* Add some margin for debugging with visible FocusCaptures */}
        <div style={{ marginLeft: 10, marginRight: 10 }}>
          <DataTable
            itemsById={this.itemsById}
            cols={this.cols}
            shownIds={this.shownIds}
            collectionName="simpleDataTableExample2"
            style={{ zIndex: 60 }}
          />
        </div>
      </Modal>
    );
  }
}

export default AllExamples;
