// @flow

/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { LIST_SEPARATOR } from 'giu';

const ExampleLabel = ({ children }: Object) => (
  <div style={style.label}>{children}</div>
);

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
const setLang = (newLang: string) => {
  lang = newLang;
};

const NORMAL_OPTIONS = [
  {
    label: () => (lang === 'es' ? 'Manzanas' : 'Apples'),
    value: 'a',
    keys: 'mod+a',
    onClick: () => console.log('Custom click Apples'),
  },
  { label: '2', value: 2, keys: 'mod+2' },
  LIST_SEPARATOR,
  {
    label: () => (lang === 'es' ? 'Bayas' : 'Berries'),
    value: 'b',
    keys: ['shift+b', 'shift+c'],
  },
  { label: 'true', value: true, keys: 'alt+backspace' },
  { label: 'C', value: 'c', keys: 'shift+up' },
];

const TALL_OPTIONS = [];
for (let i = 0; i < 50; i++) {
  if (i === 31) {
    TALL_OPTIONS.push(LIST_SEPARATOR);
    TALL_OPTIONS.push({
      label: 'Title',
      value: 'title',
      disabled: true,
    });
  }
  TALL_OPTIONS.push({
    label: `Option ${i}`,
    value: i,
  });
}

const WIDE_OPTIONS = [
  {
    label: 'A long, really long, very very very very very very long option',
    value: 'a',
  },
  { label: 'Another long, really long, very very long option', value: 2 },
  LIST_SEPARATOR,
  { label: 'B', value: 'b' },
  { label: 'true', value: true },
  { label: 'C', value: 'c' },
];

const LONG_TEXT = `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`;

const onChange = (ev: ?SyntheticEvent<*>, o: any): any => console.log(o);
const onChangeJson = (ev: ?SyntheticEvent<*>, o: any): any =>
  console.log(JSON.stringify(o));

export {
  ExampleLabel,
  exampleStyle,
  NORMAL_OPTIONS,
  TALL_OPTIONS,
  WIDE_OPTIONS,
  LONG_TEXT,
  onChange,
  onChangeJson,
  getLang,
  setLang,
};
