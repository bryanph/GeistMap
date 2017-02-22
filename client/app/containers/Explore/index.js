/*
 *
 * Explore
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

export class Explore extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
      This is Explore container !
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default Explore;
