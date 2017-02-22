import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export const ModalButton = React.createClass({
    /*
     * A button with its own Modal container
     * Has state w.r.t the Modal being open or closed
    */

    getInitialState: function() {
        return {
            opened: false
        }
    },

    propTypes: {
        children: React.PropTypes.element.isRequired,
        name: React.PropTypes.string.isRequired,

        buttonProps: React.PropTypes.element, // TODO: Allow spread on button - 2016-01-28
    },

    toggleModal: function() {
        this.setState({ opened: !this.state.opened })
    },

    render: function() {
        return (
            <div style={{float: this.props.float}}>
                <a className={this.props.className} onClick={this.toggleModal}>{this.props.name}</a>
                <ReactCSSTransitionGroup transitionName="fade-slow" transitionEnterTimeout={400} transitionLeaveTimeout={400}> 
                    {this.state.opened ? <ModalOverlay /> : null }
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup transitionName="zoom" transitionEnterTimeout={600} transitionLeaveTimeout={600}> 
                    {this.state.opened ? 
                        <ModalContainer>
                            <div className="modal">
                                {this.props.children}
                                <div className="actions">
                                    {this.props.actionButton ? <a className="button secondary" onClick={this.props.action}>{this.props.actionButton}</a> : null }
                                    {this.props.closeButton ? <a className="button" onClick={this.toggleModal}>{this.props.closeButton}</a> : null }
                                </div>
                            </div>
                        </ModalContainer>
                    : null}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
})

const ModalContainer = React.createClass({
    /*
     * Overlay container
     */

    propTypes: {
        children: React.PropTypes.element.isRequired,
        opened: React.PropTypes.bool,
    },

    render: function() {
        return (
            <div className="modal-container">
                <div className="row">
                    <div className="columns small-centered small-12 medium-8 large-6 xlarge-4">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
})

const ModalOverlay = props => {
    return (
        <div className="modal-overlay"></div>
    )
}

