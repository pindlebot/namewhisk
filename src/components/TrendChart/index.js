import React from 'react'
import { Line } from 'react-chartjs-2'
import moment from 'moment'
import Client from '../../lib/client'
import Spinner from '../Spinner'

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
  componentDidMount () {
    this.props.fetchChartData()
  }

  render () {
    if (!this.props.data) {
      return <Spinner />
    }
    return (
      <div className='trends'>
        <Line
          data={this.props.data}
          options={OPTIONS}
          height={120}
        />
        <span>Google trends - last 12 months</span>
      </div>
    )
  }
}

export default TrendChart
