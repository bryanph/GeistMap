/**
 *
 * CollectionTable
 *
 */

import React, { PropTypes } from 'react';
import { withRouter } from 'react-router'

import styles from './styles.css';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export const CollectionTableRow = ({ name, description, nodeCount, ...rest }) => (
    <TableRow {...rest} hoverable={true}>
        <TableRowColumn>{ name }</TableRowColumn>
        <TableRowColumn>{ description || "No description" }</TableRowColumn>
        <TableRowColumn>{ nodeCount }</TableRowColumn>
    </TableRow>
    
)
CollectionTableRow.propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
}

class CollectionTable extends React.Component {

    constructor(props) {
        super(props)

        this.collectionDetailRoute = this.collectionDetailRoute.bind(this)
    }

    collectionDetailRoute(rowNumber, columnId) {
        const collection = this.props.collections[rowNumber]

        this.props.router.push(`/app/collections/${collection.id}`)
    }

    render() {

        const rows = this.props.collections.map(coll => (
            <CollectionTableRow
                style={{cursor: 'pointer'}}
                key={coll.id}
                name={coll.properties.name}
                description={coll.properties.description}
                nodeCount={coll.count || 0}
            />
        ))
        return (
            <div className={ styles.collectionTable }>
                <Table onCellClick={this.collectionDetailRoute}>
                    {/* // TODO: make table headers sortable (pass div with onClick) - 2016-07-13 */}
                    <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                        <TableRow>
                            <TableHeaderColumn>Name</TableHeaderColumn>
                            <TableHeaderColumn>Description</TableHeaderColumn>
                            <TableHeaderColumn>Number of Nodes</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        { rows }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

export default withRouter(CollectionTable);
