import React from 'react'
import Content from './Content'
import Footer from './Footer'
import Header from './Header'

const Card = props => (
  <a href={''} target='_blank' className={props.loading ? 'fadeOut animated' : 'fadeIn animated'}>
    <div className='card-wrapper'>
      <Header domain={props.domain} />
      <Content {...props} stats={{}} />
      <Footer />
    </div>
  </a>
)

export default Card
