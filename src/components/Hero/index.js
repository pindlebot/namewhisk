import React from 'react'
import SearchInput from '../SearchInput'
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
            <SearchInput {...this.props} />
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
