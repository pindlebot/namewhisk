import React from 'react'
import PropTypes from 'prop-types'
import Spinner from '../Spinner'
import { unstable_deferredUpdates as deferredUpdates } from 'react-dom'
import debounce from 'lodash.debounce'

class LazyLoad extends React.Component {
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }

  onScroll = debounce(evt => {
    let bottom = window.scrollY + window.innerHeight >= document.body.clientHeight
    if (bottom && !this.props.loading) {
      this.props.fetchMore()
      // this.props.setOffset(this.props.offset + 10)
    }
  }, 100)

  render () {
    return (
      <div className='lazy-load'>
        {this.props.render(this.state)}
        {this.props.loading ? <Spinner /> : <div className='spacer' />}
      </div>
    )
  }
}

export default LazyLoad