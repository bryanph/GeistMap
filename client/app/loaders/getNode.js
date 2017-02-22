

export default (Component) => {
    class getNode extends React.Component {
        constructor(props) {
            super(props)
        }

        componentWillMount() {
            
        }

        componentWillReceiveProps(nextProps) {
            // TODO: set active node if id is set - 2016-10-05
            if (nextProps.id && this.props.id !== nextProps.id) {
                this.props.loadNode(nextProps.id)
            }
        }

    
        render() {
            const {  } = this.props
    
            return (
                <Component {...this.props} />
            )
        }
    }

    function mapStateToProps(state, props) {

    }

    return connect(null, { loadNode })(getNode)
}
