import React from 'react'
import CardContent from '../CardContent'
import CardHeader from '../CardHeader'
import Client from '../../lib/client'

class Card extends React.Component {
  state = {
    available: undefined,
    expanded: false,
    data: undefined,
    loading: false
  }
  async componentDidMount () {
    if (this.props.domain.placeholder) return
    let client = new Client(this.props)
    let result = await client.fetchDomain(this.props.domain.domain)
    let available = Boolean(result[this.props.tld])
    this.setState({ available })
  }

  fetchChartData = () => {
    this.setState({ loading: true }, async () => {
      let client = new Client(this.props)
      let data = await client.fetchTrends(this.props.domain.keyword)
      this.setState({ data, loading: false })
    })
  }

  handleClick = evt => {
    evt.preventDefault()
    this.setState(prevState => ({ expanded: !prevState.expanded }))
  }

  render () {
    if (this.props.domain.placeholder) {
      return <div className='card-wrapper placeholder' />
    }
    return (
      <a href={'/#'}
        target='_blank'
        className={this.props.loading ? 'fadeOut animated' : 'fadeIn animated'}
      >
        <div className='card-wrapper'>
          <CardHeader
           {...this.props}
           available={this.state.available}
          />
          <CardContent
            {...this.props}
            stats={{}}
            expanded={this.state.expanded}
            handleClick={this.handleClick}
            data={this.state.data}
            loading={this.state.loading}
            fetchChartData={this.fetchChartData}
          />
        </div>
      </a>
    )
  }
}

export default Card
