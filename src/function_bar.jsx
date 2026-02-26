import React from 'react'
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx'

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

import { PERSP_CAMERA } from './Orbit_Display'
import { ORTHO_CAMERA } from './Orbit_Display' 
import { SIDE_BUTTON_STYLE } from './constants.js'
import { TT_BGCOLOR } from './constants.js'

import { V3DSpace } from './App.jsx'

class Function_Bar extends React.Component
    {
    constructor (props)
        {
        super (props) 

        this.state = {
            magneto_visible: false,
            bs_visible: false,
            xz_grid: V3DSpace.xz_grid_visible (),
            yz_grid: V3DSpace.yz_grid_visible (),
            xy_grid: V3DSpace.xy_grid_visible (),
            ambient_light: V3DSpace.ambient,
            terminator_visible: V3DSpace.terminator_line,
            }

        this.toggle_ambient_light = this.toggle_ambient_light.bind (this)
        this.toggle_terminator_line = this.toggle_terminator_line.bind (this)
        this.toggle_bowshock = this.toggle_bowshock.bind (this)
        this.toggle_magnetopause = this.toggle_magnetopause.bind (this)
        this.toggle_xz_grid = this.toggle_xz_grid.bind (this)
        this.toggle_yz_grid = this.toggle_yz_grid.bind (this)
        this.toggle_xy_grid = this.toggle_xy_grid.bind (this)
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

    render ()
        {    
        //const TT_BGCOLOR = "darkblue" ;
        //const filter={filter: "invert(" + this.props.invert.toFixed() + "%)"}

        const ambient_icon = (this.state.ambient_light)? ambient_on_icon : ambient_off_icon

        const bowshock_button =
        <V_Tooltip    
            align="left" 
            offset="20px"
            background={TT_BGCOLOR}
            text={`Display a mesh representing the magnetic bow shock 
                    relative to the Earth.`}>
            <V_Button
                size="standard"
                onClick={this.toggle_bowshock} 
                style={SIDE_BUTTON_STYLE}
                image={bowshock_icon}
                alt="show bowshock button"
                dark={this.props.invert}
                toggle={this.state.bs_visible}
                />
        </V_Tooltip> ;

        const mp_button =
        <V_Tooltip    
            align="left" 
            offset="20px"
            background={TT_BGCOLOR}
            text="Display a mesh representing the magnetopause relative to the Earth.">
            <V_Button
                size="standard"
                onClick={this.toggle_magnetopause} 
                style={SIDE_BUTTON_STYLE}
                image={magneto_icon}
                alt="show magnetopause button"
                dark={this.props.invert}
                toggle={this.state.magneto_visible}
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
                dark={this.props.invert}
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
                dark={this.props.invert}
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
                dark={this.props.invert}
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
                dark={this.props.invert}
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
                dark={this.props.invert}
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
                dark={this.props.invert}
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
                dark={this.props.invert}
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
