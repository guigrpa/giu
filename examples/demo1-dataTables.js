/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React                from 'react';
import faker                from 'faker';
import { merge, setIn }     from 'timm';
import {
  DataTable,
  Textarea, Checkbox, TextInput, Button, Spinner,
  bindAll,
  flexContainer, flexItem,
} from '../src';
import { ExampleLabel, exampleStyle } from './demo1-common';

// -----------------------------------------------
// Development example
// -----------------------------------------------
let dataTableLang = false;
const sampleDataTableItems = (num, idStart = 0) => {
  const out = {};
  for (let i = 0; i < num; i++) {
    const id = String(idStart + i);
    const name = i === 0 ? 'Mª Antonia Pérez Ñandú' : faker.name.findName();
    out[id] = {
      id,
      name,
      confirmed: Math.random() > 0.5,
      phone: faker.phone.phoneNumber(),
      notes: faker.lorem.sentences(2).split('\n').join(' '),
    };
  }
  return out;
};

const DATA_TABLE_COLS = [
  {
    attr: 'name',
    label: () => (dataTableLang ? 'Nombre' : 'Name'),
    minWidth: 100,
  },
  {
    attr: 'notes',
    label: () => (dataTableLang ? 'Notas' : 'Notes'),
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
    label: () => (dataTableLang ? 'Confirmado' : 'Confirmed'),
    minWidth: 30,
    render: ({ item, id, attr, onChange }) =>
      <Checkbox
        value={item.confirmed}
        onChange={(ev, value) => onChange(id, attr, value)}
      />,
  },
  {
    attr: 'phone',
    label: () => (dataTableLang ? 'Teléfono' : 'Phone'),
    minWidth: 150,
  },
];

class DevelopmentExample extends React.Component {
  constructor(props) {
    super(props);
    const numItems = 40;
    const itemsById = sampleDataTableItems(numItems);
    this.selectedIds = ['1'];
    this.alwaysRenderIds = ['0', '1', '3'];
    try {
      const json = localStorage['giu.dataTableExample.manuallyOrderedIds'];
      this.manuallyOrderedIds = JSON.parse(json);
    } catch (err) { /* ignore */ }
    this.state = {
      numItems,
      itemsById,
      shownIds: Object.keys(itemsById),
      numShownIds: numItems,
      filterValue: '',
      fFetching: false,
    };
    bindAll(this, [
      'fetchMore',
      'logArgs',
      'onChange',
    ]);
    this.commonCellProps = { onChange: this.onChange };
  }

  render() {
    return (
      <div>
        <div style={flexContainer('row', { alignItems: 'baseline' })}>
          <div>
            <Button onClick={() => this.toggleLang()}>Toggle lang</Button>
            {' '}
            Quick find:
            {' '}
            <TextInput onChange={(ev, filterValue) => this.setState({ filterValue })} />
          </div>
          <div style={flexItem(1)}></div>
          <div>Items: {this.state.numShownIds}</div>
        </div>
        <DataTable
          itemsById={this.state.itemsById}
          cols={DATA_TABLE_COLS}
          lang={String(dataTableLang)}
          shownIds={this.state.shownIds}
          onChangeShownIds={shownIds => this.setState({ numShownIds: shownIds.length })}
          // alwaysRenderIds={this.alwaysRenderIds}
          commonCellProps={this.commonCellProps}
          height={250}
          fetchMoreItems={this.fetchMore}
          fetching={this.state.fFetching}
          FetchRowComponent={() => <div><Spinner />{' '}Fetching...</div>}
          filterValue={this.state.filterValue}
          manuallyOrderedIds={this.manuallyOrderedIds}
          manualSortColLabel={() => (dataTableLang ? 'Ordenar manualmente' : 'Sort manually')}
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
    dataTableLang = !dataTableLang;
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
// Example with defaults
// -----------------------------------------------
const COLS = [
  { attr: 'id' },
  { attr: 'name', minWidth: 100 },
  { attr: 'phone', minWidth: 150 },
  { attr: 'notes', minWidth: 100, flexGrow: 1 },
];

const ExampleWithDefaults = () => {
  const itemsById = sampleDataTableItems(1000, 0);
  return (
    <DataTable
      itemsById={itemsById}
      cols={COLS}
      shownIds={Object.keys(itemsById)}
    />
  );
};

// -----------------------------------------------
// Example with uniform row heights
// -----------------------------------------------
const COLS2 = [
  { attr: 'id' },
  { attr: 'name', minWidth: 100, flexGrow: 1 },
  { attr: 'phone', minWidth: 150, flexGrow: 1 },
];

const ExampleWithUniformRowHeights = () => {
  const itemsById = sampleDataTableItems(1000, 0);
  return (
    <DataTable
      itemsById={itemsById}
      cols={COLS2}
      shownIds={Object.keys(itemsById)}
      height={100}
      uniformRowHeight
    />
  );
};

// -----------------------------------------------
// Index
// -----------------------------------------------
const DataTableExample = () =>
  <div style={exampleStyle}>
    <ExampleLabel>
      DataTable (sort, filter, select, fetch more...) + VirtualScroller (only render
      visible rows, with dynamic-unknown, uniform-unknown or uniform-known row heights)
    </ExampleLabel>
    <br />
    {<DevelopmentExample />}
    <br />
    <b>The simplest example: leave everything to the DataTable component</b>
    <ExampleWithDefaults />
    <br />
    <b>Ultrafast, with uniform row heights:</b>
    <ExampleWithUniformRowHeights />
  </div>;

export default DataTableExample;
