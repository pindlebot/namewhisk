import React from 'react'
import Spinner from './Spinner'

class Scroll extends React.Component {
  constructor (props) {
    super(props)
    this.state = {isAtBottomOfPage: false}
    this.handleScroll = this
      .handleScroll
      .bind(this)
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll)
  };

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScroll)
  };

  handleScroll () {
    const windowHeight = 'innerHeight' in window
      ? window.innerHeight
      : document.documentElement.offsetHeight
    const body = document.body
    const html = document.documentElement
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    const windowBottom = windowHeight + window.pageYOffset + 50
    if (windowBottom >= docHeight) {
      this.setState({isAtBottomOfPage: true})
      if (this.props.shouldBeLoading) {
        this.props.isAtBottomOfPageCallback()
      }
    }
  };

  render () {
    var styles = { width: '100%' }
    var arr = []
    if (this.props.enableSpinner && this.props.shouldBeLoading && this.state.isAtBottomOfPage) {
      arr.push(<Spinner />)
    }
    return (
      <div style={styles}>
        {this.props.children}
        {arr}
      </div>
    )
  }
}

export default Scroll

Scroll.Proptypes = {
  isAtBottomOfPageCallback: React.PropTypes.func,
  enableSpinner: React.PropTypes.bool,
  shouldBeLoading: React.PropTypes.bool
}
