import React from 'react'
import Card from '../Card'
import LazyLoad from '../LazyLoad'
import Spinner from '../Spinner'

class Results extends React.Component {
  render () {
    const domains = this.props.domains.slice(0, this.props.offset)
    if (!domains.length) return false
    return (
      <LazyLoad {...this.props} render={({ loading }) => {
        return (
          <div className='wrapper'>
            {
              domains.map((domain, key) => (
                <Card {...this.props} domain={domain} key={key} />
              ))
            }
          </div>
        )
      }} />
    )
  }
}

export default Results
