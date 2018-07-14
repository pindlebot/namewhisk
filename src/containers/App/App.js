import React from 'react'
import Header from '../../components/Header'
import SearchInput from '../../components/SearchInput'
import Spinner from '../../components/Scroll/Spinner'
import SelectSearchType from '../../components/SelectSearchType'
import { connect } from 'react-redux'
import '../../css/main.scss'
import { setSeed, setTld, setSearchMode, setSynonyms, setLoading, setDomains } from '../../lib/store'
import SelectTld from '../../components/SelectTld'
import SelectSynonym from '../../components/SelectSynonym'
import Client from '../../lib/client'
import Card from '../../components/Card'

class App extends React.Component {
  state = {
    loading: false,
    cacheKey: ''
  }

  _isInFlight = false

  static getDerivedStateFromProps (nextProps, nextState) {
    const { tld, seed, mode } = nextProps
    let cacheKey = `${seed}-${tld}-${mode}`
    if (cacheKey !== nextState.cacheKey) {
      return { 
        cacheKey
      }
    }
    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.cacheKey !== this.state.cacheKey ||
      this.props.domains.length !== nextProps.domains.length
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      !this.state.loading &&
      !this._isInFlight
    ) {
      this._isInFlight = true
      this.fetchSuggestions()
    }
  }

  fetchSuggestions = async () => {
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
      .then(suggestions =>
        this.props.setDomains(suggestions)
      )
    this.setState({
      loading: false
    }, () => {
      this._isInFlight = false
    })
  }

  render () {
    console.log('__props__', this.props)
    return (
      <div>
        <Header />
          <div className={'hero-wrapper'}>
            <div className={'hero-column'}>
              <div className='flex-row hero'>
                <h1 className='valueprop'>
                  Find the perfect exact match domain name
                </h1>
              </div>
              <div className='flex-row hero'>
                <SearchInput {...this.props} />
              </div>
              <SelectSearchType
                {...this.props}
              />
              <SelectTld
                {...this.props}
              />
              <SelectSynonym
                {...this.props}
              />
            </div>
          </div>
          <div className='wrapper'>
          {
            this.props.domains.map((domain, key) => (
              <Card {...this.props} domain={domain} key={key} />
            ))
          }
          </div>
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
    )
  })
)(App)
