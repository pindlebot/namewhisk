import React from 'react'
import CardContent from '../CardContent'
import CardHeader from '../CardHeader'
import Client from '../../lib/client'
import { resolve } from 'path';

class Card extends React.Component {
  state = {
    available: undefined,
    expanded: false,
    data: undefined,
    loading: false
  }
  async componentDidMount () {
    this.checkAvailability()
  }

  checkAvailability = async (validate = false) => {
    if (this.props.domain.placeholder) return
    let client = new Client(this.props)
    let result = await client.fetchDomain(
      this.props.domain.domain,
      validate
    )
    let available = Boolean(result[this.props.tld])
    this.setState({ available })
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
    }), () => {
      this.checkAvailability(true)
    })
  }

  render () {
    if (this.state.available !== true) {
      return false
    }
    if (this.props.domain.placeholder) {
      return <div className='card-wrapper placeholder' />
    }
    return (
      <div
        className='card-wrapper'
        onClick={this.handleClick}
        style={{
          opacity: this.state.available ? 1 : 0.5
        }}
      >
        <CardHeader
          {...this.props}
          available={this.state.available}
          expanded={this.state.expanded}
          loading={this.state.loading}
        />
        <CardContent
          {...this.props}
          stats={{}}
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
