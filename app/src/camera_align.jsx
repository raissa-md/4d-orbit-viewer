import React from 'react'
import { V_Button } from './UI.jsx'
import { V_Dropdown } from './UI.jsx'
import { V_Tooltip } from './UI.jsx'
import { Dropdown } from 'antd'

import x_axis_icon from './images/x_axis_icon.png' 
import y_axis_icon from './images/y_axis_icon.png' 
import z_axis_icon from './images/z_axis_icon.png' 

import alt_x_axis_icon from './images/alt_x_axis_icon.png' 
import alt_y_axis_icon from './images/alt_y_axis_icon.png' 
import alt_z_axis_icon from './images/alt_z_axis_icon.png' 

import plus_x_icon from './images/plus_x.png' 
import minus_x_icon from './images/minus_x.png' 
import plus_y_icon from './images/plus_y.png' 
import minus_y_icon from './images/minus_y.png' 
import plus_z_icon from './images/plus_z.png' 
import minus_z_icon from './images/minus_z.png' 


import { TOP_BUTTON_STYLE } from './constants.js'
import { TT_BGCOLOR } from './constants.js'

import { V3DSpace } from './App'

const DBL_CLICK_TIME = 350
const TT_OPEN_DELAY = 100

const BUTTONS = {
    X: 1 << 0,      // X align button is active
    Y: 1 << 1,      // Y align button is active
    Z: 1 << 2,      // Z align button is active
    }  ;

class Camera_Align extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
            dropdown_open: 0,
            x_click_timeout: null,
            y_click_timeout: null,
            z_click_timeout: null,
            x_icon: x_axis_icon,
            y_icon: y_axis_icon,
            z_icon: z_axis_icon,
            hover_a: false,
            hover_b: false,
            label: V3DSpace.target_label,
            }

        this._last_click_time = 0

        const handle_off_axis = () => 
            {
            this.setState ({
                x_icon: x_axis_icon,
                y_icon: y_axis_icon, 
                z_icon: z_axis_icon, 
                })    
            }

        document.addEventListener ('off_axis', handle_off_axis)
        document.addEventListener ('focus_change', (e) => {
            this.setState ({label: V3DSpace.target_label})
            })
         
        this.sng_click_x = this.sng_click_x.bind (this)
        this.dbl_click_x = this.dbl_click_x.bind (this)
        this.handle_context_menu_change = this.handle_context_menu_change.bind (this)
        this.set_viewaxis_x = this.set_viewaxis_x.bind (this) 
        this.sng_click_y = this.sng_click_y.bind (this)
        this.dbl_click_y = this.dbl_click_y.bind (this)
        this.set_viewaxis_y = this.set_viewaxis_y.bind (this) 
        this.sng_click_z = this.sng_click_z.bind (this)
        this.dbl_click_z = this.dbl_click_z.bind (this)
        this.set_viewaxis_z = this.set_viewaxis_z.bind (this) 
        }

    sng_click_x ()
        {
        V3DSpace.set_axis ("X", false)
            
        this.setState ({
            x_click_timeout: null, 
            x_icon: x_axis_icon, 
            y_icon: y_axis_icon, 
            z_icon: z_axis_icon, 
            })
        }

    dbl_click_x ()
        {
        V3DSpace.set_axis ("X", true)

        this.setState ({x_click_timeout: null, 
            x_icon: alt_x_axis_icon,
            y_icon: y_axis_icon,
            z_icon: z_axis_icon, 
            })                 
        }

    set_viewaxis_x (e)
        {    
        // Check for the existence of the timer.  If we have have already started
        // the timer, than this is a doubleclick.  Otherwise, it just a solitary 
        // click which may -or may not- be followed by another.
        if  (this.state.x_click_timeout)
            {
            clearTimeout (this.state.x_click_timeout)

            this.dbl_click_x ()
            }

        else 
            {
            // Check if a right mouse button click generated this event.
            // Don't do anything in this case.
            if  (e.which === 3 || e.button === 2)
                {
                //alert ('blah')
                return
                }

            // Check for double clicks
            if  (e.altKey)
                {
                this.dbl_click_x ()

                return
                }

            const handle = setTimeout (() => {
                // Handle single-click logic here
                this.sng_click_x ()
                }, 
                DBL_CLICK_TIME)
    
            this.setState ({x_click_timeout: handle})
            }
        }

    sng_click_y ()
        {
        V3DSpace.set_axis ("Y", false)
            
        this.setState ({
            y_click_timeout: null, 
            x_icon: x_axis_icon, 
            y_icon: y_axis_icon, 
            z_icon: z_axis_icon, 
            })
        }

    dbl_click_y ()
        {
        V3DSpace.set_axis ("Y", true)

        this.setState ({y_click_timeout: null, 
            x_icon: x_axis_icon,
            y_icon: alt_y_axis_icon,
            z_icon: z_axis_icon, 
            })                
        }

    set_viewaxis_y (e)
        {
        // Check for the existence of the timer.  If we have have already started
        // the timer, than this is a doubleclick.  Otherwise, it just a solitary 
        // click which may -or may not- be followed by another.
        if  (this.state.y_click_timeout)
            {
            clearTimeout (this.state.y_click_timeout)

            this.dbl_click_y ()
            }

        else 
            {
            if  (e.altKey)
                {
                this.dbl_click_y ()

                return
                }
    
            const handle = setTimeout (() => {
                // Handle single-click logic here
                this.sng_click_y ()
                }, 
                DBL_CLICK_TIME)
    
            this.setState ({y_click_timeout: handle})
            }
        }

    sng_click_z ()
        {
        V3DSpace.set_axis ("Z", false)
            
        this.setState ({
            z_click_timeout: null, 
            x_icon: x_axis_icon, 
            y_icon: y_axis_icon, 
            z_icon: z_axis_icon, 
            })
        }
        
    dbl_click_z ()
        {
        V3DSpace.set_axis ("Z", true)

        this.setState ({z_click_timeout: null,  
            x_icon: x_axis_icon,
            y_icon: y_axis_icon,
            z_icon: alt_z_axis_icon, 
            })                        
        }


    set_viewaxis_z (e)
        {
        // Check for the existence of the timer.  If we have have already started
        // the timer, than this is a doubleclick.  Otherwise, it just a solitary 
        // click which may -or may not- be followed by another.
        if  (this.state.z_click_timeout)
            {
            clearTimeout (this.state.z_click_timeout)

            this.dbl_click_z ()
            }

        else 
            {
            if  (e.altKey)
                {
                this.dbl_click_z ()

                return
                }
    
            const handle = setTimeout (() => {
                // Handle single-click logic here
                this.sng_click_z ()
                }, 
                DBL_CLICK_TIME)
    
            this.setState ({z_click_timeout: handle})
            }
        }


    handle_context_menu_change (open, name, info)
        {
        if  (open)
            {
            switch (name)
                {
                case 'x_align_menu': 
                    this.setState ({dropdown_open: BUTTONS.X})
                    return
                case 'y_align_menu':
                    this.setState ({dropdown_open: BUTTONS.Y})
                    return
                case 'z_align_menu':
                    this.setState ({dropdown_open: BUTTONS.Z})
                    return
                default:    
                    this.setState ({dropdown_open: 0})
                    return
                }
            }

        this.setState ({dropdown_open: 0})
        }


    render ()
        {    
        const context_menu_button_a = {
            border: "none",
            filter: this.state.hover_a ? 'brightness(3.5)' : '', 
            transform: this.state.hover_a ? 'scale(1.5)' : '',
            }
        
        const context_menu_button_b = {
            border: "none",
            filter: this.state.hover_b ? 'brightness(3.5)' : '', 
            transform: this.state.hover_b ? 'scale(1.5)' : '',
            }
                
        const label = (this.state.dropdown_open)? "" :  this.state.label

        const dropdown_open = this.state.dropdown_open

        const items_x =  
            <>
                <V_Button
                    size="small"
                    onClick={this.sng_click_x} 
                    onMouseEnter={() => this.setState ({hover_a: true})}
                    onMouseLeave={() => this.setState ({hover_a: false})}
                    style={context_menu_button_a}
                    image={plus_x_icon}
                    data-dropdown-item
                    alt="show X-axis camera align button"
                    />
                <V_Button
                    size="small"
                    onClick={this.dbl_click_x} 
                    onMouseEnter={() => this.setState ({hover_b: true})}
                    onMouseLeave={() => this.setState ({hover_b: false})}
                    style={context_menu_button_b}
                    image={minus_x_icon}
                    data-dropdown-item
                    alt="show reversed X-axis camera align button"
                    />
                </> ;

        const items_y =  
            <>
                <V_Button
                    size="small"
                    onClick={this.sng_click_y} 
                    onMouseEnter={() => this.setState ({hover_a: true})}
                    onMouseLeave={() => this.setState ({hover_a: false})}
                    style={context_menu_button_a}
                    image={plus_y_icon}
                    data-dropdown-item
                    alt="show Y-axis camera align button"
                    />
                <V_Button
                    size="small"
                    onClick={this.dbl_click_y} 
                    onMouseEnter={() => this.setState ({hover_b: true})}
                    onMouseLeave={() => this.setState ({hover_b: false})}
                    style={context_menu_button_b}
                    image={minus_y_icon}
                    data-dropdown-item
                    alt="show reversed Y-axis camera align button"
                    />
            </> ;

        const items_z =  
            <>                    
                <V_Button
                    size="small"
                    onClick={this.sng_click_z} 
                    onMouseEnter={() => this.setState ({hover_a: true})}
                    onMouseLeave={() => this.setState ({hover_a: false})}
                    style={context_menu_button_a}
                    image={plus_z_icon}
                    data-dropdown-item
                    alt="show Z-axis camera align button"
                    />
                <V_Button
                    size="small"
                    onClick={this.dbl_click_z} 
                    onMouseEnter={() => this.setState ({hover_b: true})}
                    onMouseLeave={() => this.setState ({hover_b: false})}
                    style={context_menu_button_b}
                    image={minus_z_icon}
                    data-dropdown-item
                    alt="show reversed Z-axis camera align button"
                    />
            </>;


        const x_button =                    
            <V_Button
               size="small"
                onClick={this.set_viewaxis_x}
                style={TOP_BUTTON_STYLE}
                image={this.state.x_icon}
                alt="show X-axis camera align button"
                />            

        const x_align_button =
             
            <V_Tooltip    
                align="bottom"
                offset="10px"
                active = {dropdown_open === 0}
                background={TT_BGCOLOR}
                text={`Align view to the X axis. Double-click or use 
                        the 'Alt' key to align view to the -X axis. Use the right
                        mouse button to bring up a context sensitive menu.`}
                >
                <V_Dropdown 
                    trigger="contextmenu"
                    name="x_align_menu"
                    align='bottom'
                    offset='20px'
                    padding='0'
                    background="transparent"
                    border="none"
                    gap="0"
                    close_on_select={true}
                    visible={dropdown_open === BUTTONS.X}
                    onOpenChange={this.handle_context_menu_change}
                    dropdown={items_x}
                    anchor={()=>{return (x_button)}}
                    />
            </V_Tooltip> ;

        const y_button =
            <V_Button
                size="small"
                onClick={this.set_viewaxis_y} 
                style={TOP_BUTTON_STYLE}
                image={this.state.y_icon}
                alt="show Y-axis camera align button"
                />

        const y_align_button =
            <V_Tooltip    
                align="bottom" 
                offset="10px"
                active = {dropdown_open === 0}
                background={TT_BGCOLOR}
                text={`Align view to the Y axis. Double-click or use 
                        the 'Alt' key to align view to the -Y axis. Use the right
                        mouse button to bring up a context sensitive menu.`}
                >
                <V_Dropdown 
                    trigger="contextmenu"
                    name="y_align_menu"
                    align='bottom'
                    offset='20px'
                    padding='0'
                    background="transparent"
                    border="none"
                    gap="0"
                    visible={dropdown_open === BUTTONS.Y}
                    onOpenChange={this.handle_context_menu_change}
                    dropdown={items_y}
                    anchor={()=>{return (y_button)}}
                    />
             </V_Tooltip> ;

        const z_button =
            <V_Button
                size="small"
                onClick={this.set_viewaxis_z} 
                style={TOP_BUTTON_STYLE}
                image={this.state.z_icon}
                alt="show Z-axis camera align button"
                />
    
        const z_align_button =
            <V_Tooltip    
                align="bottom" 
                offset="10px"
                active = {dropdown_open === 0}
                background={TT_BGCOLOR}
                text={`Align view to the Z axis. Double-click or use 
                        the 'Alt' key to align view to the -Z axis. Use the right
                        mouse button to bring up a context sensitive menu.`}
                >
                <V_Dropdown 
                    dropdown={items_z}
                    name="z_align_menu"
                    align='bottom'
                    trigger="contextmenu"
                    offset='20px'
                    padding='0'
                    background="transparent"
                    border="none"
                    gap="0"
                    visible={dropdown_open === BUTTONS.Z}
                    onOpenChange={this.handle_context_menu_change}
                    anchor={()=>{return (z_button)}} 
                    />
             </V_Tooltip> ;

        return (
            <div className="center_controls">
                <div className="camera_align_controls">
                    {x_align_button}
                    {y_align_button}
                    {z_align_button}
                </div>
                <div className={`target_label`}>
                    {label}
                </div>
            </div>


            ) ;
        }
    }

    export default Camera_Align