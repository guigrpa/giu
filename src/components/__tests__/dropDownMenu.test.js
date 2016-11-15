// @flow

/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import DropDownMenu from '../dropDownMenu';
import { Floats } from '../floats';
import { LIST_SEPARATOR } from '../../';

const lang = 'es';
const ITEMS = [
  { label: () => (lang === 'es' ? 'Manzanas' : 'Apples'), value: 'a' },
  { label: '2', value: 2 },
  LIST_SEPARATOR,
  { label: () => (lang === 'es' ? 'Bayas' : 'Berries'), value: 'b' },
  { label: 'true', value: true },
  { label: 'C', value: 'c' },
];

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');

describe('DropDownMenu', () => {
  it('01 renders (closed)', () => {
    const tree = renderer.create(
      <div>
        <Floats />
        <DropDownMenu items={ITEMS}>Menu title</DropDownMenu>
      </div>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // it('02 opens when clicked upon', () => {
  //   const component = renderer.create(
  //     <div>
  //       <Floats />
  //       <DropDownMenu items={ITEMS}>Menu title</DropDownMenu>
  //     </div>
  //   );
  //   let tree;
  //   tree = component.toJSON();
  //   expect(tree).toMatchSnapshot();
  //   const selectEl = $(tree, '.giu-select-custom');
  //   selectEl.onMouseDown();
  //   tree = component.toJSON();
  //   expect(tree).toMatchSnapshot();
  // });
});
