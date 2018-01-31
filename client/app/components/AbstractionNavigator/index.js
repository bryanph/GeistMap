/*
 * AbstractionNavigator
 */

import React from 'react';

import { Link, withRouter } from 'react-router-dom'
import QueryLink from 'QueryLink'

import { Icon } from 'semantic-ui-react'

import './styles.scss';

class AbstractionNavigator extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { abstractionChain } = this.props

        const abstractionItems = abstractionChain.map((c, i) => (
            <AbstractionItem
                key={i}
                url={`/app/nodes/${c.id}/graph`}
                name={c.name}
                hasNext={ this.props.extra || (i < (abstractionChain.length - 1)) }
                onClick={() => this.props.moveParent(c.id)}
            />
        ))

        return (
            <div className="AbstractionNavigator">
                { abstractionItems }

            </div>
        );
    }
}

const AbstractionItem = ({ url, name, hasNext, onClick }) => (
    <div className="AbstractionNavigator-item">
        <QueryLink to={url} onClick={onClick}>{ name }</QueryLink>
        {
            hasNext ? <Icon name="angle right" /> : null
        }
    </div>
)

export default withRouter(AbstractionNavigator);
