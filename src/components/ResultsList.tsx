import React from 'react'
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { CheckCircle, Clear } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  list: {
    width: '100%',
    // @ts-ignore
    marginBottom: theme.spacing(2)
  }
}))

function ResultsList (props) {
  const { results } = props 
  const classes = useStyles(props)
  return (
    <List className={classes.list}>
      {
        results.map((result, i) => {
          return (
            <ListItem key={i} button>
              <ListItemIcon>
                {result.available ? <CheckCircle /> : <Clear />}
              </ListItemIcon>
              <ListItemText primary={result.domain} />
            </ListItem>
          )
        })
      }
    </List>
  )
}

export default ResultsList
