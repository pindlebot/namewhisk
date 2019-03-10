import React from 'react'
import { connect } from 'react-redux'

import Spinner from '../../components/Spinner'
import SelectSearchType from '../../components/SelectSearchType'
import '../../css/main.scss'
import {
  setName,
  setTld,
  setSearchMode,
  setSynonyms,
  setLoading,
  setDomains,
  setOffset,
  onSearch,
  fetchMore
} from '../../lib/store'
import SelectTld from '../../components/SelectTld'
import SelectSynonym from '../../components/SelectSynonym'
import Card from '../../components/Card'
import Results from '../../components/Results'
import Hero from '../../components/Hero'
import remote from '../../lib/remote'
import Layout from 'antd/lib/layout'
import 'antd/dist/antd.css'

const ENDPOINT_URL = 'https://pr4yxzklrj.execute-api.us-east-1.amazonaws.com/dev/'

class App extends React.Component {
  state = {
    loading: false
  }

  _isInFlight = false

  async componentDidMount () {
    this.remote = remote()
    this.remote.subscribe(this.update.bind(this))
  }

  onSearch = (data) => {
    this.props.onSearch(data, this.remote)
  }

  update = (domains) => {
    if (domains.length) {
      this.props.setDomains(domains)
    } else {
      this.fetchMore()
    }
  }

  async componentWillUnmount () {
    await this.remote.end()
  }

  fetchMore = () => {
    this.props.fetchMore(this.remote)
  }

  render () {
    return (
      <Layout>
        <Layout.Header>
          Namewhisk
        </Layout.Header>
        <Layout.Content>
          <Hero  {...this.props} onSearch={this.onSearch} />
          <Results
            {...this.props}
            fetchMore={this.fetchMore}
          />
        </Layout.Content>
      </Layout>
    )
  }
}

export default connect(
  state => state, {
    setName,
    onSearch,
    selectTld: setTld,
    setSearchMode,
    setLoading,
    setDomains,
    setOffset,
    fetchMore
  }
)(App)
