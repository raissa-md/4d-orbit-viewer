import React from 'react'
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx'
import { V_Dropdown } from './UI.jsx'

import x_grid_icon from './images/x_grid_icon.png' 
import y_grid_icon from './images/y_grid_icon.png' 
import z_grid_icon from './images/z_grid_icon.png' 
import magneto_icon from './images/magneto_icon.png' 
import bowshock_icon from './images/bowshock_icon.png' 
import orthogonal_icon from './images/orthogonal_icon.png' 
import perspective_icon from './images/perspective_icon.png' 
import ambient_on_icon from './images/ambient_light_on.png'
import ambient_off_icon from './images/ambient_light_off.png'
import terminator_icon from './images/terminator_icon.png'
import wireframe_icon from './images/wf_view_icon.png'
import solid_icon from './images/solid_view_icon.png'
import options_dlg_icon from './images/options_dlg_icon.png'

import { PERSP_CAMERA } from './Orbit_Display'
import { ORTHO_CAMERA } from './Orbit_Display' 
import { MHD_Events } from './MHDpause.js'
import { SIDE_BUTTON_STYLE } from './constants.js'
import { TT_BGCOLOR } from './constants.js'

import { V3DSpace } from './App.jsx'

const TT_OPEN_DELAY = 100

class Function_Bar extends React.Component
    {
    constructor (props)
        {
        super (props) 

        this.state = {
            mag_obj_name: '',  // This should be static, so maybe move it out of state?
            bs_obj_name: '',   // This should be static, so maybe move it out of state?
            magneto_visible: false,
            bs_visible: false,
            mag_menu_open: false,
            bs_menu_open: false,
            mag_wf: false,
            bs_wf: false,
            hover_a: false,
            hover_b: false,
            show_bs_tooltip: false,
            show_mag_tooltip: false,
            xz_grid: V3DSpace.xz_grid_visible (),
            yz_grid: V3DSpace.yz_grid_visible (),
            xy_grid: V3DSpace.xy_grid_visible (),
            ambient_light: V3DSpace.ambient,
            terminator_visible: V3DSpace.terminator_line,
            }

        this.process_mhd_events = this.process_mhd_events.bind(this)
        this.toggle_ambient_light = this.toggle_ambient_light.bind (this)
        this.toggle_terminator_line = this.toggle_terminator_line.bind (this)
        this.toggle_bowshock = this.toggle_bowshock.bind (this)
        this.toggle_magnetopause = this.toggle_magnetopause.bind (this)
        this.toggle_xz_grid = this.toggle_xz_grid.bind (this)
        this.toggle_yz_grid = this.toggle_yz_grid.bind (this)
        this.toggle_xy_grid = this.toggle_xy_grid.bind (this)
        this.show_bs_context_menu = this.show_bs_context_menu.bind (this)
        this.show_mag_context_menu = this.show_mag_context_menu.bind (this)
        this.bs_mouse_over = this.bs_mouse_over.bind (this)
        this.bs_mouse_leave = this.bs_mouse_leave.bind (this)
        this.mag_mouse_over = this.mag_mouse_over.bind (this)
        this.mag_mouse_leave = this.mag_mouse_leave.bind (this)
        this.click_outside = this.click_outside.bind (this)
        this.componentDidMount = this.componentDidMount.bind(this)
        }

    process_mhd_events (detail)
        {
        const name = detail.name    // name of the originating filed display object

        switch (detail.event)
            {
            case MHD_Events.WF_VIEW_CHANGE:

                if  (name === this.state.mag_obj_name) this.setState ({mag_wf: detail.wf})
                    
                if  (name === this.state.bs_obj_name)  this.setState ({bs_wf: detail.wf})

                return
                    
            default:

                // Do nothing for unhandled events
                return
            }
        }

    toggle_magnetopause ()
        {
        const visible = ! this.state.magneto_visible

        V3DSpace.set_magnetopause_visible (visible)

        this.setState ({magneto_visible: visible}) 
        }

    toggle_bowshock ()
        {
        const visible = ! this.state.bs_visible

        V3DSpace.set_bowshock_visible (visible)

        this.setState ({bs_visible: visible}) 
        }

    toggle_xz_grid ()
        {
        V3DSpace.toggle_xz_grid_visible ()

        this.setState ({xz_grid: V3DSpace.xz_grid_visible ()})
        }

    toggle_yz_grid ()
        {
        V3DSpace.toggle_yz_grid_visible ()

        this.setState ({yz_grid: V3DSpace.yz_grid_visible ()})
        }

    toggle_xy_grid ()
        {
        V3DSpace.toggle_xy_grid_visible ()

        this.setState ({xy_grid: V3DSpace.xy_grid_visible ()})
        }

    toggle_terminator_line ()
        {
        V3DSpace.display_terminator (! this.state.terminator_visible)

        this.setState ({terminator_visible: V3DSpace.terminator_line})
        }

    toggle_ambient_light ()
        {
        V3DSpace.set_ambient_light (! this.state.ambient_light)
        this.setState ({ambient_light: V3DSpace.ambient})
        }

    show_mag_context_menu (e)
        {
        e.preventDefault()

        document.addEventListener ('click', this.click_outside)

        this.setState ({mag_menu_open: true, show_mag_tooltip: false})
        }

    show_bs_context_menu (e)
        {
        e.preventDefault()

        document.addEventListener ('click', this.click_outside)

        this.setState ({bs_menu_open: true, show_bs_tooltip: false})
        }

    bs_mouse_over ()
        {
        if  (! this.state.bs_menu_open)
            {
            setTimeout (() => this.setState ({show_bs_tooltip: true}), TT_OPEN_DELAY)
            }
        }

    bs_mouse_leave ()
        {
        setTimeout (() => this.setState ({show_bs_tooltip: false}), TT_OPEN_DELAY)
        }

    mag_mouse_over ()
        {
        if  (! this.state.mag_menu_open)
            {
            setTimeout (() => this.setState ({show_mag_tooltip: true}), TT_OPEN_DELAY)
            }
        }

    mag_mouse_leave ()
        {
        setTimeout (() => this.setState ({show_mag_tooltip: false}), TT_OPEN_DELAY)
        }

    click_outside ()
        {
        document.removeEventListener ('click', this.click_outside)

        this.setState ({
            bs_menu_open: false, 
            show_bs_tooltip: false, 
            mag_menu_open: false, 
            show_mag_tooltip: false
            })
        }

    get_view_icon (wf)
        {
        return (wf)? wireframe_icon : solid_icon
        }
    
    componentDidMount ()
        {
        document.addEventListener ("field_display_evt", e => {
            this.process_mhd_events (e.detail)
            })


        this.setState ({
            mag_obj_name: V3DSpace.mag_name,
            bs_obj_name: V3DSpace.bs_name,
            mag_wf: V3DSpace.mag_wf_view,
            bs_wf: V3DSpace.bs_wf_view,
            })
        }

    render ()
        {    
        //const TT_BGCOLOR = "shadeblue" ;
        //const filter={filter: "invert(" + this.props.invert.toFixed() + "%)"}

        const ambient_icon = (this.state.ambient_light)? ambient_on_icon : ambient_off_icon

        const context_menu_btn = {
            border: "none",
            filter: this.state.hover_a ? 'brightness(3.5)' : '', 
            transform: this.state.hover_a ? 'scale(1.5)' : '',
            }

        const context_wf_toggle = {
            border: "none",
            filter: this.state.hover_b ? 'brightness(3.5)' : '', 
            transform: this.state.hover_b ? 'scale(1.5)' : '',
            }


        const bs_dropdown =
            <>
                <V_Button
                    size="small"
                    onClick={() => V3DSpace.set_bowshock_wf (! this.state.bs_wf)} 
                    onMouseEnter={() => this.setState ({hover_a: true})}
                    onMouseLeave={() => this.setState ({hover_a: false})}
                    style={context_menu_btn}
                    image={this.get_view_icon (! this.state.bs_wf)}
                    alt="switch between wireframe and solid view"
                    />
                <V_Button
                    size="small"
                    onMouseEnter={() => this.setState ({hover_b: true})}
                    onMouseLeave={() => this.setState ({hover_b: false})}
                    style={context_wf_toggle}
                    image={options_dlg_icon}
                    alt="open a dialog box to set bowshock display options"
                    disabled={true}
                    />
            </> ;

        const bowshock_btn =
            <V_Button
                size="standard"
                onClick={this.toggle_bowshock} 
                onContextMenu={this.show_bs_context_menu} 
                onMouseOver={this.bs_mouse_over}
                onMouseLeave={this.bs_mouse_leave}
                style={SIDE_BUTTON_STYLE}
                image={bowshock_icon}
                disabled={this.props.disable_field_boundaries}
                alt="show bowshock button"
                shade={this.props.invert}
                toggle={this.state.bs_visible}
                />


        const bowshock_button =
        <V_Tooltip    
            align="left" 
            offset="20px"
            background={TT_BGCOLOR}
            text={`Display a mesh representing the magnetic bow shock 
                    relative to the Earth.`}
            active={this.state.show_bs_tooltip}
            >
            <V_Dropdown 
                trigger="contextmenu"
                name="bs_menu"
                align='left'
                offset='20px'
                padding='0'
                orientation="row"
                reverse={true}
                background="transparent"
                border="none"
                gap="0"
                close_on_select={true}
                visible={this.state.bs_menu_open}
                dropdown={bs_dropdown}
                anchor={()=>{return bowshock_btn}}
                />
        </V_Tooltip> ;

        const mp_dropdown =             
            <>
                <V_Button
                    size="small"
                    onClick={() => V3DSpace.set_magnetopause_wf (! this.state.mag_wf)} 
                    onMouseEnter={() => this.setState ({hover_a: true})}
                    onMouseLeave={() => this.setState ({hover_a: false})}
                    style={context_menu_btn}
                    image={this.get_view_icon (! this.state.mag_wf)}
                    alt="switch between wireframe and solid view"
                    />
                <V_Button
                    size="small"
                    onMouseEnter={() => this.setState ({hover_b: true})}
                    onMouseLeave={() => this.setState ({hover_b: false})}
                    style={context_wf_toggle}
                    image={options_dlg_icon}
                    alt="open a dialog box to set magnetopause display options"
                    disabled={true}
                    />
            </> ;

        const mp_btn =
            <V_Button
                size="standard"
                onClick={this.toggle_magnetopause} 
                onContextMenu={this.show_mag_context_menu} 
                onMouseOver={this.mag_mouse_over}
                onMouseLeave={this.mag_mouse_leave}
                style={SIDE_BUTTON_STYLE}
                image={magneto_icon}
                alt="show magnetopause button"
                shade={this.props.invert}
                toggle={this.state.magneto_visible}
                disabled={this.props.disable_field_boundaries}
                />

        const mp_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Display a mesh representing the magnetopause relative to the Earth."
                active={this.state.show_mag_tooltip}
                >
                <V_Dropdown 
                    trigger="contextmenu"
                    name="mag_menu"
                    align='left'
                    offset='20px'
                    padding='0'
                    orientation="row"
                    reverse={true}
                    background="transparent"
                    border="none"
                    gap="0"
                    close_on_select={true}
                    visible={this.state.mag_menu_open}
                    dropdown={mp_dropdown}
                    anchor={()=>{return mp_btn}}
                    />


            </V_Tooltip> ;

        const yz_grid_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Display a coordinate grid in the YZ plane perpendicular to the X axis.">
                <V_Button
                    size="standard"
                    onClick={this.toggle_yz_grid} 
                    style={SIDE_BUTTON_STYLE}
                    image={x_grid_icon}
                    alt="show YZ grid button"
                    shade={this.props.invert}
                    toggle={this.state.yz_grid}
                    />
            </V_Tooltip> ;

        const xz_grid_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Display a coordinate grid in the XZ plane perpendicular to the Y axis.">
                <V_Button
                    size="standard"
                    onClick={this.toggle_xz_grid} 
                    style={SIDE_BUTTON_STYLE}
                    image={y_grid_icon}
                    alt="show XZ grid button"
                    shade={this.props.invert}
                    toggle={this.state.xz_grid}
                    />
            </V_Tooltip> ;

        const xy_grid_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Display a coordinate grid in the XY plane perpendicular to the Z axis.">
                <V_Button
                    size="standard"
                    onClick={this.toggle_xy_grid} 
                    style={SIDE_BUTTON_STYLE}
                    image={z_grid_icon}
                    alt="show XY grid button"
                    shade={this.props.invert}
                    toggle={this.state.xy_grid}
                    />
            </V_Tooltip> ;

        const persp_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Switch to the perspective camera.">
                <V_Button
                    size="standard"
                    onClick={this.props.set_perspective} 
                    style={SIDE_BUTTON_STYLE}
                    image={perspective_icon}
                    alt="perspective camera button"
                    shade={this.props.invert}
                    toggle={this.props.camera_type === PERSP_CAMERA}
                    />
            </V_Tooltip> ;

        const ortho_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Swith to the orthographic camera.">
                <V_Button
                    size="standard"
                    onClick={this.props.set_orthogonal} 
                    style={SIDE_BUTTON_STYLE}
                    image={orthogonal_icon}
                    alt="orthographic camera button"
                    shade={this.props.invert}
                    toggle={this.props.camera_type === ORTHO_CAMERA}
                    />
            </V_Tooltip> ;

        const terminator_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Enable or disable the terminator line on the earth.">
                <V_Button
                    size="standard"
                    onClick={this.toggle_terminator_line} 
                    style={SIDE_BUTTON_STYLE}
                    image={terminator_icon}
                    alt="show terminator line button"
                    shade={this.props.invert}
                    toggle={this.state.terminator_visible === true}
                    />
            </V_Tooltip> ;

        const ambient_light_button =
            <V_Tooltip    
                align="left" 
                offset="20px"
                background={TT_BGCOLOR}
                text="Turn the ambient lighting in the scene on or off.">
                <V_Button
                    size="standard"
                    onClick={this.toggle_ambient_light} 
                    style={SIDE_BUTTON_STYLE}
                    image={ambient_icon}
                    alt="toggle ambient light button"
                    shade={this.props.invert}
                    />
            </V_Tooltip> ;

        if  (! this.props.visible)
            {
            return null ;
            }

        return (
            <div className="function_side_bar"> 
                {bowshock_button}
                {mp_button}
                {yz_grid_button}
                {xz_grid_button}
                {xy_grid_button}
                {persp_button}
                {ortho_button}
                {terminator_button}
                {ambient_light_button}
            </div>
            ) ;
        }
    }

export default Function_Bar
