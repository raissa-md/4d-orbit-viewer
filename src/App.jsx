import React from 'react'
import './App.css'
//import 'antd/dist/antd.css'

import Manager from './Observatory.jsx'
import display_space from './3DSpace'
import Geo from './geo_orbit'
import Helio from './helio_orbit'

export const GEO = new Geo ()
export const HELIO = new Helio ()
export const V3DSpace = new display_space ("orbit")

class App extends React.Component {
  render() {
    return (
      <>
        <Manager />
      </>
    )
  }
}

export default App;