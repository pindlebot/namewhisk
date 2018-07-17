import React from 'react'
import CardContent from '../CardContent'
import CardHeader from '../CardHeader'
import Client from '../../lib/client'
import { resolve } from 'path';

class Card extends React.Component {
  state = {
    expanded: false,
    data: undefined,
    loading: false
  }

  fetchChartData = () => {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true }, async () => {
        let client = new Client(this.props)
        let data = await client.fetchTrends(this.props.domain.keyword)
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
