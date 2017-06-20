/**
*
* AddButton
*
*/

import React from 'react';

import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add';


const AddButton = (props) => (
    <FloatingActionButton onClick={props.onClick} {...props}>
        <ContentAdd />
    </FloatingActionButton>
)

export default AddButton;
