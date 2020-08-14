import * as React from 'react'
import { CssBaseline } from '@material-ui/core'
import { render } from 'react-dom'
import { ApolloProvider } from '@apollo/client'

import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles'
import apolloClient from './apolloClient'
import theme from './theme'
import App from './views/App'

render( 
  <ApolloProvider client={apolloClient}>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')
)