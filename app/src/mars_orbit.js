import * as THREE from 'three'
import { AU } from './Orbit.js'
import { COORD_System } from './Orbit.js'
import { get_planet_inclination } from './planet_data.js'
import { get_planet_omega } from './planet_data.js'
import { GSE_to_ANY } from './Orbit.js'
import { mltply } from './Orbit.js'
import { DEG2RD } from './Orbit'
import { add_vectors } from './Orbit.js'
import { Orbit_Data } from './App.jsx'

/* This module implements Mars-centered Solar Orbital (MSO) coordinate conversion class. 
MSO coordinates are a right-handed coordinate system with the origin at the center of Mars.
The X axis points from Mars to the Sun 
The Y axis, is in the Mars Orbit Plane, which is approximately opposite to Orbital Motion Direction
The Z axis is perpendicular to both the X and Y axes.
See:
https://data.nasa.gov/dataset/maven-magnetometer-mag-magnetic-field-and-orbital-position-sun-state-and-payload-coordinat
The MSO coordinate system is used for modeling the Martian magnetosphere and solar wind interactions with Mars. 
*/  

class Mars
    {
    constructor ()
        {
        // Just doing this to enable debugging the transformation functions.
        this.HAE_to_MSO = this.HAE_to_MSO.bind(this)
        this.MSO_to_HAE = this.MSO_to_HAE.bind(this)
        }

    HAE_to_MSO (hae, time)
        {
        // Note that hae is an array [x, y, z], time is a scalar.

        // Get the position of Mars in HAE coordinates at the requested time.
        const mars_pos = GSE_to_ANY (Orbit_Data.get_orbit_pos ("MARS", time, true), COORD_System.HAE, time)

        // X axis vector. In MSO this is the unit vector that points from Mars to the sun.
        const x_axis = new THREE.Vector3 (mars_pos.x, mars_pos.y, mars_pos.z).normalize ().negate ()

        // Get the normalized velocity vector of mars with respect to the sun.
        const mars_v = Orbit_Data.get_velocity_normal ("MARS", time, true, COORD_System.HAE)

        // Approximate Y axis (opposite orbital motion) used only to establish the orbit plane; not guaranteed orthogonal to x_axis.
        const y_axis_raw = new THREE.Vector3 (mars_v.x, mars_v.y, mars_v.z).negate ()

        // Z axis vector. In MSO this is the unit vector that is perpendicular to the plane
        // formed by the sun and Mars.
        const z_axis = new THREE.Vector3 ().crossVectors (x_axis, y_axis_raw).normalize ()

        // Re-derive Y from the orthogonal X/Z pair so the basis is orthonormal.
        const y_axis = new THREE.Vector3 ().crossVectors (z_axis, x_axis).normalize ()

        // Now create a transformation matrix that will convert from GSE to MSO coordinates. 
        // The columns of this matrix are the X, Y, and Z axis vectors we just calculated.
                
        // Create matrix to transform from HAE to MSO coordinates
        let a = Array.from(Array(3), () => new Array(3)) 

        a [0] [0] = x_axis.x
        a [0] [1] = x_axis.y
        a [0] [2] = x_axis.z

        a [1] [0] = y_axis.x
        a [1] [1] = y_axis.y
        a [1] [2] = y_axis.z

        a [2] [0] = z_axis.x
        a [2] [1] = z_axis.y
        a [2] [2] = z_axis.z

        // Return the HAE coordinates transformed to MSO coordinates by multiplying the transformation
        // matrix by the HAE coordinates.
        const relative_position = [hae[0] - mars_pos.x, hae[1] - mars_pos.y, hae[2] - mars_pos.z]

        const mso = mltply (a, relative_position)  // HAE to MSO

        return mso 
        }

    MSO_to_HAE (mso, time)
        {
        // Note that mso is an array [x, y, z], time is a scalar.

        // Get the position of Mars in HAE coordinates at the requested time.
        const mars_pos = GSE_to_ANY (Orbit_Data.get_orbit_pos ("MARS", time, true), COORD_System.HAE, time)

         // X axis vector. In MSO this is the unit vector that points from Mars to the sun.
        const x_axis = new THREE.Vector3 (mars_pos.x, mars_pos.y, mars_pos.z).normalize ().negate ()

        // Get the normalized velocity vector of mars with respect to the sun.
        const mars_v = Orbit_Data.get_velocity_normal ("MARS", time, true, COORD_System.HAE)

        // Approximate Y axis (opposite orbital motion) used only to establish the orbit plane; not guaranteed orthogonal to x_axis.
        const y_axis_raw = new THREE.Vector3 (mars_v.x, mars_v.y, mars_v.z).negate ()

        // Z axis vector. In MSO this is the unit vector that is perpendicular to the plane
        // formed by the sun and Mars.
        const z_axis = new THREE.Vector3 ().crossVectors (x_axis, y_axis_raw).normalize ()

        // Re-derive Y from the orthogonal X/Z pair so the basis is orthonormal.
        const y_axis = new THREE.Vector3 ().crossVectors (z_axis, x_axis).normalize ()

        // Now create a transformation matrix that will convert from GSE to MSO coordinates. 
        // The columns of this matrix are the X, Y, and Z axis vectors we just calculated.
                
        // Create matrix to transform from MSO to GSE coordinates
        let a = Array.from(Array(3), () => new Array(3)) 

        a [0] [0] = x_axis.x
        a [0] [1] = y_axis.x
        a [0] [2] = z_axis.x

        a [1] [0] = x_axis.y
        a [1] [1] = y_axis.y
        a [1] [2] = z_axis.y

        a [2] [0] = x_axis.z
        a [2] [1] = y_axis.z
        a [2] [2] = z_axis.z

        // Return the MSO coordinates transformed to GSE coordinates by multiplying the transformation
        // matrix by the MSO coordinates.
        return add_vectors (mltply (a, mso), [mars_pos.x, mars_pos.y, mars_pos.z])
        }
    }

export default Mars