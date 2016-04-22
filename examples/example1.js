import React                from 'react';
import ReactDOM             from 'react-dom';
import {
  Icon,
  LargeMessage,
  hoverable,
  flexItem,
  flexContainer,
  merge,
}                           from '../src';

// -----------------------------------------------
// Examples
// -----------------------------------------------
const App = () => (
  <div>
    <Message />
    <Icons />
    <Hoverable />
    <FlexRow>
      <span>Left</span>
      <FlexSpacer />
      <span>Right</span>
    </FlexRow>
  </div>
);

const Message = () => (
  <div style={style.example}>
    <LargeMessage>Hello there!</LargeMessage>
  </div>
);

const Icons = () => (
  <div style={style.example}>
    <Icon icon="heart" id="a" />
    {' '}
    <Icon icon="circle-o-notch" />
    {' '}
    <Icon icon="spinner" spin/>
    {' '}
    <Icon icon="arrow-left" id="a" />
  </div>
);

const Hoverable = hoverable(({ hovering, onHoverStart, onHoverStop }) => (
  <div
    onMouseEnter={onHoverStart}
    onMouseLeave={onHoverStop}
    style={merge(style.example, style.hoverable(hovering))}
  >
    Hoverable
  </div>
));

const FlexRow = ({ children }) => (
  <div style={merge(style.example, flexContainer('row'))}>
    {children}
  </div>
);

const FlexSpacer = ({ children }) => <div style={flexItem('1')}>{children}</div>;

// -----------------------------------------------
// Styles
// -----------------------------------------------
const style = {
  example: {
    marginBottom: 5,
    width: 400,
    border: '1px solid #ccc',
    padding: 5,
  },
  hoverable: hovering => ({
    backgroundColor: hovering ? '#ccc' : undefined,
  }),
};

// -----------------------------------------------
// Render main
// -----------------------------------------------
ReactDOM.render(<App/>, document.getElementById('app'));