import React from 'react'

class SelectSynonym extends React.Component {
  render () {
    let { synonyms, seed, selectSeed } = this.props
    return (
      <div>
        {synonyms.map(synonym => (
          <div className='flex-row tab'>
            <span
              className={seed === synonym ? 'selected' : ''}
              onClick={evt => selectSeed(synonym)}
            >
              {synonym}
            </span>
          </div>
        ))}
      </div>
    )
  }
}

SelectSynonym.defaultProps = {
  synonyms: [],
  seed: ''
}

export default SelectSynonym

