// const extensionRe = /\.([0-9a-z]+)$/
const videoRe = /(.*)\.(mp4|ogv)$/
const audioRe = /(.*)\.mp3$/
const imageRe = /(.*)\.(jpeg|jpg|gif|png|apng|svg|bmp)$/
const youtubeRe = /youtube\.com\/watch\?v=(.+)$/

const regexes = {
    video: videoRe,
    audio: audioRe,
    image: imageRe,
    youtube: youtubeRe,
}

export function getType(src) {
    let type = null;
    for (let key in regexes) {
        if (regexes[key].test(src)) {
            type = key;
            break;
        }
    }

    return type
}

const youtubeIdRe = /\?v=(.+)$/
const getYoutubeId = (src) => (
    youtubeIdRe.exec(src)[1]
)

export const transformSrc = (type, src) => {
    /*
     * For example https://www.youtube.com/watch?v=7d69mDT11yI to https://www.youtube.com/embed/7d69mDT11yI
    */
    if (type === 'youtube') {
        const id = getYoutubeId(src)
        return `https://www.youtube.com/embed/${id}`
    }

    return src
}
