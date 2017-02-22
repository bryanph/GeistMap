/*
 *
 * CollectionDetail
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'

import { DebouncedTextField } from '../../components/Input'

import NodeSearch from '../../containers/NodeSearch'
import { TrashButton, EditButton } from '../../components/Buttons'
import ContentEditor from '../../containers/CollectionContentEditor'

import EditableTitle from '../../components/EditableTitle'
import { accentColor } from '../../containers/App/muitheme'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import moment from 'moment'
import NodeEditor from '../../containers/NodeEditor'
import Spinner from '../../components/Spinner'
import MainFocus from '../../containers/MainFocus'

const styles = {
    cardTitle: {
        textAlign: 'center',
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '10px',
        marginRight: '10px',
    },
    collapseButton: {
        zIndex: 99,
        position: 'absolute',
        right: 0,
        top: 0,
    },
}

export class CollectionDetail extends React.Component { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props)

        // this.updateCollection = this.updateCollection.bind(this)
        // this.removeCollection = this.removeCollection.bind(this)
        // this.exploreCollection = this.exploreCollection.bind(this)
    }

//     updateCollection(obj) {
//         const { id, collection: { properties } } = this.props

//         const newProperties = Object.assign({}, properties, obj)

//         this.props.updateCollection(id, newProperties)
//     }

//     removeCollection() {
//         const result = window.confirm("Are you sure you want to delete this collection?")
//         if (result) {
//             this.props.removeCollection(this.props.id)
//                 .then(() => this.props.router.push(`/app/collections`))
//         }
//     }

    exploreCollection() {
        this.props.router.push(`/app/explore/collections/${this.props.id}`)
    }

    render() {
        const { collection } = this.props

        if (!collection) {
            return <Spinner />
        }

        return (
            <MainFocus
                left={
                    <CollectionDetailEditor id={this.props.id} />
                }
                right={
                    <CollectionDetail id={this.props.id}/>
                }
            />
        );
    }
}

import { loadCollection, updateCollection, addNodeToCollection, removeCollection } from '../../actions/async'
import { setTitle, showGraphSideBar, hideGraphSideBar, showAddNodeToCollectionWindow } from '../../actions/ui'


export default connect(mapStateToProps, { loadCollection, updateCollection, addNodeToCollection, removeCollection, setTitle, showAddNodeToCollectionWindow, showGraphSideBar, hideGraphSideBar})(withRouter(CollectionDetail));
