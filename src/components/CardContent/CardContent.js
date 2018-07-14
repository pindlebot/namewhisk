import React from 'react'
import TrendChart from '../TrendChart'
import Client from '../../lib/client'

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
    return (
      <div className='card-content'>
        <div className={'card-row'}>
          <span className='keyword'>Keyword: {domain.keyword}</span>
          <span className='ams'>Monthly volume: {stats && stats.ams}</span>
        </div>
       
        <div className={'card-details'}>
          {expanded && <TrendChart
            {...this.props}
            domain={domain}
            fetchChartData={fetchChartData}
          />
          }
        </div>
        <div>
          <button className={'expand'} onClick={handleClick}>
            {loading
              ? '' 
              : expanded
                ? <i className='fa fa-chevron-up' />
                : <i className='fa fa-chevron-down' />
            }
          </button>
        </div>
      </div>
    )
  }
}

export default Content
