import React from 'react';

import BlockContent from "./BlockContent"
import BlockData from "./BlockData"
import BlockInput from "./BlockInput"
import CommonBlock from "./CommonBlock"
import { wrapMedia } from './MediaWrapper'

import DeleteIcon from 'material-ui/svg-icons/action/delete';

const styles = {
  image: {
    display: "inline-block", // Eliminates whitespace between block and data fields block
    maxWidth: "100%",
    width: "100%",
    verticalAlign: "middle"
  }
};


class ImageBlock extends React.Component {
    constructor(props) {
        super(props);

        this._handleCaptionChange = this._handleCaptionChange.bind(this)
        this._handleRightsHolderChange = this._handleRightsHolderChange.bind(this)

        this.actions = [
            {"key": "delete", "icon": DeleteIcon, "action": this.props.container.remove}
        ];
    }

    _handleCaptionChange(event) {
        event.stopPropagation();
        this.props.container.updateData({caption: event.target.value});
    }

    _handleRightsHolderChange(event) {
        event.stopPropagation();
        this.props.container.updateData({rightsHolder: event.target.value});
    }

    render() {
        return (
            <CommonBlock {...this.props} actions={this.actions}>
                <BlockContent>
                    <img style={styles.image} src={this.props.data.src} alt=""/>
                </BlockContent>

                <BlockData>
                    <BlockInput
                        placeholder="Caption"
                        value={this.props.data.caption}
                        onChange={this._handleCaptionChange} />

                    {
                        /*
                        <BlockInput
                            placeholder="Rights Holder"
                            value={this.props.data.rightsHolder}
                            onChange={this._handleRightsHolderChange} />
                        */
                    }
                </BlockData>
            </CommonBlock>           
        )
    }
}


export default wrapMedia(ImageBlock)

