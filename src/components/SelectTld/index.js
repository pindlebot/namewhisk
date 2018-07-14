import React from 'react'

export default class SelectTld extends React.Component {
  render () {
    const { tld, selectTld } = this.props
    return (
      <div className='flex-row tab'>
        <span
          className={tld === 'com' ? 'selected' : ''}
          onClick={evt => selectTld('com')}>
          .com
        </span>
        <span
          className={tld === 'io' ? 'selected' : ''}
          onClick={evt => selectTld('io')}>
          .io
        </span>
        <span
          className={tld === 'co' ? 'selected' : ''}
          onClick={evt => selectTld('co')}>
            .co
        </span>
      </div>
    )
  }
}
