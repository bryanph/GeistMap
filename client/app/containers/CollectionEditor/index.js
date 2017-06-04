
/*
 *
 * CollectionEditor
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import CollectionEditorToolbar from '../../containers/CollectionEditorToolbar'
import ContentEditor from '../../containers/CollectionContentEditor'
import Spinner from '../../components/Spinner'

class CollectionEditor extends React.Component {

    componentWillMount() {
        this.props.loadCollection(this.props.id)
    }

    componentWillReceiveProps(nextProps) {
        // TODO: set active collection if id is set - 2016-10-05
        if (nextProps.id && this.props.id !== nextProps.id) {
            this.props.loadCollection(nextProps.id)
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
                            shortcutWindow={this.props.shortcutWindow}
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
        shortcutWindow: state.serverUiState.shortcutWindow,
    }
}

import { loadCollection } from '../../actions/async'

export default connect(mapStateToProps, { loadCollection })(CollectionEditor);
