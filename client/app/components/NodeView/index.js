/*
 *
 * NodeView
 * combines CollectionDetail and NodeExplore
 *
 */

import React from 'react';

import NodeGraph from '../../components/NodeGraph'
import AddButton from '../../components/AddButton'
import Spinner from '../../components/Spinner'
import AddNodeWindow from '../../components/AddNodeWindow'
import EditModeButton from '../../components/EditModeButton'
import FocusButton from '../../components/FocusButton'
import FetchNodeButton from '../../components/FetchNodeButton'

import './styles.scss'

export class NodeView extends React.PureComponent {
    render() {
        const {
            nodeId,
            collection,
            nodes,
            links,
            focus,
            mode,
            isLoading,
            graphType,
        } = this.props

        return (
            <div className='appContainer'>
                <AddNodeWindow 
                    opened={mode === 'edit'} 
                    collection={collection} 
                    disabled={isLoading}
                />
                <NodeGraph 
                    isLoading={isLoading}
                    activeNode={this.props.activeNode}
                    activeCollection={this.props.activeCollection}
                    nodes={nodes}
                    links={links}
                    collection={collection} 
                    graphType={ graphType }
                    mode={mode}
                    focus={focus}

                    addNode={this.props.addNode}
                    connectNodes={this.props.connectNodes}
                    updateNode={this.props.updateNode}
                    setActiveNode={this.props.setActiveNode}
                />
                { /* // TODO: combine this into one mode button - 2017-06-28 */ }
                <div className="graphActions">
                    <FocusButton />
                    <FetchNodeButton />
                </div>
                <div className="editModeButton-container">
                    <EditModeButton />
                </div>
            </div>

        );
    }
}

export default NodeView

