/* eslint-disable no-console */

import React from 'react';
import { Floats, TextInput, PasswordInput } from '../src';

const Component = class extends React.Component {
  // componentDidMount() {
  //   setTimeout(() => {
  //     this.refUserName && this.refUserName._blur();
  //     this.refPassword && this.refPassword._blur();
  //     this.refUserName && this.refUserName._focus();
  //   }, 2000)
  // }
  render() {
    // <form action="/api" method="post">
    return (
      <div className="login">
        <Floats />
        <form onSubmit={ev => this.onHandleSubmit(ev)}>
          <TextInput
            ref={c => {
              this.refUserName = c;
            }}
            id="a"
            value=""
            placeholder="Enter your name"
            focusOnChange={false}
          />
          <PasswordInput
            ref={c => {
              this.refPassword = c;
            }}
            id="b"
            value=""
            placeholder="Enter your password"
            focusOnChange={false}
          />
          <br />
          <br />
          <input type="submit" value="Log in" />
        </form>
      </div>
    );
  }

  onHandleSubmit(ev) {
    ev.preventDefault();
    const credentials = {
      username: this.refUserName.getValue(),
      password: this.refPassword.getValue(),
    };
    fetch('/api', {
      method: 'post',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        console.log(res);
        return fetch('/api');
      })
      .catch(() => {});
  }
};

export default Component;
