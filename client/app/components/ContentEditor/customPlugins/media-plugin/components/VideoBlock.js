import React, { PropTypes } from 'react';

import BlockContent from "./BlockContent"
import BlockData from "./BlockData"
import BlockInput from "./BlockInput"
import CommonBlock from "./CommonBlock"
import { wrapMedia } from './MediaWrapper'

import DeleteIcon from 'material-ui/svg-icons/action/delete';

const styles = {
  video: {
    display: "inline-block", // Eliminates whitespace between block and data fields block
    maxWidth: "100%",
    width: "100%",
    verticalAlign: "middle"
  }
};


class VideoBlock extends React.Component {
    constructor(props) {
        super(props);

        this._handleCaptionChange = this._handleCaptionChange.bind(this)

        this.actions = [
            {"key": "delete", "icon": DeleteIcon, "action": this.props.container.remove}
        ];
    }

    _handleCaptionChange(event) {
        event.stopPropagation();
        this.props.container.updateData({caption: event.target.value});
    }

    render() {
        return (
            <CommonBlock {...this.props} actions={this.actions}>
                <BlockContent>
                    <video controls style={styles.video} src={this.props.data.src} />
                </BlockContent>

                <BlockData>
                    <BlockInput
                        placeholder="Caption"
                        value={this.props.data.caption}
                        onChange={this._handleCaptionChange} />
                </BlockData>
            </CommonBlock>           
        )
    }
}
VideoBlock.propTypes = {

}


export default wrapMedia(VideoBlock)

