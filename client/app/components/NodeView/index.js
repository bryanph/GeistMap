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
import GraphModes from '../../components/GraphModes'
import ExpandButton from '../../components/ExpandButton'
import AbstractionList from '../../containers/AbstractionList'
import AbstractionNavigator from '../../components/AbstractionNavigator'

import './styles.scss'


export class NodeView extends React.PureComponent {
    render() {
        const {
            nodeId,
            nodes,
            collections,
            links,
            focus,
            mode,
            isLoading,
            graphType,
        } = this.props

        // TODO: pass in collections and nodes separately - 2017-07-09

        return (
            <div className='appContainer'>
                <AddNodeWindow 
                    opened={mode === 'edit'} 
                    collection={this.props.activeCollection} 
                    disabled={isLoading}
                />
                <AbstractionNavigator
                    collectionChain={this.props.collectionChain}
                    collection={this.props.activeCollection}
                />
                <AbstractionList 
                    collections={collections}
                />
                <NodeGraph 
                    isLoading={isLoading}
                    activeNode={this.props.activeNode}
                    activeCollection={this.props.activeCollection}
                    nodes={nodes}
                    collections={collections}
                    links={links}
                    graphType={ graphType }
                    mode={mode}
                    focus={focus}

                    addNode={this.props.addNode}
                    connectNodes={this.props.connectNodes}
                    updateNode={this.props.updateNode}
                    setActiveNode={this.props.setActiveNode}
                    toggleCollapse={this.props.toggleCollapse}
                    moveToAbstraction={this.props.moveToAbstraction}
                />
                { /* // TODO: combine this into one mode button - 2017-06-28 */ }
                <div className="graphActions">
                    <GraphModes />
                </div>
            </div>

        );
    }
}

export default NodeView

