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
import NodeEditor from '../../containers/NodeContentEditor'
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
                <div className="nodeView-toolbar">
                    <NodeEditorToolbar
                        id={this.props.activeNodeId || this.props.focusNodeId}
                        isLoading={isLoading}
                        node={this.props.activeNode || this.props.focusNode}
                    />
                </div>

                { /* This is only visible in desktop mode */ }
                <div className="nodeView-editor">
                    <div className="contentContainer">
                        <div className="contentContainer-inner">
                            <NodeEditor
                                id={this.props.activeNodeId || this.props.focusNodeId}
                                isLoading={isLoading}
                                node={this.props.activeNode || this.props.focusNode}
                            />
                        </div>
                    </div>
                </div>

                <div className="nodeView-graph">
                    {
                        /*
                        <AbstractionNavigator
                            key="1"
                            abstractionChain={this.props.abstractionChain}
                            collection={this.props.focusNode}
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
                                focusNode={this.props.focusNode}
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
                    <AddNodeWindow
                        graphType={graphType}
                        opened={mode === 'edit'}
                        activeNodeId={this.props.activeNodeId}
                        focusNodeId={this.props.focusNodeId}
                        disabled={isLoading}
                    />
                    <GraphTypeSwitcher
                        graphType={graphType}
                        isLoading={isLoading}
                        id={this.props.activeNodeId || this.props.focusNodeId}
                        node={this.props.activeNode || this.props.focusNode}
                    />
                    <GraphModes
                        graphType={graphType}
                    />
                </div>

        </HotKeys>

        );
    }
}

export default NodeView
