import React from 'react'
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx'

import {TT_BGCOLOR } from './constants.js'
import { SIDE_BUTTON_STYLE } from './constants.js'

import sun_icon from './images/sun_icon.png' 
import moon_icon from './images/moon_icon.png' 
import earth_icon from './images/earth_icon.png' 
import mars_icon from './images/mars_icon.png' 
import mercury_icon from './images/mercury_icon.png' 
import venus_icon from './images/venus_icon.png' 
import L1_icon from './images/L1_icon.png'

class Target_Bar extends React.Component
    {
    constructor (props)
        {
        super (props) 

        this.set_frame_earth = this.set_frame_earth.bind (this) 
        this.set_frame_moon = this.set_frame_moon.bind (this) 
        this.set_frame_sun = this.set_frame_sun.bind (this) 
        this.set_frame_mars = this.set_frame_mars.bind (this) 
        this.set_frame_mercury = this.set_frame_mercury.bind (this) 
        this.set_frame_venus = this.set_frame_venus.bind (this) 
        this.set_frame_L1 = this.set_frame_L1.bind (this)
        }

    set_frame_moon ()
        {
        this.props.set_frame ("MOON")
        }

    set_frame_sun ()
        {
        this.props.set_frame ("SUN")
        }

    set_frame_mars ()
        {
        this.props.set_frame ("MARS")
        }

    set_frame_mercury ()
        {
        this.props.set_frame ("MERCURY")
        }
    set_frame_venus ()
        {
        this.props.set_frame ("VENUS")
        }

    set_frame_earth ()
        {
        this.props.set_frame ("EARTH")
        }

    set_frame_L1 ()
        {
        this.props.set_frame ("L1")
        }

    render ()
        {    
        const filter={filter: "invert(" + this.props.invert.toFixed() + "%)"}

        const earth_button =                    
        <V_Tooltip    
            align="right" 
            offset="20px"
            background={TT_BGCOLOR}
            text="Set the focus to planet Earth.">
            <V_Button
                size="small"
                onClick={this.set_frame_earth} 
                style={SIDE_BUTTON_STYLE}
                image={earth_icon}
                alt="Fix the Camera on the Earth."
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const moon_button =
        <V_Tooltip    
            align="right" 
            background={TT_BGCOLOR}
            text="Set the focus to the Moon."
            offset="20px">
            <V_Button
                size="small"
                onClick={this.set_frame_moon} 
                style={SIDE_BUTTON_STYLE}
                image={moon_icon}
                alt="Fix the Camera on the Moon."
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const sun_button =
        <V_Tooltip    
            align="right" 
            background={TT_BGCOLOR}
            text="Set the focus to the Sun."
            offset="20px">
            <V_Button
                size="small"
                onClick={this.set_frame_sun} 
                style={SIDE_BUTTON_STYLE}
                image={sun_icon}
                alt="Fix the Camera on the Sun."
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const mercury_button =
        <V_Tooltip
            align="right" 
            anchor_point="right"
            background={TT_BGCOLOR}
            text="Set the focus to planet Mercury."
            offset="20px">
            <V_Button
                size="small"
                onClick={this.set_frame_mercury} 
                style={SIDE_BUTTON_STYLE}
                image={mercury_icon}
                alt="Fix the Camera on Mercury."
                dark={this.props.invert}
                />
        </V_Tooltip> ; 

        const venus_button = 
        <V_Tooltip    
            align="right" 
            background={TT_BGCOLOR}
            text="Set the focus to planet Venus."
            offset="20px">
            <V_Button
                size="small"
                onClick={this.set_frame_venus} 
                style={SIDE_BUTTON_STYLE}
                image={venus_icon}
                alt="Fix the Camera on Venus."
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const mars_button =
        <V_Tooltip    
            align="right" 
            background={TT_BGCOLOR}
            text="Set the focus to planet Mars."
            offset="20px">
            <V_Button
                size="small"
                onClick={this.set_frame_mars} 
                style={SIDE_BUTTON_STYLE}
                image={mars_icon}
                alt="Fix the Camera on Mars."
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const l1_button =
        <V_Tooltip    
            align="right" 
            background={TT_BGCOLOR}
            text="Set the focus to the Earth/Sun Lagrange Point 1 (L1)."
            offset="20px">
            <V_Button
                size="small"
                onClick={this.set_frame_L1} 
                style={SIDE_BUTTON_STYLE}
                image={L1_icon}
                alt="Fix the Camera on the Lagrange Point 1 (L1)."
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        if  (! this.props.visible)
            {
            return null ;
            }

        return (
            <div className="target_side_bar"> 
                
                    {earth_button}
                    {moon_button}
                    {sun_button}
                    {mercury_button}
                    {venus_button}
                    {mars_button}
                    {l1_button}

            </div>
            ) 
        }
    }

    export default Target_Bar