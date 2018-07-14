import React from 'react'
import Content from './Content'
import Footer from './Footer'
import Header from './Header'
import Client from '../../lib/client'

class Card extends React.Component {
  state = {
    available: undefined,
    expanded: false,
    data: undefined,
    loading: false
  }
  async componentDidMount () {
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
    return (
      <a href={''}
        target='_blank'
        className={this.props.loading ? 'fadeOut animated' : 'fadeIn animated'}
      >
        <div className='card-wrapper'>
          <Header
           {...this.props}
           available={this.state.available}
          />
          <Content
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
