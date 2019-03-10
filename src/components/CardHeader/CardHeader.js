import React from 'react'
import CardSpinner from '../Spinner'
// <i className='fa fa-check available' />
const CardTitle = props => (
  <div className='card-header-left' dangerouslySetInnerHTML={{
    __html: `${props.domain.name.replace(props.name, '<span class="seed">$&</span>').trim()}.${props.tld}`
  }} />
)

const CardHeader = props => (
  <div className='card-header'>
    <CardTitle {...props} />
    <div className='card-header-center'>
      <button className={'expand'}>
        {props.loading
          ? ''
          : props.expanded
            ? <i className='fa fa-chevron-up' />
            : <i className='fa fa-chevron-down' />
        }</button>
    </div>
    <div className={'card-header-right'}>
      {props.available === true
        ? <i className='fa fa-check available' />
        : props.available === false
          ? <i className='fa fa-times unavailable' />
          : <CardSpinner />}
    </div>
  </div>
)

CardHeader.defaultProps = {
  domain: {
    domain: ''
  },
  tld: '',
  available: undefined
}

export default CardHeader
