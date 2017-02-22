/*
 *
 * NodeExplore
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from './styles.css';

import NodeEditor from '../../containers/NodeEditor'
import NodeExplore from '../../containers/NodeExplore'

import MainFocus from '../../containers/MainFocus'

export class NodeExplore extends React.Component { // eslint-disable-line react/prefer-stateless-function


    render() {
        const { id, loadingStates } = this.props

        if (id && loadingStates.GET_NODE_L2) {
            return <Spinner />
        }

        return (
            <MainFocus
                left={
                    <NodeEditor page="explore"/>
                }
                right={
                    <NodeExplore />
                }
            />
        );
    }
}

function mapStateToProps(state, props) {
    const { id } = props.params

    return {
        loadingStates: state.loadingStates,
    };
}

export default connect(mapStateToProps)(NodeExplore);
