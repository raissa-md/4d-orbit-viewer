/*
* Licensed under the Apache License, Version 2.0.
*/

import React from 'react'
import './App.css'
//import 'antd/dist/antd.css'

import Manager from './Observatory.jsx'
import display_space from './3DSpace'
import Geo from './geo_orbit'
import Helio from './helio_orbit'
import { Orbit_Data_Store } from './orbit_data'

export const GEO = new Geo ()
export const HELIO = new Helio ()
export const V3DSpace = new display_space ("orbit")
export const Orbit_Data = new Orbit_Data_Store ()

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