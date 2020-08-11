import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { store } from './lib/store'
const UP_STAGE = process.env.UP_STAGE || ''

render(
  <Provider store={store}>
    <BrowserRouter basename={UP_STAGE}>
      <Route path='/' component={App} /> 
    </BrowserRouter>
  </Provider>
, document.getElementById('root'))
