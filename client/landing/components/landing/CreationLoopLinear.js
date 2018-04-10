import React from 'react'
import ReactDom from 'react-dom'
import classNames from 'classnames'

import './styles.scss'


const creationLoopItems = {

}

class CreationLoopItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { name, title, selected } = this.props

        const className = classNames("creationLoop-item", { active: selected === name })

        return (
            <div className={ className } onClick={() => this.props.onClick(name)}>
                <h3>{ title }</h3>
            </div>
        )
    }
}

class CreationLoop extends React.Component {
    constructor(props) {
        super(props)

        this.itemClicked = this.itemClicked.bind(this);

        this.state = {
            selected: "source",
        }
    }

    itemClicked(section) {
        console.log("itemClicked", section)
        this.setState({ selected: section })
        // switch(section) {
        //     case "source":
        //         // change the view in the middle?
        //         break;
        // }
    }

    render() {
        const {  } = this.props
        const { selected } = this.state

        return (
            <div className="creationLoop-container">
                <div className="creationLoop">
                    <div>
                        <CreationLoopItem
                            name="source"
                            title="Collect sources"
                            onClick={this.itemClicked}
                            selected={this.state.selected}
                        />
                        <CreationLoopItem
                            name="annotate"
                            title="Highlight and Annotate"
                            onClick={this.itemClicked}
                            selected={this.state.selected}
                        />
                        <CreationLoopItem
                            name="relate"
                            title="Relate"
                            onClick={this.itemClicked}
                            selected={this.state.selected}
                        />
                        <CreationLoopItem
                            name="structure"
                            title="Structure"
                            onClick={this.itemClicked}
                            selected={this.state.selected}
                        />
                        <CreationLoopItem
                            name="reference"
                            title="Reference"
                            onClick={this.itemClicked}
                            selected={this.state.selected}
                        />
                        <CreationLoopItem
                            name="create"
                            title="Share and Create"
                            onClick={this.itemClicked}
                            selected={this.state.selected}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default CreationLoop

