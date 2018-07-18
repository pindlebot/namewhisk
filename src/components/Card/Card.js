import React from 'react'
import CardContent from '../CardContent'
import CardHeader from '../CardHeader'
import { resolve } from 'path';
import 'isomorphic-fetch';

const BASE_URI = 'https://1oqkke2wfd.execute-api.us-east-1.amazonaws.com/dev'

const _fetch = (id, { endpoint }) => {
  let url = `${BASE_URI}/${endpoint}/${id}`
  return fetch(url)
    .then(resp => resp.json())
}

const generateDataset = (label, data) => ({
  label: label || '',
  fill: false,
  lineTension: 0.2,
  backgroundColor: 'rgba(75,192,192,0.4)',
  borderColor: '#52616F',
  borderCapStyle: 'butt',
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: '#2C3E50',
  pointBackgroundColor: '#3F4F5F',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
  data: data
})

const fetchTrends = async (value) => {
  let { default: { timelineData: data } } = await _fetch(value, { endpoint: 'trends' })
  let values = data.map((data) => data.value[0])
    .slice(0, 12)
  let labels = data.map(({ formattedTime }) => formattedTime.slice(0, 3))
    .slice(0, 12)
  return {
    labels,
    datasets: [
      generateDataset(value, values)
    ]
  }
}

class Card extends React.Component {
  state = {
    expanded: false,
    data: undefined,
    loading: false
  }

  fetchChartData = () => {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true }, async () => {
        let data = await fetchTrends(this.props.domain.keyword)
        this.setState({ data, loading: false }, resolve)
      })
    })
  }

  handleClick = evt => {
    evt.preventDefault()
    this.setState(prevState => ({
      expanded: !prevState.expanded
    }))
  }

  render () {
    if (this.props.domain.placeholder) {
      return <div className='card-wrapper placeholder' />
    }
    return (
      <div
        className='card-wrapper'
        onClick={this.handleClick}
      >
        <CardHeader
          {...this.props}
          available={true}
          expanded={this.state.expanded}
          loading={this.state.loading}
        />
        <CardContent
          {...this.props}
          expanded={this.state.expanded}
          data={this.state.data}
          loading={this.state.loading}
          fetchChartData={this.fetchChartData}
        />
        </div>
    )
  }
}

export default Card
