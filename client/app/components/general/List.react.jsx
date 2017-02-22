"use strict"

import _ from 'lodash'
import React, { PropTypes } from 'react'
import classNames from 'classnames'
import store from '../../app'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'


import { List, ListItem } from 'material-ui/List'

export const ButtonList = React.createClass({
    /*
     * A list of accordions, acting as containers
     */

    propTypes: {
        // containers: PropTypes.arrayOf(PropTypes.elements).isRequired, // what is rendered in accordion
        onClick: PropTypes.func, // when clicking on the list item

        active: PropTypes.number, // index of active item

        ulClass: PropTypes.string,
        liClass: PropTypes.string,
        activeClass: PropTypes.string,
    },

    render: function() {

        // required
        let { children } = this.props
        // optional
        let { active, ulClass, liClass, activeClass } = this.props

        return (
            <ul className={ulClass}>
                {children}
            </ul>
        )
    }
})

export const NestedButtonList = React.createClass({
    /*
     * A list of accordions, acting as containers
     */

    propTypes: {
        // containers: PropTypes.arrayOf(PropTypes.elements).isRequired, // what is rendered in accordion
        onClick: PropTypes.func, // when clicking on the list item

        active: PropTypes.number, // index of active item

        ulClass: PropTypes.string,
        liClass: PropTypes.string,
        activeClass: PropTypes.string,
    },

    render: function() {

        // required
        let { children } = this.props
        // optional
        let { active, ulClass, liClass, activeClass } = this.props

        return (
            <ul className={ulClass}>
                {children}
            </ul>
        )
    }
})

export const NestedButtonListItem = React.createClass({
    /*
     * A button list with an extra nested levels in the form of a div with an additional back button
    */

    propTypes: {
        title: PropTypes.string.isRequired,
        initialActive: PropTypes.bool,

        liClass: PropTypes.string,
        hrefClass: PropTypes.string, // title
        divClass: PropTypes.string, // div

        onClick: PropTypes.func,
    },

    mixins: [
        require('react-onclickoutside')
    ],

    getInitialState: function() {
        return {
            active: this.props.initialActive || false
        }
    },

    onClickFwd: function(e) {
        e.preventDefault()
        this.setState({ active: !this.state.active })
    },

    onClickBkwd: function(e) {
        this.setState({ active: !this.state.active })
        store.dispatch(resetSearchString())
    },

    handleClickOutside: function(e) {
        this.setState({ active: false })
    },

    render: function() {
        let active = this.state.active
        let { title, length } = this.props
        let {liClass, hrefClass, divClass } = this.props
        let divWrapClass = classNames(divClass, 'nav-wrap secondary')
        let slideDirection = this.props.from == "items" ? "slide" : "slide-right"
        return (
            <li className={liClass}>
                <a href="#" onClick={this.onClickFwd} className={hrefClass}>{title} {length}</a>
                <ReactCSSTransitionGroup transitionName={slideDirection} transitionEnterTimeout={500} transitionLeaveTimeout={500}> 
                    { active ?
                        <div className={divWrapClass}>
                            <div className="header">
                                <h3>
                                    <i className="material-icons link" onClick={this.onClickBkwd}>close</i>
                                    {title}
                                </h3>
                            </div>
                            { this.props.children }
                        </div>
                    : null
                    }
                </ReactCSSTransitionGroup>
            </li>
        )
    }
})

export const Checkbox = (props) => (
    <div>
        <input type="checkbox" id={props.id} {...props} />
        <label htmlFor={props.id}>{props.name} {props.length}</label>
    </div>
)

export const CheckboxList = React.createClass({
    /*
     * a list of checkboxes, with a submit and cancel button
     * list of objects with checked: true/false for initial value
     */

    PropTypes: {
        // items: PropTypes.arrayOf(PropTypes.object).isrequired, // rendered as checkboxes
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,

        cancelClass: PropTypes.string,
        submitClass: PropTypes.string,
    },

    onSubmit: function() {
        // this.props.onSubmit(
        //     _.map(this.state.selected, (i) => this.props.items[i])
        // )
    },

    render: function() {

        return (
            <div className='selectfield checkboxes'>
                { this.props.children }
            </div>
        )
    }
})

export const SearchInput = (props) => (
    <label className='selectfield filter-list'>
        <input type="text" {...props} value={props.defaultValue} placeholder="Filter your results" />
        <span className="fake-line"></span>
    </label>
)
SearchInput.propTypes = {
    defaultValue: PropTypes.string,
}

// TODO: Make this a stand-alone component like Orderable - 2016-03-15
export const SearchableCheckboxList = React.createClass({
    /*
     * a list of checkboxes, with a search input
     * list of objects with checked: true/false for initial value
     */

    propTypes: {

    },

    getInitialState: function() {
        return {
            filter: ""
        }
    },

    dispatchAction: function(value) {
        store.dispatch(changeSearchString(value))
    },

    onInputChange: function(event) {
        // this.setState({ filter: value })
        this.dispatchAction(event.target.value)
    },

    render: function() {
        const { items, searchInputProps, checkboxListProps, divProps } = this.props

        return (
            <div { ...divProps }>
                <SearchInput {...searchInputProps} onChange={this.onInputChange}/>
                <CheckboxList {...checkboxListProps}>
                    {this.props.children}
                </CheckboxList>
            </div>
        )
    }
})


export const OrderButton = React.createClass({

    propTypes: {
        active: PropTypes.bool.isRequired,
        reverse: PropTypes.bool.isRequired,
    },

    render: function() {


        let classes = classNames({
            active : this.props.active,
            reverse : this.props.reverse
        })

        return (
            <button className={classes} onClick={this.props.onClick}>{this.props.children}</button>
        )
    }
})

export const Orderable = React.createClass({

    propTypes: {
        orderables: PropTypes.arrayOf(PropTypes.string).isRequired,
        active: PropTypes.string.isRequired, // which orderable is active?
        reverse: PropTypes.bool, // reversed or not
    },

    dispatchAction: function(value) {
        store.dispatch(changeOrder(value))
    },

    onOrderChange: function(newOrder, event) {
        // this.setState({ filter: value })
        store.dispatch(changeOrder(newOrder, !this.props.reverse))
    },

    render: function() {
        const { active, orderables } = this.props

        return (
            <div {...this.props}>
                { orderables.map((orderable, i) => (
                    <OrderButton 
                        key={i}
                        active={orderable === active}
                        reverse={this.props.reverse}
                        onClick={this.onOrderChange.bind(null, orderable)}>
                        {orderable}
                    </OrderButton>
                ))}
            </div>
        )
    }
})
