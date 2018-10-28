import React from 'react'
import Header from '../../components/Header'
import SearchInput from '../../components/SearchInput'
import Spinner from '../../components/Spinner'
import SelectSearchType from '../../components/SelectSearchType'
import { connect } from 'react-redux'
import '../../css/main.scss'
// import 'react-select/dist/react-select.css'
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
import Card from '../../components/Card'
import Results from '../../components/Results'
import Hero from '../../components/Hero'
import remote from '../../lib/remote'

const ENDPOINT_URL = 'https://pr4yxzklrj.execute-api.us-east-1.amazonaws.com/dev/'

class App extends React.Component {
  state = {
    loading: false
  }

  _isInFlight = false

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.seed !== this.props.seed ||
      nextProps.mode !== this.props.mode ||
      nextProps.loading !== this.props.loading ||
      nextProps.offset !== this.props.offset ||
      nextProps.domains.length !== this.props.domains.length ||
      nextProps.tld !== this.props.tld
  }

  async componentDidMount () {
    this.remote = remote()
    this.remote.subscribe(this.update.bind(this))
  }

  async componentDidUpdate (prevProps, prevState) {
    if (
      this.props.seed &&
      this.props.action !== 'SET_DOMAINS' &&
      this.props.action !== 'SET_LOADING'
    ) {
      if (!this.props.loading) {
        this.props.setLoading(true)
      }
      console.log('publishing', this.props)
      await this.remote.publish({
        name: this.props.seed,
        tld: this.props.tld,
        offset: this.props.offset,
        limit: 10,
        mode: this.props.mode
      })
    }
  }

  update = (domains) => {
    if (domains.length) {
      this.props.setDomains(domains)
    } else {
      this.props.setOffset(this.props.offset + 10)
    }
  }

  async componentWillUnmount () {
    await this.remote.end()
  }

  render () {
    return (
      <React.Fragment>
        <Header />
        <main>
          <Hero  {...this.props} />
          <Results
            {...this.props}
          />
        </main>
      </React.Fragment>
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
