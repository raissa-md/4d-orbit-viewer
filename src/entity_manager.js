import * as THREE from 'three'
import { MathUtils } from 'three';

import { MeshLine, MeshLineMaterial} from 'three.meshline'

import { sprite_text } from './sprite_text.js'
import { DARK_ICON_SHADE, LIGHT_ICON_SHADE} from './constants.js'
import { DARK_TEXT_COLOR, LIGHT_TEXT_COLOR } from './constants.js'
import { DEF_BACKGROUND_COLOR } from './constants.js'
import { DEF_FOCUS_DISTANCE } from './constants.js'
import { DEF_FOCUS_DISTANCE_PLANET } from './constants.js'
import { DEF_STEP_SIZE } from './constants.js'
import { ORTHO_TARGET_DIST } from './constants.js'
import terminator_diffuse from './images/terminator_line.png'

//import {Lat_Lon_to_XYZ} from './geo_orbit.js'
import {ρϕλ_2_xyz} from './Orbit.js'
import {sph2rect} from './Orbit.js'
import { DEG2RD, GSE_to_ANY } from './Orbit.js'
import { COORD_System } from './Orbit.js'
import { coord_system_to_key } from './Orbit.js'
import { REF_FRAME } from './Orbit.js'
import { GSE_to_WS } from './Orbit.js'
import { Frame_to_DS } from './Orbit.js'
import { GSE_to_Frame } from './Orbit.js'
import { xyz } from './Orbit.js'
import { Calculate_Planet_Orbit } from './Orbit.js'
//import { EARTH_RADIUS } from './Orbit.js'
import { COORD_Unit } from './Orbit.js'
import { convert } from './Orbit.js'
import { get_rotation_function } from './planet_data.js'
import { rotate_terminator } from './Rotation.js'
import { ALERT } from './message_box.jsx'

import { TIME_RATE } from './constants.js'
import { MAX_MESHLINE_PTS } from './constants.js'
import { PLANET_ORBIT_INTERVAL } from './constants.js'
//import { PlaySquareOutlined } from '@ant-design/icons';

import { SSC_WS } from './ssc_ws.js'
import { JN } from './ssc_ws.js'

const DEF_SC_COLOR = "#FFFF00" ;
const DEF_SC_SHAPE = "sphere" ;
const DEF_LABEL_OFFSET = [0, -.25, 0]
//const PLANET_LBL_OFFSET = [0, 0, 0]

const entity_types = 
    {
    UNKNOWN: 0, 
    SPACECRAFT: 1,
    PLANET: 2
    }

export const ENT_type = Object.freeze (entity_types)

// Reasonable case that this should be a static class which is passed to 
// the entity_manager.
export const system_time = {time: 0} 

// Text color selection functions
function hex_to_rgb (hex)
    {
    // Ensure the hex value is formatted correctly
    hex = hex.replace(/^#/, '')

    if (hex.length === 3) 
        {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

    // Parse the r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    // Convert to values between 0 and 1
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255
        };
    }

function luminance (r, g, b)
    {
    //    if RsRGB <= 0.03928 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4
    //    if GsRGB <= 0.03928 then G = GsRGB/12.92 else G = ((GsRGB+0.055)/1.055) ^ 2.4  
    //    if BsRGB <= 0.03928 then B = BsRGB/12.92 else B = ((BsRGB+0.055)/1.055) ^ 2.4  
    
    const red   = (r <= 0.03928)? r / 12.92 : ((r + .055) / 1.055) ** 2.4
    const green = (g <= 0.03928)? r / 12.92 : ((g + .055) / 1.055) ** 2.4
    const blue  = (b <= 0.03928)? r / 12.92 : ((b + .055) / 1.055) ** 2.4

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }

function use_light_text (hex)
    {
    // Return false if the contrasting text color should be dark.
    // Return true if the contrasting text color should be light.
    const rgb = hex_to_rgb (hex)
    
    return (luminance (rgb.r, rgb.g, rgb.b) > .5)? false : true 
    }

function orbit_class_to_res (orbit = "L", cadence = 60)
    {
    const MIN_ORBIT_POS = 45

    // Number of minutes in the orbital period
    let period = 90 
    let n_orbit_pos = MIN_ORBIT_POS

    switch (orbit.toUpperCase ())
        {
        // "L" for Low Earth Orbit (LEO).
        // "Y" for Sun-Synchronous Orbit Polar Orbit
        // "P" Polar and Near Polar orbits (Not sure how different this is from Y)
        // Estimated Orbital Period: 90 minutes
        case "Y" :
        case "P" :
        case "L" :
            
            period  = 90

            break
            
        case "K" :
        // "K" Highly Elliptical and Middle Earth Orbit
        // Estimated Orbital Period: 4 hours

            period = 240

            break

        // "G" for Geosynchronous.
        // Estimated Orbital Period: 24 hours
        case "G" :

            period = 1440
            n_orbit_pos = 90
        
            break
        
        // "C" for Cislunar, the region of space that includes the Moon.
        // Estimated Orbital Period: 27.4 days
        case "C" :
        
            period = 3456
            
            break 
        
        // "M" for Moon (Selenocentric).
        // Estimated Orbital Period: 120 minutes
        case "M" :
        
            period = 120

            break
        
        // "H" for Halo orbit (L1).
        // Estimated Orbital Period: 182.6 days
        case "H" :

            period = 262944
            n_orbit_pos = 4000
        
            break
        
        // "X" for Complex or interstellar trajectories.
        // Also used for planetary bodies
        // 1 point per day (or an orbital period of MIN_ORBIT_POS days)
        case "X" :
        
            period = 1440 * MIN_ORBIT_POS
            
            break

        default :

        // No default action.
        }

    const res = Math.floor (period / ((n_orbit_pos * cadence) / 60))

    return Math.max (1, res)
    }

function min_allowed_res (t0, t1, cadence = 60)
    {
    // minimum number of orbit positions for the entire time range
    const MIN_DISP_POS = 75

    const delta = Math.floor ((t1 - t0) / 1000)

    const min_res =  Math.floor ((delta / MIN_DISP_POS) / cadence)

    return Math.max (1, min_res)
    }

export class entity 
    {
    constructor (...args)

        {
        this._id = ""
        this._name = ""
        this._display = false
        this._label_color = "white" 
        this._label_text_height = 10
        this._focus = null
        this._now = 0          // Current time
        this._orbit_class = "Z"
        this._cadence = 60

        if  (args.length === 1 && typeof args[0] === 'object')
            {
            args [0].id && (this._id = args [0].id)
            args [0].name && (this._name = args [0].name) 
            args [0].display && (this._display = args [0].display)
            args [0].label_color && (this._label_color = args [0].label_color)
            args [0].label_text_height && (this._label_text_height = args [0].label_text_height)
            args [0].focus && (this._focus = args [0].focus)
            args [0].orbit_class && (this._orbit_class = args [0].orbit_class)
            args [0].cadence && (this._cadence = args [0].cadence)
            }

        else
            {            
            args [0] && (this._id = args [0])
            args [1] && (this._name = args [1]) 
            }

        this._exist = false 
        this._x_disp = 0
        this._y_disp = 0

        this._focus_dist = DEF_FOCUS_DISTANCE 

        //this._time = []
        //this._coord = [] 
        //this._points = []

        this._orbit = []
        this._time = []
        this._decimate = [] // indexes required for simplified version of the orbit
        this._orbit_ref_frame = REF_FRAME.ECI
        this._coord_system = COORD_System.GEI

        this._at_start = false // True when entity at the start of its orbit
        this._at_end   = false // True when entity at the end of its orbit
        this._index  = 0       // Index of closest orbital position triplet
        this._tstart = 0       // Beginning of currently requested orbit data
        this._tend = 0         // End of currently requested orbit data

        this._obj = null
        this._label = null

        this._scene = null

        this._is_planet = false
        this._is_sc = false

        this.get_orbit_pos = this.get_orbit_pos.bind (this)
        }

    set_display (x_disp, y_disp)
        {
        this._x_disp = x_disp
        this._y_disp = y_disp
        }

    set_scene_reference (scene)
        {
        this._scene = scene
        }

    set_time (time = 0)
        {
        this._now = time
        console.log ('Setting time to: ', time)
        }

    V3_from_orbit (pos = 0)
        {
        return new THREE.Vector3 (this._orbit [pos].x, this._orbit [pos].y, this._orbit [pos].z)
        }

    orbit_to_DS (index, system = this._coord_system)
        {
        const gse = xyz (this._orbit [index])
        const t = this._time [index]
    

        return Frame_to_DS (GSE_to_ANY (gse, system, t))
        }

    orbit_to_WS (index, frame = this._orbit_ref_frame)
        {
        const gse = xyz (this._orbit [index])
        const t = this._time [index]

        return GSE_to_WS (GSE_to_Frame (gse, t, frame))
        }

    /* No longer used.
    set_frame (frame = REF_FRAME.ECI)
        {
        if  (this._orbit_ref_frame !== frame)
            {
            this._orbit_ref_frame = frame

            // If the object hasn't been instanced yet, then don't do anything.
            if  (this._time.length > 0)
                {
                // Update spacecraft position to current time 
                this.update_position (this._now)
                }
            }
        }
    */

    set_coord_system (system = COORD_System.GSE)
        {
        if  (this._coord_system !== system)
            {
            this._coord_system = system

            // If the object hasn't been instanced yet, then don't do anything.
            if  (this._time.length > 0)
                {
                // Update spacecraft position to current time 
                this.update_position (this._now)
                }
            }
        }

    // Maybe worth having this just return a position value instead of updating the 
    // the object position. Maybe?
    update_position (time, use_interpolation=false, system = this._coord_system)
    // update_position (time, use_interpolation=false, frame = this._orbit_ref_frame)
        {
        //use_interpolation = false
        if  (this._time.length === 0)
            {
            return
            }

        this._now = time

        this._at_start = false
        this._at_end = false

        let f_interpolate = use_interpolation // interpolation flag.

        let p_0  = 0
        let p_1  = 0

        let t0 = 0
        let t1 = 0

        // Find the index of the orbit position whose time is closest to the current
        // time.

        // time prior to the earliest orbital point
        if  (time <= this._time [0])                  
            {
            this._index = 0 
            this._now = this._time [this._index]
            f_interpolate = false 

            this._at_start = true
            }

        // time after latest orbital point.
        else if (time >= this._time [this._time.length-1])  
            {
            this._index  = this._time.length-1 
            this._now = this._time [this._index]
            f_interpolate = false 
            
            this._at_end = true
            }

        // time within range covered by orbital data.  Calculate!
        else                                   
            {
            for (let i = 1  ; i < this._time.length ; i++)
                {
                if  (time < this._time [i]) 
                    {
                    p_0 = i - 1 
                    p_1 = i 

                    break 
                    }
                }

            t0 = this._time [p_0]
            t1 = this._time [p_1]

            //this._index = ((time - this._time [p_0]) < (this._time [p_1] - time))? p_0 : p_1 
            this._index = ((time - t0) < (t1 - time))? p_0 : p_1 

            // Set end of track or beginning of track flags as needed
            this._at_end = (this._index === this._time.length - 1) ? true : false 
            this._at_start = (this._index === 0)? true : false
            }
        if  (f_interpolate)
            {
            // The interval between closest and p1 should bracket the position of the s/c at time.
            const alpha = (time - t0) / (t1 - t0) 
            // const v0 = new THREE.Vector3().fromArray (this._points, p_0 * 3) 
            // const v0 = GSE_to_WS (this.V3_from_orbit (p_0))
            // const v0 = GSE_to_WS (GSE_to_Frame (this.V3_from_orbit (p_0)), t0, this._orbit_ref_frame)
            
            //const v0 = new THREE.Vector3().fromArray (this.orbit_to_WS (p_0, frame))
            const v0 = new THREE.Vector3().fromArray (this.orbit_to_DS (p_0, system))
            
            // const v1 = new THREE.Vector3().fromArray (this._points, p_1 * 3) 
            // const v1 = GSE_to_WS (this.V3_from_orbit (p_1))
            // const v1 = GSE_to_WS (GSE_to_Frame (this.V3_from_orbit (p_1)), t1, this._orbit_ref_frame)
            
            //const v1 = new THREE.Vector3().fromArray (this.orbit_to_WS (p_1, frame))
            const v1 = new THREE.Vector3().fromArray (this.orbit_to_DS (p_1, system))

            this._obj.position.lerpVectors (v0, v1, alpha) 
            }

        else
            {
            // console.log (this._index)
            // this._obj.position.fromArray (GSE_to_WS (xyz (this._orbit [this._index])))
            
            //this._obj.position.fromArray (this.orbit_to_WS (this._index, frame))
            this._obj.position.fromArray (this.orbit_to_DS (this._index, system))
            
            //this._obj.position.set (this._orbit [this._index].x, 
            //                        this._orbit [this._index].y, 
            //                        this._orbit [this._index].z)
            }

        if  (this._id === 'MOON')
            {
            //console.log (this._obj.position.toArray ())
            }
 
        // Return the current orbit time for use by the planetary rotation method
        return this._now
        }

    /*
    add_orbit_pos ()
        {
        // stub
        }
    */

    start_time ()
        {
        return (this._time.length > 1)? this._time [0] : 0
        }

    stop_time ()
        {
        return (this._time.length > 1)? this._time [this._time.length - 1] : 0
        }

    // I am not sure that this will ever be used.
    // set_display (d=false)
    //    {
    //    this.display = d? true : false
    //    }

    set_focus (f=false)
        {
        this._focus = f
        }

    scale_label (...args)
        {
        if  (this._label)
            {
            this._label.set_text_scale (...args)
            }
        }

    set_label_view_dist (...args)
        {
        if  (this._label)
            {
            this._label.set_view_distance (...args)
            }
        }

    set_label_visible (...args)
        {
        if  (this._label)
            {
            this._label.set_visible (...args)
            }
        }

    set_label_color (...args)
        {
        if  (this._label)
            {
            this._label.set_color (...args)
            }
        }

    data_valid ()
        {
        return (this._time.length > 0)
        }

    /*
    calculate_curvature (points) 
        {
            const curvatures = [];
            for (let i = 1; i < points.length - 1; i++) {
                const p1 = points[i - 1];
                const p2 = points[i];
                const p3 = points[i + 1];
        
                const num = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x));
                const den = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2) * Math.sqrt((p3.x - p1.x)**2 + (p3.y - p1.y)**2) * Math.sqrt((p3.x - p2.x)**2 + (p3.y - p2.y)**2);
        
                const curvature = num / den;
                curvatures.push(curvature);
            }
            return curvatures;
        }
        
    pass_one (orbit, epsilon) 
        {
        const n_points = orbit.length / 3

        if  (n_points < 3) 
            {
            return orbit
            }
        
        let dmax = 0
        let index = 0

        const end = n_points - 1  // does need to change

        const line_start = orbit.slice (0, 3)
        const line_end = orbit.slice (end * 3, end * 3 + 3)
        
        for (let i = 1; i < end; i++) 
            {
            const point = orbit.slice (i * 3, i * 3 + 3)

            const d = this.perpendicular_dist (point, line_start, line_end)

            if  (d > dmax) 
                {
                index = i;
                dmax = d;
                }
            }
        
            // Mental Stress Training Is Planned for U.S. Soldiers
            if  (dmax > epsilon) 
                {
                const a = this.pass_one (orbit.slice (0, (index * 3), epsilon))
                const b = this.pass_one (orbit.slice (index, n_points), epsilon)
        
                return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
                } 
            else 
                {
                return line_start.concat (line_end)
                }
        }
        
    pass_two (orbit, simlified, threshold) 
        {
            const curvatures = calculateCurvature(points);
            const refinedPoints = [simplifiedPoints[0]];
        
            for (let i = 1; i < simplifiedPoints.length; i++) {
                const start = points.indexOf(simplifiedPoints[i - 1]);
                const end = points.indexOf(simplifiedPoints[i]);
        
                let maxCurvature = 0;
                let maxIndex = start;
        
                for (let j = start; j <= end; j++) {
                    if (curvatures[j] > maxCurvature) {
                        maxCurvature = curvatures[j];
                        maxIndex = j;
                    }
                }
        
                if (maxCurvature > curvatureThreshold) {
                    refinedPoints.push(points[maxIndex]);
                }
        
                refinedPoints.push(simplifiedPoints[i]);
            }
        
            return refinedPoints;
        }
        
    perpendicular_dist (point, lineStart, lineEnd) 
        {
        const [x0, y0, z0] = point
        const [x1, y1, z1] = lineStart
        const [x2, y2, z2] = lineEnd
    
        const num = Math.abs ((x2 - x1)*(y1 - y0) - (x1 - x0)*(y2 - y1) + (z2 - z1)*(z1 - z0))
        const den = Math.sqrt ((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2)
        
        return num / den
        }
    

    simplify_curve (orbit, epsilon, threshold)
        {
        const r = this.pass_one (orbit, epsilon)
        return this.pass_two (orbit, r, threshold)
        }
    */
    decimate ()
        {
        const MAX_POINTS = 4000

        this._decimate.length = 0

        if  (this._orbit.length < MAX_POINTS)
            {
            this._orbit.forEach ((_, index) => this._decimate.push (index))

            console.log ("no decimation done. length = ", this._decimate.length)

            return
            }
            
        const skip = Math.min (Math.floor (this._orbit.length / MAX_POINTS), 4)

        for (let index = 0 ; index < this._orbit.length  ; index += skip)
            {
            this._decimate.push (index)
            }

        console.log ("decimated to", this._decimate.length)
        }

    simplify_curve (orbit)
        {
        const r = []

        for (let index = 0 ; index < this._decimate.length ; index++)
            {
            r.push (...orbit.slice (this._decimate[index] * 3, this._decimate[index] * 3 + 3))
            }

        return r
        }

    simplify_time (time)
        {
        const t = []

        for (let index = 0 ; index < this._decimate.length ; index++)
            {
            t.push (this._time [this._decimate [index]])
            }

        return t

        }

    // Returns an array of orbit coordinates in the same format that is required
    // For meshline.  
    // Why is this even here?
    //  Should just use get_orbit_as_array
    get_orbit_coord (system = COORD_System.GSE)
        {
        let r = [] 

        const repack = (e, i) => {
            r.push (GSE_to_ANY (e, system, this._time [i]))
            }

        this._orbit.forEach (repack)

        return r
        }

    orbit_as_single_array ()
        {
        let r = []

        for (let i = 0 ; i < this._orbit.length ; i++)
            {
            r.push (...xyz (this._orbit [i]))
            }

        return r
        }


    get_orbit_times ()
        {
        return [...this._time]
        }

    clear_orbit_data ()
        {
        this._time.length = 0
        this._orbit.length = 0

        this._now = 0
        this._index  = 0
        this._at_start = false
        this._at_end   = false
        }

    get_orbit_pos (system = COORD_System.GSE, index = this._index)
        {
        const r = {
            index: index,
            time: null,
            x: null,
            y: null,
            z: null,
            valid: false,
            }

        if  (this._time.length > 0)
            {
            // This could probably be rewritten to be more efficient?
            r.time = this._time [index]

            const {x, y, z} = GSE_to_ANY (this._orbit [index], system, r.time)
            //const {x, y, z} = GSE_to_ANY ({x:81.38, y:-29.62, z:-50}, system, r.time)
            // const {x, y, z} = ANY_to_GSE ({x:100.0, y:100, z:100}, system, r.time)
            // const {x, y, z} = ANY_to_GSE (ρϕλ_2_xyz (100., -30.*DEG2RD, -20.*DEG2RD), system, r.time)
            //const {x, y, z}= ρϕλ_2_xyz (100., -30.*DEG2RD, -20.*DEG2RD)
            //const x = v [0]
            //const y = v [1]
            //const z = v [2]

            r.x = x
            r.y = y
            r.z = z

            r.valid = true 
            }

        return r
        }

    orbit_data_valid (start=0, end=0)
        {
        if  (start > 0 && end > 0 && start < end)
            {
            return this.start_time () < end && this.stop_time () > start
            }
        
        else 
            {
            return false
            }
        }

    dispose_obj ()
        {
        if  (this._obj)
            {
            this._obj.geometry.dispose ()
            this._obj.material.dispose ()
            this._label.dispose ()

            this._scene.remove (this._obj)
            }
        }

    dispose ()
        {
        this.dispose_obj ()

        this.clear_orbit_data ()
        }


    deploy (val=true)
        {
        if  (! this._exist)
            {
            this._exist = true
            }

        return val
        }


    get exist ()
        {
        return this._exist
        }

    get label ()
        {
        return this._label
        }

    get color ()
        {
        return this._color
        }

    get name ()
        {
        return this._name
        }

    get focus ()
        {
        return this._focus
        }

    get focus_dist ()
        {
        return this._focus_dist
        }

    get position ()
        {
        return this._obj.position
        }

    get is_sc ()
        {
        return this._is_sc
        }
        
    get is_planet ()
        {
        return this._is_planet
        }

    get id ()
        {
        return this._id
        }

    get tstart ()
        {
        return this._tstart
        }

    get tend ()
        {
        return this._tend
        }
    }

class planet extends entity
    {
    constructor (...args)
        {
        super (...args)

        this._radii = 1
        this._color = 'white'
        this._diffuse = null
        this._normal = null
        this._specular = null
        this._terminator = false
        this._terminator_obj = null
        this._step_size = DEF_STEP_SIZE 
        this._focus_dist = DEF_FOCUS_DISTANCE_PLANET
        this._emit_light = 0.
        this._lc = 0xFFFFFF
        this._ssc_id = ""

        if  (args.length === 1 && typeof args[0] === 'object')
            {
            args [0].radii && (this._radii = args [0].radii)
            args [0].color && (this._color = args [0].color)
            args [0].diffuse && (this._diffuse = args [0].diffuse)
            args [0].normal && (this._normal = args [0].normal)
            args [0].specular && (this._specular = args [0].specular)
            args [0].terminator && (this._terminator = args [0].terminator)
            args [0].step_size && (this._step_size = args [0].step_size)
            args [0].dist && (this._focus_dist = args [0].dist)
            args [0].emit_light && (this._emit_light = args [0].emit_light)
            args [0].lc && (this._lc = args [0].lc)
            args [0].ssc_id && (this._ssc_id = args [0].ssc_id)
            }
        else
            {
            args [3] && (this._ssc_id = args [3])
            args [4] && (this._radii = args [4])
            args [5] && (this._focus_dist = args [5])
            args [6] && (this._emit_light = args [6])
            args [7] && (this._lc = args [7])
            }

        this._is_planet = true 
        this._type = ENT_type.PLANET

        this._lights = []
        this._rotation_function = get_rotation_function (this._id)
        //this._rotation_function = null
        this._planet = null

        const empty = new THREE.BoxGeometry (0.1, 0.1, 0.1)
        const invis = new THREE.MeshBasicMaterial ({ visible: false })
        this._obj = new THREE.Mesh (empty, invis)
        //let orbit_data = {
        //    time: [],
        //    coord: [],
        //   points: [],
        //    }
        this.orbit_calc = new Calculate_Planet_Orbit ()
        }

    available ()
        {
        // Orbit data is always available for planets.
        return true
        }

    set_orbit_data_start ()
        {
        // Stub. Should never be called.
        }

    set_orbit_data_stop ()
        {
        // Stub. Should never be called.
        }

    display_terminator (d = true)
        {
        if  (this._terminator_obj)
            {
            this._terminator_obj.visible = d

            return d
            }

        return null
        }

    // Will eventually need to change this as well
    
    get_orbit_data (t0, t1)
        {
        this.clear_orbit_data ()

        if  (this._ssc_id === "")
            {
            return new Promise ((resolve) => 
                {
                let utc = t0

                while (utc <= t1)
                    {
                    this._time.push (utc)
                    this._orbit.push ({x: 0., y: 0., z: 0.})
            
                    utc += PLANET_ORBIT_INTERVAL * 60 * 1000    
                    }
            
                resolve ()
                });
            }

        console.log ("planet = ", this._ssc_id)
        return SSC_WS.get_orbit_data (this._ssc_id, t0, t1, 12, 'GSE', COORD_Unit.RE)

            .then ( (data) =>
                {
                this._time = data.time
                this._orbit = data.coord

                this.decimate ()
                }) ;

        /*
        return this.orbit_calc.calculate_orbit_data (this._id, t0, t1)

            .then ( (data) =>
                {
                this._time = data.time
                this._orbit = data.orbit
                }) ;
        */
        }

        /*
        get_orbit_data (t0, t1)
            {
            this.clear_orbit_data ()

            return SSC_WS.get_orbit_data (this._id, t0, t1, 2, 'GSE', COORD_Unit.RE)

                .then ( (data) =>
                    {
                    this._time = data.time
                    this._orbit = data.coord

                    this.decimate ()
                    }) ;
            }
        */

    update_position (time)
        {
        if  (this._time.length === 0)
            {
            return
            }
        
        this.rotate (super.update_position (time, true))
        }


    deploy (t0, t1)
        {
        if  (! this._scene || ! this._scene.isScene)
            {
            return Promise.reject (new Error ('Scene not correctly defined.'))
            }

        this._tstart = t0
        this._tend = t1

        if  (! this._exist)
            {
            this.create_planet ()
            }
            
        const r = this.get_orbit_data (t0, t1)

        return r.then (() =>
            {
            // Update planet position to current time 
            this.update_position (this._now)

            super.deploy ()
            }) ;
        }

    add_rotation_function (f)
        {
        this._rotation_function = f
        }

    rotate (time = 0, system = this._coord_system)
        {
        // Check for a terminator line.  If it exists, we will have to rotate it as well.
        if  (this._terminator_obj)
            {
            const {q, theta} = rotate_terminator (time, system)

            this._terminator_obj.quaternion.copy (q)
            this._terminator_obj.rotateY (theta)
            }

        // Check for a valid rotation function
        if  (! this._rotation_function)
            {
            return
            }

        // Should return an quaternion (q) and an angle (theta).  The quaternion orients the 
        // planet so that its axis of rotation is correctly set.  theta is the rotation
        // angle to use.
        const {q, theta} = this._rotation_function (time, system)

        //this._obj.quaternion.copy (q)
        //this._obj.rotateY (theta)
        this._planet.quaternion.copy (q)
        this._planet.rotateY (theta)
        }

    add_lights (radius, nlat=4, nlon=4)
        {
        for (let i = 0 ; i <= nlat ; i++) 
            {
            // Calculate latitude (φ), ranging from 0 to π
            const phi = Math.PI * (i / nlat) - Math.PI / 2

            const children = (i === 0 || i === nlat)? 1 : nlon

            for (let j = 0 ; j < children ; j++) 
                {
                // Calculate longitude (θ), ranging from 0 to 2π
                const theta = 2 * Math.PI * (j / children);
        
                // Create a point light
                const l = new THREE.PointLight (this._lc, this._emit_light, 0., 0)
                //let l = new THREE.Mesh (new THREE.SphereGeometry (10, 32, 32), new THREE.MeshBasicMaterial () )
                
                // Position it in place
                l.position.fromArray (xyz (ρϕλ_2_xyz (radius, phi, theta)))
                
                // Add it to the planet object
                this._obj.add (l)

                // Store a reference to it
                this._lights.push (l)
                }
            }
        }

    set_luminosity (intensity=1.0)
        {
        const POWER = 2.3

        if  (this._emit_light > 0.)
            {
            this._lights.forEach(l => {
                l.intensity = intensity * this._emit_light
                });
    
            // Clamp to [0,1]
            const amount = Math.max (0, Math.min (1, intensity));

            // Apply exponential decay (faster falloff)
            const scaled = Math.pow (amount, POWER);

            this._planet.material.emissiveIntensity = scaled
            }
        }

    create_terminator_sphere ()
        {
        const radius_offset = 1.025

        const loadManager = new THREE.LoadingManager()
        const loader = new THREE.TextureLoader (loadManager)

        const terminator_geometry = new THREE.SphereGeometry (this._radii * radius_offset, 32, 32) 
        const terminator_material = new THREE.MeshPhongMaterial () 

        terminator_material.map = loader.load (terminator_diffuse) 
        terminator_material.transparent = true 
        terminator_material.emissive = new THREE.Color(0xffffff) 
        terminator_material.emissiveIntensity =  1.5             
                      
        this._terminator_obj = new THREE.Mesh (terminator_geometry, terminator_material)
        
        this._terminator_obj.name = "pln_" + this._id + "_terminator"

        this._terminator_obj.visible = false

        this._obj.add (this._terminator_obj)
        }


    add_gs (loc=[])
        {            
        // Necessary to set some constants for adding ground station markers to a planet.
        // Might be able to move further up.  
        const gs_radius = this._radii * .01332 
        const gs_height = this._radii * .02 

        this._gs_alt = this._radii + gs_height / 2.

        this._station_geometry = new THREE.ConeGeometry( gs_radius, gs_height, 6 ) 
        this._station_material = new THREE.MeshPhongMaterial () 

        this._GS = []

        this.update_gs_pos (loc)
        }
    
    create_gs (loc=[])
        {
        for (let i = 0 ; i < this._GS.length ; i++)
            {
            this._GS [i].gs = new THREE.Mesh (this._station_geometry, this._station_material) 

            const xyz = sph2rect (new THREE.Vector3 (this._GS[i].long, this._GS[i].latt, 1.))

            const ws = GSE_to_WS (xyz)
    
            this._GS [i].gs.position.copy (ws.multiplyScalar (this._gs_alt)) ;

            this._GS [i].gs.lookAt (0., 0., 0.) ;

            this._GS [i].gs.rotateZ (-90 * DEG2RD) ;
            this._GS [i].gs.rotateX (-90 * DEG2RD) ;

            this._planet.add (this._GS [i].gs) ;
            }
        }

    update_gs_pos (loc=[])
        {
        if  (this._GS.length)
            {
            this._GS.forEach (gs => this._obj.remove (gs.gs))

            this._GS.length = 0
            }

        // his.GS[i].long, this.GS[i].latt
        loc.forEach (gs => this._GS.push ({latt: gs.latt, long: gs.long, gs: null}))
        
        this.create_gs ()
        }

    create_planet ()
        {
        const mat_props = {} 

        /*
        if  (this._id === 'EARTH')
            {
            alert ('creating the earth')
            }
        */

        // Check if a b
        if  (this._diffuse|| this._normal || this._specular )
            {
            const loadManager = new THREE.LoadingManager() 
            const loader = new THREE.TextureLoader (loadManager) ;        

            if  (this._diffuse) 
                { 
                mat_props.map = loader.load (this._diffuse) 
                }

            if  (this._normal)
                {
                mat_props.bumpMap = loader.load (this._normal) 
                mat_props.bumpScale = 0.05
                }

            if  (this._specular)
                {
                mat_props.specularMap = loader.load (this._specular) 
                }
            }

        if  (this._diffuse === null)
            {
            mat_props.color = this._color 
            mat_props.emissive = this._color
            }

        const material = new THREE.MeshPhongMaterial (mat_props)

        const geometry = new THREE.SphereGeometry (this._radii, 32, 32) 

        this._planet = new THREE.Mesh ( geometry, material )
        this._obj.name = "pln_" + this._id 

        // Does this body emit light?
        if  (this._emit_light > 0.)
            {
            this.add_lights (this._radii * 1.5, 5, 5)
            material.emissive.set (this._color)
            }

        // Does the planet need a terminator line? IF so, create it now.
        if  (this._terminator)
            {
            this.create_terminator_sphere ()
            }

        this._label = new sprite_text (this._name, this._label_color, ORTHO_TARGET_DIST, {textHeight: this._label_text_height})

        this._obj.add (this._label)

        const x = .3 * DEF_LABEL_OFFSET [1] * this._focus_dist - this._radii

        this._label.position.fromArray ( [0, x, 0] )

        this._obj.add (this._planet)
        this._scene.add (this._obj)
        }

    dispose ()
        {
        if  (this._terminator_obj)
            {
            this._terminator_obj.geometry.dispose ()
            this._terminator_obj.material.dispose ()
            }

        this._planet.geometry.dispose ()
        this._planet.material.dispose ()

        this._scene.remove (this._planet)

        super.dispose ()
        }


    get is_planet ()
        {
        return this._is_planet
        }
    }

class spacecraft extends entity
    {
    constructor (...args)
        {
        super (...args)

        this._orbit_data_start = 0
        this._orbit_data_stop = 0
        this._color = DEF_SC_COLOR
        this._shape = DEF_SC_SHAPE

        if  (args.length === 1 && typeof args[0] === 'object')
            {
            args [0].orbit_data_start && (this._orbit_data_start = args [0].orbit_data_start)
            args [0].orbit_data_stop && (this._orbit_data_stop = args [0].orbit_data_stop)
            args [0].color && (this._color = args [0].color)
            args [0].shape && (this._shape = args [0].shape)
            }
        else
            {
            args [3] && (this._color = args [3])
            args [4] && (this._shape = args [4])
            }

        this._is_sc = true 
        this._type = ENT_type.SPACECRAFT

        this._color_request = null
        this._shape_request = null

        this._orbit_path = []
        this._direct = null
        this._common_direct_material = null

        this.dispose = this.dispose.bind (this)
        this.dispose_orbit = this.dispose_orbit.bind (this)

        // this.WS = new SSC_WS ()
        }

    set_orbit_data_start (t = 0)
        {
        this._orbit_data_start = t
        }

    set_orbit_data_stop (t = 0)
        {
        this._orbit_data_stop = t
        }

    available (t0, t1)
        {
        return (t1 > this._orbit_data_start && t0 < this._orbit_data_stop)
        }

    set_common_material (common)
        {
        this._common_direct_material = common
        }

    update_position (time)
        {
        if  (this._time.length === 0)
            {
            return
            }

        super.update_position (time, true)

        this.orient_spacecraft ()
        }

    /*
    add_orbit_pos (time, x, y, z)
        {
        // add the time
        this._time.push (time)

        // add the GSE coordinate position
        this._coord.push (x, y, z)

        // convert to WS
        const ws = GSE_to_WS_base (x, y, z, true)

        // add the WS coordinate position
        this._points.push (ws.x, ws.y, ws.z)
        }
    */

    // orient_spacecraft (frame = this._orbit_ref_frame)
    orient_spacecraft (system = this._coord_system)
        {
        // Point shape in direction of orbit, but only if it is not a sphere.
        if  (this._shape !== "sphere" && ! this._at_end) 
            {    
            //const target = new THREE.Vector3 ().fromArray (this._points, (this._index + 1) * 3) ;
            //const target = new THREE.Vector3 ().fromArray (xyz (GSE_to_WS (this._orbit [this._index])))
            //const target = new THREE.Vector3 ().fromArray (this.orbit_to_WS (this._index + 1, frame))
            const target = new THREE.Vector3 ().fromArray (this.orbit_to_DS (this._index + 1, system))


            target.sub (this._obj.position) ;
            target.normalize () ;

            this._obj.lookAt (target.add (this._obj.position)) ;
            this._obj.rotateX (MathUtils.degToRad (90)) ;
            }
       }

    get_orbit_data (t0, t1)
       {
       this.clear_orbit_data ()

       const res = orbit_class_to_res (this._orbit_class, this._cadence)
       const min_res =  min_allowed_res (t0, t1, this._cadence)

       console.log ("id %s res %s min %s orbit %s", this._id, res, min_res, this._orbit_class)

       return SSC_WS.get_orbit_data (this._id, t0, t1, Math.min (res, min_res), 'GSE', COORD_Unit.RE)

           .then ( (data) =>
               {
               this._time = data.time
               this._orbit = data.coord

               this.decimate ()
               }) ;
       }
   

    async deploy (t0, t1)
        {
        if  (! this._scene || ! this._scene.isScene)
            {
            return Promise.reject (new Error ('Scene not correctly defined.'))
            }

        this._tstart = t0
        this._tend = t1

        if  (! this._exist)
            {
            this.create_spacecraft ()
            console.log ('creating new spacecraft')
            }
            
        const r = this.get_orbit_data (t0, t1)
        //const r = true

        return r.then (() =>
            {
            // Stash the orbit data somewhere
            this.dispose_orbit (true)

            this.create_orbit ()
            this.create_direction_indicator ()

            // Update spacecraft position to current time 
            this.update_position (this._now)

            super.deploy ()
            }) ;
        }

    // create_orbit (frame = this._orbit_ref_frame)
    create_orbit (system = this._coord_system)
        {
        // Probably best not to do this until a better decimation routine is developed
        // const orbit = this.simplify_curve (this.orbit_as_single_array (true))
        // const time  = this.simplify_time (this._time)

        const orbit = this.orbit_as_single_array (true)
        const time  = this._time

        console.log ("Total number of time points: " + time.length)
        //console.log ("Total number of orbit points: " + orbit.length)

        let pts = time.length
        let instance = 0


        while (pts > 0)
            {
            const segment = Math.min (time.length, MAX_MESHLINE_PTS)

            const start = instance * MAX_MESHLINE_PTS
            const stop  = Math.min (start + segment, time.length)

            // Create the mesh line.
            const line = new MeshLine () // GSE_to_ANY (gse, system, t)
            //const simplified = this.orbit_as_single_array (true)

            const time_slice = time.slice (start, stop)
            const orbit_slice = orbit.slice (start * 3, stop * 3)

            // console.log ("slice parameters: ", start, stop, start * 3, stop * 3)

            // Add in the geometry for the line
            // line.setPoints (GSE_to_WS (GSE_to_Frame (this.orbit_as_single_array (true), this._time, frame)))
            //line.setPoints (Frame_to_DS (GSE_to_ANY (this.orbit_as_single_array (true), system, this._time)))
            // line.setPoints (Frame_to_DS (GSE_to_ANY (this.orbit_as_single_array (true), system, this._time)))
            line.setPoints (Frame_to_DS (GSE_to_ANY (orbit_slice, system, time_slice)))

            // Create the line material                   
            const material = new MeshLineMaterial (
                {   
                useMap: false,
                color: this._color,
                opacity: 1,
                resolution: new THREE.Vector2 (this._x_disp, this._y_disp),
                sizeAttenuation: false,
                lineWidth:  2.5,
                //near: this.camera.near,
                //far: this.camera.far                             
                }); 

            // Create the orbit mesh.
            this._orbit_path [instance] = new THREE.Mesh (line, material) 
            this._orbit_path [instance].name = this._id + instance.toFixed ()

            this._scene.add (this._orbit_path [instance])

            instance++

            pts -= segment
            }
        }

    create_direction_indicator (system = this._coord_system)
    // create_direction_indicator (frame = REF_FRAME.ECI)
        {
        const cone = new THREE.ConeGeometry (0.04, .10, 16)

        this._direct = new THREE.Mesh (cone, this._common_direct_material) 

        //this._direct.position.fromArray (this._points, 0)
        // this._direct.position.fromArray (xyz (GSE_to_WS (this._orbit [0])))
        //this._direct.position.fromArray (this.orbit_to_WS (0, frame))
        this._direct.position.fromArray (this.orbit_to_DS (0, system))
        
        
        //const target = new THREE.Vector3 ().fromArray (this._points, 3)
        //const target = new THREE.Vector3 ().fromArray (xyz (GSE_to_WS (this._orbit [1])))
        //const target = new THREE.Vector3 ().fromArray (this.orbit_to_WS (1, frame))
        const target = new THREE.Vector3 ().fromArray (this.orbit_to_DS (1, system))


        target.sub (this._direct.position)
        target.normalize ()

        this._direct.translateOnAxis (target, -.12) 
        this._direct.lookAt (target.add (this._direct.position))
        this._direct.rotateX (MathUtils.degToRad (90))

        this._scene.add (this._direct)
        }

    create_spacecraft_mesh (shape, color)
        {
        const mat_props = {color: color} ;
        const material = new THREE.MeshBasicMaterial (mat_props) 
    
        let   geometry ;
    
        switch (shape)
            {
            case "cube" :
    
                geometry = new THREE.BoxGeometry (0.08, .08, .08) 
    
                break ;
    
            case "cylinder" :
    
                geometry = new THREE.CylinderGeometry (0.06, .06, .14, 32) 
    
                break ;
    
            case "cone" :
    
                geometry = new THREE.ConeGeometry (0.08, .12, 32) 
    
                break ;
    
            case "diamond" :
    
                break ;
    
            case "sphere" : 
    
                // break omitted
    
            // eslint-disable-next-line no-fallthrough
            default :
    
                geometry = new THREE.SphereGeometry (0.06, 32, 32)         
            }
        
        return new THREE.Mesh ( geometry, material ) 
        }


    create_spacecraft ()
        {
        // Create the THREE object for the spacecraft
        this._obj = this.create_spacecraft_mesh (this._shape, this._color)
        this._obj.name = "mob_" + this._id

        this._label = new sprite_text (this._name, this._label_color, ORTHO_TARGET_DIST, {textHeight: this._label_text_height})

        this._obj.add (this._label)
        this._label.position.fromArray (DEF_LABEL_OFFSET)

        this._scene.add (this._obj)
        }

    set_color (c=DEF_SC_COLOR)
        {
        this._color = c

        if  (this._exist)
            {
            // dispose of orbit
            this.dispose_orbit ()

            // Change the spacecraft material color
            this._obj.material.color.setStyle (this._color)

            // Create the new orbit
            this.create_orbit ()
            this.create_direction_indicator ()

            this._color_request = null
            }

        return true
        }

    set_shape (s=DEF_SC_SHAPE)
        {
        this._shape = s

        if  (this._exist)
            {
            // dispose of the spacecraft
            this.dispose_obj ()

            // create the new spacecraft
            this.create_spacecraft ()

            // update the spacecraft position
            this.update_position (this._now)

            this._shape_request = null
            }

        return true 
        }

    /* No longer used.
    set_frame (frame = REF_FRAME.ECI)
        {
        if  (this._orbit_ref_frame !== frame)
            {
            // Recreate the orbit and orbit indicator
            if  (this._time.length !== 0)
                {
                // Remove the orbit and orbit indicator
                this.dispose_orbit (true)

                // Create the new orbit
                this.create_orbit (frame)

                this.create_direction_indicator (frame)    
                }

            super.set_frame (frame)
            }
        }
    */

    set_coord_system (system = COORD_System.GSE)
        {
        if  (this._coord_system !== system)
            {
            this._coord_system = system

            // Recreate the orbit and orbit indicator
            if  (this._time.length !== 0)
                {
                // Remove the orbit and orbit indicator
                this.dispose_orbit (true)

                // Create the new orbit
                this.create_orbit (system)

                this.create_direction_indicator (system)    

                this.update_position (this._now)
                }
            }
        }

    set_orbit_visible (visible = true)
        {               
        this._orbit_path.forEach (seg => seg.visible = visible)
        }



    dispose_orbit (all = true)
        {
        // If all is true, dispose of the orbit and the orbit direction indicator
        // If all is false, only dispose of the orbit.
        console.log ('removing orbit for ', this._id)
        if  (this._orbit_path.length > 0)
            {
            for (let i = 0 ; i < this._orbit_path.length ; i++)
                {
                this._orbit_path [i].geometry.dispose ()
                this._orbit_path [i].material.dispose ()
                this._scene.remove (this._orbit_path [i])
                }

            this._orbit_path.length = 0
            }

        if  (all && this._direct)
            {
            this._direct.geometry.dispose ()
            this._scene.remove (this._direct)
            }
        }

    dispose ()
        {
        this.dispose_orbit ()

        super.dispose (true)
        }
    
    get is_sc ()
        {
        return this._is_sc
        }
    }

export class entity_manager
    {
    constructor (scene_reference)
        {
        this.scene = scene_reference
        this._msg_portal = null

        this.list = new Map ()
        this._sc_pos_list = []

        this._start_time = 0 
        this._end_time = 0
        this.time_range_update = false
        this.sc_change = false 

        // Properties related to text color and display background
        this.dark_text = DARK_TEXT_COLOR
        this.light_text = LIGHT_TEXT_COLOR
        this.light_shade = LIGHT_ICON_SHADE
        this.dark_shade = DARK_ICON_SHADE
        this.background_color = DEF_BACKGROUND_COLOR
        this._terminator_line = false

        this.light_overlay = use_light_text (this.background_color)
        this.text_color = (this.light_overlay)? this.light_text : this.dark_text
        this._icon_shade = (this.light_overlay)? this.light_shade : this.dark_shade

        this.x_disp = 0  // Need this so we can pass it on to new actors
        this.y_disp = 0  // Need this so we can pass it on to new actors

        // Time value that matches current orbital position
        // Moved to the Module Level system_time object
        // this._time = 0
        this._at_start = true
        this._at_end = false

        // Show or hide labels for a class of objects as a group
        this._show_labels_sc = true
        this._show_labels_planets = true
        this._orbit_visible = false

        //this._planet_orbit =
        this._coord_system = COORD_System.GSE
        this._reference_frame = REF_FRAME.ECI
        this._unit = COORD_Unit.RE
        // this._reference_frame = REF_FRAME.ECER


        this.orbit_direction_material = new THREE.MeshBasicMaterial ()

        this.update_actor = this.update_actor.bind (this)
        }

    add (actor)
        {        
        actor.set_scene_reference (this.scene)
        actor.set_display (this.x_disp, this.y_disp)
        actor.set_time (system_time.time)
        //actor.set_frame (this._reference_frame)
        actor.set_coord_system (this._coord_system)

        this.list.set (actor.id, actor)

        this.sc_change = true

        return true 
        }
    
    add_spacecraft (...args)
        {
        const sc = new spacecraft (...args)

        sc.set_common_material (this.orbit_direction_material)
        sc.set_label_visible (this._show_labels_sc)
        // sc.set_orbit_visible ()

        return this.add (sc)
        }

    add_planet (...args)
        {
        const pl = new planet (...args)

        pl.display_terminator (this._terminator_line)
        pl.set_label_visible (this._show_labels_planets)


        return this.add (pl)
        }

    remove (id)
        {
        const actor = this.list.get (id)

        if  (actor) 
            {
            actor.dispose ()
            this.list.delete (id)

            this.update_sc_pos_list (this._coord_system)

            return id
            }

        console.log ("Attempted to remove invalid asset from store")

        return null
        }

    size ()
        {
        return this.list.size 
        }
        
    empty ()
        {
        return this.list.size === 0 
        }

    get (id)
        {
        if  (this.list.has (id))
            {
            return  this.list.get (id)
            }

        alert ("Attempted to access invalid asset in store")

        return null
        }

    valid (id)
        {
        return this.list.has (id)
        }

    update_label_color (...args)
        {
        this.list.forEach (actor => actor.set_label_color (...args))
        }

    update_text_scale (...args)
        {
        this.list.forEach (actor => actor.scale_label (...args))
        }

    update_label_view_distance (...args)
        {
        this.list.forEach (actor => actor.set_label_view_dist (...args))
        }

    clear_focus ()
        {
        // applies to all entities
        this.list.forEach (actor => actor.set_focus (false))
        }

    set_focus (id)
        {
        // Clear the focus flag from all entities
        this.clear_focus ()

        const actor = this.get (id)

        // Set the focus on the requested entity.
        actor.set_focus (true)
        
        return actor.name 
        }

    get_focus ()
        {
        // return null is no object has focus
        let r = null

        this.list.forEach ((actor) => {if (actor.focus) { r = actor}})

        return r
        }

    register_msg_portal (portal)
        {
        this._msg_portal = portal 
        }

    set_label_visible (visible = true)
        {
        this._show_labels_planets = visible
        this._show_labels_sc = visible

        this.list.forEach (actor => actor.set_label_visible (visible))

        return visible
        }
        
    set_sc_label_visible (visible = true)
        {
        this._show_labels_sc = visible

        this.list.forEach (actor => {if (actor.is_sc) {actor.set_label_visible (this._show_labels_sc)}})

        return this._show_labels_sc
        }
  
    set_planet_label_visible (visible = true)
        {
        this._show_labels_planets = visible

        this.list.forEach (actor => {if (actor.is_planet) {actor.set_label_visible (this._show_labels_planets)}})            
        
        return this._show_labels_planets
        }
        
    set_orbit_visible (visible = true)
        {
        this._orbit_visible = visible

        this.list.forEach (actor => {if (actor.is_sc) {actor.set_orbit_visible (this._orbit_visible)}})

        return this._orbit_visible
        }

    dim_lights (dim=1.0)
        {
        this.list.forEach (actor => {if (actor.is_planet) {actor.set_luminosity (dim)}})

        return dim 
        }

    set_start_time (t=0)
        {
        console.log ("start time: ", t)

        if  (t > 0)
            {
            this._start_time = t

            this.time_range_update = true
            }
        }

    set_coord_system (system = COORD_System.GSE)
        {       
        if  (this._coord_system !== system)
            {
            console.log ("Setting coordinate system to: ", coord_system_to_key (system) )

            this.list.forEach (actor => actor.set_coord_system (system))

            this._coord_system = system

            this.update_sc_pos_list (this._coord_system)
            }

        return this._coord_system
        }

    set_end_time (t=0)
        {
        console.log ("end time: ", t)

        if  (t > 0)
            {
            this._end_time = t

            this.time_range_update = true
            }
        }

    /* No longer used.
    set_reference_frame (frame = REF_FRAME.ECI)
        {
        if  (this._reference_frame !== frame)
            {
            this.list.forEach (actor => actor.set_frame (frame))

            this._reference_frame = frame
            }
        }
    */

    async update_actor (actor)
        {
        if  (actor.tstart === this._start_time && actor.tend === this._end_time)
            {
            return Promise.resolve ()
            }

        const msgid = (actor.is_sc) ? this._msg_portal.add_alert (ALERT.data_loading) : null

        return actor.deploy (this._start_time, this._end_time)
            .then (() =>
                {
                if  (actor.is_sc)
                    {
                    this.update_sc_pos_list (this._coord_system)

                    this._msg_portal.clear_alert (msgid)
                    }

                return false
                })

            .catch ((status) =>
                {
                if  (msgid)
                    {
                    this._msg_portal.clear_alert (msgid)
                    this._msg_portal.add_alert (ALERT.failure, actor.id)
                    }


                JN.log (SSC_WS.log_event (status))

                this.remove (actor.id)

                return actor.id
                })
        }

    async update ()
        {
        /*
            this.update_required = true
            this.time_change = true     
 
        */

        let failed = false


        switch (true)
            {
            case (this.time_range_update):

                this.set_time (0)
                new Calculate_Planet_Orbit ().reset ()  //Singleton Class

                // falls through

            case (this.sc_change):

                failed = await this.call_with_delay (this.update_actor, 500, 3)

                break

            default:
            }

        this.time_range_update = false
        this.sc_change = false    

        return failed
        }

    set_time (t)
        {
        this._at_start = false
        this._at_end = false

        system_time.time = t

        if  (t <= this._start_time)
            {
            system_time.time = this._start_time
            this._at_start = true
            }

        else if  (t  >= this._end_time)
            {
            system_time.time = this._end_time
            this._at_end = true
            }        

        this.list.forEach (actor => actor.update_position (system_time.time))

        this.update_sc_pos_list (this._coord_system)
        }

    update_time (delta, loop)
        {
        let pause = false

        this._at_start = false
        this._at_end = false

       system_time.time += delta * TIME_RATE

        if  (system_time.time > this._end_time)
            {
            if  (loop)
                {
                system_time.time = this._start_time
                this._at_start = true
                }

            else 
                {
                system_time.time = this._end_time
                this._at_end = true

                pause = true
                }
            }

        this.list.forEach (actor => actor.update_position (system_time.time))

        this.update_sc_pos_list (this._coord_system)

        return pause
        }

    update_sc_pos_list ()
        {
        // Called from Time_Manager::update_sc_pos
        // Don't need to do this for planets.
        function new_sc_pos_row (id)
            {
            let x_pos =  " - " 
            let y_pos =  " - " 
            let z_pos =  " - " 

            const pos = this.get (id).get_orbit_pos (this._coord_system)

            if  (pos.valid)
                {
                x_pos = (convert (pos.x, COORD_Unit.RE, this._unit)).toFixed (2) 
                y_pos = (convert (pos.y, COORD_Unit.RE, this._unit)).toFixed (2) 
                z_pos = (convert (pos.z, COORD_Unit.RE, this._unit)).toFixed (2) 
                }

            const r = { name: this.get (id).name, 
                        id: id,
                        color: this.get (id).color,
                        x: x_pos,
                        y: y_pos,
                        z: z_pos,
                        }
                
            this._sc_pos_list.push (r) 
            }

        this._sc_pos_list.length = 0

        this.get_all_sc_id().map (new_sc_pos_row.bind (this))
        }

    async call_with_delay (callback, delay = 1000, brake = 0) 
        {
        let n = 0
        const fail = []

        for (let [key, value] of this.list) 
            {
            const delay_in_ms = (n < brake)? 0 : delay

            await new Promise (resolve => setTimeout (resolve, delay_in_ms))

            const r = await callback (value, key)

            if  (r)
                {
                fail.push (r)
                }

            n++
            }

        return fail
        }

    set_slider_value (value)
        {
        if  (value === this._slider_value)
            {
            return false
            }

        this._slider_value = value 
        this.set_master_time (this.time_from_slider_position ())

        return true 
        }

    set_bg_color (hex)
        {
        this.background_color = hex
        this.light_overlay = use_light_text (this.background_color)
        this.text_color = (this.light_overlay)? this.light_text : this.dark_text
        this._icon_shade = (this.light_overlay)? this.light_shade : this.dark_shade

        this.update_label_color (this.text_color)
        }

    set_color  (id, ...args)
        {
        if  (this.valid (id))
            {
            return this.get (id).set_color (...args)
            }

        return null
        }

    set_unit (unit = COORD_Unit.RE)
        {
        this._unit = unit
        this.update_sc_pos_list (this._coord_system)
        }

    set_shape  (id, ...args)
        {
        if  (this.valid (id))
            {

            return this.get (id).set_shape (...args)
            }

        return null
        }

    set_display_size (x, y)
        {
        this.x_disp = x
        this.y_disp = y

        this.list.forEach (actor => actor.set_display (this.x_disp, this.y_disp))
        }

    display_terminator (d = true)
        {
        this.list.forEach (actor => {if (actor.is_planet) {actor.display_terminator (d)}})

        this._terminator_line = d

        return d
        }

    get_orbit_coord (id, system = this._coord_system)
        {
        return this.get (id).get_orbit_coord (system)
        }

    get_orbit_times (id)
        {
        return this.get (id).get_orbit_times ()
        }

    add_GS_to_planet (planet, gs_loc = [])
        {
        const actor = this.get (planet)

        // Check to make sure a valid planet was found.
        if  (actor === null || ! actor.is_planet)
            {
            return null
            }

        actor.add_gs (gs_loc)
        }

    get_all_id ()
        {
        // Return an array of spacecraft IDs currently in the database.  
        const r = []
        
        this.list.forEach (actor => r.push (actor.id))

        return r
        }

    get_all_sc_id ()
        {
        // Return an array of spacecraft IDs currently in the database.  
        const r = []

        this.list.forEach (actor => {if (actor.is_sc) {r.push (actor.id)}})

        return r
        }

    get_number_sc ()
        {
        let count = 0

        this.list.forEach (actor => {if (actor.is_sc) {count++}})

        return count
        }
    /*
    get_all_available ()
        {
        // Return an array of spacecraft IDs that orbit data can be 
        // requested for.
        const r = []
        this.list.forEach (actor => {
            if  (actor.available (this._start_time, this.stop_time))
                {
                r.push (actor.id)
                }
            })

        return r
        }
    */

    get_all_valid ()
        {
        // Return an arrayy of spacraft IDs that have valid orbit data.
        // Return an array of spacecraft IDs that orbit data can be 
        // requested for.
        const r = []
        this.list.forEach (actor => {
            if  (actor.data_valid ())
                {
                r.push (actor.id)
                }
            })

        return r
        }

    dispose ()
        {
        this.orbit_direction_material.dispose ()
        }

    get start_time ()
        {
        return this._start_time
        }

    get end_time ()
        {
        return this._end_time
        }

    get time ()
        {
        return system_time.time
        }

    get icon_shade ()
        {
        return this._icon_shade
        }

    get sc_pos_list ()
        {
        return this._sc_pos_list
        }

    get coord_system ()
        {
        return this._coord_system
        }

    get unit ()
        {
        return this._unit
        }

    get msg_portal ()
        {
        return this._msg_portal
        }

    get reference_frame ()
        {
        return this._reference_frame
        }

    get terminator_line ()
        {
        return this._terminator_line
        }

    }

export default entity_manager