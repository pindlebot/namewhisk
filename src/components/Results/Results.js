import React from 'react'
import LazyLoad from '../LazyLoad'
import Spinner from '../Spinner'
import Collapse from 'antd/lib/collapse'
import Card from '../Card'

class Results extends React.Component {
  state = {
    expanded: []
  }

  onChange = value => {
    const expanded = [...this.state.expanded].concat(value)
    this.setState({ expanded })
  }

  render () {
    const domains = this.props.domains
    if (!domains.length) return false
    return (
      <LazyLoad {...this.props} render={() => {
        return (
          <div className='wrapper'>
            <Collapse onChange={this.onChange}>
              {
                domains.map((domain, key) => (
                  <Collapse.Panel header={domain.domain} key={domain.domain}>
                    <Card
                      {...this.props}
                      domain={domain}
                      expanded={this.state.expanded.includes(domain.domain)}
                      key={key}
                    />
                  </Collapse.Panel>
                ))
              }
              {this.props.loading && <Spinner />}
            </Collapse>
          </div>
        )
      }} />
    )
  }
}

export default Results
