import React, { PropTypes } from 'react'

const styles = {
    surroundingDiv: {
        margin: "1.5rem 0",
        borderBottom: "1px solid #cacaca",
        lineHeight: 0,
        textAlign: 'center',
    },
    span: {
        background: "#fff",
        padding: "0 0.5rem",
    }
}
export default (props) => (
    <div style={styles.surroundingDiv}>
        <span style={styles.span}>Or</span>
    </div>
)
