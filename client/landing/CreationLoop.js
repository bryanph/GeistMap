import React from 'react'
import ReactDom from 'react-dom'
import classNames from 'classnames'


const creationLoopItems = [
    {
        name: "source",
        title: "Collect sources",
        content: `
            A source can have many forms. Think of an article or a blog post, a video, an image. these are all potentially interesting sources. The goal then is to collect these sources and relate them to as many concepts and other sources as we can possibly think of. The goal in this stage is not to accurately categorize the source, but rather to relate it to as many concepts as possible so that it can be re-discovered at a later time. This process simply requires recall, so no explicit effort is put into organizing. You can think of this as a bookmark where every source can be in many many folders.
        `
    },
    {
        name: "annotate",
        title: "Highlight and Annotate",
        content: `
            When actually consuming the source, we should be able to highlight the parts that we find interesting and add our own comments. We should also be able to personalize the information presented. This can be done by summarizing parts of a text and by relating it to existing knowledge.
        `
    },
    {
        name: "relate",
        title: "Relate and Personalize",
    }
]

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
