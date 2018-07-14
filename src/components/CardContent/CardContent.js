import React from 'react'
import TrendChart from '../TrendChart'
import Client from '../../lib/client'
import 'isomorphic-fetch';

class Stats extends React.Component {
  state = {
    data: []
  }
  async componentDidMount () {
    let client = new Client(this.props)
    let { data } = await client.fetch(this.props.domain.keyword, { endpoint: 'lookup' })
    this.setState({ data })
  }
  
  render () {
    let { data } = this.state
    if (!data.length) return false
    return (
      <div>
        <div>
          <div>Volume</div>
          <div>{data[0].volume}</div>
        </div>
      </div>
    )
  }
}


class Content extends React.Component {
  state = {
    open: false
  }
  render () {
    const {
      domain,
      stats,
      handleClick,
      expanded,
      fetchChartData,
      loading
    } = this.props
    if (!expanded) return false
    console.log(this.props)
    return (
      <div className='card-content'>
        {/*<div className={'card-row'}>
          <span className='keyword'>Keyword: {domain.keyword}</span>
        </div>*/}
       
        <div className={'card-details'}>
          <TrendChart
            {...this.props}
            domain={domain}
            fetchChartData={fetchChartData}
          />
          <div>
            <Stats {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

export default Content
