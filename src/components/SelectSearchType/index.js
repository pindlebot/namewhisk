import React from 'react'

class SelectSearchType extends React.Component {
  render () {
    const { mode, setSearchMode } = this.props
    const isWhimsical = mode === 'whimsical'
    return (
      <div className='flex-row tab'>
        <div className='option-title'>Mode</div>
        <span
          className={!isWhimsical ? 'selected' : ''}
          onClick={evt => setSearchMode('exact')}>
            Exact Match
        </span>
        <span
          className={isWhimsical ? 'selected' : ''}
          onClick={evt => setSearchMode('whimsical')}>
            Whimsical
        </span>
      </div>
    )
  }
}

export default SelectSearchType
