import React from 'react'
import Radio from 'antd/lib/radio'
export default class SelectTld extends React.Component {
  onChange = evt => {
    this.props.selectTld(evt.target.value)
  }

  render () {
    const { tld } = this.props
    return (
      <Radio.Group value={tld} onChange={this.onChange} className={'gutter'}>
        <Radio.Button value="com">com</Radio.Button>
        <Radio.Button value="io">io</Radio.Button>
        <Radio.Button value="co">co</Radio.Button>
      </Radio.Group>
    )
  }
}
