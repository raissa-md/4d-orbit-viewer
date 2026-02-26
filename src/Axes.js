import * as THREE from "three"

import { COORD_System } from './Orbit.js'
import { COORD_Unit } from "./Orbit.js"
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
import { convert } from "./Orbit.js"

import { AXIS_X, AXIS_Y, AXIS_Z } from './Orbit_Display'

import { GSE_to_WS, sph2rect } from './Orbit.js'
import { REF_FRAME } from "./Orbit.js"

export class Axes
    {
    constructor  (scene, axes_length = 1, unit = COORD_Unit.RE)
        {
        const TICK_SIZE = .020

        this.scene = scene 

        this.axes_end_points = null 

        this.axes_size = 1
        this.unit = COORD_Unit.RE
        this.ratio = 1

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

        this.create_end_markers ()
        this.create_axes ()

        this.set_coord_units (unit)

        this.update_axes_length (axes_length)
        
        this.update_axes_length = this.update_axes_length.bind (this)
        this.create_end_markers = this.create_end_markers.bind (this)
        this.create_axes = this.create_axes.bind (this)
        this.update_axes = this.update_axes.bind (this)
        this.set_tick_mark_positions = this.set_tick_mark_positions.bind (this)
        this.set_tick_marks_visible = this.set_tick_marks_visible.bind (this)
        this.remove_axis_tick_marks = this.remove_axis_tick_marks.bind (this)
        this.create_axis_tick_marks = this.create_axis_tick_marks.bind (this)
        this.resize_axes = this.resize_axes.bind (this)
        }
    
    update_axes_length (axes_length = 0)
        {
        // This has to be rewritten.  We need to completely recreate axes every time the
        // Size or coordinate system changes.

        if  (axes_length !== 0)
            {
            if  (this._axes_length === 0)
                {
                this.axes.visible = true 

                this.x_axis_mark.visible = true
                this.y_axis_mark.visible = true
                this.z_axis_mark.visible = true

                this.set_tick_marks_visible (this.x_axis_tick_marks, true)
                this.set_tick_marks_visible (this.y_axis_tick_marks, true)
                this.set_tick_marks_visible (this.z_axis_tick_marks, true)   
                }

            this._axes_length = axes_length
            this.axes_size = axes_length + 1

            this.resize_axes () 
            }

        else
            {
            this.axes.visible = false 

            this.x_axis_mark.visible = false
            this.y_axis_mark.visible = false
            this.z_axis_mark.visible = false

            this.set_tick_marks_visible (this.x_axis_tick_marks, false)
            this.set_tick_marks_visible (this.y_axis_tick_marks, false)
            this.set_tick_marks_visible (this.z_axis_tick_marks, false)

            this._axes_length = axes_length
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

    update_axes ()
        {
        // This should be called with each time update.
        const gse = this.axes_end_points.map (p => {return p * this.axes_size * this.ratio}) 

        //const gse = ANY_to_GSE (target, system, time)
        const ws = GSE_to_WS (gse)

        this.axes.geometry.setAttribute ( 'position', new THREE.Float32BufferAttribute ( ws, 3))

        this.x_axis_mark.position.fromArray (ws, 0)
        this.y_axis_mark.position.fromArray (ws, 6)
        this.z_axis_mark.position.fromArray (ws, 12)

        this.x_axis_mark.lookAt (0, 0, 0) // Will eventually to convert (0, 0, 0) from current coordinate system
        this.y_axis_mark.lookAt (0, 0, 0)
        this.z_axis_mark.lookAt (0, 0, 0)

        this.set_tick_mark_positions (this.x_axis_tick_marks, this.x_axis_tick_pos)
        this.set_tick_mark_positions (this.y_axis_tick_marks, this.y_axis_tick_pos)
        this.set_tick_mark_positions (this.z_axis_tick_marks, this.z_axis_tick_pos)
        }

    set_tick_mark_positions (marks, pos)
        {
        // const gse = ANY_to_GSE (pos, system, time)

        // const gse_frame = GSE_to_Frame (gse, time, frame)
        const gse = pos.map (x => x * this.ratio )

        const ws = GSE_to_WS (gse)
        //const ws = gse_frame
        // const ws = GSE_to_WS (pos)

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

    rescale_tick_marks (marks, s = 1)
        {
        for (let i = 0 ; i < marks.length ; i++)
            {
            marks [i].scale.set (s, s, s)
            }
        }

    rescale_axis_components (s = 1)
        {
        this.x_axis_mark.scale.set (s, s, s)
        this.y_axis_mark.scale.set (s, s, s)
        this.z_axis_mark.scale.set (s, s, s)


        this.rescale_tick_marks (this.x_axis_tick_marks, s)
        this.rescale_tick_marks (this.y_axis_tick_marks, s)
        this.rescale_tick_marks (this.z_axis_tick_marks, s)
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

        this.rescale_tick_marks (this.x_axis_tick_marks, this.ratio)
        this.rescale_tick_marks (this.y_axis_tick_marks, this.ratio)
        this.rescale_tick_marks (this.z_axis_tick_marks, this.ratio)
        }

    set_coord_units (unit)
        {
        this.unit = unit 

        this.ratio = convert (1, this.unit, COORD_Unit.GSE)

        this.rescale_axis_components (this.ratio)
        }

    get axes_length ()
        {
        return this._axes_length
        }
    }

    export default Axes