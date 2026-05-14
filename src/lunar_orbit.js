import * as THREE from 'three'
import { mltply } from './Orbit.js'
import { Orbit_Data } from './App.jsx'


class Selene
    {
    constructor ()
        {
        }

    GSE_to_SSE (gse, sun_pos, time)
        {
        // Note that gae is an array, time is a scalar, but sun_pos is an 
        // object with multiple properties, but we only care about x, y, z.

        // Get the position of the moon in GSE coordinates at the requested time.  
        const moon_pos = Orbit_Data.get_orbit_pos ("MOON", time, true)

        // We will need to convert both moon_pos and sun_pos to Vector3 objects so we can do 
        // vector math with them.

        // Solar position as a unit vector in GSE coordinates
        const sun_vector = new THREE.Vector3 (sun_pos.x, sun_pos.y, sun_pos.z)

        // Moon position as a vector in GSE coordinates
        const moon_vector = new THREE.Vector3 (moon_pos.x, moon_pos.y, moon_pos.z).normalize ()

        // X axis vector. In SSE this is the unit vector that points from the moon to the sun.
        const x_axis = sun_vector.clone ().sub (moon_vector).normalize ()

        // Z axis vector. In SSE this is the unit vector that is perpendicular to the plane
        // formed by the sun and moon. Because we are transforming from GSE to SSE, we can use a
        // unit vector that points in the same direction as the GSE Z axis.
        const z_axis = new THREE.Vector3 (0, 0, 1)

        // Y axis vector. In SSE this is the unit vector that is perpendicular to both the X and Z axes.
        const y_axis = new THREE.Vector3 ().crossVectors (z_axis, x_axis).normalize ()

        // Now create a transformation matrix that will convert from GSE to SSE coordinates. 
        // The columns of this matrix are the X, Y, and Z axis vectors we just calculated.
                
        // Create matrix to transform from GSE to SSE coordinates
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

        const relative_position = [gse [0] - moon_pos.x, gse [1] - moon_pos.y, gse [2] - moon_pos.z]

        // Return the GSE coordinates transformed to SSE coordinates by multiplying the transformation
        // matrix by the GSE coordinates.
        return mltply (a, relative_position)
        }

    SSE_to_GSE (sse, sun_pos, time)
        {
        // Note that sse is an array, time is a scalar, but sun_pos is an 
        // object with multiple properties, but we only care about x, y, z.

        // Get the position of the moon in GSE coordinates at the requested time.  
        const moon_pos = Orbit_Data.get_orbit_pos ("MOON", time, true)

        // We will need to convert both moon_pos and sun_pos to Vector3 objects so we can do 
        // vector math with them.

        // Solar position as a unit vector in GSE coordinates
        const sun_vector = new THREE.Vector3 (sun_pos.x, sun_pos.y, sun_pos.z)

        // Moon position as a vector in GSE coordinates
        const moon_vector = new THREE.Vector3 (moon_pos.x, moon_pos.y, moon_pos.z).normalize ()

        // X axis vector. In SSE this is the unit vector that points from the moon to the sun.
        const x_axis = sun_vector.clone ().sub (moon_vector).normalize ()

        // Z axis vector. In SSE this is the unit vector that is perpendicular to the plane
        // formed by the sun and moon. Because we are transforming from GSE to SSE, we can use a
        // unit vector that points in the same direction as the GSE Z axis.
        const z_axis = new THREE.Vector3 (0, 0, 1)

        // Y axis vector. In SSE this is the unit vector that is perpendicular to both the X and Z axes.
        const y_axis = new THREE.Vector3 ().crossVectors (z_axis, x_axis).normalize ()

        // Now create a transformation matrix that will convert from SSE to GSE coordinates. 
        // The columns of this matrix are the X, Y, and Z axis vectors we just calculated.
                
        // Create matrix to transform from SSE to GSE coordinates
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

        const relative_position = [sse [0] + moon_pos.x, sse [1] + moon_pos.y, sse [2] + moon_pos.z]

        // Return the SSE coordinates transformed to GSE coordinates by multiplying the transformation
        // matrix by the SSE coordinates.
        return mltply (a, relative_position)

        }
    }

export default Selene