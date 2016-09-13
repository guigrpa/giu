/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
import React                from 'react';

const ExampleLabel = ({ children }) => <div style={style.label}>{children}</div>;

const style = {
  label: {
    fontWeight: 'bold',
    color: 'darkblue',
  },
};

const exampleStyle = {
  marginLeft: 5,
  marginTop: 5,
  marginBottom: 5,
  border: '1px solid #ccc',
  padding: 10,
  minWidth: 400,
};

export {
  ExampleLabel,
  exampleStyle,
};
