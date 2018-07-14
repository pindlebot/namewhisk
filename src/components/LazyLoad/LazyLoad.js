import React from 'react'
import PropTypes from 'prop-types'
import Spinner from '../Spinner'
import { unstable_deferredUpdates as deferredUpdates } from 'react-dom'
import debounce from 'lodash.debounce'

export const wrapWithLoadingState = async (update, asyncFn, isUnmounted) => {
  if (isUnmounted()) {
    console.warn('Component is unmounted!')
    return
  }
  let shouldProceed = await new Promise((resolve, reject) => {
    update(prevState => {
      if (prevState.loading || isUnmounted()) {
        console.warn('Could not update loading state to true')
        resolve(false)
        return null
      }
      resolve(true)
      return { loading: true }
    })
  })
  if (!shouldProceed) return
  await asyncFn()
  deferredUpdates(
    () => update(prevState => {
      if (!prevState.loading || isUnmounted()) {
        console.warn('Could not update loading state to false')
        return null
      }
      return { loading: false }
    })
  )
}

class LazyLoad extends React.Component {
  static propTypes = {
    posts: PropTypes.object,
    projects: PropTypes.object,
    render: PropTypes.func
  }

  state = {
    loading: false
  }
  _hasUnmounted = false
  _isInFlight = false
  _positionY = 0
  _scrollY = 0

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount () {
    this._hasUnmounted = true
    window.removeEventListener('scroll', this.onScroll)
  }

  // load = () => {
  //  console.log('load')
  //  this.props.fetchMore()
  //    .then(() => this.reset())
  // }

  // fetchMore = () => wrapWithLoadingState(
  //  (state) => deferredUpdates(() => this.setState(state)),
  //  () => this.load(),
  //  () => this._hasUnmounted
  //)

  // reset = () => {
  //  let id = setTimeout(() => {
  //    this._isInFlight = false
  //    clearTimeout(id)
  //  }, 500)
  //}

  onScroll = debounce(evt => {
    let bottom = window.scrollY + window.innerHeight >= document.body.clientHeight
    if (bottom && !this.props.loading) {
      this.props.setOffset(this.props.offset + 3)
    }
  }, 200)

  render () {
    return (
      <div id='lazy-load'>
        {this.props.render(this.state)}
        {this.props.loading && <Spinner />}
      </div>
    )
  }
}

export default LazyLoad