/**
*
* DeleteButton
*
*/

import React from 'react';

import styles from './styles.css';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';

function DeleteButton({ onClick }) {
  return (
    <div className={ styles.deleteButton }>
        <IconButton onClick={onClick}>
            <ActionDelete />
        </IconButton>
    </div>
  );
}

export default DeleteButton;
