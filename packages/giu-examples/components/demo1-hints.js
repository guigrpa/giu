// @flow

/* eslint-disable no-console, no-alert, max-len */
/* eslint-disable react/prop-types, react/no-multi-comp, react/jsx-no-bind, react/jsx-boolean-value */
/* eslint-disable react/prefer-stateless-function, react/no-string-refs */
import React from 'react';
import {
  HintScreen,
  hintDefine,
  hintShow,
  hintReset,
  hintDisableAll,
  Button,
  Icon,
} from 'giu';
import { ExampleLabel, exampleStyle } from './demo1-common';

class HintExample extends React.Component {
  state: { fEmbeddedHint: boolean };

  constructor() {
    super();
    this.state = { fEmbeddedHint: false };
  }

  componentWillMount() {
    hintDefine('hintExample', {
      elements: () => {
        const out = [];
        const ref = this.refs.buttonShowHint;
        if (ref) {
          const bcr = ref.getBoundingClientRect();
          const x = bcr.right + 90;
          const y = bcr.top - 80;
          out.push({
            type: 'LABEL',
            x,
            y,
            children: 'Just shows a pre-defined hint (if not already shown)',
          });
          out.push({
            type: 'ARROW',
            from: { x, y },
            to: { x: (bcr.left + bcr.right) / 2, y: bcr.top - 5 },
            counterclockwise: true,
          });
        }
        return out;
      },
    });
  }

  render() {
    return (
      <div style={exampleStyle}>
        <ExampleLabel>
          Hints (show once, disable-all, reset) and Hint (embedded): simple
          label positioning, even taking into account DOM element positions
        </ExampleLabel>
        <span ref="buttonShowHint">
          <Button onClick={() => hintShow('hintExample')}>
            Show hint (if not already shown)
          </Button>
        </span>{' '}
        <Button
          onClick={() => {
            hintReset();
            alert('Hints have been reset');
          }}
        >
          Reset hints
        </Button>{' '}
        <Button
          onClick={() => {
            hintDisableAll();
            alert('Hints have been disabled');
          }}
        >
          Disable all
        </Button>{' '}
        <br />
        <span ref="buttonEmbedHint">
          <Button onClick={() => this.setState({ fEmbeddedHint: true })}>
            Embed hint
          </Button>
        </span>
        {this.state.fEmbeddedHint && this.renderEmbeddedHint()}
      </div>
    );
  }

  renderEmbeddedHint() {
    const close = () => this.setState({ fEmbeddedHint: false });
    const elements = () => {
      const out = [
        {
          type: 'LABEL',
          x: 300,
          y: 30,
          align: 'right',
          children: (
            <span>
              A right-aligned label with an icon: <Icon icon="ambulance" />
            </span>
          ),
        },
        {
          type: 'LABEL',
          x: 500,
          y: 60,
          align: 'center',
          children: (
            <span>
              A <span style={{ color: 'yellow' }}>center-aligned</span> label
            </span>
          ),
        },
        {
          type: 'LABEL',
          x: 700,
          y: 80,
          children: (
            <span>
              A very, very, very, very, very, very, very, very long label
            </span>
          ),
        },
        { type: 'ARROW', from: { x: 300, y: 30 }, to: { x: 420, y: 60 } },
        {
          type: 'ARROW',
          from: { x: 550, y: 120 },
          to: { x: 700, y: 140 },
          counterclockwise: true,
        },
      ];
      const ref = this.refs.buttonEmbedHint;
      if (ref) {
        const bcr = ref.getBoundingClientRect();
        const y = (bcr.top + bcr.bottom) / 2;
        const to =
          y >= 130
            ? { x: bcr.right + 10, y }
            : { x: (bcr.left + bcr.right) / 2, y: bcr.bottom + 10 };
        const counterclockwise = y >= 130;
        out.push({
          type: 'LABEL',
          x: 160,
          y: Math.max(130, (bcr.top + bcr.bottom) / 2),
          children: (
            <span>
              This is <i>the</i> button
            </span>
          ),
        });
        out.push({
          type: 'ARROW',
          from: { x: 160, y: Math.max(130, y) },
          to,
          counterclockwise,
        });
      }
      return out;
    };
    return <HintScreen onClose={close} elements={elements} />;
  }
}

export default HintExample;
