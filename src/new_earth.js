import * as THREE from "three"

import { COORD_System, GSE_to_Frame } from './Orbit.js'
import { sun_position } from './Orbit.js'
import { GEI_to_GSE } from './Orbit.js'
import { ANY_to_GSE } from "./Orbit.js"
import { GSE_to_ANY } from "./Orbit.js"
import { Frame_to_DS } from "./Orbit.js"
import { DEG2RD } from "./Orbit.js"
import { midnight } from "./Orbit.js"
import { RD2DEG } from "./Orbit.js"
import { gmst } from "./Orbit.js"
import { GEI_to_GEO } from "./Orbit.js"

import { AXIS_X, AXIS_Y, AXIS_Z } from './Orbit_Display'

import { GSE_to_WS, sph2rect } from './Orbit.js'
import { REF_FRAME } from "./Orbit.js"

import earth_diffuse    from './images/earthmap1k.jpg' 
import earth_bump       from './images/earthbump1k.jpg' 
import earth_spec       from './images/earthspec1k.jpg' 

export class Terra 
    {
    constructor  (scene, axes_length = 1, GS_loc=[], system = COORD_System.GSE, time)
        {
        const TICK_SIZE = .020

        this.scene = scene 

        this.mesh_earth_radius = 1 
        this.top_vector = [0, -1, 0]

        this.earth = null 
        this.axes_end_points = null 

        this.axes_size = 1

        this.axes = null 

        this.x_axis_mark = null
        this.y_axis_mark = null
        this.z_axis_mark = null

        //this.x_axis_orient = null
        //this.y_axis_orient = null
        //this.z_axis_orient = null

        this.x_axis_tick_marks = []
        this.y_axis_tick_marks = []
        this.z_axis_tick_marks = []

        this.x_axis_tick_pos = []
        this.y_axis_tick_pos = []
        this.z_axis_tick_pos = []

        // Create new tick mark geometry
        //this.tick_mark_geometry = new THREE.BoxGeometry (TICK_SIZE, TICK_SIZE, TICK_SIZE)
        this.tick_mark_geometry = new THREE.SphereGeometry (TICK_SIZE, 24, 24)


        // Make appropriate materials fpr each axis. 
        this.axis_x_material = new THREE.MeshBasicMaterial ({color: AXIS_X})
        this.axis_y_material = new THREE.MeshBasicMaterial ({color: AXIS_Y})
        this.axis_z_material = new THREE.MeshBasicMaterial ({color: AXIS_Z})

        const gs_radius = this.mesh_earth_radius * .01332 
        const gs_height = this.mesh_earth_radius * .02 

        this.adjusted_earth_radius = this.mesh_earth_radius + gs_height / 2.0 // Really Altitude

        this.station_geometry = new THREE.ConeGeometry( gs_radius, gs_height, 6 ) 
        this.station_material = new THREE.MeshPhongMaterial () 

        this.GS = []

        this.create_earth ()

        this.create_end_markers (system, time)
        this.update_GS_location (GS_loc)

        this.axes_length = 6

        this.create_axes ()

        this.update_axes_length (axes_length)

        this.update_GS_location = this.update_GS_location.bind (this)
        this.update_axes_length = this.update_axes_length.bind (this)
        this.create_end_markers = this.create_end_markers.bind (this)
        this.create_axes = this.create_axes.bind (this)
        this.update_axes = this.update_axes.bind (this)
        this.set_tick_mark_positions = this.set_tick_mark_positions.bind (this)
        this.set_tick_marks_visible = this.set_tick_marks_visible.bind (this)
        this.remove_axis_tick_marks = this.remove_axis_tick_marks.bind (this)
        this.create_axis_tick_marks = this.create_axis_tick_marks.bind (this)
        this.resize_axes = this.resize_axes.bind (this)

        /*
        const m = new THREE.MeshBasicMaterial ()
        const g = new THREE.SphereGeometry (0.06, 32, 32)  
        this._marker = new THREE.Mesh ( g, m ) 
        this.scene.add (this._marker)
        */
        }
    
    update_GS_location (loc=[])
        {
        if  (this.GS.length)
            {
            this.GS.forEach (gs => this.earth.remove (gs.gs))

            this.GS.length = 0
            }

        // his.GS[i].long, this.GS[i].latt
        loc.forEach (gs => this.GS.push ({latt: gs.latt, long: gs.long, gs: null}))
        
        this.create_ground_stations ()
        }

    update_axes_length (axes_length = 0)
        {
        // This has to be rewritten.  We need to completely recreate axes every time the
        // Size or coordinate system changes.

        if  (axes_length !== 0)
            {
            if  (this.axes_length === 0)
                {
                this.axes.visible = true 

                this.x_axis_mark.visible = true
                this.y_axis_mark.visible = true
                this.z_axis_mark.visible = true

                this.set_tick_marks_visible (this.x_axis_tick_marks.visible, true)
                this.set_tick_marks_visible (this.y_axis_tick_marks.visible, true)
                this.set_tick_marks_visible (this.z_axis_tick_marks.visible, true)   
                }

            this.axes_length = axes_length
            this.axes_size = axes_length + 1

            this.resize_axes () 
            }

        else
            {
            this.axes.visible = false 

            this.x_axis_mark.visible = false
            this.y_axis_mark.visible = false
            this.z_axis_mark.visible = false

            this.set_tick_marks_visible (this.x_axis_tick_marks.visible, false)
            this.set_tick_marks_visible (this.y_axis_tick_marks.visible, false)
            this.set_tick_marks_visible (this.z_axis_tick_marks.visible, false)

            this.axes_length = axes_length
            this.axes_size = 0
            }

        }

    create_end_markers ()
        {

        const axis_x_material = new THREE.MeshBasicMaterial ({color: AXIS_X})
        const axis_y_material = new THREE.MeshBasicMaterial ({color: AXIS_Y})
        const axis_z_material = new THREE.MeshBasicMaterial ({color: AXIS_Z})

        const end_mark = new THREE.ConeGeometry (0.12, .24, 4, 1, true)

        end_mark.rotateX (-90 * DEG2RD)

        this.x_axis_mark = new THREE.Mesh (end_mark, axis_x_material)
        this.y_axis_mark = new THREE.Mesh (end_mark, axis_y_material)
        this.z_axis_mark = new THREE.Mesh (end_mark, axis_z_material)

        this.scene.add (this.x_axis_mark) 
        this.scene.add (this.y_axis_mark) 
        this.scene.add (this.z_axis_mark) 
        }

    create_axes ()
        {
        // This just creates a generic set of endpoints.  They are moved to their correct 
        // positions in the method update_axes()

        const material = new THREE.LineBasicMaterial ({ vertexColors: true, toneMapped: false }) ;
		const geometry = new THREE.BufferGeometry() ;
        
        // access this array at 0, 6 and 12 get the positions of the axis marks.  
        const points = [
             1,  0,  0,
            -1,  0,  0,
             0,  1,  0,
             0, -1,  0,
             0,  0,  1,
             0,  0, -1,
            ] ;

        const color = [
            ...AXIS_X.toArray (),
            ...AXIS_X.toArray (),
            ...AXIS_Y.toArray (),
            ...AXIS_Y.toArray (),
            ...AXIS_Z.toArray (),
            ...AXIS_Z.toArray (),
            ]

        this.axes_end_points = points ;
        
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute ( points, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute ( color, 3 ) );

        this.axes = new THREE.LineSegments ( geometry, material )

        this.scene.add (this.axes)
        }

    update_axes (time, system = COORD_System.GSE, frame = REF_FRAME.ECI)
        {
        // This should be called with each time update.
        const target = this.axes_end_points.map (p => {return p *  this.axes_size}) 

        // const gse = ANY_to_GSE (target, system, time)

        // const gse_frame = GSE_to_Frame (gse, time, frame)
 
        const ws = GSE_to_WS (target)
        // const ws = GSE_to_WS (gse_frame)
        //const ws = gse_frame

        this.axes.geometry.setAttribute ( 'position', new THREE.Float32BufferAttribute ( ws, 3))

        this.x_axis_mark.position.fromArray (ws, 0)
        this.y_axis_mark.position.fromArray (ws, 6)
        this.z_axis_mark.position.fromArray (ws, 12)

        this.x_axis_mark.lookAt (0, 0, 0) // Will eventually to convert (0, 0, 0) from current coordinate system
        this.y_axis_mark.lookAt (0, 0, 0)
        this.z_axis_mark.lookAt (0, 0, 0)

        this.set_tick_mark_positions (this.x_axis_tick_marks, this.x_axis_tick_pos, time, system, frame)
        this.set_tick_mark_positions (this.y_axis_tick_marks, this.y_axis_tick_pos, time, system, frame)
        this.set_tick_mark_positions (this.z_axis_tick_marks, this.z_axis_tick_pos, time, system, frame)
        }

    set_tick_mark_positions (marks, pos, time, system= COORD_System.GSE, frame = REF_FRAME.ECI)
        {
        // const gse = ANY_to_GSE (pos, system, time)

        // const gse_frame = GSE_to_Frame (gse, time, frame)

        //const ws = GSE_to_WS (gse_frame)
        //const ws = gse_frame
        const ws = GSE_to_WS (pos)

        for (let i = 0 ; i < marks.length ; i++)
            {
            marks [i].position.fromArray (ws, i * 3)
            }
        }

    remove_axis_tick_marks (a)
        {
        for (let i = 0 ; i < a.length ; i++)
            {
            this.scene.remove (a [i])
            }

        a.length = 0
        }

    set_tick_marks_visible (axis, visible = true)
        {
        for (let i = 0 ; i < axis.length ; i++)
            {
            axis [i].visible = visible
            }
        }

    create_axis_tick_marks (marks, pos, axis)
        {
        let unit = null
        let material = null 

        marks.length = 0
        pos.length = 0

        switch (axis.toUpperCase ())
            {
            case "X" :
                unit = [1, 0, 0]
                material = this.axis_x_material

                break

            case "Y" :
                unit = [0, 1, 0]
                material = this.axis_y_material

                break

            case "Z" :
                unit = [0, 0, 1]
                material = this.axis_z_material

                break

            default :
                unit = [1, 0, 0]
                material = this.axis_x_material

            }

        for (let i = this.axes_size ; i > 1 ; i--)
            {
            marks.unshift (new THREE.Mesh (this.tick_mark_geometry, material))
            pos.push (...unit.map (e => e * i * -1))

            this.scene.add (marks [0])
            }

        for (let i = 2 ; i < this.axes_size ; i++)
            {
            marks.unshift (new THREE.Mesh (this.tick_mark_geometry, material))
            pos.push (...unit.map (e => e * i))

            this.scene.add (marks [0])
            }

        // console.log ("axis: ", axis, " marks: ", marks.length, " pos: ", pos.length)
        // console.log (pos)
        }

    resize_axes ()
        {
        if  (this.x_axis_tick_marks.length !== 0)
            {
            this.remove_axis_tick_marks (this.x_axis_tick_marks)
            this.remove_axis_tick_marks (this.y_axis_tick_marks)
            this.remove_axis_tick_marks (this.z_axis_tick_marks)
            }
        
        this.create_axis_tick_marks (this.x_axis_tick_marks, this.x_axis_tick_pos, "X")
        this.create_axis_tick_marks (this.y_axis_tick_marks, this.y_axis_tick_pos, "Y")
        this.create_axis_tick_marks (this.z_axis_tick_marks, this.z_axis_tick_pos, "Z")
        }

    create_earth () 
        {
        const loadManager = new THREE.LoadingManager()
        const loader = new THREE.TextureLoader (loadManager)

        const earth_geometry = new THREE.SphereGeometry (this.mesh_earth_radius, 32, 32) 

        const earth_material = new THREE.MeshPhongMaterial () 
        
        earth_material.map           = loader.load (earth_diffuse) 
        earth_material.bumpMap       = loader.load (earth_bump)
        earth_material.specularMap   = loader.load (earth_spec) 
        earth_material.bumpScale     = 0.05 
        
        this.earth = new THREE.Mesh (earth_geometry, earth_material) 

        this.earth.name = "earth" 

        /*
        const m = new THREE.MeshBasicMaterial ()
        const cyl  =  new THREE.CylinderGeometry (0.06, .06, .2, 32) 
        const cone =  new THREE.ConeGeometry (.06, .3, 32)

        cyl.rotateX (90 * DEG2RD)
        cone.rotateX (90 * DEG2RD)

        const u = new THREE.Mesh ( cyl, m ) 
        const v = new THREE.Mesh ( cone, m ) 

        const pz = GSE_to_WS (new THREE.Vector3 (0, 0, 1))
        u.lookAt (pz)
        u.position.copy (pz)
        u.position.multiplyScalar (1.1)

        this.earth.add (u)

        const px = GSE_to_WS (new THREE.Vector3 (1, 0, 0))
        v.lookAt (px)
        v.position.copy (px)
        v.position.multiplyScalar (1.15)

        this.earth.add (v)

        */

        

        this.scene.add (this.earth)
        }

    create_ground_stations ()
        {

        for (let i = 0 ; i < this.GS.length ; i++)
            {
            this.GS [i].gs = new THREE.Mesh (this.station_geometry, this.station_material) 

            const xyz = sph2rect (new THREE.Vector3 (this.GS[i].long, this.GS[i].latt, 1.))

            const ws = GSE_to_WS (xyz)
    
            this.GS [i].gs.position.copy (ws.multiplyScalar (this.adjusted_earth_radius)) ;

            this.GS [i].gs.lookAt (0., 0., 0.) ;

            this.GS [i].gs.rotateZ (-90 * DEG2RD) ;
            this.GS [i].gs.rotateX (-90 * DEG2RD) ;

            this.earth.add (this.GS [i].gs) ;
            }

        }

    create_axes_marker (time)
        {
        const gs_radius = this.mesh_earth_radius * .05 ;
        const gs_height = this.mesh_earth_radius * .1 ;
    
        const adjusted_earth_radius = this.mesh_earth_radius + gs_height / 2.0 ;
    
        const station_geometry = new THREE.ConeGeometry( gs_radius, gs_height, 6 ) ;
        const station_material = new THREE.MeshPhongMaterial () ;
    
        const station = new THREE.Mesh (station_geometry, station_material) ;


        //  set the proper inclination and rotation of the Earth.

        const sunpos = sun_position (time) ;

        const gei = sph2rect (new THREE.Vector3 (0.0, 90.0, 1.0)) ;
        const gse = GEI_to_GSE (gei, sunpos) ;
        const ws  = GSE_to_WS (gse) ;

        this.scene.add (station) ;

        station.position.copy (ws.multiplyScalar (adjusted_earth_radius)) ;

        station.lookAt (0., 0., 0.) ;

        station.rotateZ (-90 * DEG2RD) ;
        station.rotateX (-90 * DEG2RD) ; 
        }

    set_earth_rotation (time = 0, frame = REF_FRAME.ECI, system = COORD_System.GSE)
        {
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
        const q0 = new THREE.Quaternion ()
        q0.setFromAxisAngle (axis_z_align, rot_z_align)
        
        // Align the Earth to its rotation axis
        this.earth.quaternion.copy (q0)

        // Current location of the point (0 ϕ, 0 λ)  on the surface of the Earth.
        const x = init_x.clone ().applyQuaternion (q0)

        // Calculate the angle of rotation necessary to align x with target_x
        const angle = Math.acos (x.dot (target_x))
        const theta = (target_x.z > 0)? (Math.PI - angle) + Math.PI : angle
        
        // Rotate the Earth to attain its correct position
        this.earth.rotateY (theta)

        // this._marker.position.copy (target_x).multiplyScalar (1.3)

        // Old earth orientation code using object lookat.
        /*
        //  set the proper inclination and rotation of the Earth.
        const sunpos = sun_position (time) ;

        // convert longitude 0 / lattitude 90 to spherical coordinates.  
        //const gei = sph2rect (new THREE.Vector3 (0.0, 90.0, 1.0)) 
        //const gse = GEI_to_GSE (gei, sunpos) ;
 
        //const ws  = GSE_to_WS (gse) ;
 
        const gse = GEI_to_GSE ([0, 0, 1], sunpos) ;
        const ws  = new THREE.Vector3 ().fromArray (GSE_to_WS (gse))
 
 
        this.earth.lookAt (ws) ;
        //this.earth.rotateX (90 * DEG2RD) ;
 
        // Don't rotate the earth in ECER
        if  (frame === REF_FRAME.ECER)
            {
            this.earth.rotateZ (gmst (midnight (time)))
            }
 
        else 
            {
            this.earth.rotateZ (gmst (time))
            }
        */
        
        }
    }

    export default Terra