import React from 'react' ;
//import { Button } from 'antd';
import { Slider } from 'antd'
import { Switch } from 'antd'
import { Menu } from 'antd'
// import { ConfigProvider} from 'antd'
// import { theme } from 'antd'
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx';
//import { Typography } from 'antd'
//import { Space } from 'antd'
import * as THREE from "three";
//import { MathUtils } from 'three';
import play_icon from './images/play_icon.png'
import pause_icon from './images/pause_icon.png'
import help_icon from './images/help_icon.png' ;
import { TT_BGCOLOR } from './constants.js'
import Icon_Bar  from './icon_bar.jsx'
import Target_Bar from './target_bar.jsx'
import Function_Bar from './function_bar.jsx'
import Camera_Align from './camera_align.jsx'
//import moon_diffuse from './images/moon_diffuse.jpg' ;
//import mercury_diffuse from './images/mercury_diffuse.jpg' ;
//import sun_diffuse from './images/sun_diffuse.jpg' ;
//import venus_diffuse from './images/venus_diffuse.jpg' ;
//import mars_diffuse from './images/mars_diffuse.jpg' ;

import { coord_system_to_key } from './Orbit'
import { unit_to_string } from './Orbit.js'

//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { MeshLine, MeshLineMaterial} from 'three.meshline';
//import { CSS2DRenderer, CSS2DObject } from  'three/examples/jsm/renderers/CSS2DRenderer.js';
//import Get_Orbit, { GSE_to_WS } from './Orbit.js' ;

import { MIN_SCREEN_X } from './constants.js'
import { OVERLAY_NAME_FIELD_SZ } from './constants.js'
import { MONTHS } from './constants.js'

import { V3DSpace } from './App.jsx';


const DEFAULT_RATE_SELECT = 3

const BASE_ANIM_RATE = 7200.0

const PB_SPEED = [
        {
            label: "0.25 x",
            rate: Math.floor (BASE_ANIM_RATE * .25) * 1.0
        },
        {
            label: "0.5 x",
            rate: Math.floor (BASE_ANIM_RATE * .5) * 1.0
        },
        {
            label: "0.75 x",
            rate: Math.floor (BASE_ANIM_RATE * .75) * 1.0
        },
        {
            label: "1 x",
            rate: BASE_ANIM_RATE,
        },
        {
            label: "2 x",
            rate: BASE_ANIM_RATE * 2
        },
        {
            label: "4 x",
            rate: BASE_ANIM_RATE * 4
        },
        {
            label: "8 x",
            rate: BASE_ANIM_RATE * 8
        },
        {
            label: "16 x",
            rate: BASE_ANIM_RATE * 16
        },]

const speed_item_select = [        
        {
            key: 0,
            label: PB_SPEED [0].label,
        },
        {
            key: 1,
            label: PB_SPEED [1].label,
        },
        {
            key: 2,
            label: PB_SPEED [2].label,
        },
        {
            key: 3,
            label: PB_SPEED [3].label,
        },
        {
            key: 4,
            label: PB_SPEED [4].label,
        },
        {
            key: 5,
            label: PB_SPEED [5].label,
        },
        {
            key: 6,
            label: PB_SPEED [6].label,
        },
        {
            key: 7,
            label: PB_SPEED [7].label,
        }]

const MIN_DIRECT_SHADE_VAL = .55
const MAX_DIRECT_SHADE_VAL = .95
const DELTA_SHADE_VAL = MAX_DIRECT_SHADE_VAL - MIN_DIRECT_SHADE_VAL
const M_LUMINA = DELTA_SHADE_VAL * .5
const B_LUNINA = DELTA_SHADE_VAL + MIN_DIRECT_SHADE_VAL

export const ORTHO_CAMERA = 0 ;
export const PERSP_CAMERA = 1 ;
const DEFAULT_CAM = ORTHO_CAMERA ;

const NEAR_PLANE = 1 ;
const FAR_PLANE_PERSP = 10000000 ;
// const FAR_PLANE_ORTHO = FAR_PLANE_PERSP
// const FAR_PLANE_ORTHO = 20 ;  // Must be changed based on perspective / orthagonal view
const VFOV = 70 ;     // Vertical Field of View
const ORTHO_TARGET_DIST = 20 // Distance of the orthographic camera from the target. 
const INITIAL_ASPECT_RATIO = 2 ;

// Create a desaturated red green and blue colors
export const AXIS_X   = new THREE.Color("hsl(0, 64%, 50%)") ;  // RED
export const AXIS_Y = new THREE.Color("hsl(120, 64%, 50%)") ;  // GREEN
export const AXIS_Z  = new THREE.Color("hsl(240, 64%, 50%)") ; // BLUE


export function epoch_to_date_time (epoch, include_time = true)
    {
    const d = new Date (epoch)

    // Convert the Epoch to a string, including time and date, but get rid of the T.
    const [date_string, time] = d.toISOString().replace(/T/, ' ').replace(/\..+/, '').split (' ')

    const year  = date_string.substr (0, 4)
    const day   = date_string.substr (8, 2)
    const month = MONTHS [parseInt (date_string.substr (5, 2), 10) - 1]

    const date = year + ' ' + month + ' ' + day 

    return (include_time) ? date + ' ' + time : date
    }


class Display_Manager extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
            camera: null, 
            controls: null,
            align_camera_axis: "X",
            frame_target: "earth",
            planet_orbit_request: [],
            focus_label: 'Earth',
            camera_type: DEFAULT_CAM,
            start_time: 0,
            end_time: 0,
            }

        //this.orb_list = [] ;
        this.planet_list = [] 
        this.shade_val = MIN_DIRECT_SHADE_VAL 
        this.orbit_direct_material = new THREE.MeshBasicMaterial ()

        this.display_orbit_data = this.display_orbit_data.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this) 
        this.update_frame = this.update_frame.bind (this) 
        //this.create_planet = this.create_planet.bind (this)
        this.set_orthogonal = this.set_orthogonal.bind (this) 
        this.set_perspective = this.set_perspective.bind (this) 
        }

    set_perspective ()
        {
        if  (this.state.camera_type !== PERSP_CAMERA)
            {
            V3DSpace.switch_camera ()

            this.setState ({camera_type: PERSP_CAMERA}) ;
            }
        }
        
    set_orthogonal ()
        {
        if  (this.state.camera_type !== ORTHO_CAMERA)
            {
            V3DSpace.switch_camera ()

            this.setState ({camera_type: ORTHO_CAMERA}) ;
            }
        }

    /*
    create_xz_grid ()
        {
        // const g = new Grid ('Z', 'Y', xz_options.size, xz_options.scale, 'red', 'green' )

        // this.scene.add (g)

        // const ws = this.g.get_ws_coord ([0, 0, xz_options.offset], to_gse)

        // g.set_grid_position (offset)
        // g.set_grid_visible (visible)


        // axis
        // transverse
        // requested_size
        // scale
        // color
        // cntr_color
        // to_gse

        // this.grid = new Grid (axis, transverse, requested_size, scale, color, cntr_color, to_gse) 

        const r = <Grid_Creator 
            size={this.props.xz_options.size}
            scale={this.props.xz_options.scale}
            color={"red"}
            cntr_color={"green"}
            axis={"Z"}
            transverse = {"Y"}
            to_gse={null}
            offset={this.props.xz_options.offset}
            visible={this.state.xz_grid_visible}
            /> ;
        return r ;
        }

    create_yz_grid ()
        {
        const r = <Grid_Creator  
                size={this.props.yz_options.size}
                scale={this.props.yz_options.scale}
                color={"red"}
                cntr_color={"green"}
                axis={"Z"}
                transverse = {"X"}
                to_gse={null}
                offset={this.props.yz_options.offset}
                visible={this.state.yz_grid_visible}
                /> ;
        return r ;
        }

    create_xy_grid ()
        {
        const r = <Grid_Creator 
                size={this.props.xy_options.size}
                scale={this.props.xy_options.scale}
                color={"red"}
                cntr_color={"green"}
                axis={"X"}
                transverse = {"Z"}
                to_gse={null}
                offset={this.props.xy_options.offset}
                visible={this.state.xy_grid_visible}
                /> ;

        return r ;
        }

    */
    /*
    toggle_magnetosphere ()
        {
        this.setState ({magneto_visible: ! this.state.magneto_visible}) ;
        }

    toggle_xy_grid ()
        {
        this.setState ({xy_grid_visible: ! this.state.xy_grid_visible}) ;
        }

    toggle_xz_grid ()
        {
        this.setState ({xz_grid_visible: ! this.state.xz_grid_visible}) ;
        }

    toggle_yz_grid ()
        {
        this.setState ({yz_grid_visible: ! this.state.yz_grid_visible}) ;
        }

    toggle_bowshock ()
        {
        this.setState ({bs_visible: ! this.state.bs_visible}) ;
        }
    */

    /*
    create_orbit (sc) 
        {
        // Create the line geometry used for storing verticies
        //let geometry = new THREE.BufferGeometry() ;

        //geometry.setAttribute ( 'position', new THREE.BufferAttribute( points, 3 ) ) ;

        // Create the mesh line.
        const line = new MeshLine () ;
        
        // Add in the geometry for the line
        line.setPoints (sc.points);

        // Create the line material                   
        const material = new MeshLineMaterial (
            {   
            useMap: false,
            color: sc.color,
            opacity: 1,
            resolution: new THREE.Vector2(this.props.width, this.props.height),
            sizeAttenuation: false,
            lineWidth:  2.5,
            //near: this.camera.near,
            //far: this.camera.far                             
            }); 

        // Create the orbit mesh.
        const mesh = new THREE.Mesh (line, material) ;
        mesh.name = sc.id ;        
        
        // Create a cone to indicate the direction of travel in the orbit
        const orbit_direct = new THREE.Mesh (new THREE.ConeGeometry (0.04, .10, 16), this.orbit_direct_material) 

        orbit_direct.position.fromArray (sc.points, 0)

        const target = new THREE.Vector3 ().fromArray (sc.points, 3)

        target.sub (orbit_direct.position)
        target.normalize ()

        orbit_direct.translateOnAxis (target, -.12) 
        orbit_direct.lookAt (target.add (orbit_direct.position))
        orbit_direct.rotateX (MathUtils.degToRad (90))

        // Display the orbit.
        assets.scene.add(mesh)

        mesh.add (orbit_direct)


        // Create the 
        }

    create_bright_planet (planet)
        {

        }
    
    create_dark_planet (planet)
        {

        }
    */

    /*
    inc_orbit_direct_shade (inc=5)
        {
        this.shade_val += inc

        this.shade_val = (this.shade_val < 360)?  this.shade_val : 0

        const shade = Math.sin (this.shade_val * DEG2RD) * M_LUMINA + B_LUNINA

        //console.log ( " shade val: ", this.shade_val)

        this.orbit_direct_material.color.setRGB (shade, shade, shade)
        }
    */
    /*
    create_planet (planet)
        {
        if  (! planet.hasOwnProperty ('mobile') )
            {
            const i = PLANETS.map(object => object.id).indexOf(planet.id) ;
            const mat_props = {} ;

            if  (PLANETS [i].diffuse)
                {
                const loadManager = new THREE.LoadingManager() ;
                const loader = new THREE.TextureLoader (loadManager) ;        

                mat_props.map = loader.load (PLANETS [i].diffuse) ;
                }

            else
                {
                mat_props.color = PLANETS [i].color ;
                }

            const material = new THREE.MeshPhongMaterial (mat_props) ;

            const geometry = new THREE.SphereGeometry (PLANETS [i].radii, 32, 32) ;

            const obj = new THREE.Mesh ( geometry, material ) ;

            //obj.position.set (0., 0., 0.) ;
            obj.position.fromArray (planet.points, 0) ;
            //obj.position.x = planet.points [0] ;
            //obj.position.y = planet.points [1] ;
            //obj.position.z = planet.points [2] ;
            planet.time_index = 0 ;

            obj.name = "pln_" + planet.id ;

            planet.mobile = obj ;

            // move this to bottom.
            // this.state.scene.add(obj) ;            
            }

        else
            {
            //planet.mobile.position.set (0., 0., 0.) ;
            planet.mobile.position.fromArray (planet.points, 0) ;
            //planet.mobile.position.x = planet.points [0] ;
            //planet.mobile.position.y = planet.points [1] ;
            //planet.mobile.position.z = planet.points [2] ;
            planet.time_index = 0 ;
            }

        // Add section to check if planet is already part of the scene.
        // if it is not, then add it.
        if  (planet.mobile.parent !== V3DSpace.scene)
            {
            V3DSpace.scene.add (planet.mobile) ;
            }
    
        planet.position = -1 ;
        //planet.time_index = -1 ;

        }
    */
    /*
    update_sc_shape (sc)
        {

        if  (! sc.hasOwnProperty ('mobile') )
            {
            return 
            }

        if  (! this.remove_spacecraft (sc.id))
            {
            return 
            }
        
        sc.mobile = null

        this.create_spacecraft (sc, sc.color)

        console.log ("recreated s/c mob_" + sc.id) ; 
        }    

    create_spacecraft (sc)
        {
        if  (! sc.hasOwnProperty ('mobile') || sc.mobile === null)
            {

            this.state.controls.update_sprite_size ()

            const entity = assets.get (sc.id)

            assets.scene.add (entity.obj)

            sc.mobile = entity.obj ;
            sc.current_shape = entity.shape
            sc.current_color = entity.color 
            }

        sc.mobile.position.fromArray (sc.points, sc.time_index * 3)
        }

    */

    display_orbit_data (orbit_data, sc = true)
        {
        if  (sc)
            {
            //this.create_orbit (orbit_data) ;
            //this.create_spacecraft (orbit_data, orbit_data.color) ;
            // this.update_sc_pos_list () ;

            // Add observatory ID to the list of orbits
            // this.orb_list = [...this.orb_list, orbit_data.id] ;
            this.props.orb_list.push (orbit_data.id)
            }
        else
            {
            this.create_planet (orbit_data) ;

            // Add planet ID to the list of planets
            this.planet_list = [...this.planet_list, orbit_data.id] ;
            }
        }

    /*
    remove_orbit (id)
        {
        let orbit = assets.scene.getObjectByName (id) ; 

        if  (typeof orbit !== "undefined")
            {
            assets.scene.remove (orbit) ;

            orbit.geometry.dispose () ;        
            orbit.material.dispose () ;

            console.log ("removed orbit " + id) ; 
            this.update_sc_pos_list () ;

            return ;
            }

        console.log ("attempted to remove orbit " + id + " but not found") ; 
        }

    remove_spacecraft (id)
        {
        // display objects should also contain orbit objects??
        let mobile = assets.scene.getObjectByName ( "mob_" + id ) ;

        if  (typeof mobile != "undefined")
            {
            assets.scene.remove (mobile) ;
            console.log ("removed s/c mob_" + id) ; 

            return true
            }

        console.log ("attempted to remove s/c mob_" + id + " but not found")

        return false 
        }
    */

    /*
    store_controls_ref (controls) 
        {
        this.setState ({controls: controls,}) ; 
        }

    store_camera_ref (camera) 
        {
        this.setState ({camera: camera,}) ; 
        }
    */

    /*
    get_camera_vector (axis="X", distance=5)
        {
        // Return a normalized directional matrix for the requested axis.
        const v = new THREE.Vector3 (0, 0, 0) ;

        switch (axis)
            {
            case "X" : 
                v.setX (1) ;
                break ;

            case "Y" :
                v.setY (1) ;
                break ;

            case "Z" :
                v.setZ (1) ;
                break ;

            default: 
                v.setX (1) ;
            }

        return GSE_to_WS (v) ;
        }
    */

    /*
    set_axis (axis)
        {
        if  (['X', 'Y', 'Z'].includes (axis))
            {
            const target = this.state.controls.target
            const distance = this.state.controls.get_distance_to_target ()

            this.set_camera_position (target, distance, this.get_camera_vector (axis))

            this.state.camera.lookAt (target) 
            this.state.controls.target.copy (target) 
            }
        }

    direction_to_target (target)
        {
        return new THREE.Vector3 ().subVectors(this.state.camera.position, target).normalize ()
        }

    */

    /*
    set_camera_position (target, dist_to_target, direction)
        {
        

        if  (this.state.camera_type === PERSP_CAMERA)
            {
            this.state.camera.position.addVectors (target, direction.multiplyScalar (dist_to_target))
            }
        else
            {
            this.state.camera.position.addVectors (target, direction.multiplyScalar (ORTHO_TARGET_DIST))
            this.state.camera.zoom = ORTHO_TARGET_DIST / dist_to_target
            this.state.camera.updateProjectionMatrix ()
            }

        this.state.camera.lookAt (target) ;
        }

    */

    update_frame ()
        {
        // frame is the center of a fixed coordiate system. it is set in Manager
        // currently only Earth is implementmented

        // Eventually we will add the logic for switching between different frames here
        // But since we only one frame here, for the moment this won't be used.
        const frame = (this.props.frame)? this.props.frame : this.state.frame_target 

        V3DSpace.update_frame (frame)

        /*
        let distance = 5

        if (['EARTH'].includes (frame))
            {
            // Set the initial distance of the camera from the target based on the target.       
            switch (frame)
                {
                case "EARTH" :
                    distance = 5
                    break ;

                default :
                    distance = 5
                }
            }

        else
            {
            distance = 5
            }

        const target = new THREE.Vector3 (0., 0., 0.)

        // this.state.camera.position.addVectors (target, this.get_camera_vector ("X", distance)) ;
        // this.state.camera.lookAt (target) ;
        this.set_camera_position (target, distance, this.get_camera_vector ('X'))


        this.state.controls.target.copy (target) ;
        */

        this.setState ({frame_target: frame,}) ; 

        }

    /*
    update_camera_to_follow (s, refocus=false)
        {
        if  (refocus)
            {
            this.state.controls.target.copy  (s.mobile.position)
            this.state.camera.position.copy  (s.mobile.position)

            // const pos = (s.dist)? this.get_camera_vector ('X', s.dist) : new THREE.Vector3(0, 6, 6)  
            // this.state.camera.position.add (pos)

            const distance = (s.dist)? s.dist : 6 
            const direction = (s.dist)? this.get_camera_vector ('X') :  new THREE.Vector3(0, 1, 1) 

            this.set_camera_position (s.mobile.position, distance, direction)
            }

        else 
            {
            const t = new THREE.Vector3 ().subVectors (s.mobile.position, this.state.controls.target )

            this.state.camera.position.add (t)
            this.state.controls.target.add (t)
            }

        //this.state.camera.position.setX (s.mobile.position.x) ;
        //this.state.camera.position.setY (s.mobile.position.y + 6) ;
        //this.state.camera.position.setZ (s.mobile.position.z + 6) ;

        //this.state.controls.target.copy  (s.mobile.position) ;

        this.state.controls.update () ;

        // console.log ("setting focus to (" + s.id +") " + JSON.stringify (s.mobile.position)) ;
        }
    */
    /*
    update_sc_pos_list ()
        {
        // Called from Time_Manager::update_sc_pos
        // Don't need to do this for planets.

        function new_sc_pos_row (id)
            {
            let x_pos =  " - " 
            let y_pos =  " - " 
            let z_pos =  " - " 

            const name = V3DSpace.get_entity_name (id)
            const color = V3DSpace.get_entity_color (id)

            const pos = V3DSpace.get_entity_pos (id)

            if  (pos)
                {
                x_pos = (pos.x / EARTH_RADIUS).toFixed (1) 
                y_pos = (pos.y / EARTH_RADIUS).toFixed (1) 
                z_pos = (pos.z / EARTH_RADIUS).toFixed (1) 
                }

            return ({   name: name, 
                        id: id,
                        color: color,
                        x: x_pos,
                        y: y_pos,
                        z: z_pos,
                        }
                ) ;
            }

        const list = []

        V3DSpace.get_all_sc_id().map (id => list.push (new_sc_pos_row (id)))

        this.setState ({sc_pos_list: list}) ;
        }
    */
    /*
    // Replaced by update_time
    update_sc_pos (sc, time, new_pos = 0, planet = 0)
        {
        // Use this for updating planet position as well.

        // check to make sure time and orbit data is available.  May not be during
        // orbit update.
        if  (sc.hasOwnProperty ('t') && sc.hasOwnProperty ('points'))
            {
            // make sure the spacecraft has a mobile representation
            if  (sc.hasOwnProperty ('mobile'))
                {
                //let db = (planet && sc.id === "moon") ? true : false ;
                let f_interpolate = true ;  // interpolation flag.
                let p_0  = 0;
                let p_1  = 0;
                let closest ; 
                let end = false ;
                // Find the index of the orbit position whose time is closest to the current
                // time.
                if  (time <= sc.t[0])                  // time prior to the earliest orbital point
                    {
                    closest = 0 ;
                    f_interpolate = false ;
                    }
                else if (time >= sc.t[sc.t.length-1])  // time after latest orbital point.
                    {
                    closest = sc.t.length-1 ;
                    f_interpolate = false ;
                    end = true ;
                    }
                else                                   // time within range covered by orbital data.  Calculate!
                    {
                    // This was cute but probably overkill
                    //closest = sc.t.reduce (
                    //    function (prev, curr, index, times) 
                    //        {
                    //        const prior = Math.abs (times [prev] - time) ;
                    //        const now   = Math.abs (curr - time) ;
                    //        return (now < prior) ? index : prev ;
                    //        }, 0);
                    //
                    for (let i = 1  ; i < sc.t.length ; i++)
                        {
                        if  (time < sc.t[i]) 
                            {
                            p_0 = i - 1 ;
                            p_1 = i ;

                            break ;
                            }
                        }

                    closest = ((time - sc.t[p_0]) < (sc.t[p_1] - time))? p_0 : p_1 ;
                    end = (closest === sc.t.length - 1) ? true : false ;
                    }
                    
                if  (f_interpolate && planet)
                    {
                    // The interval between closest and p1 should bracket the position of the s/c at time.
                    const alpha = (time - sc.t[p_0]) / (sc.t[p_1] - sc.t[p_0] ) ;
                    const v0 = new THREE.Vector3().fromArray (sc.points, p_0*3) ;
                    const v1 = new THREE.Vector3().fromArray (sc.points, p_1*3) ;
                    sc.mobile.position.lerpVectors (v0, v1, alpha) ;

                    }

                else
                    {
                    // if  (closest === sc.t.length - 1)  {closest-- ;}

                    // alert (moment.utc (sc.t [closest]).format ('MMM DD YYYY HH:mm:ss')) ;
                    //sc.mobile.position.x = sc.points [closest * 3 + 0] ;
                    //sc.mobile.position.y = sc.points [closest * 3 + 1] ;
                    //sc.mobile.position.z = sc.points [closest * 3 + 2] ;
                    sc.mobile.position.fromArray (sc.points, closest * 3) ;
                    //console.log ("tl: %d pl %d closest: %d", sc.t.length, sc.points.length, closest) ;
                    }


                // Point shape in direction of orbit, but only if it is not a sphere.
                if  (sc.mobile.name.substring(0, 3) === "mob" && sc.shape !== "sphere" && ! end) 
                    {    
                    const target = new THREE.Vector3 ().fromArray (sc.points, (closest + 1) * 3) ;

                    target.sub (sc.mobile.position) ;
                    target.normalize () ;

                    sc.mobile.lookAt (target.add (sc.mobile.position)) ;
                    sc.mobile.rotateX (MathUtils.degToRad (90)) ;
                    }
                //if  (new_pos == 100) {alert (sc.t.length + " " + sc.points.length + " " + closest) ;}
                //if  (new_pos == 1) {alert (closest) ;}

                // Check if we have focus.  If so, also need to reset the OrbitControls.
                if  (sc.focus)
                    {
                    this.update_camera_to_follow (sc) ;
                    } 

                sc.position = new_pos ;
                sc.time_index = closest ;

                //if  (planet !== 0) 
                //    {
                //    this.update_sc_pos_list () ;
                //    }
                }
            }
        }
        */
    /*
    componentDidMount ()
        {
        // Check if we already have a planet list (one exists by default)
        // If we do, then go get the orbit data for those planets and then 
        // display them
        if  (this.props.planet_id.length !== 0)
            {
            this.setState ({planet_orbit_request: this.props.planet_id}) ;
            }
        }
    */

    componentDidUpdate (prevProps, prevState)
        {
        /*
        if  (this.props.display_id.length > 0) 
            {
            const new_colors = this.props.display_id.map ((item)=>item.color) ;
            alert ("new colors " + new_colors.join (", ")) ;
            }

        if  (prevProps.display_id.length > 0)
            {
            const old_colors = prevProps.display_id.map ((item)=>item.color) ;
            alert ("old colors " + old_colors.join (", ")) ;
            }
        */
        // Check for change of label display status
        /*
        if  (prevProps.show_decals !== this.props.show_decals)
            {
            V3DSpace.set_label_visible (this.props.show_decals)
            }
        */
        /*
        // Check for a change of focus
        if  (prevProps.focus !== this.props.focus)
            {
            //  Focus has changed.  Find the new focus object and set its focus flag.  All other
            //  objects will have their focus flags set to false.
            if  (this.props.focus)
                {
                for (let i = 0 ; i < this.props.display_id.length ; i++ )
                    {
                    if  (this.props.display_id[i].id === this.props.focus)
                        {
                        this.update_camera_to_follow (this.props.display_id[i], true) 

                        this.setState ({focus_label: this.props.display_id[i].name})

                        break
                        }
                    }

                for (let i = 0 ; i < this.props.planet_id.length ; i++ )
                    {
                    if  (this.props.planet_id[i].id === this.props.focus)
                        {
                        this.update_camera_to_follow (this.props.planet_id[i], true)

                        this.setState ({focus_label: this.props.planet_id[i].name})

                        break
                        }
                    } 
                }
            else 
                {
                this.update_frame ()

                this.setState ({focus_label: 'Earth'})
                }
            }
            */
            
        // if  (prevProps.start_time !== this.props.start_time ||   
        //    prevProps.end_time !==  this.props.end_time)
        // if  (this.props.start_time < prevProps.start_time ||   
        //    this.props.end_time > prevProps.end_time)
        const time_change = 
            this.state.start_time !== this.props.start_time || 
            this.state.end_time !==  this.props.end_time

        // const display_list_change = prevProps.display_id !== this.props.display_id

        // const display_id = this.props.display_id 


        // Check for update.
        if  (this.props.update && ! prevProps.update)
             
            /* 
            {
            // Start or end time has changed.  Remove all orbits and get new orbit data.

            const orbit_list = this.orb_list ;
            const display_list = this.props.display_id ;

            // Remove all displayed orbits
            for (let i = 0 ; i < this.orb_list.length ; i++ )
                {
                // Remove the orbit.
                this.remove_orbit (this.orb_list [i]) ;
                }

            // Clear the orbit display list
            this.orb_list = [] ;

            // Clear the planet display list
            this.planet_list = [] ;

            // Request all spacecraft listed in the display_id prop
            // Request all planets listed in the planet_id prop
            this.setState (
                    {
                    orbit_data_request: [...this.props.display_id],
                    planet_orbit_request: [...this.props.planet_id],
                    }) ;

            return ;
            }
            */

 
            {
            // Create a list spacecraft ids from the list of selected spacecraft. 
            // Only updated by add_orbit/remove_orbit in manager.  
            //const display_list = display_id.map ((item)=>item.id)

            if  (time_change) this.planet_list = [] 


            // If there no spacecraft listed in the display_id prop
            // then remove all displayed orbits.
            if  (time_change)
                {
                ///for (let i = 0 ; i < this.props.orb_list.length ; i++ )
                //    {
                //    this.remove_orbit (this.props.orb_list [i]) ; 
                //    this.remove_spacecraft (this.props.orb_list [i]) ;
                //    }

                // Clear the orbit display list
                //this.props.orb_list.length = 0 

                if  (time_change) 
                    {
                    // Clear the planet display list
                    this.planet_list.length = 0

                    //display_id.map (i => i.mobile = null)

                    // Request all spacecraft listed in the display_id prop
                    // Request all planets listed in the planet_id prop
                    this.setState (
                        {
                        //orbit_data_request: [...this.props.display_id],
                        planet_orbit_request: [...this.props.planet_id],
                        start_time: this.props.start_time, 
                        end_time: this.props.end_time,
                        }) ;
                    }
                }
            /*
            else
                {
                //let new_orbit_list = [] ;
        
                // Remove any orbits that are displayed, but do not have
                // their spacecraft listed in the display_id prop
                // OMG --- NEED TO MAKE ORB LIST REFERENCE FULL SC STRUCTURES NOT JUST
                // ARRAY OF SC NAMES !!!!!!!
                //const sc_ids = [...this.props.orb_list]

                //for (let i = 0 ; i < sc_ids.length ; i++ )
                //    {
                //    if  (display_list.indexOf (sc_ids [i]) === -1)
                //        {
                //       console.log ('*** removing orbit for ', sc_ids [i])
                //       this.remove_orbit (sc_ids [i]) ;
                //       this.remove_spacecraft (sc_ids [i]) ;
                //        this.props.orb_list.splice (this.props.orb_list.indexOf (sc_ids [i]), 1) ;
                //        //console.log (this.props.orb_list)
                //        }
                //    }

                
                // Create a list of spacecraft that are in the display_id
                // prop but do not yet have their orbits displayed.

                // First check if the list of displayed orbits is empty.
                //if  (this.props.orb_list.length === 0)
                //    {
                //    new_orbit_list = display_id ;  
                //    }
                
                // Otherwise have to check each observatory in display_id
                //else
                    //{
                    for (let i = 0 ; i < display_id.length ; i++ )
                        {
                        // Check if the orbit is already being displayed.
                        // If it is not, then add to the list of orbits that we
                        // need to retrieve.
                        if  (this.props.orb_list.indexOf (display_list [i]) === -1)
                            {
                            new_orbit_list.push (display_id [i]);
                            }

                        // Otherwise, check if the color or shape of the spacecraft changed.
                        else
                            {
                            const color_change = assets.get (display_id[i]).color !== display_id[i].current_color
                            const shape_change = assets.get (display_id[i]).shape !== display_id[i].current_shape 

                            if  (color_change)
                                {
                                console.log ('changing color')
                                this.remove_orbit (this.props.orb_list [i]) ;
                                this.create_orbit (display_id [i]) ;
                                //display_id [i].mobile.material.color.setStyle (display_id [i].color) ;
                                display_id [i].current_color = display_id [i].color
                                this.update_sc_pos_list () ;
                                }

                            if  (shape_change)
                                {
                                console.log ('changing shape')
                                this.update_sc_shape (display_id [i])
                                display_id [i].current_shape = display_id[i].shape
                                }
                            }
                        }
                }

                // Request needed spacecraft orbits.
                this.setState ({orbit_data_request: new_orbit_list}) ;
                */
            }

        return ;
        }

    
    render ()
        {
        // const display_id = this.props.display_id ;

        // <Obs_List sc_pos={this.state.sc_pos_list} />

        // <Orbit_Data display_id={this.props.display_id} />

        //const xz_grid = this.create_xz_grid () ;
        //const yz_grid = this.create_yz_grid () ;
        //const xy_grid = this.create_xy_grid () ;

        const top_center = (this.props.block_transport_bar)? null : <Camera_Align />


        return (
                <div ref={this.props.ui} id='ui'>

                    <Time_Manager
                        start_time={this.props.start_time}
                        end_time={this.props.end_time}
                        planets={this.props.planet_id}
                        transport_bar_help={this.props.transport_bar_help}
                        hide_time_control={this.props.hide_time_control}
                        block_transport_bar={this.props.block_transport_bar}
                        show_sc_position={this.props.show_sc_position}
                        invert={V3DSpace.icon_shade}
                        />

                    <Icon_Bar 
                        display_main_help_dialog={this.props.display_main_help_dialog}
                        toggle_l_sidebar={this.props.toggle_l_sidebar}
                        open_save_menu={this.props.open_save_menu}
                        copy_search_url={this.props.copy_search_url}
                        open_image_save_menu={this.props.open_image_save_menu}
                        open_coord_dialog={this.props.open_coord_dialog}
                        open_option_menu={this.props.open_option_menu}
                        invert={V3DSpace.icon_shade}
                        coord_system={this.props.coord_system}
                        visible={! this.props.block_transport_bar}
                        />

                    <Function_Bar 
                        //toggle_bowshock={this.toggle_bowshock}
                        //toggle_magnetosphere={this.toggle_magnetosphere}
                        //bs_visible={this.state.bs_visible}
                        //magneto_visible={this.state.magneto_visible}
                        //xy_grid_visible={this.state.xy_grid_visible}
                        //yz_grid_visible={this.state.yz_grid_visible}
                        //xz_grid_visible={this.state.xz_grid_visible}
                        //toggle_xy_grid={this.toggle_xy_grid}
                        //toggle_xz_grid={this.toggle_xz_grid}
                        //toggle_yz_grid={this.toggle_yz_grid}
                        visible={! this.props.block_transport_bar}
                        set_orthogonal={this.set_orthogonal}
                        set_perspective={this.set_perspective}
                        invert={V3DSpace.icon_shade}
                        camera_type={this.state.camera_type}
                        />

                    {top_center}

                    <Target_Bar
                        set_frame={this.props.set_frame} 
                        visible={! this.props.block_transport_bar}
                        invert={V3DSpace.icon_shade}
                        />

                </div>
                ) ;
        }
    }

/*
class Orbit_Data_Row extends React.Component
    {
    constructor (props)
        {
        super (props) ;
        }

    render ()
        {
        const time_string = moment.utc(this.props.time).format('YYYY MMM DD HH:mm:ss') ;

        //const points_x = this.props.sc.points[this.props.row * 3] ;
        //const points_y = this.props.sc.points[this.props.row * 3 + 1] ;
        //const points_z = this.props.sc.points[this.props.row * 3 + 2] ;

        const points_x = this.props.sc.coord [this.props.row * 3] 
        const points_y = this.props.sc.coord [this.props.row * 3 + 1] 
        const points_z = this.props.sc.coord [this.props.row * 3 + 2] 

        const pos_x = (points_x) ? points_x.toFixed (3) : " " ;
        const pos_y = (points_y) ? points_y.toFixed (3) : " " ;
        const pos_z = (points_z) ? points_z.toFixed (3) : " " ;

        const mark = (this.props.row === this.props.sc.time_index)? "▶" : " ";

        return (
                <>
                    <div className="right_overlay_row">
                            <div className="overlay_col_mark">{mark}</div>
                            <div className="overlay_col_time">{time_string}</div>
                            <div className="overlay_col_coord">{pos_x}</div>
                            <div className="overlay_col_coord">{pos_y}</div>
                            <div className="overlay_col_coord">{pos_z}</div>
                    </div>
                </>
            ) ;
        }

    }


class Orbit_Data extends React.Component
    {
    constructor (props)
        {
        super (props) ;
        }

    render ()
        {
        let data_available = 0 ;

        if  (this.props.display_id.length > 0)
            {
            if  (this.props.display_id [0].hasOwnProperty ('t'))
                {
                this.counter = 0 ;
                data_available = 1 ;
                }
            }
        
        return (
            <>
                <div className="right_overlay">
                    {data_available && this.props.display_id [0].t.map ((time, index) =>
                        <Orbit_Data_Row time={time} key={index} row={index} sc={this.props.display_id [0]} />
                        )}
                </div>
            </>
            ) ;
        }
    }
*/

class Obs_List extends React.Component
    {        

    use_small_footprint ()
        {
        return (V3DSpace.width < MIN_SCREEN_X * 1.6)? true : false
        }

    create_title ()
        {
        if  (! this.use_small_footprint ())
            {
            const row = <div className='right_overlay_row overlay_heading_font'>
                            <div className="overlay_col_color"></div>
                            <div className="overlay_col_name">Spacecraft</div>
                            <div className="overlay_col_coord">X</div>
                            <div className="overlay_col_coord">Y</div>
                            <div className="overlay_col_coord">Z</div>
                        </div> ;

            return row 
            }

        return null 
        }

    create_legend ()
        {
        if  (! this.use_small_footprint ())
            {
            const unit_str = unit_to_string (V3DSpace.unit)
            const coord_str = coord_system_to_key (V3DSpace.coord_system)
            const coord_ctr = V3DSpace.coord_center

            let text = `spacecraft positions in ${unit_str} in ${coord_str} coordinates` 
            let disc = null

            if  (coord_ctr)
                {
                disc = `PLEASE NOTE: positions are relative to ${coord_str} origin, not ${coord_ctr}`
                }

            const row = <div className='overlay_legend'>
                            <div>{text}</div>
                            {disc && <div>{disc}</div>}
                        </div> ;

            return row 
            }

        return null 
        }

    name_style (color)
        {
        if (this.use_small_footprint ()) 
            {
            return {textAlign: 'right', color: color, width: OVERLAY_NAME_FIELD_SZ}
            }
        else 
            {    
            return {textAlign: 'left', width: OVERLAY_NAME_FIELD_SZ}
            }
        }

    create_row (name, x, y, z, color)
        {
        const s = this.name_style (color)

        const row = (this.use_small_footprint ())?
            <>
                <div style={s}>{name}</div>
            </>
        :
            <>
                <div className="overlay_col_color">
                    <div className="color_swatch" style={{backgroundColor: color}} ></div>
                </div>
                <div style={s}>{name}</div>
                <div className="overlay_col_coord">{x}</div>
                <div className="overlay_col_coord">{y}</div>
                <div className="overlay_col_coord">{z}</div>
            </>

        return row
        }

    render ()
        {
        let display = null 

        if  (this.props.visible && V3DSpace.sc_pos_list.length > 0)
            {
            display = 
                <div className="right_overlay">
                    {this.create_title ()}
                    {V3DSpace.sc_pos_list.map (s =>
                        <div key={s.name} 
                            className="right_overlay_row overlay_row_font"
                            onClick={() => {V3DSpace.set_focus (s.id)}}
                            >
                            {this.create_row (s.name, s.x, s.y, s.z, s.color)}
                        </div>
                        )}
                    {this.create_legend ()}
                </div> ;
            }

        return (display) ;
        }
    }

class Time_Manager extends React.Component
    {
    // State Variables--
    // time:  current time in moments.
    // state [running/paused]
    // position (reported from position slider) 
    //     -- normalized to between 1 (BOT) and 100 (EOT)
    //     -- 0 indicates no specific position 
    //     -- slider should be disabled when running
    // loop [true/false]  -- independent of position??
    // rate:  number of display time seconds per real seconds
    //      -- default is 7200  (2 hours / sec)


    // 
    // Props--
    // start_time: start of track
    // end_time: end of track
    // scene: handle to THREE.js scene
    // 
    
    // What we have to do here:
    //      Receive frame update notifications.
    //      
    constructor (props)
        {
        super (props) ;

        this.state = {
            // time: this.props.start_time, // 0.0 (set to start time for testing),
            paused: true,
            position: 1,
            loop: true,                                     // false, (set to true for testing)
            rate: PB_SPEED [DEFAULT_RATE_SELECT].rate,      // simulation seconds per realtime second
            rate_select: DEFAULT_RATE_SELECT,               //  current selection index from rate menu
            transport_bar_visible: false,
            pos: 0,
            time_string: epoch_to_date_time (V3DSpace.time, true),
            }

        this.handle_loop_change = this.handle_loop_change.bind (this) 
        this.handle_mouse_enter_pad = this.handle_mouse_enter_pad.bind (this) 
        this.handle_mouse_leave_pad = this.handle_mouse_leave_pad.bind (this) 
        this.componentDidMount = this.componentDidMount.bind (this)
        this.update_slider_pos = this.update_slider_pos.bind (this)
        this.select_rate = this.select_rate.bind (this) 
        }

    /*
    time_from_slider_position (pos)
        {
        const slider_range = this.props.slider_width - 1
        const time_range = this.props.end_time - this.props.start_time

        return ((pos - 1) / slider_range) * (time_range) + this.props.start_time 

        }

    slider_position_from_time (time)
        {
        const slider_range = this.props.slider_width - 1
        const time_range = this.props.end_time - this.props.start_time

        return  Math.round (slider_range * (time - this.props.start_time) / time_range) + 1
        }
    */

    /*

    update_time (delta)
        {
        // delta is the amount of time to animate over.

        // Check for Pause
        if  (this.state.paused)
            {
            let update_flag = false

            // Check that each spacecraft is set to the correct location for the
            // current slider position.  If any are not, then update them.
            for (let i = 0 ; i < this.props.observatories.length ; i++)
                {
                if  (this.state.position !== this.props.observatories [i].position)
                    {
                    this.props.update_sc_pos (
                                        this.props.observatories [i], 
                                        this.props.time, 
                                        this.state.position ) ;

                    update_flag = true
                    }
                }

            // Also check that each planet is set to the correct location for the
            // current slider position.  If any are not, update them as well.
            for (let i = 0 ; i < this.props.planets.length ; i++)
                {
                if  (this.state.position !== this.props.planets [i].position)
                    {
                    this.props.update_sc_pos (
                                        this.props.planets [i], 
                                        this.props.time, 
                                        this.state.position,
                                        1 ) ;
                    }
                }

            // Update the Spacecraft Position List if needeed.
            if  (update_flag) this.props.update_sc_pos_list ()
            }

        else
            {
            // Calculate the new time.
            // let new_time = this.state.time + (delta * this.state.rate) * 1000.0 ;
            let new_time = this.props.time + (delta * this.state.rate) * 1000.0 ;
            let pause_state = false ;

            if  (new_time > this.props.end_time)
                {

                if  (this.state.loop)
                    {
                    new_time = this.props.start_time ; 
                    }
                else
                    {
                    // Force time to end of time range
                    new_time = this.props.end_time ;

                    // Switch to paused state
                    pause_state = true ;  /// need to fix this !!!!
                    }
                }

            // Convert the time into a slider position and update the slider.
            //const new_pos = Math.round (SLIDER_RANGE * (new_time - this.props.start_time) / (this.props.end_time - this.props.start_time)) + SLIDER_LOW_VAL ;
            const new_pos = this.slider_position_from_time (new_time)


            // Update all spacecraft positions.
            for (let i = 0 ; i < this.props.observatories.length ; i++)
                {
                this.props.update_sc_pos ( this.props.observatories [i], new_time, new_pos ) ;
                }

            // Update all planet positions.
            for (let i = 0 ; i < this.props.planets.length ; i++)
                {
                this.props.update_sc_pos ( this.props.planets [i], new_time, new_pos, 1 ) ;
                }

            // Update the Spacecraft Position List
            this.props.update_sc_pos_list ()

            // Update time and position
            //
            //this.setState ({
            //    time: new_time,
            //   position: new_pos,
            //    }) ;
            this.setState ({position: new_pos, paused: pause_state}) ;

            this.props.update_master_time (new_time) ;
            }
        }

    */

    select_rate (p)
        {
        V3DSpace.speed (PB_SPEED [p.key].rate)
        
        this.setState ({rate_select: p.key, rate: PB_SPEED [p.key].rate})
        }

    handle_loop_change (checked)
        {
        V3DSpace.loop (checked)

        this.setState({loop: checked}) ;
        }

    handle_mouse_enter_pad ()
        {
        this.setState ({transport_bar_visible: true}) ;
        }

    handle_mouse_leave_pad (e)
        {
        this.setState ({transport_bar_visible: false}) ;
        }

    update_slider_pos ()
        {
        this.setState ({
            pos: typeof V3DSpace.slider_value === 'number' ? V3DSpace.slider_value : 0,
            time_string: epoch_to_date_time (V3DSpace.time, true), 
            })
        }
    
    componentDidMount ()
        {
        setInterval (this.update_slider_pos, 33)
        }

    /*
    handle_change (value) 
        {
        // Reset the time based on the current slider position
        const new_time = this.time_from_slider_position (value)

        //const new_time =    ((value - SLIDER_LOW_VAL) / SLIDER_RANGE) * 
        //                    (this.props.end_time - this.props.start_time) + 
        //                    this.props.start_time ;

        this.props.update_master_time (new_time) ;


        this.setState ({position: value,}) ;
        }
    */
        
    /*
    handle_animation_state ()
        {
        // decide if we should run or pause based on the last event
        const new_pause_state = ! this.state.paused ;
        
        if  (! new_pause_state)  
            {
            // Now running after being paused.  Reset the time based on the 
            // current slider position
            const new_time = this.time_from_slider_position (this.state.position)
            
            //const new_time =    ((this.state.position - SLIDER_LOW_VAL) / SLIDER_RANGE) * 
            //                    (this.props.end_time - this.props.start_time) + 
            //                    this.props.start_time ;

            // Update time and position
            
            //this.setState ({
            //    time: new_time,
            //    paused: new_pause_state,
            //    }) ;
            
            this.setState ({paused: new_pause_state,}) ;

            this.props.update_master_time (new_time) ;
            }

        else
            {
            // Otherwise we are pausing after running.  
            // Just update the pause state.
            this.setState ({paused: new_pause_state,}) ;
            }
        }
    */

    /*
    componentDidUpdate (prevProps, prevState)
        {
        if  (prevProps.start_time !== this.props.start_time ||
             prevProps.end_time !==  this.props.end_time)
            {
            // Start or end time has changed.  Update animation parameters.
            
            //this.setState ({
            //    time: this.props.start_time, // 0.0 (set to start time for testing),
            //    paused: true,
            //   position: 0,
            //    }) ;
            

            this.setState ({
                paused: true,
                position: 1,
                }) ;


            // Move time update from to top level component.

            return ;
            }
        }  
        */

    render ()
        {
        //const time_string = moment.utc(this.state.time).format('YYYY MMM DD HH:mm:ss') ;


        /*
        <Radio.Group    onChange={this.handle_animation_state}
                        value={this.state.paused? "pause" : "animate"}
                        buttonStyle="solid"
                        size="large"
                        >
            <Radio.Button 
                value="animate"
                style={{backgroundColor: "#C4C4C4", 
                        color: "#212121",
                        borderColor: "#D2D2D6"}}
                >
                    {<PlayCircleOutlined />}
                </Radio.Button>
            <Radio.Button 
                value="pause"
                style={{backgroundColor: "#C4C4C4", 
                        color: "#212121",
                        borderColor: "#D2D2D6"}}
                >
                    {<PauseCircleOutlined />}
            </Radio.Button>
        </Radio.Group>

        */

        // const time_string = moment.utc(V3DSpace.time).format('MMM DD YYYY HH:mm:ss') 
        // const time_string = "this is time" 
    
        let classes = ""
        //let effect = ""
        let time_display = null 

        /* Not used.  Now using themes.
        // Invert the text color if the background is light to make it more visible.
        if  (this.props.invert > 50)
            {
            effect = "VUI-btn-dark-mode "
            }
        */

        if  (this.props.block_transport_bar)
            {
            classes = "transport_bar hide_transport_bar"
            }

        else 
            {
            classes = (! this.state.transport_bar_visible && this.props.hide_time_control) ?
                    "pointer-events transport_bar hide_transport_bar" :
                    `pointer-events transport_bar show_transport_bar` ;

            time_display =                 
                <div className={`system_time`}>
                    {this.state.time_string}
                </div> ;
            }

        const include_time = V3DSpace.slider_width > 240
        const hide = V3DSpace.slider_width < 166

        const start_time = (hide)? "" : epoch_to_date_time (V3DSpace.start_time, include_time)
        const end_time = (hide)? "" : epoch_to_date_time (V3DSpace.end_time, include_time)

        const filter={filter: "invert(" + this.props.invert.toFixed() + "%)"}
        const animation_msg = (V3DSpace.pause_state) ? "Start" : "Pause" ;
        //const animation_icon = (V3DSpace.pause_state) ?
        //        <img src={play_icon} style={filter} className= "icon_image" alt="" />
        //        : <img src={pause_icon} style={filter} className= "icon_image" alt="" />
        const animation_icon = (V3DSpace.pause_state) ? play_icon : pause_icon

        const animation_help = (this.state.paused) ?
                "Start Spacecraft Animation Sequence."
            :   "Pause Spacecraft Animation Sequence."

        const items = [
            {
            label: "Speed: " + PB_SPEED [this.state.rate_select].label,
            key: 'SubMenu',
            popupOffset: [-10,20],
            children: speed_item_select,
            },]

        return (
            <>
                <Obs_List 
                    visible={this.props.show_sc_position}
                    />
                <div    className={classes}
                        onMouseEnter={this.handle_mouse_enter_pad}
                        onMouseLeave={this.handle_mouse_leave_pad}
                        >

                        <div className='transport_bar_row_1'>
                            <div style={{display: 'flex', 
                                        flexDirection: 'row',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center',}}
                                    >
                                <div style={{marginLeft: 20, width: '2rem'}}>
                                    {animation_msg}
                                </div>
                                <div style={{marginLeft: 5}}>
                                    <V_Tooltip    
                                        align="top-right" 
                                        anchor_point="bottom-left"
                                        offset="100px"
                                        background={TT_BGCOLOR}
                                        text= {animation_help}
                                        >
                                        <V_Button
                                            size="small"
                                            onClick={V3DSpace.toggle_pause_play} 
                                            image={animation_icon}
                                            shade={V3DSpace.icon_shade}
                                            alt="Animate Display"
                                            />
                                    </V_Tooltip>
                                </div>
                                <div style={{marginLeft: 20}}>
                                    Loop
                                </div>
                                <div style={{marginLeft: 5}}>                                    
                                    <V_Tooltip    
                                        align="top" 
                                        anchor_point="bottom"
                                        offset="80px"
                                        background={TT_BGCOLOR}
                                        text= "Enable/Disable Loop Play."
                                        >
                                        <Switch defaultChecked onChange={this.handle_loop_change} />
                                    </V_Tooltip>
                                </div>
                                <div style={{marginLeft: 20}}>
                                    <V_Tooltip    
                                            align="top" 
                                            anchor_point="bottom"
                                            offset="100px"
                                            background={TT_BGCOLOR}
                                            text= "Get help for time controls."
                                            >
                                            <V_Button
                                                size="medium"
                                                onClick={this.props.transport_bar_help} 
                                                image={help_icon}
                                                shade={V3DSpace.icon_shade}
                                                alt="Help"
                                                />
                                    </V_Tooltip>
                                </div>
                                <div style={{marginLeft: 20}}>
                                    <V_Tooltip    
                                        align="top-right" 
                                        anchor_point="bottom-right"
                                        offset="50px"
                                        background={TT_BGCOLOR}
                                        text= "Select animation speed."
                                        >
                                        <Menu 
                                            onSelect={this.select_rate}
                                            items={items} 
                                            theme="dark"
                                            triggerSubMenuAction="click"
                                            disabledOverflow="true"
                                            mode="horizontal"
                                            />  
                                    </V_Tooltip>      
                                </div>
                            </div>
                        </div>
                        <div className='transport_bar_row_2'>
                            <Slider
                                min={1}  
                                max={V3DSpace.slider_width}  
                                onChange={V3DSpace.slider_position}
                                tooltip={{open: false}}
                                value={this.state.pos}
                                styles={{ rail: {backgroundColor: '#c2bbd5'} }}
                                />
                        </div>
                        <div className='transport_bar_row_3'>
                            <span>{start_time}</span>
                            <span style={{minWidth: 100, flex: 1}}></span>
                            <span>{end_time}</span>
                        </div>
                    </div>
                {time_display}
            </>
            ) ;
        }
    }

//class Orbit_Display extends React.PureComponent 
//   {
//    constructor (props)
//        {
//        super (props) ;

//        this.state =  {
            //scene: new THREE.Scene(),
//            }


        // this.scene = new THREE.Scene(); // create the scene
        // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        //  this.camera.position.set(10, 5, 20);
        //this.camera = new THREE.PerspectiveCamera(VFOV, INITIAL_ASPECT_RATIO, NEAR_PLANE, FAR_PLANE);
        //this.camera = new THREE.OrthographicCamera();
        //this.camera.near = NEAR_PLANE ;
        //this.camera.far = FAR_PLANE_ORTHO ;
        //this.camera.right = INITIAL_RIGHT_PLANE ;
        //this.camera.left = INITIAL_LEFT_PLANE ;
        //this.camera.top = INITIAL_TOP_PLANE ;
        //this.camera.bottom = INITIAL_BOT_PLANE ;
        /*
        this.persp_camera = new THREE.PerspectiveCamera ()  
        this.ortho_camera = new THREE.OrthographicCamera () 
        this.aspect_ratio = INITIAL_ASPECT_RATIO

        //this.ortho_camera.add (this.persp_camera) ;

        //this.camera.position.z = 400;
        if  (this.props.camera_type === ORTHO_CAMERA)
            {
            this.ortho_camera.position.set (ORTHO_TARGET_DIST, 0, 0)   
            this.ortho_camera.zoom = ORTHO_TARGET_DIST / 5
            this.camera = this.ortho_camera ;
            }

        else
            {
            this.persp_camera.position.set (5, 0, 0)     
            this.camera = this.persp_camera ;
            }

        this.update_camera_view (this.aspect_ratio) ;

        //this.renderer = new THREE.WebGLRenderer({ 
        //    antialias: true, 
        //    alpha: true,
        //    preserveDrawingBuffer: true
        //    })
            
        //this.renderer.setClearColor('#000000', 0) ;
        //renderer = new THREE.WebGLRenderer( { alpha: true } ); // init like this
        //renderer.setClearColor( 0xffffff, 0 ); // second param is opacity, 0 => transparent

        // this.renderer = new THREE.WebGLRenderer({canvas: document.querySelector("canvas")});
        //let ah = new THREE.AxesHelper (2); // add axis to the scene

        //reset axes colors
        //const colors = ah.geometry.attributes.color;
        //const array = colors.array;

        //this.axis = ah ;

        this.alight = new THREE.AmbientLight (0x999999, .7) ;
        this.slight = new THREE.DirectionalLight (0xcccccc, 1.2, 0., 0) ;

        //this.scene.add (this.axis);
        //this.scene.add(this.alight);
        const sun_pos_ws = GSE_to_WS (new THREE.Vector3 (AU, 0, 0)) ;
        this.slight.position.copy (sun_pos_ws);
        assets.scene.add (this.alight);
        assets.scene.add (this.slight);
        // this.camera.rotateX (MathUtils.degToRad (-90)) ;

        this.camera.lookAt(assets.scene.position) ;


        this.clock = new Clock () ;
        */

        //this.create_earth = this.create_earth.bind (this) ;
        //this.componentDidMount = this.componentDidMount.bind (this) ;
        //this.componentWillUnmount = this.componentWillUnmount.bind (this) ;
        //this.start = this.start.bind (this) ;
        //this.stop = this.stop.bind (this) ;
        //this.animate = this.animate.bind (this) ;
        //this.render_scene = this.render_scene.bind (this) ;
        //this.resize_canvas = this.resize_canvas.bind (this) ;
        //this.create_orhto_camera = this.create_ortho_camera.bind (this) ;
        //this.create_persp_camera = this.create_persp_camera.bind (this) ;
        //this.update_camera_view = this.update_camera_view.bind (this) ;
        //this.switch_camera = this.switch_camera.bind (this) ; 
        //this.componentDidUpdate = this.componentDidUpdate.bind (this) ;
        //}

    /*
    switch_camera ()
        {
        // Update the view parameters for each camera.
        // this.update_camera_view (aspect_ratio)

        const target = this.controls.target.clone () ;

        // Get the distance from the camera to the target.  If we are using 
        let dist_to_target = (this.controls)? this.camera.position.distanceTo (target) : ORTHO_TARGET_DIST
        
        if  (this.camera.isOrthographicCamera)
            {
            dist_to_target = dist_to_target / this.camera.zoom
            }

        console.log ('     distance to target', dist_to_target.toFixed (2))
        console.log ("     target pos", target.x.toFixed (2), target.y.toFixed (2), target.z.toFixed (2))

        // Get rid of the Orbit Controls object. 
        this.controls.dispose () ;

        const direction = new THREE.Vector3 ().subVectors(this.camera.position, target).normalize ()

        if  (this.props.camera_type === PERSP_CAMERA)
            {            
            this.persp_camera.position.addVectors (target, direction.multiplyScalar (dist_to_target))
            this.camera = this.persp_camera ;
            }
        else
            {
            // this.controls = new OrbitControls (this.ortho_camera, this.props.vs.current)

            this.ortho_camera.position.addVectors (target, direction.multiplyScalar (ORTHO_TARGET_DIST))
            this.ortho_camera.zoom = ORTHO_TARGET_DIST / dist_to_target
            this.ortho_camera.updateProjectionMatrix ()
            this.camera =  this.ortho_camera ;
            }

        console.log ("     new camera pos", this.camera.position.x.toFixed (2), this.camera.position.y.toFixed (2), this.camera.position.z.toFixed (2))
        console.log ("     isOrthographicCamera = ", this.camera.isOrthographicCamera)

        this.camera.lookAt (target) 
        this.controls = new my_orbital_controls (this.camera, this.props.vs.current, this.props.orb_list)
        this.controls.target.copy (target)
        this.controls.update ()

             
        //this.props.store_scene_ref (this.scene) ;
        this.props.store_camera_ref (this.camera) ;
        this.props.store_controls_ref (this.controls) ;    
        }

    update_camera_view (aspect_ratio)
        {        
        // Note:  Only use this when the aspect ratio changes !!! 
        //const horz_FOV = 2 * Math.atan (Math.tan (VFOV / 2) * aspect_ratio)

        // Calculate parameters for orthogonal camera
        const far_plane = FAR_PLANE_PERSP ;

        const frustum_height = 2 * ORTHO_TARGET_DIST * Math.tan (VFOV * 0.5 * (Math.PI / 180))
        // const frustum_height = 2.0 * far_plane * Math.tan (VFOV * 0.5 * (Math.PI / 180)) ;
        const frustum_width = frustum_height * aspect_ratio ;

        console.log ('     Frustum Height:  ', frustum_height.toFixed (2))
        console.log ('     Frustum Width:  ', frustum_width.toFixed (2))

        this.ortho_camera.left = (frustum_width / -2) ;
        this.ortho_camera.right = (frustum_width / 2) ;
        this.ortho_camera.top = (frustum_height / 2)  ;
        this.ortho_camera.bottom = (frustum_height / -2)  ;
        this.ortho_camera.near = NEAR_PLANE ;
        this.ortho_camera.far = far_plane ;

        // Calculate parameters for perspective camera
        this.persp_camera.far = FAR_PLANE_PERSP ;
        this.persp_camera.near = NEAR_PLANE ;
        this.persp_camera.aspect = aspect_ratio ;
        this.persp_camera.fov = VFOV ;
        
        this.ortho_camera.updateProjectionMatrix () ;
        this.persp_camera.updateProjectionMatrix () ;
        }


    resize_canvas () 
        {
        const display = 1

        if  (display) 
            {
            const width =  window.innerWidth
            const height = window.innerHeight
            this.aspect_ratio = width / height

            // alert (width)

            // Pass this info up to parent
            this.props.update_screen_size (width, height) ;

            // For Perspective Camera
            // this.camera.aspect = aspect_ratio ;

            // For Orthographic Camera 
            //const frustum_height = 2.0 * FAR_PLANE_ORTHO * Math.tan (VFOV * 0.5 * (Math.PI / 180)) ;
            //const frustum_width = frustum_height * aspect_ratio ;
            //this.camera.left = (frustum_width / -2) ;
            //this.camera.right = (frustum_width / 2) ;
            //this.camera.top = (frustum_height / 2)  ;
            //this.camera.bottom = (frustum_height / -2)  ;

            this.update_camera_view (this.aspect_ratio) ;
          

            // this.camera.updateProjectionMatrix();

            console.log ("width = " + width + " height = " + height)

            this.renderer.setSize (width, height, false)  
            }
        }

    startup () 
        {
        //const geometry = new THREE.SphereGeometry (1, 32, 32) ;

        //const loadManager = new THREE.LoadingManager() ;
        //const loader = new THREE.TextureLoader (loadManager) ;
        
        //const materials       = new THREE.MeshPhongMaterial () ;

        //materials.map           = loader.load (earth_diffuse);
        //materials.bumpMap       = loader.load (earth_bump);
        //materials.specularMap   = loader.load (earth_spec) ;
        //materials.bumpScale     = 0.05 ;

        //this.earth = new THREE.Mesh (geometry, materials) ;
        
        //loadManager.onLoad = () => 
        //        {
        //        //this.earth = new THREE.Mesh (geometry, materials) ;
        //        this.scene.add (this.earth) ;

                this.start () ;

                this.controls = new my_orbital_controls (this.camera, this.props.vs.current, this.props.orb_list);

                this.props.store_camera_ref (this.camera) ;
                this.props.store_controls_ref (this.controls) ;        
       //         }
        }
    

    componentDidMount () 
        {
        // use ref as a mount point of the Three.js scene instead of the document.body 
        // this.mount.appendChild( this.renderer.domElement );
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: true,
            canvas: this.props.vs.current,
            })

        this.renderer.setClearColor('#000000', 0) ;

        this.resize_canvas () ;
        this.startup () ;

        window.addEventListener('resize', this.resize_canvas) ;
        }

    componentWillUnmount() 
        {
        this.stop () ;
        //this.mount.removeChild (this.renderer.domElement) ;
        }
        
    componentDidUpdate (prevProps)
        {
        if  (prevProps.camera_type !== this.props.camera_type)
            {
            console.log ("Prev Camera: ", prevProps.camera_type, " new camera ", this.props.camera_type)
            this.switch_camera (this.aspect_ratio) 
            }
        }

    start() 
        {
        if  (!this.frameId) 
            {
//            this.props
            this.frameId = requestAnimationFrame (this.animate) ;
            }
        }
        
    stop() 
        {
        cancelAnimationFrame (this.frameId) ;
        }
        
    animate () 
        {
        const delta = this.clock.getDelta ();

        //const earth = this.scene.getObjectByName ("earth") ;
        
        //if  (earth)
        //    {
            //earth.rotation.y += (.000072921) * 15  ;
            // earth.rotateY ((.000072921) * 15)  ;
        //    }

        this.props.update_time (delta) ; 
        this.props.inc_orbit_direct_shade (666 * delta)


        //const pos = this.camera.getWorldPosition ()

        //console.log ("*",  pos.x.toFixed (1), pos.y.toFixed (1), pos.z.toFixed (1))

        //if  (this.props.focus)
        //    {
        //    let mobile = this.scene.getObjectByName ( "mob_" + this.props.focus ) ;

        //    this.camera.position.x = mobile.position.x ;
        //    this.camera.position.y = mobile.position.y ;
        //    this.camera.position.z = mobile.position.z + .02 ;

        //    this.camera.lookAt (mobile.position) ;
        //    }

        this.controls.update () ;
        // console.log ("      ** camera pos", this.camera.position.x.toFixed (2), this.camera.position.y.toFixed (2), this.camera.position.z.toFixed (2))
        // console.log ("      ** target pos", this.controls.target.x.toFixed (2), this.controls.target.y.toFixed (2), this.controls.target.z.toFixed (2))
        
        this.render_scene () ;
        this.frameId = window.requestAnimationFrame (this.animate) ;
        }
        
    render_scene () 
        this.renderer.render (assets.scene, this.camera) ;
        /*
        //if  (this.props.camera_type === ORTHO_CAMERA)
        //    {
        //    this.renderer.render (this.scene, this.ortho_camera)
        //    }
        //else
        //    {
        //    this.renderer.render (this.scene, this.persp_camera)
        //    }
 
        }
    */
   /*   
    render () 
        {
        //  <div className = "orbit" ref={ref => (this.mount = ref)} />
        return (
            <>
                <Earth 
                        bs_visible={this.props.bs_visible}
                        magneto_visible={this.props.magneto_visible}
                        />

            </>
            ) ;
        }
    }
    */
    export default Display_Manager ;