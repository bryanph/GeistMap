import _ from 'lodash'
import React, { PropTypes } from 'react'

import { List, ListItem } from 'material-ui/List'

import { Link } from 'react-router'

class SelectedEdges extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { edges, idKey } = this.props

        const listItems = _.map(edges, edge => (
            <Link key={edge.id} to={`/app/nodes/${edge[idKey].id}`}>
                <ListItem 
                    onTouchTap={this.props.onClick}
                    rightIconButton={<RemoveButton onClick={() => this.props.onRemoveClick(edge.id)}/>}
                    primaryText={edge[idKey].properties.name}
                />
            </Link>
        ))

        return (
            <List>
                {listItems}
            </List>
        )
    }
}
SelectedEdges.propTypes = {
    edges: PropTypes.array.isRequired,
    idKey: PropTypes.string,
    onRemoveClick: PropTypes.func,
    onClick: PropTypes.func,
}

export const SelectedEdgesTo = (props) => (
    <SelectedEdges
        {...props}
        idKey={'start'}
    />
)
SelectedEdgesTo.propTypes = {
    edges: PropTypes.array.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
}

export const SelectedEdgesFrom = (props) => (
    <SelectedEdges
        {...props}
        idKey={'end'}
    />
)
SelectedEdgesFrom.propTypes = {
    edges: PropTypes.array.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
}

import IconButton from 'material-ui/IconButton';
import ContentClear from 'material-ui/svg-icons/content/clear';


const RemoveButton = (props) => (
    <IconButton tooltip="Font Icon" {...props}>
        <ContentClear />
    </IconButton>
)
RemoveButton.propTypes = {
    onClick: PropTypes.func,
}
