import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import DirectionsIcon from '@material-ui/icons/Directions'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  }
}))

function SearchInput(props) {
  const classes = useStyles()

  const { value, onChange, onSubmit, onKeyDown } = props

  const preventDefault = evt => {
    evt.preventDefault()
  }
  return ( 
    <Paper component='form' className={classes.root} onSubmit={preventDefault}>
      <InputBase
        className={classes.input}
        placeholder='Search'
        inputProps={{ 'aria-label': 'search' }}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <IconButton
        className={classes.iconButton}
        aria-label='search'
        onClick={onSubmit}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchInput
