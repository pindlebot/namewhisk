import React from 'react'
import Select from 'react-select'
import client from '../../lib/client'

class SearchInput extends React.Component {
  state = {
    options: [],
  }

  promptTextCreator = () => {
    return 'Search available domain names...'
  }

  handleOnChange = (value) => {
    // this.setState({ value }, () => {
    //  this.fetchSuggestions(value)
    //})
    this.props.setSeed(value)
  }

  render () {
    const styles = {
      width: '100%'
    }
    const { options } = this.state
    return (
      <div className='section' style={styles}>
        <Select.Creatable
          style={styles}
          options={options}
          onChange={this.handleOnChange}
          value={this.props.seed}
          promptTextCreator={this.promptTextCreator}
          placeholder='Enter a seed keyword and hit enter'
        />
      </div>
    )
  }
}

export default SearchInput

