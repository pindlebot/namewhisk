import React from 'react'
import TrendChart from '../TrendChart'
import Client from '../../lib/client'

class Content extends React.Component {
  async componentDidMount () {
    let client = new Client(this.props)
    let result = await client.fetchDomain(this.props.domain.domain)
    console.log({ result })
  }

  render () {
    const { domain, stats } = this.props

    return (
      <div className='card-content'>
        <div className='info'>
          <span className='keyword'>Keyword: {domain.keyword}</span>
          <span className='ams'>Monthly volume: {stats && stats.ams}</span>
        </div>
        <TrendChart {...this.props} domain={domain} />
      </div>
    )
  }
}

export default Content
