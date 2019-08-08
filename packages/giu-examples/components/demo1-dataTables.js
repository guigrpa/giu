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
  notify,
} from 'giu';
import type { DataTableColumn } from 'giu/lib/components/dataTableRow';

faker.seed(0);

const DEBUG = false && process.env.NODE_ENV !== 'production';

const USER_TYPES = [
  { value: 'Guest', label: 'Guest' },
  { value: 'User', label: 'User' },
];

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
      <div className="example">
        <div className="example-label">
          DataTable (sort, filter, select/multi-select, fetch more,
          keyboard-controlled, clipboard, manual sort with drag-and-drop,
          LocalStorage persistence...)
        </div>
        <p>
          DataTable is based on the <b>VirtualScroller</b> component, whose
          primary function is to render only visible rows. These rows can have
          uniform and well-known heights (at the simplest end of the spectrum),
          uniform but unknown, and also dynamic: different for every row, and
          even changing in time (as a result of passed-down props or their own
          intrinsic state).
        </p>

        <p>
          <b>Complete example</b>: editable, filtered, internationalised,{' '}
          <i>inifinite</i>
          (fetch more items by scrolling down to the bottom of the list), custom
          styles, etc.
        </p>
        <DevelopmentExample lang={this.props.lang} />

        <p>
          <b>Example with custom sort and pagination</b>: this one is also
          ultra-fast, thanks to having uniform heights:
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
          <b>Example without a fixed data-table height</b>
        </p>
        <VariableHeightExample />

        <p>
          Finally, you can also <b>embed a DataTable in a Modal</b>:{' '}
          <Button onClick={() => this.setState({ fModal: true })}>
            Show me!
          </Button>
        </p>
        {this.renderModal()}
        <style jsx global>{`
          .giu-modal#modal-datatable .giu-modal-box {
            width: 600px;
          }
          #datatable-modal .giu-data-table-col-id {
            flex: 0 0 50px;
          }
          #datatable-modal .giu-data-table-col-name {
            flex: 0 0 100px;
          }
          #datatable-modal .giu-data-table-col-phone {
            flex: 0 0 150px;
          }
          #datatable-modal .giu-data-table-col-notes {
            flex: 1 0 100px;
          }
        `}</style>
      </div>
    );
  }

  renderModal() {
    if (!this.state.fModal) return null;
    const close = () => this.setState({ fModal: false });
    return (
      <Modal
        id="modal-datatable"
        title="DataTable in a Modal"
        buttons={[{ label: 'Close', onClick: close }]}
        onClickBackdrop={close}
        onEsc={close}
      >
        {/* Add some margin for debugging with visible FocusCaptures */}
        <div style={{ marginLeft: 10, marginRight: 10 }}>
          <DataTable
            id="datatable-modal"
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
  { attr: 'id' },
  {
    attr: 'name',
    label: () => (curLang === 'es' ? 'Nombre' : 'Name'),
  },
  {
    attr: 'notes',
    label: () => (curLang === 'es' ? 'Notas' : 'Notes'),
    // render: ({ item, id, attr, onChange, onMayHaveChangedHeight }) =>
    render: ({ item, id, attr, onChange }) => (
      <Textarea
        value={item.notes}
        onChange={(ev, value) => onChange(id, attr, value)}
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
  },
];

const DATA_TABLE_ALT_LAYOUT_COLS = [
  {
    attr: 'allDetails',
    label: () => (curLang === 'es' ? 'Detalles' : 'Details'),
    render: ({ item, id, onChange }) => (
      <div>
        <div>
          <b>{curLang === 'es' ? 'Nombre:' : 'Name:'}</b> {item.name}
        </div>
        <div>
          <div>
            <b>{curLang === 'es' ? 'Teléfono' : 'Phone'}</b> {item.phone} (
            {item.confirmed
              ? curLang === 'es'
                ? 'Confirmado'
                : 'Confirmed'
              : curLang === 'es'
              ? 'No confirmado'
              : 'Unconfirmed'}
            )
          </div>
        </div>
        <div>
          <Textarea
            value={item.notes}
            onChange={(ev, value) => onChange(id, 'notes', value)}
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
          id={fAltLayout ? 'datatable-dev-alt' : 'datatable-dev'}
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
          animated
          {...otherProps}
        />
        <style jsx global>{`
          /* Header */
          #datatable-dev .giu-data-table-header,
          #datatable-dev-alt .giu-data-table-header {
            color: white;
            background-color: gray;
            border-bottom: 1px solid gray;
          }
          #datatable-dev svg,
          #datatable-dev-alt svg {
            stroke: white;
          }
          /* Rows */
          #datatable-dev .giu-data-table-row,
          #datatable-dev-alt .giu-data-table-row {
            border-bottom: 1px solid #ccc;
          }
          /* Columns */
          #datatable-dev .giu-data-table-col-id {
            flex: 0 0 40px;
          }
          #datatable-dev .giu-data-table-col-name {
            flex: 0 0 100px;
          }
          #datatable-dev .giu-data-table-col-notes {
            flex: 1 0 100px;
          }
          #datatable-dev .giu-data-table-col-confirmed {
            flex: 0 0 30px;
            max-width: 30px;
          }
          #datatable-dev .giu-data-table-col-phone {
            flex: 0 0 150px;
          }
          #datatable-dev-alt .giu-data-table-col-allDetails {
            flex: 1 0 100px;
          }
        `}</style>
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
  { attr: 'name', className: 'giu-ellipsis' },
  { attr: 'age' },
  { attr: 'phone', className: 'giu-ellipsis' },
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
          id="datatable-custom-sort"
          itemsById={this.itemsById}
          cols={COLS}
          shownIds={this.shownIds}
          headerClickForSorting={false}
          allowManualSorting={fSortedManually}
          sortBy={fSortedManually ? SORT_MANUALLY : undefined}
          sortDescending={false}
          height={100}
          uniformRowHeight
        />
        <style jsx global>{`
          #datatable-custom-sort .giu-data-table-col-id {
            flex: 0 0 50px;
          }
          #datatable-custom-sort .giu-data-table-col-name {
            flex: 1 0 100px;
          }
          #datatable-custom-sort .giu-data-table-col-age {
            flex: 0 0 50px;
          }
          #datatable-custom-sort .giu-data-table-col-phone {
            flex: 1 0 150px;
          }
          #datatable-custom-sort {
            margin-top: 3px;
            border-top: 1px solid var(--color-accent-bg);
            border-bottom: 1px solid var(--color-accent-bg);
          }
          #datatable-custom-sort .giu-data-table-header {
            border-bottom: 1px solid var(--color-accent-bg);
          }
        `}</style>
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
      <React.Fragment>
        <DataTable
          id="datatable-edit-validate"
          itemsById={itemsById}
          shownIds={Object.keys(itemsById)}
          alwaysRenderIds={Object.keys(this.state.changedRows)}
          cols={this.getCols()}
          commonCellProps={this.commonCellProps}
          collectionName="editAndValidateExample"
          uniformRowHeight
        />
        <style jsx global>{`
          #datatable-edit-validate .giu-data-table-col-name {
            flex: 1 0 150px;
          }
          #datatable-edit-validate .giu-data-table-col-type {
            flex: 0 0 80px;
          }
          #datatable-edit-validate .giu-data-table-col-lastModified {
            flex: 0 1 150px;
          }
          #datatable-edit-validate .giu-data-table-col-confirmed {
            flex: 0 0 30px;
            max-width: 30px;
          }
          #datatable-edit-validate .giu-data-table-col-phone {
            flex: 0 0 150px;
          }
          #datatable-edit-validate .giu-data-table-col-submit {
            flex: 0 0 50px;
          }
        `}</style>
      </React.Fragment>
    );
  }

  getCols() {
    return [
      {
        attr: 'name',
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <TextInput
            ref={c => registerInputRef(id, attr, c)}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            skipTheme
          />
        ),
      },
      {
        attr: 'type',
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <Select
            ref={c => registerInputRef(id, attr, c)}
            items={USER_TYPES}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
          />
        ),
      },
      {
        attr: 'lastModified',
        label: 'Last change',
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <DateInput
            ref={c => {
              registerInputRef(id, attr, c);
            }}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            skipTheme
          />
        ),
      },
      {
        attr: 'confirmed',
        labelLevel: 1,
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
        render: ({ item, id, attr, onChange, registerInputRef }) => (
          <TextInput
            ref={c => registerInputRef(id, attr, c)}
            value={item[attr]}
            onChange={() => onChange(id)}
            required
            skipTheme
          />
        ),
      },
      {
        attr: 'submit',
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
// Simple example: minimum attributes
// -----------------------------------------------
const DATA_SIMPLE_EXAMPLE = sampleDataTableItems(1000, 0);
const SimpleExample = () => {
  if (DEBUG) return null;
  const itemsById = DATA_SIMPLE_EXAMPLE;
  return (
    <React.Fragment>
      <DataTable
        id="datatable-simple"
        itemsById={itemsById}
        cols={[
          { attr: 'id' },
          { attr: 'name' },
          { attr: 'phone' },
          { attr: 'notes' },
        ]}
        shownIds={Object.keys(itemsById)}
        collectionName="simpleDataTableExample"
        animated
      />
      <style jsx global>{`
        #datatable-simple .giu-data-table-col-id {
          flex: 0 0 50px;
        }
        #datatable-simple .giu-data-table-col-name {
          flex: 0 0 100px;
        }
        #datatable-simple .giu-data-table-col-phone {
          flex: 0 0 150px;
        }
        #datatable-simple .giu-data-table-col-notes {
          flex: 1 0 100px;
        }
      `}</style>
    </React.Fragment>
  );
};

const DATA_VARIABLE_HEIGHT_EXAMPLE = sampleDataTableItems(6, 0);
const VariableHeightExample = () => {
  if (DEBUG) return null;
  const itemsById = DATA_VARIABLE_HEIGHT_EXAMPLE;
  return (
    <React.Fragment>
      <DataTable
        id="datatable-variable-height"
        itemsById={itemsById}
        cols={[
          { attr: 'id' },
          { attr: 'name' },
          { attr: 'phone' },
          { attr: 'notes' },
        ]}
        shownIds={Object.keys(itemsById)}
        collectionName="variableHeightDataTableExample"
        height={-1}
        animated
      />
      <style jsx global>{`
        #datatable-variable-height .giu-data-table-col-id {
          flex: 0 0 50px;
        }
        #datatable-variable-height .giu-data-table-col-name {
          flex: 0 0 100px;
        }
        #datatable-variable-height .giu-data-table-col-phone {
          flex: 0 0 150px;
        }
        #datatable-variable-height .giu-data-table-col-notes {
          flex: 1 0 100px;
        }
      `}</style>
    </React.Fragment>
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
// Public
// -----------------------------------------------
export default AllExamples;
