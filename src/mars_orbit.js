import * as THREE from 'three'
import { AU } from './Orbit.js'
import { mltply } from './Orbit.js'
import { add_vectors } from './Orbit.js'
import { Orbit_Data } from './App.jsx'

/* This module implements Mars Solar Ecliptic (MSO) coordinate conversion class. 
MSO coordinates are a right-handed coordinate system with the origin at the center of Mars.
The X axis points from Mars to the Sun 
The Z axis is perpendicular to the plane formed by the Sun and Mars (same as GSE Z axis).
The Y axis is perpendicular to both the X and Z axes.
The MSO coordinate system is used for modeling the Martian magnetosphere and solar wind interactions with Mars. 
*/  

class Mars
    {
    constructor ()
        {
        }

    GSE_to_MSO (gse, sun_pos, time)
        {
        // Note that gse is an array, time is a scalar, but sun_pos is an 
        // object with multiple properties, but we only care about x, y, z.

        // Get the position of Mars in GSE coordinates at the requested time.
        const mars_pos = Orbit_Data.get_orbit_pos ("MARS", time, true)

        // We will need to convert both mars_pos and sun_pos to Vector3 objects so we can do 
        // vector math with them.

        // Solar position in GSE coordinates (Sun is always along the X axis in GSE coordinates)
        const sun_vector = new THREE.Vector3 (AU * sun_pos.R, 0, 0)

        // Mars position as a vector in GSE coordinates
        const mars_vector = new THREE.Vector3 (mars_pos.x, mars_pos.y, mars_pos.z)

        // X axis vector. In MSO this is the unit vector that points from Mars to the sun.
        const x_axis = sun_vector.clone ().sub (mars_vector).normalize ()

        // Z axis vector. In MSO this is the unit vector that is perpendicular to the plane
        // formed by the sun and Mars. Because we are transforming from GSE to MSO, we can use a
        // unit vector that points in the same direction as the GSE Z axis.
        const z_axis = new THREE.Vector3 (0, 0, 1)

        // Y axis vector. In MSO this is the unit vector that is perpendicular to both the X and Z axes.
        const y_axis = new THREE.Vector3 ().crossVectors (z_axis, x_axis).normalize ()

        // Now create a transformation matrix that will convert from GSE to MSO coordinates. 
        // The columns of this matrix are the X, Y, and Z axis vectors we just calculated.
                
        // Create matrix to transform from GSE to MSO coordinates
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

        // Return the GSE coordinates transformed to MSO coordinates by multiplying the transformation
        // matrix by the GSE coordinates.
        const relative_position = [gse[0] - mars_pos.x, gse[1] - mars_pos.y, gse[2] - mars_pos.z]
        return mltply (a, relative_position)        
        }

    MSO_to_GSE (mso, sun_pos, time)
        {
        // Note that mso is an array, time is a scalar, but sun_pos is an 
        // object with multiple properties, but we only care about x, y, z.

        // Get the position of Mars in GSE coordinates at the requested time.  
        const mars_pos = Orbit_Data.get_orbit_pos ("MARS", time, true)

        // We will need to convert both mars_pos and sun_pos to Vector3 objects so we can do 
        // vector math with them.

        // Solar position in GSE coordinates (Sun is always along the X axis in GSE coordinates)
        const sun_vector = new THREE.Vector3 (AU * sun_pos.R, 0, 0)
 
        // Mars position as a vector in GSE coordinates
        const mars_vector = new THREE.Vector3 (mars_pos.x, mars_pos.y, mars_pos.z)

        // X axis vector. In MSO this is the unit vector that points from Mars to the sun.
        const x_axis = sun_vector.clone ().sub (mars_vector).normalize ()

        // Z axis vector. In MSO this is the unit vector that is perpendicular to the plane
        // formed by the sun and Mars. Because we are transforming from GSE to MSO, we can use a
        // unit vector that points in the same direction as the GSE Z axis.
        const z_axis = new THREE.Vector3 (0, 0, 1)

        // Y axis vector. In MSO this is the unit vector that is perpendicular to both the X and Z axes.
        const y_axis = new THREE.Vector3 ().crossVectors (z_axis, x_axis).normalize ()

        // Now create a transformation matrix that will convert from MSO to GSE coordinates. 
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