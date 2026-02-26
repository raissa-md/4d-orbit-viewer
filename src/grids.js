import React from 'react' ;
import * as THREE from "three";
//import { LineSegments } from '../objects/LineSegments.js';

import { ANY_to_GSE } from './Orbit.js'
import { GSE_to_WS } from './Orbit.js'
import { GSE_to_Frame } from './Orbit.js'
import { REF_FRAME } from './Orbit.js'
import { COORD_System } from './Orbit.js'
import { COORD_Unit } from './Orbit.js'
import { convert } from './Orbit.js'

const GRID_SIZE = 50 ;
const GRID_SCALE = 1 ;
const GRID_COLOR =  0x888888 ;
const CNTR_COLOR = 0x444444 ;

export class Axes 
    {
    static X = new Axes ("X") 
    static Y = new Axes ("Y") 
    static Z = new Axes ("Z") 

    constructor (name) 
        {
        this.name = name 
        }
    }

class Grid extends THREE.LineSegments
    {

	constructor(    axis = "X", 
                    off_axis = "Z",
                    //offset = 0, 
                    req_size = GRID_SIZE, 
                    scale = GRID_SCALE, 
                    color = GRID_COLOR, 
                    cntr_color = CNTR_COLOR, 
                    //time = 0, 
                    //system = COORD_System.GSE,
                    //frame = REF_FRAME.ECI,
                    unit = COORD_Unit.RE
                    ) 

        {
        const material = new THREE.LineBasicMaterial( { vertexColors: true, toneMapped: false } )
        const geometry = new THREE.BufferGeometry()

        super( geometry, material )

        this.material.visible = false

        this._transform = [0, 1, 2] 
        this._axis = axis 
        this._off_axis = off_axis 
        //this._offset = offset ;
        this._type = "AxisGrid" 
        this._name = axis . off_axis

        this._req_size = req_size
        this._scale = scale
        this._offset = 0

        this._grid_color = new THREE.Color ( color )
		this._center_line_color = new THREE.Color( cntr_color ) 

        this.vertices = []

        this.set_transform_vector ()

        this.update_grid_geometry (unit)
        }


    /*
        if  (   prevProps.size !== this.props.size ||
                prevProps.scale !== this.props.scale ||
                prevProps.color !== this.props.color ||
                prevProps.cntr_color !== this.props.cntr_color ||
                prevProps.to_gse !== this.props.to_gse
                )
            {
            const requested_size  = this.props.size ;
            const scale = this.props.scale ;
            const color = this.props.color ;
            const cntr_color = this.props.cntr_color ;
            const to_gse = this.props.to_gse ;

            this.grid.update_grid_geometry (requested_size, scale, color, cntr_color, to_gse) ;
    */

    //set_color (color, time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    set_color (color, unit = COORD_Unit.RE)
        {
        this._grid_color = new THREE.Color (color)

        this.update_grid_geometry (unit)
        }

    //set_centerline_color (color, time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    set_centerline_color (color, unit = COORD_Unit.RE)
        {
        this._center_line_color = new THREE.Color ( color )

        this.update_grid_geometry (unit)
        }

    //set_requested_size (size, time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    set_requested_size (size, unit = COORD_Unit.RE)
        {
        this._req_size = size

        this.update_grid_geometry (unit)
        }

    //set_scale (scale, time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    set_scale (scale, unit = COORD_Unit.RE)
        {
        this._scale = scale

        this.update_grid_geometry (unit)
        }

    // Create a transformation vector that will convert [axis, transverse axis, off axis]
    // into the correct set of coordinates [x, y, z].
    set_transform_vector ()
        {
        const X_index = 0 
        const Y_index = 1 
        const Z_index = 2 

        let X_transform = 0 
        let Y_transform = 1 
        let Z_transform = 2 


        // The off axis is tangent to the axis
        switch(this._off_axis) 
            {
            case 'Z':
                {
                Z_transform = Z_index 

                if  (this._axis === 'X') 
                    {
                    X_transform  = X_index 
                    Y_transform  = Y_index 
                    }
                else
                    {
                    X_transform = Y_index 
                    Y_transform = X_index 
                    }

                break 
                }

            case 'Y':
                {
                Y_transform = Z_index 

                if  (this._axis === 'X') 
                    {
                    X_transform  = X_index 
                    Z_transform  = Y_index 
                    }
                else
                    {
                    X_transform = Y_index 
                    Z_transform = X_index 
                    }

                break 
                }

            case 'X':
                {
                X_transform = Z_index 

                if  (this._axis === 'Y') 
                    {
                    Y_transform  = X_index 
                    Z_transform  = Y_index 
                    }
                else
                    {
                    Y_transform = Y_index 
                    Z_transform = X_index 
                    }

                break 
                }
                
            default:
                return undefined 
            }

        this._transform = [X_transform, Y_transform, Z_transform] 
        
        return this._transform 
        }
    
    /*
    get_ws_coord (xyz)
        {
        const coord = [xyz [this._transform [0]], xyz [this._transform [1]], xyz [this._transform [2]]] 

        if  (this._to_gse === null)
            {
            return GSE_to_WS (new THREE.Vector3().fromArray(coord)).toArray () 
            }
        else
            {
            //return GSE_to_WS (this._to_gse (new THREE.Vector3().fromArray(coord))).toArray () 
            }

        }
    */

    // update_grid (time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    update_grid (unit = COORD_Unit.RE)
        {
        // GSE_to_WS (GSE_to_Frame
        //const ws = GSE_to_WS (ANY_to_GSE (this.vertices, system, time))
        //const ws = GSE_to_WS (GSE_to_Frame (ANY_to_GSE (this.vertices, system, time), time, frame))
        const ratio = convert (1, unit, COORD_Unit.GSE)

        const ws = GSE_to_WS (this.vertices.map (p => p * ratio))

        this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( ws, 3 ) )
        }
    
    transform (...args)
        {
        // Input must be an array, passed through the fist argument, or three separate arguments
        // representing x, y, z coordinates
        const v = (args.length === 1)? args [0] : args.slice (0, 3) 

        const r = [v [this._transform [0]], v [this._transform [1]], v [this._transform [2]]]

        return r
        }

    // update_grid_geometry (time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    update_grid_geometry (unit = COORD_Unit.RE)
        {

        // Calculate number off divisions based on requested size and grid scale
        let divisions = Math.floor (this._req_size / this._scale) 

        // Detect odd number of divisions.  Always want divisition to be even
        if  (divisions % 2 === 1)
            {
            divisions++ 
            }

        // Actual size, center and half size.
        const size = divisions * this._scale 
		const center = divisions / 2   // Even divisions ensures center on grid line.
		const halfSize = size / 2      // Endpoints along requested axis.

        /*
        console.log ("request size: " + rq_size) 
        console.log ("scale: " + scale) 
        console.log ("divisions: " + divisions) 
        console.log ("size: " + size) 
        console.log ("center: " + center) 
        console.log ("halfsize size: " + halfSize) 
        */

		this.vertices.length = 0 
        const colors = [];

		for ( let i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += this._scale ) 

            {
            //vertices.push (...this.get_ws_coord ([- halfSize, this.offset, k], to_gse)) ;
            //vertices.push (...this.get_ws_coord ([halfSize, this.offset, k], to_gse)) ;
            //vertices.push (...this.get_ws_coord ([k, this.offset, - halfSize], to_gse)) ;
            //vertices.push (...this.get_ws_coord ([k, this.offset, halfSize], to_gse)) ;

            //vertices.push (...this.get_ws_coord ([- halfSize, k, this.offset], to_gse)) ;
            //vertices.push (...this.get_ws_coord ([halfSize, k, this.offset], to_gse)) ;
            //vertices.push (...this.get_ws_coord ([k, - halfSize, this.offset], to_gse)) ;
            //vertices.push (...this.get_ws_coord ([k, halfSize, this.offset], to_gse)) ;

            // use 0 offeset.  offset will now be set by changing position.

            //vertices.push (...this.get_ws_coord ([- halfSize, k, 0], this._to_gse)) 
            //vertices.push (...this.get_ws_coord ([halfSize, k, 0], this._to_gse)) 
            //vertices.push (...this.get_ws_coord ([k, - halfSize, 0], this._to_gse)) 
            //vertices.push (...this.get_ws_coord ([k, halfSize, 0], this._to_gse)) 

            this.vertices.push (...this.transform (-halfSize, k, 0)) 
            this.vertices.push (...this.transform ( halfSize, k, 0)) 
            this.vertices.push (...this.transform (k, -halfSize, 0)) 
            this.vertices.push (...this.transform (k,  halfSize, 0)) 

            const color = i === center ? this._grid_color : this._center_line_color 

			color.toArray( colors, j ); j += 3
			color.toArray( colors, j ); j += 3
			color.toArray( colors, j ); j += 3
			color.toArray( colors, j ); j += 3
    		}

        // this.update_grid (time, system, frame)
        this.update_grid (unit)

		this.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) )

        return size
	    }

    set_grid_visible (visible = true) 
        {
        this.material.visible = visible
        }
    
    // set_grid_position (offset = 0, time = 0, system = COORD_System.GSE, frame = REF_FRAME.ECI)
    set_grid_position (offset = 0, unit = COORD_Unit.RE)
        {
        this._offset = offset

        // Convert the alignment in to a point that represents the the center of the alignement.
        const p = this.transform ([0, 0, this._offset])

        // Convert the center point to the current coordinate system.
        // const ws = GSE_to_WS (ANY_to_GSE (p, system, time))
        // const ws = GSE_to_WS (GSE_to_Frame (ANY_to_GSE (p, system, time), time, frame))
        const ratio = convert (1, unit, COORD_Unit.GSE)

        const ws = GSE_to_WS (p.map (p => p * ratio))

        // Move the grid to the correct position
        this.position.fromArray (ws)
        }

    is_visible ()
        {
        return this.material.visible 
        }

    get offset ()
        {
        return this._offset
        }
    }


export default Grid ;