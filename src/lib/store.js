import * as redux from 'redux'

const SET_SEED = 'SET_SEED'
const SET_KEYWORDS = 'SET_KEYWORDS'
const SET_TLD = 'SET_TLD'
const SET_DOMAINS = 'SET_DOMAINS'
const SET_SYNONYMS = 'SET_SYONYMS'
const SET_LOADING = 'SET_LOADING'
const SET_SEARCH_MODE = 'SET_SEARCH_MODE'
const SET_STATS = 'SET_STATS'
const SET_OFFSET = 'SET_OFFSET'

export const setOffset = offset => ({
  payload: offset,
  type: SET_OFFSET
})

export const setSeed = (seed) => ({
  payload: seed,
  type: SET_SEED
})

export const setKeywords = (keywords) => ({
  payload: keywords,
  type: SET_KEYWORDS
})

export const setTld = (payload) => ({
  payload,
  type: SET_TLD
})

export const setDomains = (payload) => ({
  payload,
  type: SET_DOMAINS
})

export const setSynonyms = (payload) => ({
  payload,
  type: SET_SYNONYMS
})

export const setStats = (payload) => ({
  payload,
  type: SET_STATS
})

export const setLoading = payload => ({
  payload,
  type: SET_LOADING
})

export const setSearchMode = payload => ({
  payload,
  type: SET_SEARCH_MODE
})

export const initialState = {
  seed: '',
  tld: 'com',
  domains: [],
  synonyms: [],
  stats: [],
  mode: 'whimsical',
  offset: 3,
  scrollTop: 0
}

const _domains = [{ placeholder: true }, { placeholder: true }, { placeholder: true }]

export const reducer = (state, action) => {
  switch (action.type) {
    case SET_SEED:
      return {
        ...state,
        offset: 3,
        domains: [],
        seed: action.payload
      }
    case SET_KEYWORDS:
      return { ...state, keywords: action.payload }
    case SET_TLD:
      return {
        ...state,
        offset: 3,
        domains: state.domains.length ? _domains : [],
        tld: action.payload
      }
    case SET_SYNONYMS:
      return { ...state, synonyms: action.payload }
    case SET_STATS:
      return { ...state, stats: action.payload }
    case SET_LOADING:
      return { ...state, loading: action.payload }
    case SET_SEARCH_MODE:
      return {
        ...state,
        offset: 3,
        domains: state.domains.length ? _domains : [],
        mode: action.payload
      }
    case SET_DOMAINS:
      return { ...state, domains: action.payload }
    case SET_OFFSET:
      return {
        ...state,
        offset: action.payload
      }
    default:
      return state
  }
}

export const store = redux.createStore(reducer, initialState)
