import React from 'react'

class WrapText extends React.Component {

    static defaultProps = {
        lineHeight: 1,
        capHeight: 0.71,
        verticalAlign: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            lines: []
        }
    }

    componentWillMount() {
        const { wordsWithComputedWidth, spaceWidth } = this.calculateWordWidths();
        this.wordsWithComputedWidth = wordsWithComputedWidth;
        this.spaceWidth = spaceWidth;

        const lines = this.calculateLines(this.wordsWithComputedWidth, this.spaceWidth, this.props.width);
        this.setState({ lines });
    }

    render() {
        // TODO: determine lineHeight and dy dynamically (using passed in props)
        const { lineHeight, capHeight, verticalAlign, ...props } = this.props;
        const dy = capHeight;
        const { x, y } = props;

        // TODO: also make it work with other alignment strategies - 2018-02-28
        const baseDy = verticalAlign ? 
            -(((this.state.lines.length - 1) * lineHeight) / 2) :
                0;

        return (
            <text {...props} dy={`${baseDy + dy}em`}>
                {this.state.lines.map((word, index) => (
                    <tspan x={x} y={y} dy={`${baseDy + index * lineHeight}em`}>
                        {word}
                    </tspan>
                ))}
            </text>
        )
    }

    componentDidUpdate(nextProps, nextState) {
        if (this.props.children != nextProps.children) {
            const { wordsWithComputedWidth, spaceWidth } = this.calculateWordWidths();
            this.wordsWithComputedWidth = wordsWithComputedWidth;
            this.spaceWidth = spaceWidth; 
        }

        const lines = this.calculateLines(this.wordsWithComputedWidth, this.spaceWidth, this.props.width);
        const newLineAdded = this.state.lines.length !== lines.length;
        const wordMoved = this.state.lines.some((line, index) => line.length != lines[index].length);
        // Only update if number of lines or length of any lines change
        if (newLineAdded || wordMoved) {
            this.setState({ lines }) 
        }
    }

    calculateWordWidths() {
        // Calculate length of each word to be used to determine number of words per line
        const words = this.props.children.split(/\s+/);
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        Object.assign(text.style, this.props.style);
        svg.appendChild(text);
        document.body.appendChild(svg);

        const wordsWithComputedWidth = words.map(word => {
            text.textContent = word;
            return { word, width: text.getComputedTextLength() }
        })

        text.textContent = '\u00A0'; // Unicode space
        const spaceWidth = text.getComputedTextLength();

        document.body.removeChild(svg);

        return { wordsWithComputedWidth, spaceWidth }
    }

    calculateLines(wordsWithComputedWidth, spaceWidth, lineWidth) {
        const wordsByLines = wordsWithComputedWidth.reduce((result, { word, width}) => {
            const lastLine = result[result.length - 1] || { words: [], width: 0 };

            if (lastLine.words.length === 0) {
                // First word on line
                const newLine = { words: [word], width };
                result.push(newLine);
            } else if (lastLine.width + width + (lastLine.words.length * spaceWidth) < lineWidth) {
                // Word can be added to an existing line
                lastLine.words.push(word);
                lastLine.width += width;
            } else {
                // Word too long to fit on existing line
                const newLine = { words: [word], width };
                result.push(newLine);
            }

            return result;
        }, []);

        return wordsByLines.map(line => line.words.join(' '));
    }
}

export default WrapText
