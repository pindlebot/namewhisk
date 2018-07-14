import 'isomorphic-fetch'

const BASE_URI = 'https://1oqkke2wfd.execute-api.us-east-1.amazonaws.com/dev'

const params = {
  'suggest': 'keyword',
  'trends': 'keyword',
  'lookup': 'keyword',
  'domains': 'domains',
  'stats': 'keyword',
  'synonyms': 'word'
}

const generateDataset = (label, data) => ({
  label: label || '',
  fill: false,
  lineTension: 0.2,
  backgroundColor: 'rgba(75,192,192,0.4)',
  borderColor: '#52616F',
  borderCapStyle: 'butt',
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: '#2C3E50',
  pointBackgroundColor: '#3F4F5F',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
  data: data
})

// const toDomain = (value, { tld }) => `${value.replace(/\s/g, '')}${tld}`

const format = ({ set }, options) => {
  return set
    .filter(({ value }) => /^[\w\s]+$/.test(value))
    .map(({ value }) => ({
      domain: value.replace(/[-\s]+/g, ''),
      keyword: value
    }))
}

class Client {
  constructor (options) {
    this.options = {
      tld: 'com',
      ...options
    }
  }

  static create (options) {
    return new Client(options)
  }

  fetch (value, { endpoint }) {
    let url = `${BASE_URI}/${endpoint}`
    url += `?${params[endpoint]}=${value}`
    return fetch(url)
      .then(resp => resp.json())
  }

  async fetchSuggestions (value) {
    let url = `${BASE_URI}/suggest`
    url += `?keyword=${value}`
    let suggestions = await fetch(url)
      .then(resp => resp.json())
      .then(data => format(data, this.options))
    return suggestions
  }

  fetchDomain (keyword) {
    let tld = this.options.tld.replace(/\./, '')
    let url = `${BASE_URI}/domains?tld=${tld}&name=${keyword}`
    return fetch(url)
      .then(resp => resp.json())
  }

  async fetchTrends (value) {
    let { default: { timelineData: data } } = await this.fetch(value, { endpoint: 'trends' })
    let values = data.map((data) => data.value[0])
      .slice(0, 12)
    let labels = data.map(({ formattedTime }) => formattedTime.slice(0, 3))
      .slice(0, 12)
    return {
      labels,
      datasets: [
        generateDataset(value, values)
      ]
    }
  }
}

export default Client
