/**
*
* ExploreCollectionButton
*
*/

import React from 'react';

import styles from './styles.css';
import { Link } from 'react-router'
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

function ExploreCollectionButton() {
  return (
    <div className={ styles.exploreButton }>
        <Link to={`/app/explore/collections/`}>
            <FlatButton
                label="Explore Collections"
                primary={true}
            />
        </Link>
    </div>
  );
}

export default ExploreCollectionButton;
