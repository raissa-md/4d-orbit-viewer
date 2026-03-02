import React from 'react'
import { Dropdown } from 'antd' 
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx'
import { V_Dropdown } from './UI.jsx'

import help_icon from './images/help_icon.png'
import nasa_logo from './images/nasa-logo-96.png'
import spdf_icon from './images/SPDF_worm_logo_blue2.png'
import menu_icon from './images/menu_icon.png'
import export_icon from './images/export_icon.png'
import screenshot_icon from './images/screenshot_icon.png'
import record_icon from './images/record_btn.png'
import record_rdy_icon from './images/record_rdy_btn.png'
import options_icon from './images/options_icon.png'
//import coord_icon from './images/coordinate_icon.png'
import bookmark_icon from './images/bookmark_icon.png'

import GEO_coord_icon from './images/GEO_coord_sys.png'
import SM_coord_icon from './images/SM_coord_sys.png'
import GSM_coord_icon from './images/GSM_coord_sys.png'
import GEI_coord_icon from './images/GEI_coord_sys.png'
import J2000_coord_icon from './images/J2000_coord_sys.png'
import GSE_coord_icon from './images/GSE_coord_sys.png'
import HEE_coord_icon from './images/HEE_coord_sys.png'
import HAE_coord_icon from './images/HAE_coord_sys.png'


import { TOP_BUTTON_STYLE } from './constants.js'
import { SPDF_BUTTON_STYLE } from './constants.js'
import { TT_BGCOLOR } from './constants.js'
import { TITLE } from './constants.js'
import { BUILD } from './constants.js'
import { V3DSpace } from './App';

const DBL_CLICK_TIME = 350
const TT_OPEN_DELAY = 100

const MEDIA_TOOLTIP_STR = [
    `Press to capture a screenshot and save as a PNG image. Right click to activate a
    drop-down menu and select another function.`,
    `Press to start video capture. . Right click to activate a
    drop-down menu and select another function.`,
    `Press to end video capture.`,
    ] 

class Icon_Bar extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
            record: false,               // True when recording video.  Necessary?
            screenshot: true,            // True if in screenshot mode, otherwise false.
            btn_icon: screenshot_icon,   
            show_media_tooltip: false,   // True when the media button tooltip should be visible.        
            hover_a: false,
            hover_b: false,
            media_tooltip: MEDIA_TOOLTIP_STR [0],
            menu_open: false,            // True when the context menu is open
            screen: null,
            }


        this.get_coord_sys_icon = this.get_coord_sys_icon.bind (this)
        this.click_media = this.click_media.bind (this)
        this.setup_video_rec = this.setup_video_rec.bind (this)
        this.setup_screenshot = this.setup_screenshot.bind (this)
        this.media_mouse_over = this.media_mouse_over.bind (this)
        this.media_mouse_leave = this.media_mouse_leave.bind (this)
        this.click_outside = this.click_outside.bind (this)
        this.show_context_menu = this.show_context_menu.bind (this)
        this.render = this.render.bind (this)

        }

    get_coord_sys_icon ()
        {
        switch (this.props.coord_system.toUpperCase())
            {
                case "GSE" :

                return GSE_coord_icon
    
            case "GEI" :
    
                return GEI_coord_icon
    
            case "GEI2000" :
    
                return J2000_coord_icon
    
            case "GEO" :
    
                return GEO_coord_icon
    
            case "GSM" :
    
                return GSM_coord_icon
    
            case "SM" :
    
                return SM_coord_icon
    
            case "MAG" :
    
                return null
    
            case "HEE" :
    
                return HEE_coord_icon
    
            case "HAE" :
    
                return HAE_coord_icon
    
            case "HEEQ" :
    
                return null

            default:

                return null 
            }
        }
        
    click_media (e)
        {
        //V3DSpace.set_axis ("X", false)
        // Activate media record (screenshot or video)

        // Check for alt-click
        if  (e.altKey)
            {
            e.stopPropagation ()
            this.show_context_menu (e)

            return
            }


        if  (! this.state.screenshot)
            {
            if  (this.state.record)
                {
                this.state.screen.stop_recording ()
                }

            else
                {
                const sc = V3DSpace.get_screen ()
                sc.start_recording ()
                    .then (() => 
                        {
                        this.props.open_image_save_menu (sc)
                        this.setState ({
                                record: false,
                                btn_icon: record_rdy_icon,
                                media_tooltip: MEDIA_TOOLTIP_STR [1],
                                screen: null,
                                })
                        }); 

                this.setState ({
                    record: true,
                    btn_icon: record_icon,
                    media_tooltip: MEDIA_TOOLTIP_STR [2],
                    screen: sc,
                    })
                    }


            return
            }

        const sc = V3DSpace.get_screen ()
        sc.capture_image ()
        
        this.props.open_image_save_menu (sc)
        }

    setup_screenshot ()
        {
        this.setState ({
            btn_icon: screenshot_icon,
            screenshot: true,
            media_tooltip: MEDIA_TOOLTIP_STR [0]
            })
        }

    setup_video_rec ()
        {
        this.setState ({
            btn_icon: record_rdy_icon, // Replace with record icon when available
            screenshot: false,
            media_tooltip: MEDIA_TOOLTIP_STR [1]
            })                 
        }

    media_mouse_over ()
        {
        if  (! this.state.menu_open)
            {
            setTimeout (this.setState ({show_media_tooltip: true}), TT_OPEN_DELAY)
            }
        }

    media_mouse_leave ()
        {
        setTimeout (this.setState ({show_media_tooltip: false}), TT_OPEN_DELAY)
        }

    click_outside ()
        {
        document.removeEventListener ('click', this.click_outside)

        this.setState ({menu_open: false})
        }
    
    show_context_menu (e)
        {
        e.preventDefault()

        // No context menu when recording video
        if  (! this.state.screenshot && this.state.record)
            {
            return
            }

        document.addEventListener ('click', this.click_outside)

        this.setState ({menu_open: true, show_media_tooltip: false})
        }

    help_action ()
        {
        this.props.display_main_help_dialog (this.props.visible)
        }

    render ()
        {    
        const filter = {filter: "invert(" + this.props.invert.toFixed() + "%)"}

        //const TT_BGCOLOR = "darkblue" ;
        //const filter={filter: "invert(" + this.props.invert.toFixed() + "%)"}
        const context_screenshot_btn = {
            border: "none",
            filter: this.state.hover_a ? 'brightness(3.5)' : '', 
            transform: this.state.hover_a ? 'scale(1.5)' : '',
            }

        const context_record_btn = {
            border: "none",
            filter: this.state.hover_b ? 'brightness(3.5)' : '', 
            transform: this.state.hover_b ? 'scale(1.5)' : '',
            }

        const media_dropdown =
            <>
                <V_Button
                    size="small"
                    onClick={this.setup_screenshot} 
                    onMouseEnter={() => this.setState ({hover_a: true})}
                    onMouseLeave={() => this.setState ({hover_a: false})}
                    style={context_screenshot_btn}
                    image={screenshot_icon}
                    alt="show screenshot button"
                    dark={this.props.invert}
                    />
                <V_Button
                    size="small"
                    onClick={this.setup_video_rec} 
                    onMouseEnter={() => this.setState ({hover_b: true})}
                    onMouseLeave={() => this.setState ({hover_b: false})}
                    style={context_record_btn}
                    image={record_icon}
                    alt="show video record button"
                    dark={this.props.invert}
                    />
            </> ;

        const help_button =
        <V_Tooltip    
            align="bottom" 
            background={TT_BGCOLOR}
            offset="10px"
            text={`Open a dialog box giving basic instructions about how to 
                    use this application`}
            >
            <V_Button
                    size="standard"
                    onClick={this.help_action.bind (this)} 
                    style={TOP_BUTTON_STYLE}
                    image={help_icon}
                    alt="show top-level help button"
                    dark={this.props.invert}
                    />
        </V_Tooltip> ;

        const menu_button = 
        <V_Tooltip    
            align="bottom" 
            background={TT_BGCOLOR}
            offset="10px"
            text={`Open a panel allowing the user to select both the observatories 
                    whose orbits will be displayed as well as the time range to view
                    them in.`}
            >
            <div className="icon-top-button"
                onClick={this.props.toggle_l_sidebar}
                >
                <img style={filter} src={menu_icon} className= "icon_image_small" alt="" />
            </div>

        </V_Tooltip> ;

        const bookmark_button =
        <V_Tooltip    
            align="bottom" 
            background={TT_BGCOLOR}
            offset="10px"
            text={`Create a URL that will call the 4D Orbit Viewer application with
                    the currently selected spacecraft and using the current time range.`}
            >
            <V_Button
                size="standard"
                onClick={this.props.copy_search_url} 
                style={TOP_BUTTON_STYLE}
                image={bookmark_icon}
                alt="show bookmark button"
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const download_button =
        <V_Tooltip    
            align="bottom-right" 
            background={TT_BGCOLOR}
            offset="10px"
            text={`Open a dialog box allowing the user to select spacecraft to have
                    their orbit data exported as a text file. The orbit data of the 
                    selected spacecraft will appear in a new window.  The browser 
                    can then be used to save or print the data file.`}
            >
            <V_Button
                size="standard"
                onClick={this.props.open_save_menu} 
                style={TOP_BUTTON_STYLE}
                image={export_icon}
                alt="show export button"
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const ss_button =                    
            <V_Button
                size="standard"
                onClick={this.click_media} 
                onContextMenu={this.show_context_menu}
                onMouseOver={this.media_mouse_over}
                onMouseLeave={this.media_mouse_leave}
                style={TOP_BUTTON_STYLE}
                image={this.state.btn_icon}
                alt="show screen capture/record button"
                dark={this.props.invert}
                />

        const screenshot_button = 
        <V_Tooltip    
            align="bottom" 
            background={TT_BGCOLOR}
            offset="10px"
            text={this.state.media_tooltip}
            active={this.state.show_media_tooltip}
            >
            <V_Dropdown 
                trigger="contextmenu"
                name="media_menu"
                align='bottom'
                offset='20px'
                padding='0'
                background="transparent"
                border="none"
                gap="0"
                close_on_select={true}
                visible={this.state.menu_open}
                dropdown={media_dropdown}
                anchor={()=>{return ss_button}}
                />
        </V_Tooltip> ;

        const options_button = 
        <V_Tooltip    
            align="bottom"
            background={TT_BGCOLOR}
            offset="10px"
            text={`Open a dialog box allowing the user to select various options.`}
            >                    
            <V_Button
                size="standard"
                onClick={this.props.open_option_menu} 
                style={TOP_BUTTON_STYLE}
                image={options_icon}
                alt="show options button"
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const coord_button = 
        <V_Tooltip    
            align="bottom"
            background={TT_BGCOLOR}
            offset="10px"
            text={`Select the coordinate system.`}
            >                    
            <V_Button
                size="standard"
                onClick={this.props.open_coord_dialog} 
                style={TOP_BUTTON_STYLE}
                image={this.get_coord_sys_icon ()}
                alt="show coordinate system selection button"
                dark={this.props.invert}
                />
        </V_Tooltip> ;

        const nasa_button = 
            <V_Button
                size="large"
                onClick={() => window.open('https://www.nasa.gov/', '_blank')} 
                style={TOP_BUTTON_STYLE}
                image={nasa_logo}
                alt="link to NASA website"
                dark={this.props.invert}
                />

        const spdf_button = 
            <V_Button
                size="spdf"
                onClick={() => window.open('https://spdf.gsfc.nasa.gov/', '_blank')} 
                style={TOP_BUTTON_STYLE}
                image={spdf_icon}
                alt="link to SPDF website"
                dark={this.props.invert}
                />

        const id_string = 
            <div id="title">
                <span id="app_name">{TITLE}</span>
                <span id="build">v{BUILD}</span>
            </div>

        if  (! this.props.visible)
            {
            return (
                <div className="icon_bar"> 
                    <div className="icon_left">
                        {menu_button}
                        {help_button}
                    </div>

                    <div className="icon_right">
                        {id_string}
                        {nasa_button}
                        {spdf_button}
                    </div>
                </div>
                ) ;
            }

        return (
            <div className="icon_bar"> 
                <div className="icon_left">
                    {menu_button}
                    {download_button}
                    {screenshot_button}
                    {options_button}
                    {coord_button}
                    {bookmark_button}
                    {help_button}
                </div>

                <div className="icon_right">
                    {id_string}
                    {nasa_button}
                    {spdf_button}
                </div>
            </div>
            ) ;
        }
    }

export default Icon_Bar