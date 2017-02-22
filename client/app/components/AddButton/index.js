/**
*
* AddButton
*
*/

import React, { PropTypes } from 'react';

import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add';


const AddButton = (props) => (
    <FloatingActionButton onClick={props.onClick} {...props}>
        <ContentAdd />
    </FloatingActionButton>
)
AddButton.propTypes = {
    onClick: PropTypes.func.isRequired,
}

export default AddButton;
