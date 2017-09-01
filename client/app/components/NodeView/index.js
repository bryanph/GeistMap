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

        return (
            <HotKeys handlers={handlers} className='appContainer'>
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
                    collectionChainIds={this.props.collectionChainIds}
                    activeCollection={this.props.activeCollection}
                    collections={this.props.collections}
                />
                <NodeGraph
                    isLoading={isLoading}
                    activeNode={this.props.activeNode}
                    activeCollection={this.props.activeCollection}
                    nodes={nodes}
                    collections={this.props.visibleCollections}
                    links={links}
                    graphType={ graphType }
                    mode={mode}
                    focus={focus}

                    addNode={this.props.addNode}
                    connectNodes={this.props.connectNodes}
                    updateNode={this.props.updateNode}
                    removeNode={this.props.removeNode}
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
                    />
                </div>
            </HotKeys>

        );
    }
}

export default NodeView
