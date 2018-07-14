import React from 'react'
import Header from '../../components/Header'
import SearchInput from '../../components/SearchInput'
import Spinner from '../../components/Spinner'
import SelectSearchType from '../../components/SelectSearchType'
import { connect } from 'react-redux'
import '../../css/main.scss'
import 'react-select/dist/react-select.css'
import {
  setSeed,
  setTld,
  setSearchMode,
  setSynonyms,
  setLoading,
  setDomains,
  setOffset
} from '../../lib/store'
import SelectTld from '../../components/SelectTld'
import SelectSynonym from '../../components/SelectSynonym'
import Client from '../../lib/client'
import Card from '../../components/Card'
import Results from '../../components/Results'
import Hero from '../../components/Hero'

class App extends React.Component {
  state = {
    loading: false,
    cacheKey: ''
  }

  _isInFlight = false

  static getDerivedStateFromProps (nextProps, nextState) {
    const { tld, seed, mode, offset } = nextProps
    const { loading } = nextState
    let cacheKey = `${seed}-${tld}-${mode}-${offset}-${loading}`
    if (cacheKey !== nextState.cacheKey) {
      return { 
        cacheKey
      }
    }
    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    let shouldUpdate = nextState.cacheKey !== this.state.cacheKey ||
      this.props.domains.length !== nextProps.domains.length
    return shouldUpdate
  }

  componentDidUpdate (prevProps, prevState) {
    let shouldFetchMore = !this.state.loading &&
      !this._isInFlight &&
      this.props.seed
   
    if (
      !this.state.loading &&
      this.props.seed
    ) {
      this.fetchMore()
    }
  }

  fetchMore = () => {
    let { mode, offset, domains } = this.props
    let _domains = domains.filter(d => !d.placeholder)
  
    if (_domains.length < offset) {
      this[mode + 'Fetch']()
    }
  }

  async whimsicalFetch () {
    if (this.props.seed === '') return
    await new Promise((resolve, reject) =>
      this.setState(prevState => {
        if (prevState.loading) return null
        return { loading: true }
      }, resolve)
    )
    const NAMIST_ENDPOINT = 'https://5d9t3ix770.execute-api.us-east-1.amazonaws.com/dev/namist'
    let url = `${NAMIST_ENDPOINT}?name=${this.props.seed}&offset=${this.props.offset}`
    
    let data = await fetch(url)
      .then(resp => resp.json())
    let suggestions = data.map(str => ({
      domain: str.toLowerCase(),
      keyword: str.toLowerCase().replace(this.props.seed, ' $& ').trim()
    }))
    let domains = this.props.domains.filter(d => !d.placeholder).concat(suggestions)
    this.props.setDomains(domains)
    setTimeout(() => {
      this.setState({ loading: false })
    }, 2000)
  }

  exactFetch = async () => {
    if (this.props.seed === '') return
    await new Promise((resolve, reject) =>
      this.setState(prevState => {
        if (prevState.loading) return null
        return { loading: true }
      }, resolve)
    )

    const { tld, seed } = this.props
    const client = new Client({ tld })
    await client.fetchSuggestions(seed)
      .then(suggestions => {
        let domains = this.props.domains.filter(d => !d.placeholder).concat(suggestions)
        return this.props.setDomains(domains)
      })
    this.setState({
      loading: false
    })
  }

  render () {
    console.log(this.state)
    return (
      <div>
        <Header />
          <Hero  {...this.props} />
          <Results
            {...this.props}
            fetchMore={this.fetchMore}
            loading={this.state.loading}
          />
      </div>
    )
  }
}

export default connect(
  state => state,
  dispatch => ({
    setSeed: ({ value }) => dispatch(
      setSeed(value)
    ),
    selectTld: (tld) => dispatch(
      setTld(tld)
    ),
    setSearchMode: (mode) => dispatch(
      setSearchMode(mode)
    ),
    setLoading: (loading) => dispatch(
      setLoading(loading)
    ),
    setDomains: (domains) => dispatch(
      setDomains(domains)
    ),
    setOffset: (offset) => dispatch(
      setOffset(offset)
    )
  })
)(App)
