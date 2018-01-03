/*
 *
 * NodeView
 * combines CollectionDetail and NodeExplore
 *
 */

import React from 'react';
import classNames from 'classnames'

import NodeGraph from '../../components/graphs/NodeGraph'
import HierarchyGraph from '../../components/graphs/HierarchyGraph'
import AddNodeWindow from '../../components/AddNodeWindow'
import GraphModes from '../../components/GraphModes'
import GraphTypeSwitcher from '../../components/GraphTypeSwitcher'
import AbstractionList from '../../containers/AbstractionList'
import AbstractionNavigator from '../../components/AbstractionNavigator'
import NodeEditorToolbar from '../../containers/NodeEditorToolbar'
import { HotKeys } from 'react-hotkeys';

import './styles.scss'


export class NodeView extends React.PureComponent {
    render() {
        const {
            nodeId,
            nodes,
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

        const appContainerClass = classNames("appContainer", {
            "abstractionList-pusher": this.props.abstractionSidebarOpened
        })

        return (
            <HotKeys className={appContainerClass}>
                <AddNodeWindow
                    graphType={graphType}
                    opened={mode === 'edit'}
                    activeNodeId={this.props.activeNodeId}
                    activeCollectionId={this.props.activeCollectionId}
                    disabled={isLoading}
                />
                <NodeEditorToolbar
                    id={this.props.activeNodeId || this.props.activeCollectionId}
                    page="node"
                    isLoading={isLoading}
                    node={this.props.activeNode || this.props.activeCollection}
                />
                <div className="contentContainer">
                    {
                        /*
                        <AbstractionNavigator
                            key="1"
                            abstractionChain={this.props.abstractionChain}
                            collection={this.props.activeCollection}
                            isLoading={isLoading}
                            moveParent={this.props.moveParent}
                        /> 
                        */
                    }
                    {
                        graphType === "abstract" || graphType === "hierarchy" ?
                            <AbstractionList
                                isLoading={isLoading}
                                key="2"
                                activeCollection={this.props.activeCollection}
                                nodeTree={this.props.nodeTree}
                            /> : null
                    }
                    {
                        graphType === "hierarchy" ?
                            <HierarchyGraph {...this.props} />
                            :
                            <NodeGraph
                                {...this.props}
                            />
                    }
                </div>
                <GraphTypeSwitcher
                    graphType={graphType}
                    isLoading={isLoading}
                    id={this.props.activeNodeId || this.props.activeCollectionId}
                    node={this.props.activeNode || this.props.activeCollection}
                />
                <GraphModes
                    graphType={graphType}
                />
            </HotKeys>

        );
    }
}

export default NodeView
