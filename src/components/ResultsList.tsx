import React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core'
import { CheckCircle, Clear, Favorite, FavoriteBorder } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  list: {
    width: '100%',
    // @ts-ignore
    marginBottom: theme.spacing(2)
  }
}))

function ResultsList (props) {
  const { results, favorites, onFavorite } = props 
  const classes = useStyles(props)

  const onClick = id => evt => {
    onFavorite(id)
  }

  return (
    <List className={classes.list}>
      {
        results.map((result) => {
          return (
            <ListItem key={result.id} button>
              <ListItemIcon>
                {result.available ? <CheckCircle /> : <Clear />}
              </ListItemIcon>
              <ListItemText primary={result.domain} />
              <ListItemSecondaryAction>
                <IconButton onClick={onClick(result.id)}>
                  {favorites.has(result.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })
      }
    </List>
  )
}

export default ResultsList
