/*
 *
 * NodeView
 * combines CollectionDetail and NodeExplore
 *
 */

import React from 'react';
import classNames from 'classnames'

import NodeGraph from '../../components/graphs/NodeGraph'
import FocusGraph from '../../components/graphs/FocusGraph'
import ExploreGraph from '../../components/graphs/ExploreGraph'
import AddNodeWindow from '../../components/AddNodeWindow'
import GraphTypeSwitcher from '../../components/GraphTypeSwitcher'
import AbstractionList from '../../containers/AbstractionList'
import AbstractionNavigator from '../../components/AbstractionNavigator'
import NodeEditorToolbar from '../../containers/NodeEditorToolbar'
import NodeEditor from '../../containers/NodeContentEditor'
import { HotKeys } from 'react-hotkeys';
import { Dimmer, Loader } from 'semantic-ui-react'

import './styles.scss'

import { toggleShowLinks } from '../../actions/ui'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'

class ToggleShowLinks extends React.Component {
    render() {
        const styles = {
            position: "absolute",
            zIndex: 100,
            right: '10px',
            bottom: '10px',
        }
        return (
            <Button style={styles} toggle active={this.props.active} onClick={this.props.toggleShowLinks}>
                Show Links
            </Button>
        )
    }
}

ToggleShowLinks = connect(
    (state) => ({ active: state.uiState.showLinks }),
    { toggleShowLinks }
)(ToggleShowLinks)

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

        const appContainerClass = classNames("appContainer", {
            "abstractionList-pusher": this.props.abstractionSidebarOpened
        })

        return (
                <HotKeys className={appContainerClass}>
                    <Dimmer active={isLoading} inverted>
                        <Loader />
                    </Dimmer>

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
                        <ToggleShowLinks />
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
                        <AbstractionList
                            isLoading={isLoading}
                            focusNode={this.props.focusNode}
                            nodeTree={this.props.nodeTree}
                        />
                        {
                            graphType === "hierarchy" ?
                                <FocusGraph {...this.props} />
                                :
                                <ExploreGraph {...this.props} />
                        }
                        {
                            /*
                        <AddNodeWindow
                            graphType={graphType}
                            opened={mode === 'edit'}
                            activeNodeId={this.props.activeNodeId}
                            focusNodeId={this.props.focusNodeId}
                            disabled={isLoading}
                        />
                            */
                        }
                        {
                            /*
                        <GraphTypeSwitcher
                            graphType={graphType}
                            disabled={isLoading}
                            id={this.props.activeNodeId || this.props.focusNodeId}
                            node={this.props.activeNode || this.props.focusNode}
                        />
                            */
                        }
                    </div>

                </HotKeys>

        );
    }
}

export default NodeView
