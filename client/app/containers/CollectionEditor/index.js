
/*
 *
 * CollectionEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import CollectionEditorToolbar from '../../containers/CollectionEditorToolbar'
import ContentEditor from '../../containers/CollectionContentEditor'
import Spinner from '../../components/Spinner'

class CollectionEditor extends React.Component {

    componentWillMount() {
        this.props.getCollectionL1(this.props.id)
    }

    componentWillReceiveProps(nextProps) {
        // TODO: set active collection if id is set - 2016-10-05
        if (nextProps.id && this.props.id !== nextProps.id) {
            this.props.getCollectionL1(nextProps.id)
        }
    }

    render() {
        const { loadingStates, collection } = this.props

        if (loadingStates.GET_COLLECTION) {
            return <Spinner />
        }

        return (
            <div className="appContainer">
                <CollectionEditorToolbar
                    id={this.props.id}
                    page={this.props.page}
                />
                <div className="contentContainer">
                    <div className="contentContainer-inner">
                        <ContentEditor
                            id={this.props.id}
                            collection={collection}
                            withToolbar={false}
                            withoutContentLink={true}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

import { getCollection } from '../../reducers'

function mapStateToProps(state, props) {
    return {
        id: props.match.params.id,
        collection: getCollection(state, props.match.params.id),
        loadingStates: state.loadingStates,
    }
}

import { getCollectionL1 } from '../../actions/collection'

export default connect(mapStateToProps, { getCollectionL1 })(CollectionEditor);
