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
import { HotKeys } from 'react-hotkeys';

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

        const handlers = {
            'escape': () => this.props.setGraphMode("view"),
            'navigateMode': () => this.props.setGraphMode("view"),
            'editMode': () => this.props.setGraphMode("edit"),
            'abstractMode': () => this.props.setGraphMode("abstract"),
            'focusMode': () => this.props.setGraphMode("focus"),
            'deleteMode': () => this.props.setGraphMode("delete"),
        }

        // TODO: handle loading state - 2017-09-04

        return (
            <HotKeys handlers={handlers} className='appContainer'>
                <AddNodeWindow
                    graphType={graphType}
                    opened={mode === 'edit'}
                    activeNodeId={this.props.activeNodeId}
                    activeCollectionId={this.props.activeCollectionId}
                    disabled={isLoading}
                />
                {
                    graphType === "collection" ?
                        [
                        <AbstractionNavigator
                            key="1"
                            collectionChain={this.props.collectionChain}
                            collection={this.props.activeCollection}
                        />,
                        <AbstractionList
                            key="2"
                            collectionChainIds={this.props.collectionChainIds}
                            activeCollection={this.props.activeCollection}
                            collections={this.props.collections}
                        />
                        ]
                    :
                        null
                }
                <NodeGraph
                    isLoading={isLoading}
                    activeNodeId={this.props.activeNodeId}
                    activeNode={this.props.activeNode}
                    activeCollection={this.props.activeCollection}
                    activeCollectionId={this.props.activeCollectionId}
                    nodes={nodes}
                    collections={this.props.visibleCollections}
                    links={links}
                    collectionChain={this.props.collectionChain}
                    graphType={ graphType }
                    mode={mode}
                    focus={focus}

                    addNode={this.props.addNode}
                    connectNodes={this.props.connectNodes}
                    updateNode={this.props.updateNode}
                    removeNode={this.props.removeNode}
                    removeNodeFromCollection={this.props.removeNodeFromCollection}
                    removeAbstraction={this.props.removeAbstraction}
                    setActiveNode={this.props.setActiveNode}
                    toggleCollapse={this.props.toggleCollapse}
                    moveToAbstraction={this.props.moveToAbstraction}
                    fetchNodeL1={this.props.fetchNodeL1}
                    removeEdge={this.props.removeEdge}
                />
                { /* // TODO: combine this into one mode button - 2017-06-28 */ }
                <div className="graphActions">
                    <GraphModes
                        graphType={graphType}
                    />
                </div>
            </HotKeys>

        );
    }
}

export default NodeView
