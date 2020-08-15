import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar } from '@material-ui/core'

const useLayoutStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  appBar: {
    backgroundColor: '#1a202c'
  }
}))


function Layout (props) {
  const { children } = props
  const classes = useLayoutStyles()
  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar} position='static'>
        <Toolbar>

        </Toolbar>
      </AppBar>
      {children}
    </div>
  )
}

export default Layout
