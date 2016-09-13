/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React                from 'react';
import faker                from 'faker';
import { set as timmSet, merge, setIn } from 'timm';
import sample               from 'lodash/sample';
import {
  DataTable, SORT_MANUALLY,
  Textarea, Checkbox, TextInput, Button, Spinner, Select, Icon,
  bindAll,
  flexContainer, flexItem,
  COLORS,
} from '../src';
import { ExampleLabel, exampleStyle } from './demo1-common';

const DEBUG = false && process.env.NODE_ENV !== 'production';

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
      notes: faker.lorem.sentences(2).split('\n').join(' '),
    };
  }
  return out;
};

const DATA_TABLE_COLS = [
  {
    attr: 'id',
    minWidth: 40,
  },
  {
    attr: 'name',
    label: ({ dataTableLang }) => (dataTableLang ? 'Nombre' : 'Name'),
    minWidth: 100,
  },
  {
    attr: 'notes',
    label: ({ dataTableLang }) => (dataTableLang ? 'Notas' : 'Notes'),
    flexGrow: 1,
    minWidth: 100,
    // render: ({ item, id, attr, onChange, onMayHaveChangedHeight }) =>
    render: ({ item, id, attr, onChange }) =>
      <Textarea
        value={item.notes}
        onChange={(ev, value) => onChange(id, attr, value)}
        style={{
          color: 'black',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          marginBottom: -2,
        }}
      />,
    sortable: false,
    filterable: false,
  },
  {
    attr: 'confirmed',
    labelLevel: 1,
    label: ({ dataTableLang }) => (dataTableLang ? 'Confirmado' : 'Confirmed'),
    minWidth: 30,
    render: ({ item, id, attr, onChange }) =>
      <Checkbox
        value={item.confirmed}
        onChange={(ev, value) => onChange(id, attr, value)}
      />,
  },
  {
    attr: 'phone',
    label: ({ dataTableLang }) => (dataTableLang ? 'Teléfono' : 'Phone'),
    minWidth: 150,
  },
];

const manualSortColLabel = ({ dataTableLang }) =>
  (dataTableLang ? 'Ordenar manualmente' : 'Sort manually');

const FetchRowComponent = () => (
  <div style={{ padding: '5px 10px', backgroundColor: 'gray', color: 'white' }}>
    <Spinner />{' '}Fetching...
  </div>
);

class DevelopmentExample extends React.Component {
  constructor(props) {
    super(props);
    const numItems = 0;
    // this.alwaysRenderIds = ['0', '1', '3'];
    this.state = {
      dataTableKey: 1,        // replace key with new one when we have initial data
      numItems,               // number of total items
      itemsById: {},
      shownIds: [],
      numShownIds: 0,         // number of shown items (depending on filter)
      filterValue: '',
      fFetching: true,        // initially fetching...
      dataTableLang: false,
    };
    bindAll(this, [
      'fetchMore',
      'logArgs',
      'onChange',
      'onChangeShownIds',
    ]);
    this.commonCellProps = {
      dataTableLang: this.state.dataTableLang,
      onChange: this.onChange,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      const numItems = 50;
      const itemsById = sampleDataTableItems(numItems);
      const shownIds = Object.keys(itemsById);
      DEBUG && console.log('\n\nKEY WILL NOW BE 2')
      this.setState({
        dataTableKey: 2,
        numItems,
        itemsById, shownIds,
        numShownIds: numItems,
        fFetching: false,
      });
    }, 1200);
  }

  render() {
    this.commonCellProps = timmSet(this.commonCellProps, 'dataTableLang', this.state.dataTableLang);
    return (
      <div>
        <div style={flexContainer('row', { alignItems: 'baseline', marginTop: 4, marginBottom: 4 })}>
          <div>
            <Button onClick={() => this.toggleLang()}>Toggle lang</Button>
            {' '}
            Quick find:
            {' '}
            <TextInput onChange={(ev, filterValue) => this.setState({ filterValue })} />
            {' '}
            <Button onClick={() => this.selectRandomRow()}>Select random row</Button>
          </div>
          <div style={flexItem(1)}></div>
          <div>Items: {this.state.numShownIds}</div>
        </div>
        <DataTable key={this.state.dataTableKey}
          itemsById={this.state.itemsById}
          cols={DATA_TABLE_COLS}
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
          allowSelect multipleSelection
          onChangeSelection={this.logArgs}
          accentColor="lightgray"
          styleHeader={style.header}
          styleRow={style.row}
        />
      </div>
    );
  }

  toggleLang() {
    this.setState({ dataTableLang: !this.state.dataTableLang });
  }

  selectRandomRow() {
    const id = sample(Object.keys(this.state.itemsById));
    this.selectedIds = [id];
    this.forceUpdate();
  }

  fetchMore(id) {
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
  }

  onChange(id, attr, value) {
    const itemsById = setIn(this.state.itemsById, [id, attr], value);
    this.setState({ itemsById });
  }

  onChangeShownIds(shownIds) {
    this.setState({ numShownIds: shownIds.length });
  }

  logArgs(...args) { console.log(...args); }
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
const SimpleExample = () => {
  if (DEBUG) return null;
  const itemsById = sampleDataTableItems(1000, 0);
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

class CustomSortPaginateExample extends React.Component {
  constructor(props) {
    super(props);
    this.itemsById = sampleDataTableItems(NUM_ITEMS, 0);
    this.numPages = Math.ceil(NUM_ITEMS / ITEMS_PER_PAGE);
    this.cols = [
      { attr: 'id' },
      { attr: 'name', minWidth: 100, flexGrow: 1, style: style2.cellWithEllipsis },
      { attr: 'age', minWidth: 50 },
      { attr: 'phone', minWidth: 150, flexGrow: 1, style: style2.cellWithEllipsis },
    ];
    this.state = {
      sortBy: 'age+name',
      page: 0,
    };
    bindAll(this, ['onChangeManualOrder']);
  }

  render() {
    if (DEBUG) return null;
    this.calcShownIds();
    const { sortBy, page } = this.state;
    const fSortedManually = sortBy === SORT_MANUALLY;
    return (
      <div>
        <div style={flexContainer('row', { alignItems: 'baseline', marginTop: 4 })}>
          <div>
            Sort by
            {' '}
            <Select
              value={sortBy}
              items={[
                { value: 'age+name', label: 'Age and name' },
                { value: 'phone', label: 'Phone' },
                { value: SORT_MANUALLY, label: 'Manually' },
              ]}
              onChange={(ev, newSortBy) => this.setState({ sortBy: newSortBy, page: 0 })}
              required
            />
          </div>
          <div style={{ width: 10 }}></div>
          <div>
            Page:
            {' '}
            <Icon
              icon="arrow-left"
              disabled={page === 0}
              onClick={() => this.setState({ page: this.state.page - 1 })}
            />
            {' '}
            <b style={{ display: 'inline-block', width: 25, textAlign: 'center' }}>{page + 1}</b>
            {' '}
            <Icon
              icon="arrow-right"
              disabled={page === this.numPages - 1}
              onClick={() => this.setState({ page: this.state.page + 1 })}
            />
          </div>
        </div>
        <DataTable
          itemsById={this.itemsById}
          cols={this.cols}
          shownIds={this.shownIds}
          headerClickForSorting={false}
          allowManualSorting={fSortedManually}
          sortBy={fSortedManually ? SORT_MANUALLY : undefined}
          sortDescending={false}
          onChangeManualOrder={this.onChangeManualOrder}
          height={100}
          uniformRowHeight
          style={style2.outer}
          styleHeader={style2.header}
        />
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

  onChangeManualOrder(ids) {
    this.manuallyOrderedIds = ids;
    this.forceUpdate();
  }
}

const style2 = {
  cellWithEllipsis: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
  },
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
// Index
// -----------------------------------------------
const DataTableExample = () =>
  <div style={exampleStyle}>
    <ExampleLabel>
      DataTable (sort, filter, select/multi-select, fetch more, keyboard-controlled,
      clipboard, manual sort with drag-and-drop, LocalStorage persistence...)
    </ExampleLabel>
    <div>
      Also check out the <b>VirtualScroller</b> (only render
      visible rows, with dynamic-unknown, uniform-unknown or uniform-known row heights)
    </div>

    <br />
    <b>Complete example</b>: editable, filtered, internationalised, <i>inifinite</i>
    (fetch more items by scrolling down to the bottom of the list),
    custom styles, etc.
    <DevelopmentExample />

    <br />
    <br />
    <b>Example with custom sort and pagination</b>: this one is also ultra-fast, thanks to
    having uniform heights
    <CustomSortPaginateExample />

    <br />
    <br />
    <b>Simplest example</b>: leave everything to the DataTable component
    <SimpleExample />

  </div>;

export default DataTableExample;
