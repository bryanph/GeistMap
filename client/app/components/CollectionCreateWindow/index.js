/**
 *
 * CollectionCreateWindow
 *
 */

import React from 'react';
import { withRouter } from 'react-router-dom'

import styles from './styles.css';

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

class CollectionCreateWindow extends React.Component {

    constructor(props) {
        super(props)

        this.handleCancel = this.handleCancel.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }


    handleCancel() {
        this.props.hideWindow()

        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    handleSubmit() {
        this.props.hideWindow()

        const name = this.refs.name.getValue()
        // const description = this.refs.description.getValue()

        if (!name) {
            // TODO: render an error message... - 2016-07-12
            return
        }

        // const promise = this.props.createCollection({ name, description })
        this.props.createCollection({ name })
            .then((action) => {
                if (this.props.onCompleted) {
                    return this.props.onCompleted(action)
                }
            })
    }

    render() {

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleCancel}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleSubmit}
            />,
        ];

        return (
            <div className={ styles.collectionCreateWindow }>
                <Dialog
                    title="Create a collection"
                    actions={actions}
                    modal={false}
                    open={this.props.open}
                    onRequestClose={this.handleClose}
                >
                    <TextField
                        defaultValue={this.props.defaultValues.name}
                        ref="name"
                        hintText="Collection Name"
                    /><br />
                    {
                        /*
                    <TextField
                        defaultValue={this.props.defaultValues.description}
                        ref="name"
                        ref="description"
                        hintText="Collection description (optional)"
                        multiLine={true}
                        rows={2}
                        maxRows={100}
                    />
                        */
                    }
                </Dialog>
            </div>
        );
    }
}

export default withRouter(CollectionCreateWindow);
