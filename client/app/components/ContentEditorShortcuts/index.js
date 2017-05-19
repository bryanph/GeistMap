/**
 *
 * ContentEditorShortcuts
 *
 */

import React from 'react';

import {Tabs, Tab} from 'material-ui/Tabs';
import { CollapseButton } from '../../components/Buttons'

export const Shortcut = ({ shortcut, text }) => {
    const shortcutSpans = shortcut.map(s => <span style={styles.highlight}>{s}</span>)

    return (
        <div className="ContentEditorShortcuts-shortcut">
            <span>{ shortcutSpans.reduce((acc, span) => {
                return acc === null ? [span] : [...acc, ' + ', span]
            }, null) }</span>
        <span style={styles.shortcutText}>{text}</span>
    </div>
    )
}

const styles = {
    div: {
        backgroundColor: '#fafafa',
        width: '100%',
        fontSize: '1.2rem',
        position: 'fixed',
        zIndex: 100,
        bottom: 0,
    },
    innerDiv: {
        'maxWidth': '1000px',
        'position': 'relative',
        margin: 'auto'
    },
    header: {
            textAlign: 'center',
        },
        headerH3: {
                fontSize: '1.4rem',
                marginTop: '8px',
            },
            highlight: {
                border: '1px solid grey',
                borderRadius: '3px',
                padding: '5px 10px',
                backgroundColor: 'white'
            },
            shortcutText: {
                marginLeft: '10px',
            },
            shortcutContainer: {
                    display: 'flex',
                    maxWidth: '800px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    height: '200px',
                    marginTop: '10px',
                    lineHeight: '3rem',
                },
                collapseButton: {
                        zIndex: 99,
                        position: 'absolute',
                        right: 0,
                        top: 0,
                    },
}

const CollapseShortcuts = (props) => (
    <div style={styles.collapseButton}>
        <CollapseButton 
            onTouchTap={props.hideShortcutWindow} 
        />
    </div>
)

class ContentEditorShortcuts extends React.Component {

    constructor(props) {
        super(props)
        this.hideShortcutWindow = this.hideShortcutWindow.bind(this)
    }

    hideShortcutWindow() {
        this.props.updateUi({
            shortcutWindow: false,
        })       
    }

    render() {
        if (!this.props.shortcutWindow) {
            return null
        }

        return (
            <div style={styles.div}>
                <div style={styles.innerDiv}>
                <CollapseShortcuts 
                    hideShortcutWindow={this.hideShortcutWindow}
                />
                <span style={styles.header}>
                    <h3 style={styles.headerH3}>Keyboard Shortcuts</h3>
                </span>
                <div className="contentEditorShortcuts-shortcuts">
                    <Tabs 
                        tabItemContainerStyle={{color: 'black', backgroundColor: 'transparent'}}
                    >

                        <Tab label="Editor" style={{color: 'black'}}>
                            <div style={styles.shortcutContainer}>
                                <div>
                                    <Shortcut 
                                        shortcut={["Ctrl", "B"]}
                                        text="Bold"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "I"]}
                                        text="Italic"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "U"]}
                                        text="Underline"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "K"]}
                                        text="Link"
                                    />
                                </div>
                                <div>
                                    <Shortcut 
                                        shortcut={["*", "Space"]}
                                        text="Bullet list"
                                    />
                                    <Shortcut 
                                        shortcut={["1", ".", "Space"]}
                                        text="Ordered list"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "1"]}
                                        text="Big header"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "2"]}
                                        text="Smaller header"
                                    />
                                </div>
                            </div>
                        </Tab>
                        <Tab label="Editor 2" style={{color: 'black'}}>
                            <div style={styles.shortcutContainer}>
                                <div>
                                    <Shortcut 
                                        shortcut={["Ctrl", "Shift", "K"]}
                                        text="Node Link"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "6"]}
                                        text="Quote"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "7"]}
                                        text="Code"
                                    />
                                </div>
                                <div>
                                    <Shortcut 
                                        shortcut={["Ctrl", "m"]}
                                        text="TeX inline"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "M"]}
                                        text="TeX block"
                                    />
                                </div>
                            </div>
                        </Tab>
                        <Tab label="Actions" style={{color: 'black'}}>
                            <div style={styles.shortcutContainer}>
                                <div>
                                    <Shortcut 
                                        shortcut={["Ctrl", "Alt", "E"]}
                                        text="Explore node"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "Alt", "R"]}
                                        text="Add a relation"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "Alt", "D"]}
                                        text="Duplicate/copy node"
                                    />
                                </div>
                                <div>
                                    <Shortcut 
                                        shortcut={["Ctrl", "Alt", "G"]}
                                        text="Remove/trash node"
                                    />
                                    <Shortcut 
                                        shortcut={["Ctrl", "Alt", "C"]}
                                        text="Add a collection"
                                    />
                                    { /*
                                    <Shortcut 
                                        shortcut={["Ctrl", "Alt", "F"]}
                                        text="Focus on search"
                                    />
                                    */}
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
            </div>
        );
    }
}

import { connect } from 'react-redux'
import { updateUi } from '../../actions/async'

export default connect(state => state.serverUiState, { updateUi })(ContentEditorShortcuts);
