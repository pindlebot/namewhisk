import React from 'react'

const CardHeader = props => (
  <div className='card-header'>
    <span>{`${props.domain.domain}.${props.tld}`}</span>
    <span>
      {props.available === true
        ? <i className='fa fa-check available' />
        : props.available === false
          ? <i className='fa fa-times unavailable' />
          : <i className='fa fa-spinner unknown' />}
    </span>
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
