import React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core'
import { CheckCircle, Clear, Favorite, FavoriteBorder } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  list: {
    width: '100%',
    // @ts-ignore
    marginBottom: theme.spacing(2)
  },
  available: {
    color: '#48BB78'
  },
  unavailable: {
    color: '#ff4f56'
  },
  favorite: {
    color: '#3d556b'
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
                {result.available ? <CheckCircle className={classes.available} /> : <Clear className={classes.unavailable} />}
              </ListItemIcon>
              <ListItemText primary={result.domain} />
              <ListItemSecondaryAction>
                <IconButton onClick={onClick(result.id)} className={classes.favorite}>
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
