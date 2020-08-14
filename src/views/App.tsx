import * as React from 'react'
import { Fade, Grid, Paper, Button, Toolbar, Container, Typography, TextField } from '@material-ui/core'
import { Pagination } from '@material-ui/lab' 
import { useApolloClient } from '@apollo/client'

import { makeStyles } from '@material-ui/core/styles'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import Layout from '../components/Layout'
import ResultsList from '../components/ResultsList'
import { DOMAINS_QUERY } from '../graphql/queries'

const useAppStyles = makeStyles(theme => ({
  root: {
    // @ts-ignore
    padding: theme.spacing(3),
    marginTop: theme.spacing(3)
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    borderRadius: 0,
    height: '40px',
    marginBottom: '-2px'
  },
  textField: {
    borderRadius: 0
  },
  inputRoot: {
    borderRadius: 0
  },

  hero: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    // @ts-ignore
    padding: theme.spacing(2, 0)
  },
  paper: {
    padding: theme.spacing(2),
    boxShadow: 'rgba(47, 55, 71, 0.05) 0px 4px 8px, rgba(47, 55, 71, 0.1) 0px 1px 3px;'
  }
}))

const SET_QUERY = 'SET_QUERY'
const SET_RESULTS = 'SET_RESULTS'
const SET_LOADING = 'SET_LOADING'
const SET_TLD = 'SET_TLD'
const SET_PAGE = 'SET_PAGE'

const reducer = (state, action) => {
  switch (action.type) {
    case SET_PAGE:
      return {
        ...state,
        page: action.data
      }
    case SET_TLD:
      return {
        ...state,
        tld: action.data
      }
    case SET_LOADING:
      return {
        ...state,
        loading: action.data
      }
    case SET_QUERY:
      return {
        ...state,
        query: action.data
      }
    case SET_RESULTS:
      return {
        ...state,
        loading: false,
        results: action.data
      }
    default: 
      return state
  }
}

const TLDS = [
  'com',
  'io',
  'co',
  'sh'
]

function App () {
  const client = useApolloClient()
  const classes = useAppStyles()
  const [state, dispatch] = React.useReducer(reducer, {
    query: '',
    tld: 'io',
    results: [],
    loading: false,
    page: 1
  })

  const onChange = evt => {
    dispatch({ type: SET_QUERY, data: evt.target.value })
  }

  const onSearch = () => {
    if (!state.query) {
      return 
    }
    dispatch({ type: SET_LOADING, data: true })
    client.query({
      query: DOMAINS_QUERY,
      variables: {
        name: state.query,
        limit: 10,
        offset: (state.page - 1) * 10,
        tld: state.tld
      }
    }).then(({ data: { domains } }) => {{
      dispatch({ type: SET_RESULTS, data: domains.results })
    }})
  }

  const onTldChange = (event, tld) => {
    dispatch({
      type: SET_TLD,
      data: tld
    })
  }

  const onKeyDown = evt => {
    if (evt.key === 'Enter') {
      onSearch()
    }
  }

  const onPageChange = (evt, value) => {
    dispatch({ type: SET_PAGE, data: value })
  }

  React.useEffect(() => {
    onSearch()
  }, [state.page])

  React.useEffect(() => {
    onSearch()
  }, [state.tld])

  return (
    <Layout>
        <div className={classes.hero}>
          <Container maxWidth='sm' className={classes.root}>
            <Typography align='center' gutterBottom>
              Let's Name Your Silly Startup
            </Typography>
            <Toolbar className={classes.toolbar}>
              <TextField
                fullWidth
                onChange={onChange}
                value={state.query}
                variant='outlined'
                margin='dense'
                classes={{
                  root: classes.textField,
                }}
                InputProps={{
                  classes: {
                    root: classes.inputRoot
                  },
                  onKeyDown: onKeyDown
                }}
              /> 
              <Button className={classes.button} onClick={onSearch} variant='contained' color='primary'>
                Search
              </Button>
            </Toolbar>
            <Toolbar>
              <ToggleButtonGroup
                value={state.tld}
                exclusive
                onChange={onTldChange}
                size='small'
              >
                {TLDS.map(tld => {
                  return (
                    <ToggleButton key={tld} value={tld}>{tld}</ToggleButton>
                  )
                })}
              </ToggleButtonGroup>
            </Toolbar>
          </Container>
        </div>

        <Container maxWidth='md' className={classes.root}>
          <Fade in={state.results.length > 0}>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xs={6}>
                  <ResultsList results={state.results.slice(0, 5)} />
                </Grid>
                <Grid item xs={6}>
                  <ResultsList results={state.results.slice(5, 10)} />
                </Grid>
              </Grid>
              <Pagination count={10} page={state.page} onChange={onPageChange} />
            </Paper>
          </Fade>
        </Container>
    </Layout>
  )
}


export default App
