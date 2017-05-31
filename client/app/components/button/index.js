import React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

export const ResponsiveButton = ({ iconName, name, className }) => (
    <button className={classNames("responsiveButton", className)}>
        <Icon name={iconName} size="large" /> <span>{name}</span>
    </button>
)

