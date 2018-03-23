// @noflow

/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer'; // eslint-disable-line
import Button from '../button';

describe('Button', () => {
  it('01 renders with default style', () => {
    const tree = renderer.create(<Button>This is a button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('02 renders with plain style', () => {
    const tree = renderer
      .create(<Button plain>This is a button</Button>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('03 renders disabled', () => {
    const tree = renderer
      .create(<Button disabled>This is disabled</Button>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('04 renders with custom style', () => {
    const tree = renderer
      .create(
        <Button
          style={{
            background: 'blue',
            color: 'white',
            border: '0px solid black',
          }}
        >
          This button is blue
        </Button>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
