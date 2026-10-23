import React from 'react' ;
import { Slider } from 'antd'
import { Switch } from 'antd'
import { Menu } from 'antd'
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx';
import * as THREE from "three";
import play_icon from './images/play_icon.png'
import pause_icon from './images/pause_icon.png'
import help_icon from './images/help_icon.png' ;
import { TT_BGCOLOR } from './constants.js'
import Icon_Bar  from './icon_bar.jsx'
import Target_Bar from './target_bar.jsx'
import Function_Bar from './function_bar.jsx'
import Camera_Align from './camera_align.jsx'

import { coord_system_to_key } from './Orbit'
import { unit_to_string } from './Orbit.js'

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


    display_orbit_data (orbit_data, sc = true)
        {
        if  (sc)
            {

            // Add observatory ID to the list of orbits
            this.props.orb_list.push (orbit_data.id)
            }
        else
            {
            this.create_planet (orbit_data) ;

            // Add planet ID to the list of planets
            this.planet_list = [...this.planet_list, orbit_data.id] ;
            }
        }

    update_frame ()
        {
        // frame is the center of a fixed coordiate system. it is set in Manager
        // currently only Earth is implementmented

        // Eventually we will add the logic for switching between different frames here
        // But since we only one frame here, for the moment this won't be used.
        const frame = (this.props.frame)? this.props.frame : this.state.frame_target 

        V3DSpace.update_frame (frame)

        this.setState ({frame_target: frame,}) ; 

        }

    componentDidUpdate (prevProps, prevState)
        {
        const time_change = 
            this.state.start_time !== this.props.start_time || 
            this.state.end_time !==  this.props.end_time

        // Check for update.
        if  (this.props.update && ! prevProps.update)
            {
            // Create a list spacecraft ids from the list of selected spacecraft. 
            // Only updated by add_orbit/remove_orbit in manager.  

            if  (time_change) this.planet_list = [] 


            // If there no spacecraft listed in the display_id prop
            // then remove all displayed orbits.
            if  (time_change)
                {
                // Clear the orbit display list

                if  (time_change) 
                    {
                    // Clear the planet display list
                    this.planet_list.length = 0


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
            }

        return ;
        }

    
    render ()
        {
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
                        visible={! this.props.block_transport_bar}
                        />

                    <Function_Bar 
                        disable_field_boundaries = {this.props.disable_field_boundaries}
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

            let text = `Spacecraft positions in ${unit_str} in ${coord_str} coordinates` 
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

    render ()
        {    
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

    export default Display_Manager ;