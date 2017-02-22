/**
*
* ExploreButton
*
*/

import React from 'react';
import styles from './styles.css';
import { Link } from 'react-router'
import FlatButton from 'material-ui/FlatButton';

function ExploreButton({ id, label }) {
  return (
    <div className={ styles.exploreButton }>
        <Link to={`/app/explore/nodes/${id}`}>
            <FlatButton
                label="Explore Graph"
                primary={true}
            />
        </Link>

    </div>
  );
}

export default ExploreButton;
