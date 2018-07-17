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
import Remote from '../../lib/remote'

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
      nextProps.offset !== this.props.offset
      nextProps.domains.length !== this.props.domains.length
  }

  createConnection = () => {
    if (this.remote && this.remote.connected) {
      return
    }
    console.warn('creating new connection!')
    this.remote = new Remote({
      remote: {
        endpointUrl: ENDPOINT_URL
      },
      debug: true
    })
  }

  componentDidMount () {
    this.createConnection()
  }

  async componentDidUpdate (prevProps, prevState) {
    if (
      !this.props.loading &&
      this.props.seed &&
      !this._isInFlight
    ) {
      this._isInFlight = true
      this.props.setLoading(true)
      if (
        this.remote.channel &&
        this.remote.channel.disconnecting
      ) {
        this.createConnection()
      }
      const params = {
        name: this.props.seed,
        tld: this.props.tld,
        offset: this.props.offset,
        limit: 10,
        mode: this.props.mode
      }
      let domains = await this.remote.process(params)
      this.props.setDomains(domains)
      this._isInFlight = false
    }
  }

  async componentWillUnmount () {
    await this.remote.end()
  }

  render () {
    console.log(this.props)
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
