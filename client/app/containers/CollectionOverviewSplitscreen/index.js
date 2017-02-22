/*
 *
 * CollectionOverview
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router'

import MainFocus from '../../containers/MainFocus'

import CollectionEditor from '../CollectionEditorToolbar'

// TODO: needs a name when posting, otherwise we get unnamed collections - 2016-07-12
export class CollectionOverview extends React.Component { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props)

        this.removeCollection = this.removeCollection.bind(this)
        this.exploreCollection = this.exploreCollection.bind(this)
    }

    removeCollection() {
        const { activeCollection } = this.props
        const result = window.confirm("Are you sure you want to delete this collection?")
        if (result) {
            this.props.removeCollection(activeCollection.id)
        }
    }

    exploreCollection() {
        const { activeCollection } = this.props
        this.props.router.push(`/app/explore/collections/${activeCollection.id}`)
    }

    render() {
        const { loadingStates } = this.props

        if (loadingStates.GET_COLLECTIONS) {
            return <Spinner />
        }

        return (
            <MainFocus
                left={
                    <CollectionOverview id={this.props.id} />
                }
                right={
                    <CollectionOverviewEditor id={this.props.id} />
                }
            />

        );
    }
}



export default CollectionOverview
