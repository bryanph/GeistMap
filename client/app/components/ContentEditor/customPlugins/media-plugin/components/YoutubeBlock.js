import React, { PropTypes } from 'react';

import BlockContent from "./BlockContent"
import BlockData from "./BlockData"
import BlockInput from "./BlockInput"
import CommonBlock from "./CommonBlock"
import { wrapMedia } from './MediaWrapper'

import DeleteIcon from 'material-ui/svg-icons/action/delete';

const styles = {
    iframeWrapper: {
        position: 'relative',
        width: '100%',
        height: 0,
        paddingBottom: '56.25%',
    },

    iframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: "100%",
        height: '100%',
    }
};


class YoutubeBlock extends React.Component {
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
                    <div style={styles.iframeWrapper}>
                        <iframe 
                            src={this.props.data.src}
                            style={styles.iframe}
                            crossorigin="anonymous"
                        />
                    </div>
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
YoutubeBlock.propTypes = {

}


export default wrapMedia(YoutubeBlock)

