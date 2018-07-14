import React from 'react'
import Select from 'react-select'
import client from '../../lib/client'

const styles = {
  padding: '6px 12px',
  borderRadius: '4px',
  fontSize: '22px',
  width: '100%',
  border: 0,
  outline: 0,
  margin: 0,
  fontFamily: 'inherit',
  lineHeight: 1.15,
  overflow: 'visible',
  '&::placeholder': {
    opacity: 1
  },
  height: '40px',
  boxSizing: 'border-box'
}

class SearchInput extends React.Component {
  state = {
    value: ''
  }

  onChange = evt => {
    this.setState({ value: evt.target.value })
  }

  onKeyDown = evt => {
    if (evt.keyCode === 13) {
      this.props.setSeed({ value: this.state.value })
    }
  }

  render () {    
    const { options } = this.state
    return (
      <div className={'search-input'} onKeyDown={this.onKeyDown}>
        {/*<Select.Creatable
          style={styles}
          options={options}
          onChange={this.handleOnChange}
          value={this.props.seed}
          promptTextCreator={this.promptTextCreator}
          placeholder='Enter a seed keyword and hit enter'
        />*/}
        <input 
          value={this.state.value}
          onChange={this.onChange}
          className={'input'}
          style={styles}
        />
      </div>
    )
  }
}

export default SearchInput

