/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React                from 'react';
import faker                from 'faker';
import { LIST_SEPARATOR }   from '../src';

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

let lang = 'en';
const getLang = () => lang;
const setLang = newLang => { lang = newLang; };

const NORMAL_OPTIONS = [
  { label: () => (lang === 'es' ? 'Manzanas' : 'Apples'), value: 'a', keys: 'mod+a', onClick: () => console.log('Custom click Apples') },
  { label: '2', value: 2, keys: 'mod+2' },
  LIST_SEPARATOR,
  { label: () => (lang === 'es' ? 'Bayas' : 'Berries'), value: 'b', keys: ['shift+b', 'shift+c'] },
  { label: 'true', value: true, keys: 'alt+backspace' },
  { label: 'C', value: 'c', keys: 'shift+up' },
];

const TALL_OPTIONS = [];
for (let i = 0; i < 50; i++) {
  TALL_OPTIONS.push({
    label: `Option ${i}`,
    value: i,
  });
}

const WIDE_OPTIONS = [
  { label: 'A long, really long, very very very very very very long option', value: 'a' },
  { label: 'Another long, really long, very very long option', value: 2 },
  LIST_SEPARATOR,
  { label: 'B', value: 'b' },
  { label: 'true', value: true },
  { label: 'C', value: 'c' },
];

const LONG_TEXT = faker.lorem.sentences(7).split('\n').join(' ');

const onChange = (ev, o) => console.log(o);
const onChangeJson = (ev, o) => console.log(JSON.stringify(o));

export {
  ExampleLabel, exampleStyle,
  NORMAL_OPTIONS, TALL_OPTIONS, WIDE_OPTIONS,
  LONG_TEXT,
  onChange, onChangeJson,
  getLang, setLang,
};
