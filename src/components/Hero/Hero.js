import React from 'react'
import Input from 'antd/lib/input'

import SelectSearchType from '../SelectSearchType'
import SelectTld from '../SelectTld'
import SelectSynonym from '../SelectSynonym'

class Hero extends React.Component {
  render () {
    return (
      <div className={'hero-wrapper'}>
        <div className={'hero-column'}>
          <div className='flex-row hero'>
            <h1 className='value-prop'>Let's Name Your Silly Startup</h1>
          </div>
          <div className='flex-row hero'>
            <Input.Search
              placeholder="Enter a seed word"
              enterButton="Search"
              size="large"
              onSearch={this.props.onSearch}
              className={'gutter'}
            />
          </div>
          <SelectSearchType
            {...this.props}
          />
          <SelectTld
            {...this.props}
          />
          <SelectSynonym
            {...this.props}
          />
        </div>
      </div>
    )
  }
}

export default Hero
