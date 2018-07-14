import React from 'react'
import { Line } from 'react-chartjs-2'
import Client from '../../lib/client'
import Spinner from '../Spinner'
import Chart from 'chart.js'

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
      display: true,
      gridLines: {
        display: false
      }
    }],
    yAxes: [{
      display: false,
      gridLines: {
        display: false
      }
    }]
  }
}

class TrendChart extends React.Component {
  componentDidMount () {
    this.props.fetchChartData()
      .then(() => {
        this.renderChart()
      })
  }
  
  ref = element => {
    this.element = element
  }

  renderChart() {
    const {options, legend, type, redraw, plugins} = this.props;
    const node = this.element;
    const data = this.props.data

    this.chartInstance = new Chart(node, {
      type: 'line',
      data: data,
      options: OPTIONS,
      plugins: []
    });
  }

  render () {
    if (!this.props.data) {
      return <Spinner />
    }
    return (
      <div className='trends'>
        {/*<Line
          data={this.props.data}
          options={OPTIONS}
          width={160}
          height={100}
        />*/}
        <canvas
          ref={this.ref}
          height={100}
          width={160}
          onClick={this.handleOnClick}
        />
      </div>
    )
  }
}

export default TrendChart
