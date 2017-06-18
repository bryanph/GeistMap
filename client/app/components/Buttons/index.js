
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Delete from 'material-ui/svg-icons/action/delete';
import Edit from 'material-ui/svg-icons/editor/mode-edit';
import ActionExplore from 'material-ui/svg-icons/action/explore';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentClear from 'material-ui/svg-icons/content/clear';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import NavigationArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';

const styles = {
    labelStyle: {
        textTransform: 'none',
        fontSize: '0.9rem',
    }
}

export const TrashButton = (props) => (
    <FlatButton
        label="Delete"
        icon={<Delete />}
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const EditButton = (props) => (
    <FlatButton
        label={"Edit" || props.label}
        icon={<Edit />}
        secondary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const GraphButton = (props) => (
    <FlatButton
        label={"To Graph" || props.label}
        icon={<Edit />}
        secondary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const ExploreButton = (props) => (
    <FlatButton
        label={"Explore" || props.label}
        icon={<ActionExplore />}
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)


export const CollectionGraphButton = (props) => (
    <FlatButton
        label={"Show Collection" || props.label}
        icon={<ActionGroupWork />}
        secondary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const DuplicateButton = (props) => (
    <FlatButton
        label="Duplicate"
        icon={<ContentCopy />}
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const CollectionButton = (props) => (
    <FlatButton
        label={"Create Collection" || props.label}
        icon={<ActionGroupWork />}
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

import ActionGroupWork from 'material-ui/svg-icons/action/group-work';
export const CreateCollectionButton = (props) => (
    <FlatButton
        label="Create Collection"
        icon={<ActionGroupWork />}
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const AddRelationButton = (props) => (
    <FlatButton
        label="Add Relation"
        icon={<NavigationArrowForward />}
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

export const AddNodeWithRelationButton = (props) => (
    <RaisedButton
        label="Add Node with relation"
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)

const RaisedButton2 = (props) => (
    <RaisedButton
        primary={true}
        labelStyle={styles.labelStyle}
        {...props}
    />
)
export { RaisedButton2 as RaisedButton }

export const CollapseButton = (props) => (
    <IconButton tooltip="Close" {...props}>
        <ContentClear />
    </IconButton>
)

export const AddButton = (props) => (
    <FloatingActionButton primary={true} {...props}>
        <ContentAdd />
    </FloatingActionButton>
)

export const ClearButton = (props) => (
    <FloatingActionButton primary={true} {...props}>
        <ContentClear />
    </FloatingActionButton>
)
