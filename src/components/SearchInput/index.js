import React from 'react'
import client from '../../lib/client'
import debounce from 'lodash.debounce'

class SearchInput extends React.Component {
  state = {
    value: '',
    active: false
  }

  onChange = evt => {
    this.setState({ value: evt.target.value }, () => {
      this.debounced()
    })
  }

  componentDidUpdate () {
    if (this.state.active && !this.timer) {
      this.timer = setTimeout(() => {
        this.setState(prevState => {
          return prevState.active ? { active: false } : null
        }, () => {
          clearTimeout(this.timer)
          delete this.timer
        })
      }, 600)
    }
  }

  debounced = debounce(() => {
    if (!this.state.value) return
      this.setState({ active: true }, () => {
      this.props.setSeed({ value: this.state.value })
    })
  }
, 500)

  update = () => {
    this.setState({ active: true }, () => {
      this.props.setSeed({ value: this.state.value })
    })
  }

  onKeyDown = evt => {
    switch (evt.keyCode) {
      case 13:
        this.update()
        break
      case 8:
        if (this.props.seed) {
          this.props.setSeed({ value: '' })
        }
    }
  }

  render () {    
    const { options, active } = this.state
    const style = {}
    if (active) {
      style.animation = 'breath linear 0.5s'
      style.width = '100%'
      style.backgroundImage = 'linear-gradient(-120deg, #84fab0 0%, #8fd3f4 100%)'
    }
    return (
      <div className={'search-input'} onKeyDown={this.onKeyDown}>
          <div className={'input'}>
            <input 
              value={this.state.value}
              onChange={this.onChange}
              placeholder={'Enter a seed word like "cake"'}
            />
          </div>
          <div
            style={style}
            className={'search-progress-indicator'}
          ></div>
      </div>
    )
  }
}

export default SearchInput

