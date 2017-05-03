// @flow

/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import Backdrop from '../backdrop';

describe('Backdrop', () => {
  it('01 renders with default style', () => {
    const tree = renderer.create(
      <Backdrop />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('02 renders with custom style', () => {
    const tree = renderer.create(
      <Backdrop style={{ backgroundColor: 'black' }} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
