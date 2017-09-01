/*
 * AbstractionNavigator
 */

import React from 'react';

import { Link, withRouter } from 'react-router-dom'

import { Icon } from 'semantic-ui-react'

import './styles.scss';

class AbstractionNavigator extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { collectionChain } = this.props

        const abstractionItems = collectionChain.map((c, i) => (
            <AbstractionItem
                key={c.id}
                id={c.id}
                name={c.name}
                hasNext={ i < (collectionChain.length - 1) }
            />
        ))

        return (
            <div className="AbstractionNavigator">
                { abstractionItems }
            </div>
        );
    }
}

const AbstractionItem = ({ id, name, hasNext }) => (
    <div className="AbstractionNavigator-item">
        <Link to={`/app/collections/${id}/nodes`}>{ name }</Link>
        {
            hasNext ? <Icon name="angle right" /> : null
        }
    </div>
)

export default withRouter(AbstractionNavigator);
