import React from 'react'
import Radio from 'antd/lib/Radio'

class SelectSearchType extends React.Component {
  handleChange = (evt) => {
    this.props.setSearchMode(evt.target.value)
  }

  render () {
    const { mode } = this.props
    return (
      <div className='gutter'>
        <Radio.Group value={mode} onChange={this.handleChange} className={'gutter'}>
          <Radio.Button value="exact">Exact</Radio.Button>
          <Radio.Button value="whimsical">Whimsical</Radio.Button>
        </Radio.Group>
      </div>
    )
  }
}

export default SelectSearchType
