import React from 'react';
import { Entity } from 'draft-js'

const styles = {
    media: {
        width: '100%'
    },
    iframeWrapper: {
        // position: 'relative',
        width: '100%',
        // height: '100%',
    },
    iframe: {
        // position: 'absolute',
        // height: '100%',
    }
}

const injectProps = (Component) => {
    return (props) => {
        const entity = Entity.get(props.block.getEntityAt(0));
        const {src} = entity.getData();
        const type = entity.getType();

        return <Component src={src} />
    }
}

// TODO: allow custom components to be passed for this - 2016-08-03
export const Audio = injectProps((props) => {
    return <audio controls src={props.src} style={styles.media} />;
})
export const Image = injectProps((props) => {
    return <img src={props.src} style={styles.media} />;
})
export const Video = injectProps((props) => {
    return <video controls src={props.src} style={styles.media} />;
})
export const Youtube = injectProps((props) => {
    return (
        <div style={styles.iframeWrapper}>
            <iframe src={props.src} style={styles.iframe}/>;
        </div>
    )
})



const Audio2 = (props) => (
    <audio controls src={props.src} style={styles.media} />
)

const Image2 = (props) => (
    <img src={props.src} style={styles.media} />
)

const Youtube2 = (props) => (
    <div style={styles.iframeWrapper}>
        <iframe src={props.src} style={styles.iframe}/>
    </div>
)

export default (props) => {
    const entity = Entity.get(props.block.getEntityAt(0));
    const {src} = entity.getData();
    const type = entity.getType();

    let media;
    if (type === 'audio') {
        media = <Audio2 src={src} />;
    } else if (type === 'image') {
        media = <Image2 src={src} />;
    } else if (type === 'video') {
        media = <Video2 src={src} />;
    } else if (type === 'youtube') {
        media = <Youtube2 src={src} />;
    }

    return media;
};
