import React from 'react'
import { Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

export const ResponsiveButton = ({ iconName, name, className, ...rest }) => (
    <button className={classNames("responsiveButton", className)} {...rest}>
        <i className={`fa fa-${iconName}`} /> <span>{name}</span>
    </button>
)

export const FlatButton = ({ as="button", iconName, children, className, ...rest }) => {

    const actualClassName = classNames(className, "flatButton")

    return (
        React.createElement(
            as,
            { className: actualClassName , ...rest }, 
            [
                iconName ? <i className={`fa fa-${iconName}`} /> : null,
                children ? <span>{children}</span> : null
            ]
        )
    )
}

export const FlatLink = (props) => <FlatButton as="a" {...props} />
