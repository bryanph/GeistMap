import React, { PropTypes } from 'react';

import { RichUtils } from 'draft-js'
import { EditorState, Entity, AtomicBlockUtils } from 'draft-js'


import Media from './components/MediaWrapper';
import { Audio, Video, Image, Youtube } from './components/MediaWrapper'
import ImageBlock from './components/ImageBlock'
import VideoBlock from './components/VideoBlock'
import YoutubeBlock from './components/YoutubeBlock'

import { insertDataBlock } from '../../utils/block'
import { getType, transformSrc } from './utils/getMediaType'

const handleDrop = (getEditorState, setEditorState) => (
    function handleDrop(
        selection: SelectionState,
        dataTransfer: Object,
        isInternal: DraftDragType,
    ) : boolean {
            const src = dataTransfer.data.getData('text/plain')

            if (!src) {
                return true
            }

            const type = getType(src)

            if (!type) {
                // const extension = extensionRe.exec(src)[1]
                window.alert("This type of media is not supported (yet?) for embedding")
                return;
            }

            const transformedSrc = transformSrc(type, src)

            setEditorState(
                insertDataBlock(
                    getEditorState(),
                    {
                        type,
                        src: transformedSrc,
                    }
                )
            )

            return true
        }
)

export default (config = {}) => {

    return ({ getEditorState, setEditorState, setReadOnly }) => {
        // const type = config.type || 'block-image';
        // const theme = config.theme ? config.theme : styles;

        // const imageComponent = config.imageComponent || Image({ theme });
        // const videoComponent = config.videoComponent || Video({ theme });
        // const audioComponent = config.audioComponent || Audio({ theme });

        return {
            // Handle 'block-image' block-type with Image imageComponent
            blockRendererFn: (contentBlock) => {
                let component;
                const type = contentBlock.getType()

                if (type === 'atomic') {
                    const blockType = contentBlock.getData().get('type')

                    const props = {
                        getEditorState,
                        setEditorState,
                        setReadOnly: setReadOnly,
                    }

                    if (blockType === 'audio') {
                        return {
                            component: Audio,
                            editable: false,
                            props,
                        }
                    } else if (blockType === 'image') {
                        return {
                            // component: Image,
                            component: ImageBlock,
                            editable: false,
                            props,
                        }
                    } else if (blockType === 'video') {
                        return {
                            // component: Video,
                            component: VideoBlock,
                            editable: false,
                            props,
                        }
                    } else if (blockType === 'youtube') {
                        return {
                            component: YoutubeBlock,
                            // component: Youtube,
                            editable: false,
                            props,
                        }
                    }
                    // } else if (type === 'atomic') {
                    //     console.log("Returning atomic!!!");
                    //     console.log(contentBlock.getData());
                    //     return {
                    //         component: Media,
                    //         editable: false,
                    //     }
                }

                return null;
            },
            handleDrop: handleDrop(getEditorState, setEditorState),
        };
    }
}

export AddMediaButton, { AddMediaInput } from './components/AddMediaButton'
