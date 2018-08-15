// @flow

/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer'; // eslint-disable-line
import DropDownMenu from '../dropDownMenu';
import { LIST_SEPARATOR } from '../..';
import { floatAdd, floatDelete } from '../floats';

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
jest.mock('../floats');

describe('DropDownMenu', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('01 renders (closed)', () => {
    const tree = renderer
      .create(<DropDownMenu items={ITEMS}>Menu title</DropDownMenu>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('02 toggles highlight on/off when clicked upon', () => {
    const component = renderer.create(
      <DropDownMenu items={ITEMS}>Menu title</DropDownMenu>
    );
    let tree;
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // Open
    const focusEl = $(tree, 'input');
    focusEl.props.onFocus();
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // Close
    focusEl.props.onBlur();
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('03 shows/hides float when clicked upon', () => {
    floatAdd.mockReturnValue(425);
    const component = renderer.create(
      <DropDownMenu items={ITEMS}>Menu title</DropDownMenu>
    );
    const tree = component.toJSON();
    const focusEl = $(tree, 'input');

    // Open
    focusEl.props.onFocus();
    expect(floatAdd.mock.calls.length).toEqual(1);
    const float = renderer.create(floatAdd.mock.calls[0][0].children).toJSON();
    expect(float).toMatchSnapshot();

    // Close
    focusEl.props.onBlur();
    expect(floatDelete.mock.calls.length).toEqual(1);
    expect(floatDelete.mock.calls[0][0]).toEqual(425);
  });
});
