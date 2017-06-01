import React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

export const ResponsiveButton = ({ iconName, name, className, ...rest }) => (
    <button className={classNames("responsiveButton", className)} {...rest}>
        <Icon name={iconName} size="large" /> <span>{name}</span>
    </button>
)

export const FlatButton = ({ iconName, name, className, ...rest }) => (
    <button className={classNames("flatButton", className)} {...rest}>
        <Icon name={iconName} /> { name ? <span>{name}</span> : null }
    </button>
)

