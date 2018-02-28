import { scaleLinear } from 'd3-scale'

const textSizeScale = scaleLinear().domain([20, 50]).range([ 1.2, 0.7 ])
export const getTextSize = (charNum) => {
    if (charNum < 20) {
        return 1.2
    }
    else if (charNum > 50) {
        return 0.8
    }
    return textSizeScale(charNum)
}

