import React from 'react';
import Link from 'next/link';

// ================================================
// Public
// ================================================
class AppWrapper extends React.Component {
  render() {
    return (
      <div>
        <Link href="play1">
          <a>Play1</a>
        </Link>
      </div>
    );
  }
}

export default AppWrapper;
