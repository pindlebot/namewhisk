import React from 'react'
import { Line } from 'react-chartjs-2'
import moment from 'moment'
import Client from '../../lib/client'

const OPTIONS = {
  maintainAspectRatio: false,
  defaultFontColor: 'rgb(255,255,255)',
  gridLines: {
    color: 'rgb(255,255,255)'
  },
  legend: {
    display: false
  },
  scales: {
    xAxes: [{
      display: true
    }],
    yAxes: [{
      display: false
    }]
  }
}

class TrendChart extends React.Component {
  state = {
    data: {},
    loading: true
  }

  async componentDidMount () {
    let client = new Client(this.props)
    let data = await client.fetchTrends(this.props.domain.keyword)
    this.setState({ data, loading: false })
  }

  render () {
    if (this.state.loading) {
      return false
    }
    return (
      <div className='trends'>
        <Line
          data={this.state.data}
          options={OPTIONS}
          height={120}
        />
        <span>Google trends - last 12 months</span>
      </div>
    )
  }
}

export default TrendChart
