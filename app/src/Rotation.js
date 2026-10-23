import * as THREE from "three"
import { COORD_System } from './Orbit.js'
import { GSE_to_WS } from './Orbit.js'
import { GSE_to_ANY } from './Orbit.js'
import { ANY_to_GSE } from './Orbit.js'

export const rotate_earth = (time = 0, system = COORD_System.GSE) => 
    {
    // Check for heliocentric coordinates.  Don't do any rotation in these systems
    // for now
    if  (system === COORD_System.HEE || system === COORD_System.HAE)
        {
        return {q: new THREE.Quaternion (), theta: 0}
        }

    // Location of the point (90 ϕ, 0 λ) in world space coordinates on the unrotated Earth.  
    const init_z = GSE_to_WS (new THREE.Vector3 (0, 0, 1))
    init_z.normalize ()

    // Location of the point (0 ϕ, 0 λ) in world space coordinates on the unrotated Earth.
    const init_x = GSE_to_WS (new THREE.Vector3 (1, 0, 0))
    init_x.normalize ()

    // Location of the point (90 ϕ, 0 λ) on the Earth in world space coordinates for the current time.
    const target_z = GSE_to_WS (GSE_to_ANY (ANY_to_GSE (new THREE.Vector3 (0, 0, 1), COORD_System.GEO, time), system, time))
    target_z.normalize ()

    // Location of the point (0 ϕ, 0 λ) on the Earth in world space coordinates for the current time.
    const target_x = GSE_to_WS (GSE_to_ANY (ANY_to_GSE (new THREE.Vector3 (1, 0, 0), COORD_System.GEO, time), system, time))
    target_x.normalize ()

    // Calculate the quaternion that will align the Earth to its correct axis of rotation.  We will used 
    // the method setFromAxisAngle to do this.

    // Axis parameter to feed into setFromAxisAngle method 
    const axis_z_align = new THREE.Vector3 ()
    axis_z_align.crossVectors (init_z, target_z)
    axis_z_align.normalize ()

    // Calculate the rotation angle to feed into setFromAxisAngle method.
    const rot_z_align = Math.acos (init_z.dot (target_z))

    // Calculate quaternion that align Earth with its correct rotation axis in world space coordinates.
    const q = new THREE.Quaternion ()
    q.setFromAxisAngle (axis_z_align, rot_z_align)
    
    // Align the Earth to its rotation axis
    // this.earth.quaternion.copy (q0)

    // Current location of the point (0 ϕ, 0 λ)  on the surface of the Earth.
    const x = init_x.clone ().applyQuaternion (q)

    // Calculate the angle of rotation necessary to align x with target_x
    const angle = Math.acos (x.dot (target_x))
    const theta = (target_x.z > 0)? (Math.PI - angle) + Math.PI : angle
 
    // Return the alignment quaternion and rotation angle as a structure
    return {q: q, theta: theta}

    }

export const rotate_terminator = (time = 0, system = COORD_System.GSE) => 
    {
    // Check for heliocentric coordinates.  Don't do any rotation in these systems
    // for now
    if  (system === COORD_System.HEE || system === COORD_System.HAE)
        {
        return {q: new THREE.Quaternion (), theta: 0}
        }

    // Location of the point (90 ϕ, 0 λ) in world space coordinates on the unrotated Earth.  
    const init_z = GSE_to_WS (new THREE.Vector3 (0, 0, 1))
    init_z.normalize ()

    // Location of the point (0 ϕ, 0 λ) in world space coordinates on the unrotated Earth.
    const init_x = GSE_to_WS (new THREE.Vector3 (1, 0, 0))
    init_x.normalize ()

    // Location of the point (90 ϕ, 0 λ) on the Earth in world space coordinates for the current time.
    const target_z = GSE_to_WS (GSE_to_ANY (new THREE.Vector3 (0, 0, 1), system, time))
    target_z.normalize ()

    // Location of the point (0 ϕ, 0 λ) on the Earth in world space coordinates for the current time.
    const target_x = GSE_to_WS (GSE_to_ANY (new THREE.Vector3 (1, 0, 0), system, time))
    target_x.normalize ()

    // Calculate the quaternion that will align the Earth to its correct axis of rotation.  We will used 
    // the method setFromAxisAngle to do this.

    // Axis parameter to feed into setFromAxisAngle method 
    const axis_z_align = new THREE.Vector3 ()
    axis_z_align.crossVectors (init_z, target_z)
    axis_z_align.normalize ()

    // Calculate the rotation angle to feed into setFromAxisAngle method.
    const rot_z_align = Math.acos (init_z.dot (target_z))

    // Calculate quaternion that align Earth with its correct rotation axis in world space coordinates.
    const q = new THREE.Quaternion ()
    q.setFromAxisAngle (axis_z_align, rot_z_align)
    
    // Align the Earth to its rotation axis
    // this.earth.quaternion.copy (q0)

    // Current location of the point (0 ϕ, 0 λ)  on the surface of the Earth.
    const x = init_x.clone ().applyQuaternion (q)

    // Calculate the angle of rotation necessary to align x with target_x
    const angle = Math.acos (x.dot (target_x))
    const theta = (target_x.z > 0)? (Math.PI - angle) + Math.PI : angle
    
    // Return the alignment quaternion and rotation angle as a structure
    return {q: q, theta: theta}
    }