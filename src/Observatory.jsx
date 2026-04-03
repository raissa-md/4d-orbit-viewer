/* eslint-disable no-useless-constructor */
import React, { useState } from 'react' 
import { saveAs } from 'file-saver' ;
//import {message} from "antd" ;
//import {DatePicker, TimePicker } from "antd";
//import {Space} from "antd" ;
import {Button} from "antd" ;
//import {Radio} from "antd" ;
//import { Menu, Dropdown } from 'antd';
//import { Modal } from 'antd';
import { Typography } from 'antd';
//import { Divider } from 'antd';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons'
import moment from 'moment'
import Display_Manager from './Orbit_Display.jsx';
import { SketchPicker } from 'react-color';
import { CirclePicker } from 'react-color';
//import { Input } from 'antd';
import { Slider } from 'antd';
import { InputNumber } from 'antd';
import { Switch } from 'antd';
import { chooser_help, transport_help, main_help,orbit_data_header, orbit_data_footer } from './help_text.js';
import { sprintf } from 'sprintf-js' ;
import ReactMarkdown from 'react-markdown' ;
import remarkGfm from 'remark-gfm' ;
import properties from './properties.txt' ;
import { V_Modal } from './UI.jsx'
import { V_Checkbox } from './UI.jsx'
import { V_Radio_Button } from './UI.jsx'
import { V_Button } from './UI.jsx'
import { V_Tooltip } from './UI.jsx'
import Message_Queue from './message_box.jsx';
import { REF_FRAME } from './Orbit.js';
import { ENT_type } from './entity_manager.js'
import { COORD_System } from './Orbit.js'
import { key_to_coord_system } from './Orbit.js'
import { coord_system_to_key } from './Orbit.js'
import { unit_to_string } from './Orbit.js'
import { ALERT } from './message_box.jsx'

import { DEF_SC_COLOR, DEF_SC_SHAPE } from './constants.js'
import { DEF_ORB_STYLE } from './constants.js'
import { UNASSIGNED_SC_COLOR } from './constants.js'
import { UNASSIGNED_SC_SHAPE } from './constants.js'
import { UNASSIGNED_ORBIT_STYLE } from './constants.js'
import { SSC_WS_ACCESS } from './constants.js'
import { TT_BGCOLOR } from './constants.js'
import { MIN_SCREEN_X_3PANEL } from './constants.js'
import { PLANETS } from './planet_data.js'
import { MIN_DIALOG_HEIGHT, MIN_DIALOG_WIDTH } from './constants.js'
import { EXPORT_DIALOG_WIDTH } from './constants.js'
import { SCREENSHOT_DIALOG_WIDTH } from './constants.js'
import { OPTIONS_DIALOG_WIDTH } from './constants.js'
import { HELP_DIALOG_HEIGHT, HELP_DIALOG_WIDTH } from './constants.js'
import { DIALOG_SPACE_FACTOR } from './constants.js'
import { DIALOG_HEIGHT } from './constants.js'
import { DEF_BACKGROUND_COLOR } from './constants.js'
import { DEF_GRID_SIZE, DEF_GRID_SCALE, DEF_GRID_OFFSET } from './constants'

import { V3DSpace } from './App.jsx'
import { Orbit_Data } from './App.jsx'
import Ghost_Menu from './ghost_selection.jsx'
import { SELECT_TYPE } from './ghost_selection.jsx'

function use_min_width (disp_width)
    {
    return (disp_width < MIN_DIALOG_WIDTH * DIALOG_SPACE_FACTOR)? true : false
    }

const xp_dlg_width = (disp_width) =>
    {
    return (use_min_width (disp_width))? MIN_DIALOG_WIDTH : EXPORT_DIALOG_WIDTH
    }

const opt_dlg_width = (disp_width) =>
    {
    return (use_min_width (disp_width))? MIN_DIALOG_WIDTH : OPTIONS_DIALOG_WIDTH
    }

const scr_dlg_width = (disp_width) =>
    {
    return (use_min_width (disp_width))? MIN_DIALOG_WIDTH : SCREENSHOT_DIALOG_WIDTH
    }

const hlp_dlg_width = (disp_width) =>
    {
    return (use_min_width (disp_width))? MIN_DIALOG_WIDTH : SCREENSHOT_DIALOG_WIDTH
    }

function get_dlg_style (disp_width, calc)
    {
    const modal_style = {
        width: calc (disp_width) + "px", 
        height: DIALOG_HEIGHT + "px", 
        overflowY: 'auto',
        }

    return modal_style
    }

function get_help_dialog_style (disp_width, disp_height)
    {
    const use_min_height = disp_height < HELP_DIALOG_HEIGHT * DIALOG_SPACE_FACTOR
    const use_min_width = disp_width < HELP_DIALOG_WIDTH * DIALOG_SPACE_FACTOR

    const mh = (use_min_height)? MIN_DIALOG_HEIGHT : HELP_DIALOG_HEIGHT
    const mw = (use_min_width)?  MIN_DIALOG_WIDTH : HELP_DIALOG_WIDTH

    const modal_style = {
        width: mw.toFixed()+"px", 
        height: mh.toFixed()+"px", 
        overflowY: 'auto',
        }

    console.log (JSON.stringify (modal_style))

    return modal_style
    }

function get_bounds_box (disp_width, disp_height, calc)
    {
    const dw = calc (disp_width)
    const dh = DIALOG_HEIGHT

    const vd = Math.floor ((disp_height - dh) / 2) 
    const hd = Math.floor ((disp_width - dw) / 2) 

    const b = {
        top: -vd, 
        bottom: vd,
        left: -hd,
        right: hd,
        }

    return b
    }

function date_param_to_epoch (date) 
    {
    if  (! date)
        {
        return null 
        }

    const year = parseInt (date.substring (0, 4), 10)
    const month = parseInt (date.substring (4, 6), 10) - 1 // JavaScript months are 0-based
    const day = parseInt (date.substring (6, 8), 10)

    let hour = 0
    let min = 0
    let sec = 0
  
    if  (date.length >= 15 && date.substring (8,9) === 'T')
        {
        hour =  parseInt (date.substring (9, 11), 10)
        min =  parseInt (date.substring (11, 13), 10)
        sec =  parseInt (date.substring (13, 15), 10)
        }

    // Return the epoch time in milliseconds
    const r = new Date (Date.UTC (year, month, day, hour, min, sec, 0))

    return r.getTime ()
    }

/*
function get_user_string (suggest) 
    {     
    const { confirm } = Modal ;

    // const modal_width = 400 

    let result = false ;

    confirm (
        {
        title: 'Select Orbit Color',
        content: <Input default={suggest} id={"get_user_string"}/>,
        icon: null,
        onOk () {},
        onCancel () {},
        }) ;

    return (result) ;
    }
*/

function start_of_current_day ()
    {
    // Return a Date object representing the start of the current day in UTC
    const now = new Date ()

    const year = now.getUTCFullYear ()
    const month = now.getUTCMonth ()
    const day = now.getUTCDate ()


    return new Date (Date.UTC (year, month, day, 0, 0, 0, 0))
    }

function default_end_time ()
    {
    // The default end time is defined as the start of the current day
    // Time is returned in ms
    return start_of_current_day ().getTime ()
    }

function default_start_time (interval)
    {
    // The default start time is defined as the start of the current day
    // minus interval days.
    const date = start_of_current_day () 

    // Subtract days
    date.setUTCDate (date.getUTCDate() - interval)

    // Convert to epoch time in milliseconds
    return date.getTime ()
    }

function File_Name (props)
    {
    const {save_file_name, update_save_file_name} = props 

    return (
        <>
            <div className='grid-row op-text'>
                <V_Tooltip    
                    align="right" 
                    offset="50px"
                    background={TT_BGCOLOR}                            
                    text={`Name of file to save log messages to.`}
                    >
                    File Name
                </V_Tooltip>
            </div>
            <div className='grid-row'>
                <input
                    type='text'
                    style={{width: "50%",
                            height: "2em",
                            padding: "0.2em",
                            fontSize: ".95em",
                            boxSizing: "border-box"}}
                    value={save_file_name}
                    id="get_user_string"
                    onChange={update_save_file_name}
                    />
            </div>
        </>
        ) ;
    }

function Save_Method_Select (props)
    {
    const {update_save_target, save_file_name, save, update_save_file_name} = props

    const request_file_name = 
        <File_Name 
            save_file_name={save_file_name} 
            update_save_file_name = {update_save_file_name}
            /> ;

    const select_method =
        <div className='grid-row'>
                <div className='grid-col-1 op-text'>
                    <V_Tooltip    
                        align="right" 
                        offset="50px"
                        background={TT_BGCOLOR}                            
                        text={'Save to a file or open content in new window'}
                        >
                        Target for Save
                    </V_Tooltip>
                </div>
                <div className="grid-col-2 op-text-light">
                    <V_Radio_Button
                        grroup="log_save_target"
                        name="file"
                        checked={save}
                        label="Save to File"
                        required = {true}
                        onChange={update_save_target}
                        />
                    <V_Radio_Button
                        group="log_save_target"
                        name="new_window"
                        checked={! save}
                        label="Open in New Window"
                        onChange={update_save_target}
                        />
                </div>
        </div> ;

    return (
        <>
        {select_method}
        {save && request_file_name}
        </>
        ) ;
    }

function Save_Log_Menu (props)
    {
    const {text, helptext, action, save, update_save_target, save_file_name, update_save_file_name} = props

    const [show_menu, set_show_menu] = useState (false)

    if  (show_menu)
        {
        return (
            <> 
                <Show_Hide_Button 
                    enable = {true}
                    text={text}
                    helptext={helptext}
                    action={() => set_show_menu (false)}
                    />
                <Save_Method_Select 
                    save={save}
                    update_save_target={update_save_target}
                    save_file_name={save_file_name}
                    update_save_file_name={update_save_file_name}
                    />
                <Cancel_or_OK text="OK" action={action} />
            </>
            ) ;
         
        }

    else 
        {
        return (
            <Show_Hide_Button 
                enable = {false}
                text={text}
                helptext={helptext}
                action={() => set_show_menu (true)}
                />
            ) ; 
        }
    }

function Show_Button (props)
    {
    return (
        <Button
            size="large"
            type="ghost"
            onClick={props.action} 
            style={{border: "none"}}
            >
            <DownSquareOutlined style={{ fontSize: '32px'}}/>
        </Button>
        ) ;
    }

function Hide_Button (props)
    {
    return (
        <Button
            size="large"
            type="ghost"
            onClick={props.action} 
            style={{border: "none"}}
            >
            <UpSquareOutlined style={{ fontSize: '32px'}}/>
        </Button>
        ) ;
    }

function Cancel_or_OK (props)
    {
    const {text, helptext, action, cancel, cancel_action} = props

    const BTN_STYLE = {
        color: "white",
        background: "rgb(65,102,245)",
        border: "1px solid rgb(65,102,245)",
        borderRadius: "4px",
        padding: "0.4rem 0.9rem",
        cursor: "pointer",
        }

    const OK_button = 
        <V_Button
            size="fit"
            onClick={action} 
            style={BTN_STYLE}
            label={text}
            /> ;

    const OK = (helptext)?
        <V_Tooltip    
            align="right" 
            pffset="50px"
            background={TT_BGCOLOR}                            
            text={helptext}
            >
            {OK_button}
        </V_Tooltip>
        : OK_button ;

    const cancel_button = (cancel)? 
        <V_Button
            size="fit"
            onClick={cancel_action} 
            style={BTN_STYLE}
            label={ "Cancel" }
            /> 
        : null ;

    const CNCL = (cancel && helptext)?
        <V_Tooltip    
            align="right" 
            offset="50px"
            background={TT_BGCOLOR}                            
            text={"Cancel action."}
            >
            {cancel_button}
        </V_Tooltip>
        : cancel_button ;

        const buttons = (cancel)? <> {CNCL} {OK} </> :  <> {OK} </> ;

    return (
        <div className='grid-row op-text grid-col-span'>
            {buttons}
        </div>
        ) ;
    }

function Show_Hide_Button (props)
    {
    const {text, helptext, enable, action} = props

    const button = (enable) ? 
        <Show_Button action={action}/> :
        <Hide_Button action={action}/>

    return (


        <div className='grid-row op-text grid-col-span'>
            <div>
                <V_Tooltip          
                    align="right" 
                    background={TT_BGCOLOR}                            
                    text={helptext}
                    offset="50px"
                    >
                    {text}
                </V_Tooltip>
            </div>
            <div className='grid-col-2 op-text-light'>
                {button}
            </div>
        </div>
        ) ;    
    }

/*
class Calendar extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.handle_change = this.handle_change.bind (this) ;
        }

    handle_change (t) 
        {
        t.utc (true)
        console.log ("new time ", t)
        this.props.update_time (t) ;
        }

    render () 
        {
        // should there really be valueOf() in the default case?
        const set_time = this.props.time ? moment.utc(this.props.time) : moment.utc().valueOf()
        
        const time_string = set_time.format('MMM DD YYYY HH:mm:ss') ;

        return (
            <div className="calendar_display">
                <div className="time_select_display">
                    <DatePicker value={set_time} onChange={this.handle_change} />
                    <TimePicker value={set_time} onChange={this.handle_change} />
                </div>
                <div>
                    {this.props.lbl} : {time_string}
                </div>
            </div>
            );
        }
    }
*/

/*
class Display_Table extends React.Component
    {
    constructor (props)
        {
        super (props)

        this.state =  {
            filter: ["available"],
            }

        this.check_for_color_change = this.check_for_color_change.bind (this) 
        this.filter_row = this.filter_row.bind (this) ;
        this.control_filter = this.control_filter.bind (this) 
        //this.start   = this.start.bind (this) ;
        this.render = this.render.bind (this)
        }

    check_for_color_change (record, prev_record)
        {
        return  (record.color !== prev_record.color) ? true : false ;
        }

    filter_row (value, record)
        {
        // Returns true (display row) or false (hide row) based on the desired filter (value).
        // record is the record for the row being filtered.

        if  (value === "selected")
            {
            return record.display ;
            }

        if  (value === "available")
            {
            return record.available ;
            }

        return 1;
        }

    control_filter (e) 
        {
        this.setState ({filter: [e.target.value],}) ;
        }
        
    render() 
        {
        //let obs = this.state.obs ;
        const select_parameters = 
            {
            selectedRowKeys: this.props.selected,
            hideSelectAll: true,
            onSelect: this.props.handle_select_change,
            };
            
        const columns = 
        [
            {
            title: 'Name',
            dataIndex: 'name',
            filters: [
                {
                    text: 'selected',
                    value: 'selected',
                },
                {
                    text: 'available',
                    value: 'available',
                },

            ],
            filteredValue: this.state.filter,
            onFilter: this.filter_row,
            filterMultiple: false,
            filterDropdownVisible: false,
            render: (obs_name, record, index) => {
                const s = {} 
                s.padding = "2px"
                s.width = "90px"
                s.minHeight = "25px" 
                const button_style = {}
                button_style.color = "black"
                button_style.backgroundColor = "transparent"
                button_style.border = "none"
                button_style.cursor = "pointer"
                button_style.padding = "0" 
                button_style.outline = "none"
                button_style.textAlign = "left"     
                let render ;
                if  (record.display)
                    {
                    render =                     
                        <button style={button_style}
                            onClick={() => this.props.set_focus(record.id)}>
                            <div style={s}>{obs_name}</div>
                        </button>;                    }
                else
                    {
                    render = <div style={s}>{obs_name}</div> ;
                    }
                return (
                        {
                        props: null,
                        children:                    
                            <Space  size="middle">
                                {render}
                            </Space>
                        } 
                    ) ;
                },
            },

            {
            title: 'Color',
            dataIndex: 'color',
            editable: true,
            render: (color, record, index) => {
                const s = {} ;
                s.padding = 2 ;
                s.width = 40 ;
                s.height = 15 ;
                s.backgroundColor = color ;
                return (
                <Space size="middle">
                    <a href="javascript:;" onClick={() => this.props.get_new_color (color, record)}>
                    <div style={s}  >
                    </div>
                    </a>
                </Space>
                )
                },
            },
        
            {
            title: 'Shape',
            dataIndex: 'shape',
            editable: true,
            render: (shape, record, index) => {
                const menu_selection = (
                    <Menu onClick= {(item) => this.props.get_new_shape (item.key, record)}>  
                        <Menu.Item key="sphere">
                        sphere
                        </Menu.Item>
                        <Menu.Item key="cylinder">
                        cylinder
                        </Menu.Item>
                        <Menu.Item key="cone">
                        cone
                        </Menu.Item>
                        <Menu.Item key="diamond" disabled="true">
                        diamond
                        </Menu.Item>
                        <Menu.Item key="cube">
                        cube
                        </Menu.Item>
                    </Menu>
                    ) ;      

                const button_style = {}
                button_style.backgroundColor = "transparent" ;
                button_style.border = "1px solid black";
                button_style.cursor = "pointer";
                button_style.borderRadius = "4px" ;
                button_style.overflow = "hidden";
                button_style.outline = "none";
                button_style.color = "black";
        
                return (
                    <Dropdown overlay={menu_selection}>
                        <button 
                            type="button"
                            style={button_style}
                            onClick={e => e.preventDefault()}
                            >
                            {shape}<DownOutlined />
                        </button>
                    </Dropdown>
                    ) ;
               }
            },
        ] ;  

        const selection_options = 
            [
                { label: 'All', value: 'all', },
                { label: 'Available', value: 'available' },
                { label: 'Selected', value: 'selected' },
            ] ;

       return (<div className="list_display">
                <div className="list_display_inner_space">
                <Radio.Group
                    options={selection_options}
                    onChange={this.control_filter}
                    value={this.state.filter [0]}    
                    optionType="button"
                    buttonStyle="solid"
                    defaultValue="available"
                    />
                </div>
                <div className="list_display_inner_space">
                <Table  rowSelection= {select_parameters} 
                        columns= {columns} 
                        pagination={false} 
                        scroll={{ y: 240 }} 
                        className="mission_list"
                        dataSource={this.props.obs} 
                        />
                </div>
            </div>
            );
        }
    }
*/

class Get_Ground_Stations extends React.PureComponent
    {
    constructor (props)
        {
        super (props)
        }

    componentDidMount() 
        {
        const req_headers = new Headers
                (
                    {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': 0,
                    }
                );

        const gs_request = new Request
                (SSC_WS_ACCESS + 'WS/sscr/2/groundStations',
                {
                method: 'GET',
                headers: req_headers,
                mode: 'cors',
                cache: 'default',
              });
              

        fetch (gs_request)
            
        .then (res => res.json())
        .then ( (data) => {
                const stations = data[1].GroundStation[1] ; 
                const GS = [] ;

                for (let i = 0; i < stations.length; i++) 
                    {
                    const loc = stations[i][1].Location [1]

                    //console.log (stations[i][1].Id )

                    const s = { 
                        key: i,
                        id: stations[i][1].Id,
                        name: stations[i][1].Name,
                        latt: loc.Latitude,
                        long: loc.Longitude,
                        } 

                    GS.push (s)
                    
                    } 
                                
                this.props.ground_stations (GS) ;
                }
              )

        .catch (console.log)
        }

    render ()
        {
        return (null) ;
        }
    }

class Get_Observatories extends React.PureComponent
    {
    constructor (props)
        {
        super (props)

        this.find_default_properties = this.find_default_properties.bind (this) ;
        }

    find_default_properties (name)
        {
        let i = 0 ;
        let found = false ;

        const r = {color: DEF_SC_COLOR, shape: DEF_SC_SHAPE, style: DEF_ORB_STYLE}

        while (i < this.props.display_properties.length)
            {
            if  (name === this.props.display_properties [i].name)
                {
                found = true ;
                break ;
                }

            i++ ;
            }

        // if  (name === "yohkoh") alert ("done search " + i + " " + found) ;
        if  (found)
            {
            const triple = this.props.display_properties [i].color ;

            const red   = ('0' + triple[0].toString(16).toUpperCase()).slice (-2) ;
            const green = ('0' + triple[1].toString(16).toUpperCase()).slice (-2) ;
            const blue  = ('0' + triple[2].toString(16).toUpperCase()).slice (-2) ;

            r.color = "#" + red + green + blue ;

            switch (this.props.display_properties [i].shape)
                {
                case "sphere" :

                    r.shape = "sphere" ;
                    break ;

                case "cube" :

                    r.shape = "cube" ;
                    break ;

                case "cylinder" :

                    r.shape = "cylinder" ;
                    break ;

                case "cone" :

                    r.shape = "cone" ;
                    break ;
            
                default:

                    break ;
                }
            }

            // console.log (JSON.stringify (this.props.display_properties [i]))

            if  (this.props.display_properties [i]?.style)
                {
                r.style = this.props.display_properties [i]?.style
                }

            if  (this.props.display_properties [i]?.orbit)
                {
                r.orbit = this.props.display_properties [i]?.orbit
                }

            if  (this.props.display_properties [i]?.cadence)
                {
                r.cadence = this.props.display_properties [i]?.cadence
                }

            // console.log (JSON.stringify (r))

            return r ;
        }

    componentDidMount() 
        {
        const req_headers = new Headers
                (
                    {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': 0,
                    }
                );

        const obs_request = new Request
                (SSC_WS_ACCESS + 'WS/sscr/2/observatories', //https://sscweb-dev.sci.gsfc.nasa.gov
                {
                method: 'GET',
                headers: req_headers,
                mode: 'cors',
                cache: 'default',
              });
              

        fetch (obs_request)
            
        .then (res => res.json())
        .then ( (data) => {
                          const obs = data [1].Observatory[1] 
                          const sats = [] ;
                          const start_time = this.props.start_time ;
                          const end_time = this.props.end_time ;

                          for (let i = 0; i < obs.length; i++) 
                              {
                              // Exclude all BARREL missions
                              if  ((obs[i][1].Id).startsWith ('barrel'))
                                  {
                                  continue
                                  }

                              const obs_start_time = moment.utc(obs[i][1].StartTime[1]).valueOf() ;
                              const obs_end_time   = moment.utc(obs[i][1].EndTime[1]).valueOf() ;
                              const available = (end_time < obs_start_time || start_time > obs_end_time )? false : true ;

                              const d = this.find_default_properties (obs[i][1].Id) ;

                              const o = {
                                    key: i,
                                    id: obs[i][1].Id,
                                    name: obs[i][1].Name,
                                    color: d.color,
                                    shape: d.shape,
                                    start_time: obs_start_time,
                                    end_time: obs_end_time,
                                    display: false,
                                    available: available,
                                    orbit: d.orbit,
                                    cadence: d.cadence             
                                    } 
                              //console.log (o.id)
                              sats.push (o)
                              } 
                                
                          this.props.obs (sats) ;
                          }
              )

        .catch (console.log)
        }

    render ()
        {
        return (null) ;
        }
    }
class  Grid_Options extends React.Component
    {
    render ()
        {
        return (
            <>
                <div className="op_action">
                    <span style={{width: "10em"}}> Grid Size </span>
                    <InputNumber 
                        name={'size'}
                        controls={true}
                        defaultValue={DEF_GRID_SIZE}
                        min={1}
                        onBlur={this.props.update}
                        />
                    </div>
                <div className="op_action">
                    <span style={{width: "10em"}}> Grid Cell Size </span>
                    <InputNumber
                        name={'scale'}
                        controls={true}
                        defaultValue={DEF_GRID_SCALE}
                        min={1}
                        onBlur={this.props.update}
                        />
                </div>
                <div className="op_action">
                    <span style={{width: "10em"}}> Offset From Center </span>
                    <InputNumber
                        name={'offset'}
                        controls={true}
                        defaultValue={DEF_GRID_OFFSET}
                        onBlur={this.props.update}
                        />
                </div>
            </>
            ) ;
        }
    }

// This probably needs to go somewhere else.
/*
class Control_Layout extends React.Component 
    {
    constructor (props)
        {
        super (props)    

        this.state =  {
            selected: []
            }

        this.handle_select_change  = this.handle_select_change.bind (this) 
        this.componentDidMount = this.componentDidMount.bind (this)
        this.add_spacecraft = this.add_spacecraft.bind (this)
        this.close_action = this.close_action.bind (this)
        }
        
    add_spacecraft (record)
        {
        if  (V3DSpace.end_time < record.start_time || V3DSpace.start_time > record.end_time )
            {
            const status_msg = {
                content: 'Orbit data not available for selected time range.',
                className: 'time_set_error',
                style: {marginTop: '15vh',},
                }

            message.error (status_msg) 

            return false
            }

        V3DSpace.add_spacecraft ({
            id: record.id, 
            color: record.color, 
            shape: record.shape, 
            focus: null,
            name: record.name, 
            type: ENT_type.SPACECRAFT, 
            start_time: record.start_time, 
            end_time: record.end_time,
            orbit_class: record.orbit, 
            cadence: record.cadence
            })

        record.display = true 

        return true 
        }

    handle_select_change (record, add_flag) 
        {
        if  (add_flag)
            {

            if  (! this.add_spacecraft(record))
                {
                return false
                }

            const current_selection = this.state.selected 
            const new_selection = [...current_selection, record.key] 
 
            this.setState ({selected: new_selection,})

            return true
            }

        else
            {
            const current_selection = this.state.selected 
            const i = current_selection.indexOf (record.key) 
                
            const new_selection = 
                (current_selection.length > 0) ?
                    [...current_selection.slice(0,i),...current_selection.slice(i+1)] :
                    [] ;
         
            record.display = false 

            V3DSpace.remove (record.id) 

            this.setState ({selected: new_selection,})

            return true
            }
        }

    componentDidMount ()
        {
        const sc_id = this.props.sats.map (s => s.id)
        const select = []

        this.props.request.forEach (e =>
            {
            const id = sc_id.indexOf (e)

            if  (id !== -1)
                {
                if  (this.add_spacecraft (this.props.sats [id]))
                    {
                    select.push (this.props.sats [id].key)
                    }
                }            
            }) ;

        this.setState ({selected: select,})        
        }

    close_action ()
        {
        V3DSpace.update_orbit_data ().then (failed => {
            if  (failed.length > 0)
                {
                let select = [...this.state.selected]

                failed.forEach (id => {
                     
                    const rec = this.props.sats.findIndex (sat => sat.id === id) 
                    const i = select.indexOf (rec)

                    select = (select.length > 0) ? [...select.slice(0,i),...select.slice(i+1)] : []
                     
                    this.props.sats [rec].display = false
                    })

                this.setState ({selected: select,})
                }
            })

        this.props.hide_l_sidebar ()
        }


    render ()
        {
        const { Title } = Typography;

        return (
            <div className="controls">
                <div className="controls_title_bar">
                    <Title style={{color: "#EEEEDE"}} level={3}>Viewer Controls</Title>
                    <Button
                        size="large"
                        type="ghost"
                        style={{border: "none"}}
                        onClick={this.props.display_help} 
                        >
                        <img src={help_icon} className= "icon_image" alt="" />
                    </Button> 
                </div>
                <Divider style={{borderColor: "#FFFFFF"}} />
                <div className="cp_subsection_title ">
                    Select start of display interval:
                </div>
                <Calendar   
                    lbl={'Start Time'}
                    time={this.props.start_time}
                    update_time={this.props.update_view_start_time}
                    />
                <div className="cp_subsection_title cp_subsection_title_space">
                    Select end of display interval:
                </div>
                <Calendar   
                    lbl={'End Time'}
                    time={this.props.end_time}
                    update_time={this.props.update_view_end_time}
                    />
                <div className="cp_subsection_title cp_subsection_title_space">
                    Select observatories:
                </div>
                <Display_Table 
                    get_new_color={this.props.get_new_color}
                    get_new_shape={this.props.get_new_shape}
                    set_focus={this.props.set_focus}
                    obs={this.props.sats}
                    selected={this.state.selected}
                    request={this.props.request}
                    handle_select_change={this.handle_select_change}
                    />
                <Button 
                    type="primary" 
                    size='large' 
                    onClick={this.close_action}
                    style={{
                        transform:'rotate(90deg)',
                        position: 'absolute',
                        top: '15%',
                        left: '90%'
                        }}
                    >
                    Display Orbits      
                </Button>
    
            </div>
            ) ;
        }
    }
*/

class Read_Properties_File extends React.Component
    {
    constructor (props)
        {
        super (props) ;
        }

    componentDidMount ()
        {
        fetch(properties)
            .then(r => r.text())
            .then(text => {
                const lines = text.split ("\n") ;

                const s = [] ;

                for (let i = 0 ; i < lines.length ; i++)
                    {
                    // const [mission, r, g, b, shape] = lines [i].split (/[\s,]/) ;
                    const f = lines [i].split (/[\s,]/)

                    const mission = f.shift ()

                    if  (f.length === 0 || f [0] === "*")
                        {
                        if  (f [0] === "*")
                            {
                            f.shift ()
                            }

                        f.unshift (UNASSIGNED_SC_COLOR [0], UNASSIGNED_SC_COLOR [1], UNASSIGNED_SC_COLOR [2]) 
                        }
                        
                    const r = f.shift ()
                    const g = f.shift ()
                    const b = f.shift ()

                    if  (f.length === 0 || f [0] === "*")
                        {
                        if  (f [0] === "*")
                            {
                            f.shift ()
                            }

                        f.unshift (UNASSIGNED_SC_SHAPE)
                        }

                    const shape = f.shift ()

                    if  (f.length === 0 || f [0] === "*")
                        {
                        if  (f [0] === "*")
                            {
                            f.shift ()
                            }

                        f.unshift (UNASSIGNED_ORBIT_STYLE)
                        }

                    const style = f.shift ()
        
                    const orbit = (f.length === 0)? "L" : f.shift ()
                    const cadence = (f.length === 0)? 60 : f.shift ()

                    //console.log ("mission %s shape %s style %s orbit %s ", mission, shape, style, orbit)
                    s.push ({
                        name: mission, 
                        color: [+r,+g,+b], 
                        shape: shape,
                        style: style,
                        orbit: orbit,
                        cadence: cadence
                        }) ;
                    }
                

                // update the whatever.
                this.props.set_properties (s) ;
                });
        }

    render ()
        {
        return (null) ;
        }
    }

class Options extends React.Component
    {
    constructor (props)
        {
        super (props) ;
        
        this.state = {
            axes_length_slider_disable: this.props.axes_length === 0,
            axes_length: this.props.axes_length === 0 ? 1 : this.props.axes_length,
            display_bg_palette: false, 
            }

        this.marks = {
            1:  '1',
            2:  '2',
            3:  '3',
            4:  '4',
            5:  '5',
            6:  '6',
            7:  '7',
            8:  '8',
            }

        this.toggle_axes = this.toggle_axes.bind (this) ;
        this.update_axes_length = this.update_axes_length.bind (this) ;
        this.toggle_bg_color_palette = this.toggle_bg_color_palette.bind (this) ;
        this.create_bg_color_palette = this.create_bg_color_palette.bind (this) ;
        }

    toggle_axes (event)
        {
        const new_state = this.state.axes_length_slider_disable? false: true ;

        this.props.toggle_axes_display (event) ;

        this.setState ({
            axes_length_slider_disable: new_state,
            axes_length: 1,
            }) ;
        }

    create_bg_color_palette ()
        {
        if  (! this.state.display_bg_palette)
            {
            return (
                <div className="op_action"  >
                    <Button
                        size="large"
                        type="ghost"
                        onClick={this.toggle_bg_color_palette} 
                        style={{border: "none"}}
                        >
                        <DownSquareOutlined style={{ fontSize: '32px'}}/>
                    </Button>
                </div>
                ) ;
            }

        return (
            <div className="op_action"  >
                <SketchPicker   
                    onChangeComplete={ this.props.update_bg_color } 
                    color={this.props.bgcolor}
                    disableAlpha={ true }
                    width={'60%'}
                    />
                <Button
                    size="large"
                    type="ghost"
                    onClick={this.toggle_bg_color_palette} 
                    style={{border: "none"}}
                    >
                    <UpSquareOutlined style={{ fontSize: '32px'}}/>
                </Button>

            </div>
            ) ;
        }

    toggle_bg_color_palette ()
        {
        this.setState ({display_bg_palette: ! this.state.display_bg_palette}) ;
        }

    update_axes_length (new_axes_length)
        {
        this.props.update_axes_length (new_axes_length) ;

        this.setState({axes_length: new_axes_length}) ;
        }

    render ()
        {
        const cp = this.create_bg_color_palette () ;
        return (
            <div className='grid' style={{gap: '1.2em'}}>
                <div className='grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="bottom-right" 
                        anchor_point="left"
                        offset="50px"
                        background={TT_BGCOLOR}                            
                        text={`Hide time selection slider except for when the mouse hovers over 
                                the bottom of the screen.  When disabled, the time selection slider
                                will always be visible.`}
                        >
                        <span>Hide Time Selection Slider Except On Mouse Over</span>
                    </V_Tooltip>
                    <Switch 
                        onChange={this.props.toggle_hide_time_control}
                        checked={this.props.hide_time_control}
                        />
                </div>
                <div className= 'grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="right" 
                        anchor_point="left"
                        offset="200px"
                        background={TT_BGCOLOR}                            
                        text={`Display spacecraft orbits relative to the selected target planet or
                                object even if a coordinate system has not been implemented for that
                                reference frame.`}
                        >
                        Display orbits relative to target
                    </V_Tooltip>
                    <Switch 
                        onChange={this.props.toggle_relative_orbits}
                        checked={this.props.show_relative_orbits}
                        />
                </div>
                <div className= 'grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="right" 
                        anchor_point="left"
                        offset="200px"
                        background={TT_BGCOLOR}                            
                        text={`Show floating labels near displayed spacecraft. When disabled,
                                no floating labels will be visible.`}
                        >
                        Show spacecraft labels
                    </V_Tooltip>
                    <Switch 
                        onChange={this.props.toggle_show_decals}
                        checked={this.props.show_decals}
                        />
                </div>
                <div className='grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="right" 
                        anchor_point="left"
                        offset="200px"
                        background={TT_BGCOLOR}                            
                        text={`Show floating labels near planets. When disabled,
                                no floating labels will be visible.`}
                        >
                        Show planet labels
                    </V_Tooltip>
                    <Switch 
                        onChange={this.props.toggle_show_planet_decals}
                        checked={this.props.show_planet_decals}
                        />
                </div>
                <div className='grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="right" 
                        offset="200px"
                        anchor_point="left"
                        background={TT_BGCOLOR}                            
                        text={`Display or hide XYZ axes markers.`}
                        >
                        Display Axes
                    </V_Tooltip>
                    <Switch 
                        onChange={this.toggle_axes }
                        checked={! this.state.axes_length_slider_disable}
                        />
                </div>
                <div className='grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="right" 
                        anchor_point="left"
                        offset="200px"
                        background={TT_BGCOLOR}                            
                        text={`Set the length of the XYZ axes markers when visible.`}
                        >
                        Set Axes Length
                    </V_Tooltip>
                    <div style = {{flex: '1 1 auto', margin: '0 0 0 3em', alignSelf: 'flex-end'}}>
                        <Slider 
                            min={1}
                            max={8}
                            value={this.state.axes_length}
                            marks={this.marks}
                            dots={true}
                            disabled={this.state.axes_length_slider_disable}
                            onChange={this.update_axes_length}
                            />
                    </div>
                </div>
                <div className='grid-row op-text grid-col-span'>
                    <V_Tooltip    
                        align="right" 
                        anchor_point="left"
                        offset="200px"
                        background={TT_BGCOLOR}                            
                        text={`Select a color to use for the background (sky).`}
                        >
                        Set Background Color
                    </V_Tooltip>
                    {cp}
                </div>
                <div className='grid-row op-text grid-col-span'>                    
                    <V_Tooltip    
                        align="top-right" 
                        anchor_point="left"
                        offset="50px"
                        background={TT_BGCOLOR}                            
                        text={`Display an overlay that gives the position in GSE coordinates of 
                                every currently displayed spacecraft.`}
                        >
                        Display Spacecraft Position Overlay
                    </V_Tooltip>
                    <Switch 
                        onChange={this.props.toggle_show_sc_position}
                        checked={this.props.show_sc_position}
                        />
                </div>
                <div className='grid-row'>
                    <div className='grid-col-1 op-text'>
                            <V_Tooltip    
                                align="top-right" 
                                anchor_point="left"
                                offset="50px"
                                background={TT_BGCOLOR}                            
                                text={`Set the overall size, grid size and offset from center
                                        of the XZ axis grid plane.`}
                                >
                                XZ Grid Plane Options
                            </V_Tooltip>
                    </div>
                    <div className='grid-col-2 op-text-light'>
                    <Grid_Options 
                            key="xz"
                            update={this.props.set_xz_grid_options}
                            />                        
                    </div>
                </div>
                <div className='grid-row'>
                    <div className='grid-col-1 op-text'>
                            <V_Tooltip    
                                align="top-right" 
                                anchor_point="left"
                                offset="50px"
                                background={TT_BGCOLOR}                            
                                text={`Set the overall size, grid size and offset from center
                                        of the YZ axis grid plane.`}
                                >
                                YZ Grid Plane Options
                             </V_Tooltip>
                    </div>
                    <div className='grid-col-2 op-text-light'>
                    <Grid_Options 
                            key="yz"
                            update={this.props.set_yz_grid_options}
                            />
                    </div>
                </div>
                <div className='grid-row'>
                    <div className='grid-col-1 op-text'>
                            <V_Tooltip    
                                align="top-right" 
                                anchor_point="left"
                                offset="50px"
                                background={TT_BGCOLOR}                            
                                text={`Set the overall size, grid size and offset from center
                                        of the XY axis grid plane.`}
                                >
                                XY Grid Plane Options
                            </V_Tooltip>
                    </div>
                    <div className='grid-col-2 op-text-light'>
                    <Grid_Options 
                            key="xy"
                            update={this.props.set_xy_grid_options}
                            />
                    </div>
                </div>
                <Save_Log_Menu 
                    save={this.props.save}
                    update_save_target={this.props.update_save_target}
                    save_file_name={this.props.save_file_name} 
                    update_save_file_name={this.props.update_save_file_name}
                    text="Show or Save Log File"
                    helptext="Show or save the content of the console log."
                    action={this.props.log_action}
                    />
            </div>
            ) ;
        }
    }

class Listing_Select_Row extends React.Component
    {
    constructor (props)
        {
        super (props) ;
        }

    render ()
        {
        return (
            <div className='grid-row'
                key={this.props.id}
                >
                    <div className="grid-checkbox op-text" >
                        <V_Checkbox
                            name={this.props.spacecraft}
                            index={this.props.index}
                            checked={this.props.checked}
                            onChange={this.props.update}
                            label={this.props.spacecraft}
                            />
                    </div>

            </div>
            )
        }

    }

class Listing_Select extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
           } ;

        this.get_output_type = this.get_output_type.bind (this) ;
        }

    get_file_name ()
        {
        return (
            <>
                <div className="op-text">
                            File Name:
                </div>
                
                <div className="op-text" style={{width: "50%"}}>
                    <input
                        type='text'
                        style={{width: "100%",
                                height: "2em",
                                padding: "0.2em",
                                fontSize: ".95em",
                                boxSizing: "border-box"}}
                        value={this.props.save_file_name}
                        id="get_user_string"
                        onChange={this.props.update_save_file_name}
                        />
                </div>
            </>
            ) ;
        }
   
    get_output_type () 
        {
        const request_file_name = this.get_file_name ()

        /*
            <Radio.Group onChange={this.props.update_save_target} value={this.props.save}>
                <Radio value={true}>Save File</Radio>
                <Radio value={false}>Open in New Window</Radio>
            </Radio.Group>
        */

        return (
            <>
                <div style={{
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    }}
                    >
                    <div className='op-text' style={{flex: 1}}>
                        Show or Save Orbit Data
                    </div>
                    <div className='op-text' 
                        style={{display: 'flex', 
                                flexDirection: 'column', 
                                gap: '.3em',
                                width: '40%',
                                }}
                        >
                        <V_Radio_Button
                            grroup="save_target"
                            name="file"
                            checked={this.props.save}
                            label="Save to File"
                            required = {true}
                            onChange={this.props.save_target_select}
                            />
                        <V_Radio_Button
                            group="save_target"
                            name="new_window"
                            checked={!this.props.save}
                            label="Open in New Window"
                            onChange={this.props.save_target_select}
                            />
                    </div>
                </div>
                {this.props.save && request_file_name}
            </>
            )
        }

    render ()
        {
        return (
            <div className='grid' style={{gap: '.5em',}}>
                    {
                    this.props.sc.map ((id, i) =>
                        <Listing_Select_Row  
                            update={this.props.update}
                            checked={this.props.list[i]}
                            spacecraft={id}
                            key={id}
                            id={id}
                            index={i}
                            /> 
                        )
                    }
                <div style={{flex: 1}}></div>
                {this.get_output_type ()}
            </div>                            
            ) ;
        }
    }

class Coordinate_System_Select extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
           req_coord_system: this.props.system,
           // ref_frame: this.props.current_ref_frame 
           } ;

        this.local_update = this.local_update.bind (this)
        // this.select_rotating_ref_frame = this.select_rotating_ref_frame.bind (this)
        }

    /*
    select_rotating_ref_frame (e)
        {
        this.setState ({ref_frame: e.target.checked})

        this.props.update_ref_frame (e)
        }
    */

    local_update (name, index, checked)
        {
        this.setState ({req_coord_system: key_to_coord_system (name)})

        this.props.update (name, index, checked)
        }

    render ()
        {
            /* Saved in case I want to use it later...
                <div className="op-horizontal-line"></div>
                <div className="op_row">
                    <div className="op_checkbox">
                        <Checkbox 
                            name="ER_frame" 
                            checked={this.state.ref_frame} 
                            onChange={this.select_rotating_ref_frame}>
                        </Checkbox>
                    </div>
                    <div className="op-text op_label" >
                        
                    </div>
                    <div className="op-text-light" >
                        Use Earth Centered / Earth rotating reference frame
                    </div>
                </div>
            */


        return (
            <div className='grid' style={{gap: '.5em'}}>
                <div className='grid-row grid-col-center op-text-subtitle'>
                    Geocentric Coordinate Systems 
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="GSE"
                            name="gse"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.GSE}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Geocentric Solar Ecliptic
                    </div>                   
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="GEI"
                            name="gei"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.GEI}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Geocentric Equatorial Inertial
                    </div>                   
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="J2000"
                            name="gei2000"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.GEI2000}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Geocentric Equatorial Inertial for epoch J2000.0
                    </div>   
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="GSM"
                            name="gsm"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.GSM}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Geocentric Solar Magnetospheric system
                    </div>   
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="SM"
                            name="sm"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.SM}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Solar Magnetic coordinates
                    </div>   
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="GEO"
                            name="geo"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.GEO}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Geographic coordinate system
                    </div>   
                </div>
                <div className="op-horizontal-line"></div>
                <div className='grid-row grid-col-center op-text-subtitle'>
                    Heliocentric Coordinate Systems
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="HAE"
                            name="hae"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.HAE}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Heliocentric Aries Ecliptic
                    </div>   
                </div>
                <div className='grid-row op-text'>
                    <div className="op_checkbox">
                        <V_Checkbox
                            label="HEE"
                            name="hee"
                            offset=".2em"
                            checked={this.state.req_coord_system === COORD_System.HEE}
                            onChange={this.local_update}
                            />
                    </div>
                    <div className="op-text-light" >
                        Heliocentric Earth Ecliptic
                    </div>   
                </div>
           </div>
            ) ;
        }
    }

class Screen_Image extends React.Component
    {
    // Used to display thumbnail of the screen shot that will be saved
    constructor (props)
        {
        super (props) 

        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        this.componentDidMount = this.componentDidMount.bind (this)
        this.post_render = this.post_render.bind (this)
        this.create_video_disp = this.create_video_disp.bind (this)
        this.create_canvas_disp = this.create_canvas_disp.bind (this)
        this.display_area = this.display_area.bind (this)

        this.img = React.createRef () ;
        }

    post_render ()
        {
        if  (! this.props.screen_capture.is_video)
            {
            // Update the background color
            this.props.screen_capture.update_compost_bg_color (this.props.bg_color)

            // Copy the screen capture into the thumbnail canvas.
            const img_width  = this.props.img_width
            const img_height = this.props.img_height

            const ctx = this.img.current.getContext('2d')

            ctx.drawImage (this.props.screen_capture.img, 0, 0, img_width, img_height)
            }
        
        else
            {
            const blob = this.props.screen_capture.get_video_data ()
            const url = URL.createObjectURL(blob)

            this.img.current.src = url
            }
        }

    componentDidMount ()
        {
        this.post_render ()
        }

    componentDidUpdate ()
        {
        this.post_render ()
        }

    display_area ()
        {
        if  (this.props.screen_capture.is_video)
            {
            return this.create_video_disp ()
            }

        else 
            {
            return this.create_canvas_disp ()
            }
        }

    create_canvas_disp ()
        {
        const e = 
            <canvas
                width={this.props.img_width}
                height={this.props.img_height} 
                ref={this.img}
                >
            </canvas> ;

        return e
        }

    create_video_disp ()
        {
        const s = {
            width: this.props.img_width + 'px',
            height: this.props.img_height + 'px',
            }

        const v = 
            <video id="preview" 
                controls 
                muted 
                autoplay 
                loop 
                style={s}
                ref={this.img}
                >
            </video> ;

        return v
        }

    render ()
        {
        const display = this.display_area ()

        const img_style = {
            height: Math.floor (this.props.img_height * 1.2) + 'px',
            textAlign: "center",
            verticalAlign: "center",
            padding: "5px",
            }

        return (
            <div className='grid-row op-text grid-col-center'>
                <div style = {img_style}>
                    {display}
                </div>
            </div>
            ) ;
        }
    }

class Img_File_Select extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
           } ;

        this.get_file_name=this.get_file_name.bind (this)
        this.render = this.render.bind (this)
        }

    get_file_name ()
        {
        return (
            <>
                <div className='grid-row op-text grid-col-span'>
                        <div className='op-text grid-col-span'>
                            File Name:
                        </div>
                </div>
                
                <div className='grid-row op-text grid-col-span' style={{width: "50%"}}>
                    <input
                        type='text'
                        style={{width: "100%",
                                height: "2em",
                                padding: "0.2em",
                                fontSize: ".95em",
                                boxSizing: "border-box"}}
                        value={this.props.save_file_name}
                        id="get_user_string"
                        onChange={this.props.update_save_file_name}
                        />
                </div>
            </>
            ) ;
        }
   
    render ()
        {
        const request_file_name = this.get_file_name ()

        let save_desc  = ""
        let save_desc_tt = ""

        if  (this.props.screen_capture.is_video)
            {
            save_desc =   'Show or Save a Video Clip'
            save_desc_tt = `Select the appropriate action to save the captured
                            video clip as a webm file or display it in a new
                            browser window.`
            }

        else
            {
            save_desc =   'Show or Save a Screenshot of the Current Screen'
            save_desc_tt = `Select the appropriate action save the screenshot
                            as a PNG image or display in a new browser window.`
            }

        return (
            <> 
                <div style={{
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    }}
                    >
                    <div className='op-text' style={{flex: 1}}>
                        <V_Tooltip    
                            align="right" 
                            offset="50px"
                            background={TT_BGCOLOR}                            
                            text={save_desc_tt}
                            >
                            {save_desc}
                        </V_Tooltip>
                    </div>
                    <div className='op-text' 
                        style={{display: 'flex', 
                                flexDirection: 'column', 
                                gap: '.3em',
                                width: '40%',
                                }}
                        >
                        <V_Radio_Button
                            group="img_save_target"
                            name="file"
                            checked={this.props.save}
                            label="Save to File"
                            required = {true}
                            onChange={this.props.update_save_target}
                            />
                        <V_Radio_Button
                            group="img_save_target"
                            name="new_window"
                            checked={!this.props.save}
                            label="Open in New Window"
                            onChange={this.props.update_save_target}
                            />
                    </div>
                </div>
                {this.props.save && request_file_name}
            </>
            ) ;
        }
    }

class IMG_Save_Modal extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        this.background_colors = [
            "#f44336", 
            "#e91e63", 
            "#9c27b0", 
            "#673ab7", 
            "#3f51b5", 
            "#2196f3", 
            "#03a9f4", 
            "#00bcd4", 
            "#000000", 
            "#4caf50", 
            "#8bc34a", 
            "#cddc39", 
            "#ffeb3b", 
            "#ffc107", 
            "#ff9800", 
            "#ff5722", 
            "#795548", 
            "#607d8b"
            ]

        this.state = {
            display_bg_palette: false, 
            bg_color: this.background_colors [8],
            }


        this.create_save_bg_color_palette=this.create_save_bg_color_palette.bind (this)
        this.toggle_bg_color_palette=this.toggle_bg_color_palette.bind (this)
        this.palette_button = this.palette_button.bind (this)
        this.orphan_palette = this.orphan_palette.bind (this)
        this.palette_chooser = this.palette_chooser.bind (this)
        this.update_bg_color = this.update_bg_color.bind (this)
        }

    toggle_bg_color_palette ()
        {
        this.setState ({display_bg_palette: ! this.state.display_bg_palette}) ;
        }

    update_bg_color (color)
        {
        this.setState ({bg_color: color.hex})
        }

    button_show ()
        {
        return (
            <Button
                size="large"
                type="ghost"
                onClick={this.toggle_bg_color_palette} 
                style={{border: "none"}}
                >
                <DownSquareOutlined style={{ fontSize: '32px'}}/>
            </Button>
            ) ;
        }

    button_hide ()
        {
        return (
            <Button
                size="large"
                type="ghost"
                onClick={this.toggle_bg_color_palette} 
                style={{border: "none"}}
                >
                <UpSquareOutlined style={{ fontSize: '32px'}}/>
            </Button>
            ) ;
        }

    palette_button ()
        {
        return (this.state.display_bg_palette)? this.button_show () : this.button_hide ()
        }

    create_save_bg_color_palette ()
        {
        return (
            <div className="op_action"  >
                {this.palette_chooser ()}
                {this.palette_button ()}
            </div>
            ) ;
        }

    orphan_palette_button ()
        {
        return (
            <div className="op_action">
                {this.palette_button ()}
            </div>
            ) ;
        }

    palette_chooser ()
        {
        if  (this.state.display_bg_palette)
            {
            return (
                <CirclePicker
                    onChangeComplete={ this.update_bg_color } 
                    colors={this.background_colors}
                />
                ) ;
            }

        return (null)
        }

    orphan_palette ()
        {
        if  (this.state.display_bg_palette)
            {
            return (
                <div className='grid-row op-text grid-col-span'>
                            {this.palette_chooser ()}
                </div>
                ) ;
            }

        return (null)
        }

    create_color_select_control ()
        {
        if  (this.props.screen_capture.is_video)
            {
            return null 
            }

        if  (this.props.use_narrow_format)
            {
            const r = 
                <>
                    <div className='grid-row op-text grid-col-span'>
                                <V_Tooltip    
                                    align="right" 
                                    offset="50px"
                                    background={TT_BGCOLOR}                            
                                    text={`Select a color to use for the background of 
                                            the saved image.`}
                                    >
                                    Set Background Color for Image Save
                                </V_Tooltip>
                            {this.orphan_palette_button ()}
                    </div> 
                    {this.orphan_palette ()}
                </> ;

            return r
            }

        else 
            {            
            const r = 
                <div className='grid-row op-text grid-col-span'>
                            <V_Tooltip    
                                align="right" 
                                offset="50px"
                                background={TT_BGCOLOR}                            
                                text={`Select a color to use for the background of 
                                        the saved image.`}
                                >
                                Set Background Color for Image Save
                            </V_Tooltip>
                        {this.create_save_bg_color_palette () }
                </div> ;
            return r
            }
        }

    render ()
        {
        //const color_select = this.create_color_select_control ()
        //update save target should update the file name that the image/video will be saved to

        return (
                <div className='grid' style={{gap: '.5em'}}>
                        <Screen_Image 
                            bg_color={this.state.bg_color}
                            img_width={this.props.img_width}
                            img_height={this.props.img_height}
                            screen_capture={this.props.screen_capture}
                            />
                        {this.create_color_select_control ()}
                        <Img_File_Select
                            update_save_target={this.props.update_save_target}
                            save={this.props.save}
                            save_file_name={this.props.save_file_name}
                            screen_capture={this.props.screen_capture}
                            update_save_file_name={this.props.update_save_file_name}
                            />
                </div>
            )
        }
    }

class Base_Layout extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        //const default_grid_setting = {
        //    size: 20, 
        //    scale: 1, 
        //    offset: 0, 
        //    color: ""
        //    }

        this.state =  {
            l_sidebar_visible: false,
            axes_length: 1,
            show_options_dialog: false,
            show_save_dialog: false,
            show_image_dialog: false, // needed
            show_coord_dialog: false,
            // capture: null,
            list: Array.from ({ length: V3DSpace.get_number_sc () }, () => false),
            bgcolor: DEF_BACKGROUND_COLOR,
            save_file_name: "orbit_data",
            img_save_file_name: "screenshot",
            log_save_file_name: "log",
            save_to_file: false,
            img_save_to_file: false,
            log_save_to_file: false,
            hide_time_control: false,
            dialog_box : null,
            show_decals: true,
            show_planet_decals: true,
            show_sc_position: true,
            dark_screen: false,
            screen_capture: null, 
            sc_select_filter: SELECT_TYPE.available,
             //coord_system: V3DSpace.coord_system, 
            //xz_grid_options: {...default_grid_setting},
            //yz_grid_options: {...default_grid_setting},
            //xy_grid_options: {...default_grid_setting},
            }

        this.ui = React.createRef ()

        this.capture = new OffscreenCanvas (256, 256)

        document.getElementById('bg').style.backgroundColor = this.state.bgcolor

        this.show_l_sidebar = this.show_l_sidebar.bind (this) ;
        this.hide_l_sidebar = this.hide_l_sidebar.bind (this) ;
        this.toggle_l_sidebar = this.toggle_l_sidebar.bind (this) ;
        this.display_main_help_dialog = this.display_main_help_dialog.bind (this) ;
        this.display_transport_bar_help_dialog = this.display_transport_bar_help_dialog.bind (this)
        this.open_option_menu = this.open_option_menu.bind (this) ;
        this.close_option_menu = this.close_option_menu.bind (this) ;
        this.open_save_menu = this.open_save_menu.bind (this) 
        this.copy_search_url = this.copy_search_url.bind (this)
        //this.update_compost_bg_color=this.update_compost_bg_color.bind (this)
        this.open_image_save_menu = this.open_image_save_menu.bind (this) // need to resurect this
        this.open_coord_dialog = this.open_coord_dialog.bind (this)
        this.close_coord_dialog = this.close_coord_dialog.bind (this)
        this.close_image_save_menu = this.close_image_save_menu.bind (this) ;
        this.update_selected_for_save = this.update_selected_for_save.bind (this) ;
        this.save_selected_orbits=this.save_selected_orbits.bind (this) ;
        this.save_image=this.save_image.bind (this) ;
        this.update_save_target=this.update_save_target.bind (this) 
        this.update_coord_system = this.update_coord_system.bind (this)
        this.update_img_save_target=this.update_img_save_target.bind (this)
        this.update_log_save_target=this.update_log_save_target.bind (this)
        this.update_axes_length =this.update_axes_length.bind (this) ;
        this.toggle_axes_display = this.toggle_axes_display.bind (this) ;
        this.update_bg_color=this.update_bg_color.bind (this) ;
        this.toggle_hide_time_control=this.toggle_hide_time_control.bind (this) ;
        this.toggle_show_decals=this.toggle_show_decals.bind (this)
        this.toggle_show_planet_decals=this.toggle_show_planet_decals.bind (this)
        this.update_save_file_name=this.update_save_file_name.bind (this)
        this.update_img_save_file_name=this.update_img_save_file_name.bind (this)
        this.update_log_save_file_name=this.update_log_save_file_name.bind (this)
        this.save_or_display_log=this.save_or_display_log.bind (this)
        this.toggle_show_sc_position=this.toggle_show_sc_position.bind (this) ;
        this.set_xz_grid_options=this.set_xz_grid_options.bind (this) ;
        this.set_yz_grid_options=this.set_yz_grid_options.bind (this) ;
        this.set_xy_grid_options=this.set_xy_grid_options.bind (this) ;
        //this.set_screen_capture_background=this.set_screen_capture_background.bind (this)
        this.componentDidMount = this.componentDidMount.bind (this)
        }

    //update_screen_size (width, height)
    //    {
    //    this.setState ({disp_width: width, disp_height: height})
    //    }

    update_bg_color (color)
        {
        // Calculate the new display text color.
        V3DSpace.set_bg_color (color.hex)

        document.documentElement.style.setProperty("--txt_color", V3DSpace.text_color)

        document.getElementById('bg').style.backgroundColor = color.hex
        
        this.setState ({bgcolor: color.hex}) ;
        }

    update_axes_length (new_axes_length)
        {
        V3DSpace.update_axes_length (new_axes_length)

        this.setState ({axes_length: new_axes_length}) ;
        }

    toggle_axes_display ()
        {
        const new_axes_length = (this.state.axes_length === 0)? 1 : 0

        V3DSpace.update_axes_length (new_axes_length)

        this.setState ({axes_length: new_axes_length,}) ;
        }

    toggle_hide_time_control ()
        {
        this.setState ({hide_time_control: (this.state.hide_time_control === false)? true : false,}) ;
        }

    toggle_show_decals ()
        {
        const visible = (this.state.show_decals === false)? true : false

        V3DSpace.set_sc_label_visible (visible)

        this.setState ({show_decals: visible,})
        }

    toggle_show_planet_decals ()
        {
        const visible = (this.state.show_planet_decals === false)? true : false

        V3DSpace.set_planet_label_visible (visible)

        this.setState ({show_planet_decals: visible,})
        }

    toggle_show_sc_position ()
        {
        this.setState ({show_sc_position: (this.state.show_sc_position === false)? true : false,}) ;
        }

    display_main_help_dialog (use_main)
        {
        const w = parseInt (get_help_dialog_style (V3DSpace.width, V3DSpace.height).width, 10)

        const text = (use_main)? main_help : chooser_help

        const md =<div className='help_text'> 
                    <ReactMarkdown 
                        children={text} 
                        remarkPlugins={[remarkGfm]}
                        /> ;
                </div> ;

        const modal = <V_Modal
            width={w}
            content={md}
            onClose={() => this.setState({ dialog_box: null })}
            ref={this.ui}
            buttons={[
                { 
                label: "Close", 
                }
                ]}
            /> ;

        this.setState ({dialog_box: modal})
        }

    display_transport_bar_help_dialog ()
        {
        /*
        const { info } = Modal ;

        const w = parseInt (get_help_dialog_style (V3DSpace.width, V3DSpace.height).width, 10)

        info (
            {
            title: null,
            content: <ReactMarkdown 
                            className="help_text" 
                            children={transport_help} 
                            remarkPlugins={[remarkGfm]}
                            />,
            icon: null,
            centered: true,
            width: w,
            onOk () {},
            }) ;
        */

        const w = parseInt (get_help_dialog_style (V3DSpace.width, V3DSpace.height).width, 10)

        //const text = (use_main)? main_help : chooser_help

        const md =<div className='help_text'> 
                    <ReactMarkdown 
                        children={transport_help} 
                        remarkPlugins={[remarkGfm]}
                        /> ;
                </div> ;

        const modal = <V_Modal
            width={w}
            content={md}
            onClose={() => this.setState({ dialog_box: null })}
            ref={this.ui}
            buttons={[
                { 
                label: "Close", 
                }
                ]}
            /> ;

        this.setState ({dialog_box: modal})
        }

    open_option_menu ()
        {
        this.setState({show_options_dialog: true}) ;
        }

    close_option_menu ()
        {
        this.setState({show_options_dialog: false}) ;
        }

    create_options_dialog ()
        {
        /*
        <Modal
            title={'Options'}
            icon={null}
            centered={true}
            width={opt_dlg_width (dx)}
            style={get_dlg_style (dx, opt_dlg_width)}
            open={this.state.show_options_dialog}
            onCancel={this.close_option_menu}
            footer={[
                <Button type="primary" onClick={this.close_option_menu}>
                    Done
                </Button>,
                ]}
            >
            <Options
                update_axes_length={this.update_axes_length}
                toggle_axes_display={this.toggle_axes_display}
                axes_length={this.state.axes_length}
                bgcolor={this.state.bgcolor}
                update_bg_color={this.update_bg_color}
                hide_time_control={this.state.hide_time_control}
                show_decals={this.state.show_decals}
                show_planet_decals={this.state.show_planet_decals}
                toggle_show_decals={this.toggle_show_decals}
                toggle_show_planet_decals={this.toggle_show_planet_decals}
                show_sc_position={this.state.show_sc_position}
                toggle_show_sc_position={this.toggle_show_sc_position}
                toggle_hide_time_control={this.toggle_hide_time_control}
                set_xz_grid_options={this.set_xz_grid_options}
                set_yz_grid_options={this.set_yz_grid_options}
                set_xy_grid_options={this.set_xy_grid_options}
                update_save_target={this.update_log_save_target}
                save={this.state.log_save_to_file}
                save_file_name={this.state.log_save_file_name}
                update_save_file_name={this.update_log_save_file_name}
                log_action={this.save_or_display_log}

                />
        </Modal>
        */
        return (
            <Options
                update_axes_length={this.update_axes_length}
                toggle_axes_display={this.toggle_axes_display}
                axes_length={this.state.axes_length}
                bgcolor={this.state.bgcolor}
                update_bg_color={this.update_bg_color}
                hide_time_control={this.state.hide_time_control}
                show_decals={this.state.show_decals}
                show_planet_decals={this.state.show_planet_decals}
                toggle_show_decals={this.toggle_show_decals}
                toggle_relative_orbits={this.props.toggle_relative_orbits}
                show_relative_orbits={this.props.relative_orbits}
                toggle_show_planet_decals={this.toggle_show_planet_decals}
                show_sc_position={this.state.show_sc_position}
                toggle_show_sc_position={this.toggle_show_sc_position}
                toggle_hide_time_control={this.toggle_hide_time_control}
                set_xz_grid_options={this.set_xz_grid_options}
                set_yz_grid_options={this.set_yz_grid_options}
                set_xy_grid_options={this.set_xy_grid_options}
                update_save_target={this.update_log_save_target}
                save={this.state.log_save_to_file}
                save_file_name={this.state.log_save_file_name}
                update_save_file_name={this.update_log_save_file_name}
                log_action={this.save_or_display_log}
                />
            ) ;
        }

    create_img_save_dialog ()
        {
        /*
        <Modal
            title={'Save Screenshot or Video Clip'}
            icon={null}
            centered={true}
            width={scr_dlg_width (dx)}
            open={this.state.show_image_dialog}
            style={get_dlg_style (dx, scr_dlg_width)}
            onCancel={this.close_image_save_menu}
            onOk={this.save_image}
            >
            <IMG_Save_Modal 
                img_width={img_width}
                img_height={img_height}
                use_narrow_format={use_min_width (dx)}
                // screen_capture={this.state.capture}
                //update_bg_color={this.update_compost_bg_color}
                // update={this.update_selected_for_save}  // used -- need to check function
                update_save_target={this.update_img_save_target} // misnamed updates save to file flag
                save={this.state.img_save_to_file} // flag, true if image should be saved to file
                save_file_name={this.state.img_save_file_name} // file name of image save file.
                update_save_file_name={this.update_img_save_file_name} //updates image save file name
                screen_capture={this.state.screen_capture}
                />
        </Modal>
        */
        // This is confusing, calling this img_width and img_height.  This should be renamed
        // to disp_width and disp_height (used to calculate how big the 'thumbnail' version
        // of the screenshot will be in the dialog box)
        const [img_width, img_height] = this.get_disp_dimensions (scr_dlg_width (V3DSpace.width), DIALOG_HEIGHT)

        return (
            <IMG_Save_Modal
                img_width={img_width}
                img_height={img_height}
                use_narrow_format={use_min_width (V3DSpace.width)}
                update_save_target={this.update_img_save_target} // misnamed updates save to file flag
                save={this.state.img_save_to_file} // flag, true if image should be saved to file
                save_file_name={this.state.img_save_file_name} // file name of image save file.
                update_save_file_name={this.update_img_save_file_name} //updates image save file name
                screen_capture={this.state.screen_capture}
                />
            ) ;
        }

    create_listing_select ()
        {
        return (
            <Listing_Select
                sc={V3DSpace.get_all_sc_id ()}
                list={this.state.list}
                update={this.update_selected_for_save}
                save_target_select={this.save_target_select.bind (this)}
                save={this.state.save_to_file}
                save_file_name={this.state.save_file_name}
                update_save_file_name={this.update_save_file_name}
                /> 
            ) ; 
        }

    open_save_menu ()
        {
        /*
        <Modal
            title={'Export Orbit Data as Text'}
            icon={null}
            centered={true}
            width={xp_dlg_width (dx)}
            style={get_dlg_style (dx, xp_dlg_width)}
            open={this.state.show_save_dialog}
            onCancel={this.close_save_menu}
            onOk={this.save_selected_orbits}
            >
            <Listing_Select
                selected_id={this.props.selected_id} 
                list={this.state.list}
                update={this.update_selected_for_save}
                update_save_target={this.update_save_target}
                save={this.state.save_to_file}
                save_file_name={this.state.save_file_name}
                update_save_file_name={this.update_save_file_name}
                />
        </Modal>
        */

        const sc = V3DSpace.get_all_sc_id ()

        if  (sc.length === 0)
            {
            const status_msg = `Please select one or more spacecraft before trying to save orbit position data`
    
            V3DSpace.entity_manager.msg_portal.add_alert (ALERT.custom, status_msg, 7) 
            
            return 
            }

        const list = Array.from ({ length: sc.length }, () => false)              
        
        this.setState ({show_save_dialog: true, list: list})    
        }

    copy_search_url ()
        {
        /*
        const { confirm } = Modal ;

        confirm (
            {
            title: 'Copy URL to Recreate Display to Clipboard',
            content: url,
            width: MIN_DIALOG_WIDTH,
            okText: 'Copy',
            icon: <QuestionCircleOutlined />,
            onOk () {navigator.clipboard.writeText(url) ; return false},
            onCancel () {},
            }) ;

        */

        //const w = parseInt (get_help_dialog_style (V3DSpace.width, V3DSpace.height).width, 10)

        //const text = (use_main)? main_help : chooser_help

        const url = V3DSpace.create_url ()

        const url_display =<div 
                                style={{width: '95%', 
                                    overflowWrap: 'anywhere', 
                                    minHeight: '7em'
                                    }}
                                className='op-text'
                                >
                                {V3DSpace.create_url ()}
                            </div> ;

        const modal = <V_Modal
            title='Copy URL to Recreate Display to Clipboard?'
            content= {url_display}
            width= {MIN_DIALOG_WIDTH}
            height={DIALOG_HEIGHT * .7}
            onClose={() => this.setState ({ dialog_box: null })}
            ref={this.ui}
            buttons={[
                { 
                label: "Cancel", 
                },
                {
                label: "Copy",
                onClick: () => {navigator.clipboard.writeText(url) 
                                this.setState ({ dialog_box: null })
                                return false
                                },
                }
                ]}
            /> ;

        this.setState ({dialog_box: modal})
        }

    /*
    set_screen_capture_background (compost, clr="white")
        {
        const ctx = compost.getContext('2d')

        ctx.beginPath ()
        ctx.rect (0, 0, compost.width, compost.height)
        ctx.fillStyle = clr
        ctx.fill()
    
        ctx.drawImage (this.capture, 0, 0)
        }
    */

    /*
    add_time_date (compost)
        {
        const display_time = epoch_to_date_time (V3DSpace.time, true)

        const ctx = compost.getContext('2d')

        ctx.font = "22px Arial"
        ctx.fillStyle = "white"
        ctx.strokeStyle = 'DarkSlateGrey'
        ctx.lineWidth = 2

        const text = "Time: " + display_time 
        const width = ctx.measureText (text).width

        // Draw the time and date on the image
        ctx.strokeText(text, (compost.width / 2 - width / 2).toFixed (), compost.height - 30);
        // ctx.fillText(text, 10, compost.height - 10);
        // ctx.fillText(text, 10, 10);
        
        }
    */

    get_disp_dimensions (dx, dy)
        {
        const ar = V3DSpace.height / V3DSpace.width 

        const bound_x = Math.floor (dx * .8)
        const bound_y = Math.floor (dy / 2)

        const area_1 = bound_x * bound_x * ar
        const area_2 = bound_y * bound_y / ar

        if  (area_1 > area_2)
            {
            return [Math.floor (bound_y / ar), bound_y]
            }

        else
            {
            return [bound_x, Math.floor (bound_x * ar)]
            }
        }

    /*
    update_compost_bg_color (color, event) ///
        {
        const compost = new OffscreenCanvas (V3DSpace.width, V3DSpace.height) 

        this.set_screen_capture_background (compost, color.hex)
        
        this.add_time_date (compost)

        this.setState ({compost: compost})
        }
    */

    
    open_image_save_menu (sc = null)
        {
        const def_name = (sc.is_video)? 'video' : 'screenshot'

        // Take the screen shot as soon as the image is requested.
        this.setState ({
            screen_capture: sc,
            img_save_file_name: def_name,
            show_image_dialog: true,
            })
        }

    close_image_save_menu ()
        {
        this.setState({show_image_dialog: false, }) ;
        }

    open_coord_dialog ()
        {
        /*
        this.setState({show_coord_dialog: true})

        <Modal
            title={'Select A Coordinate System'}
            icon={null}
            centered={true}
            width={opt_dlg_width (dx)}
            style={get_dlg_style (dx, opt_dlg_width)}
            open={this.state.show_coord_dialog}
            onCancel={this.close_coord_dialog}
            footer={[
                <Button type="primary" onClick={this.close_coord_dialog}>
                    Done
                </Button>,
                ]}
            >
            <Coordinate_System_Select
                update={this.update_coord_system}
                system={V3DSpace.coord_system}
                current_ref_frame={V3DSpace.reference_frame === REF_FRAME.ECER}
                update_ref_frame={this.update_reference_frame}
                />
        </Modal>
        */

        const payload = 
            <Coordinate_System_Select
                update={this.update_coord_system}
                system={V3DSpace.coord_system}
                // current_ref_frame={V3DSpace.reference_frame === REF_FRAME.ECER}
                // update_ref_frame={this.update_reference_frame}
                /> ;
        
        
        const modal = <V_Modal
            title='Select A Coordinate System'
            content={payload}
            width={opt_dlg_width (V3DSpace.width)}
            style={get_dlg_style (V3DSpace.width, opt_dlg_width)}
            onClose={() => this.setState({ dialog_box: null })}
            ref={this.ui}
            buttons={[
                { 
                label: "Done", 
                },
                ]}
            /> ;

        this.setState ({dialog_box: modal})
        }

    close_coord_dialog ()
        {
        this.setState({show_coord_dialog: false})
        }

    update_save_target (e)
        {
        this.setState ({save_to_file: e.target.value}) ;
        }

    save_target_select (name, value)
        {
        if  (name === 'file' && value === true)
            {
            // alert (`name: ${name} value: ${value}`)

            this.setState ({save_to_file: value}) 
            }

        else 
            {
            this.setState ({save_to_file: false})         
            }
        }

    update_img_save_target (name, value)
        {
        if  (name === 'file' && value === true)
            {
            this.setState ({img_save_to_file: value}) 
            }

        else 
            {
            this.setState ({img_save_to_file: false})         
            }
        }

    update_log_save_target (name, value)
        {
        if  (name === 'file' && value === true)
            {
            this.setState ({log_save_to_file: value}) 
            }

        else 
            {
            this.setState ({log_save_to_file: false})         
            }
        }

    update_save_file_name (e)
        {
        this.setState ({save_file_name: e.target.value}) ;
        }
 
    update_img_save_file_name (e)
        {
        this.setState ({img_save_file_name: e.target.value})
        }

    update_log_save_file_name (e)
        {
        this.setState ({log_save_file_name: e.target.value})
        }

    save_or_display_log ()
        {
        const log = new Blob (window.log_messages, {type: "text/plain;charset=utf-8"})

        if  (this.state.log_save_to_file)
            {
            saveAs (log, this.state.log_save_file_name) 
            }

        else
            {
            window.open (URL.createObjectURL (log), 
                'listing', 
                'width=800, height=600, left=200, top=200') 
            }
        }

    update_selected_for_save (name, index, checked)
        {
        const newlist = this.state.list.slice () 
        
        newlist [index] = (checked)? true : false 

        this.setState ({list: newlist})
        }

    update_coord_system (name, index, checked)
        {
        V3DSpace.set_coord_system (key_to_coord_system (name))
        this.props.update_coord_system ()
        }


    /* Not needed anymore.
    update_reference_frame (e)
        {
        if  (e.target.checked)
            {
            V3DSpace.set_reference_frame (REF_FRAME.ECER)
            }

        else 
            {
            V3DSpace.set_reference_frame (REF_FRAME.ECI)
            }
        }
    */

    save_selected_orbits ()
        {
        const dfrmt = 'YYYY MMM DD HH:mm:ss' ;
        const lfrmt = '%s      %15.3f  %15.3f  %15.3f\n' ;

        let text = [] ;

        const sc = V3DSpace.get_all_sc_id ()

        for (let i = 0 ; i < this.state.list.length ; i++)
            {
            if  (! this.state.list [i])
                {
                continue ;
                }

            const id = sc [i]
            
            //const time = V3DSpace.get_orbit_times (id)
            //const coord = V3DSpace.get_orbit_coord (id, COORD_System.GSE)

            const time = Orbit_Data.get_time_vector (id)
            const coord = Orbit_Data.get_orbit_vector (id)

            const n = time.length 
            const tstart = moment.utc(time [0]).format(dfrmt) 
            const tend   = moment.utc(time [n-1]).format(dfrmt) 
            const unit_definition = ((unit_to_string (V3DSpace.unit)).match ( /\(([^)]+)\)/)) [1]

            //text.push (orbit_data_header (id, tstart, tend, 'Re', coord_system_to_key (V3DSpace.coord_system))) ;
            text.push (orbit_data_header (id, 
                        tstart, 
                        tend, 
                        'Re', 
                        coord_system_to_key (COORD_System.GSE),
                        unit_definition
                        )) ;

            for (let t = 0 ; t < n ; t++)
                {
                const ts = moment.utc(time [t]).format(dfrmt) ;
                //const loc = new THREE.Vector3 ().fromArray (coord, t*3) ;

                text.push (sprintf (lfrmt, 
                            ts, 
                            coord [t].x, 
                            coord [t].y, 
                            coord [t].z)) ;
                }

            text.push (orbit_data_footer ())
            }    

        if  (text.length !== 0)
            {
            const display = new Blob (text, {type: "text/plain;charset=utf-8"}) ;

            if  (this.state.save_to_file)
                {
                //alert ("saving to file: " + this.state.save_file_name)
                saveAs (display, this.state.save_file_name)
                }
            else
                {
                window.open (   URL.createObjectURL (display), 
                                'listing', 
                                'width=800, height=600, left=200, top=200') ;

                }
            }

        this.setState({ show_save_dialog: false })
        }

    save_image ()
        {
        const fn = this.state.img_save_file_name ;

        // const re_check_png_extension = /^([^.]*).png$/m 
        const re_check_any_extension = /^([^.]*)$/m
        
        const save_file_name = (re_check_any_extension.test (fn))? fn  + '.png': fn

        // Call either save_image or save_video as appropriate
        this.state.screen_capture.save_media (this.state.img_save_to_file, this.state.img_save_file_name)

        this.close_image_save_menu ()
        }

    toggle_l_sidebar ()
        {
        const visible = this.state.l_sidebar_visible 

        if  (visible)
            {
            this.hide_l_sidebar ()
            }

        else
            {
            this.show_l_sidebar ()
            }
        }

    show_l_sidebar () 
        {
        V3DSpace.dim_lights (.2)
        V3DSpace.set_ambient_light (false)
        V3DSpace.hide_all_2D (true)
        this.setState ({l_sidebar_visible: true, dark_screen: true}) ;
        }
        
    hide_l_sidebar ()
        {
        V3DSpace.dim_lights ()
        V3DSpace.set_ambient_light (true)
        V3DSpace.hide_all_2D (false)
        this.setState ({l_sidebar_visible: false, dark_screen: false}) 
        }
        
    set_xy_grid_options (e)
        {
        const key = e.currentTarget.getAttribute ("name") 
        const val = parseInt (e.currentTarget.value) 

        V3DSpace.update_xy_grid_options (key, val)
        }
    

    set_yz_grid_options (e)
        {
        const key = e.currentTarget.getAttribute ("name") 
        const val = parseInt (e.currentTarget.value) 

        V3DSpace.update_yz_grid_options (key, val)
        }
        
    set_xz_grid_options (e)
        {
        const key = e.currentTarget.getAttribute ("name")
        const val = parseInt (e.currentTarget.value) 

        V3DSpace.update_xz_grid_options (key, val)
        }

    componentDidMount ()
        {
        const has_seen_menu = localStorage.getItem ("has_seen_menu")

        if  (! has_seen_menu)
            {
            localStorage.setItem ("has_seen_menu", "true")
            }

        const open_on_start = (has_seen_menu || this.props.request.length > 0)? false : true

        if  (open_on_start)
            {
            this.show_l_sidebar ()
            }
        }

    render () 
        {
        /*
        <Tooltip    placement="Bottom" 
                    color={TT_BGCOLOR}
                    title="Opens a pannel which allows the selection of both the 
                            the time interval over which to display spacecraft orbits
                            as well the specific obsertavories to display orbits for.">

        <Tooltip    placement="Bottom" 
                    color={TT_BGCOLOR}
                    title="Not currently functional.">

        */

        //const display_list = this.props.selected_id.map ((item)=>item.id) ;
        //const time_string = moment.utc(this.props.time).format('YYYY MMM DD HH:mm:ss') ;

        const { Title } = Typography;

        // alert (this.state.dark_screen)

        const select_for_listing = this.state.show_save_dialog ?
            <V_Modal
                title='Export Orbit Data as Text'
                content={this.create_listing_select.bind (this) ()}
                width={opt_dlg_width (V3DSpace.width)}
                style={get_dlg_style (V3DSpace.width, opt_dlg_width)}
                onClose={() => this.setState({ show_save_dialog: false })}
                ref={this.ui}
                height={DIALOG_HEIGHT * 1.2}
                buttons={[
                    { 
                    label: "Cancel", 
                    },
                    {
                    label: "OK",
                    onClick: () => {this.save_selected_orbits ()},
                    }
                    ]}
                /> : null ;

        const options_dialog = this.state.show_options_dialog ?
            <V_Modal
                title='Options'
                overflow_x="visible"
                content={this.create_options_dialog.bind (this) ()}
                width={opt_dlg_width (V3DSpace.width)}
                style={get_dlg_style (V3DSpace.width, opt_dlg_width)}
                onClose={() => this.setState({ show_options_dialog: false })}
                ref={this.ui}
                height={DIALOG_HEIGHT * 1.2}
                buttons={[
                    { 
                    label: "Done", 
                    },
                    ]}
                /> : null ;

        const img_save_dialog = this.state.show_image_dialog ?
            <V_Modal
                title='Save Screenshot or Video Clip'
                content={this.create_img_save_dialog.bind (this) ()}
                width={opt_dlg_width (V3DSpace.width)}
                style={get_dlg_style (V3DSpace.width, opt_dlg_width)}
                onClose={() => this.setState({ show_image_dialog: false })}
                ref={this.ui}
                height={DIALOG_HEIGHT * 1.2}
                buttons={[
                    { 
                    label: "Cancel", 
                    },
                    {
                    label: "OK",
                    onClick: () => {this.save_image ()},
                    }
                    ]}
                /> : null ;

        return (
            <>
                {select_for_listing}
                {options_dialog}
                {img_save_dialog}

                <Ghost_Menu
                    time={this.props.time}
                    start_time={this.props.start_time}
                    end_time={this.props.end_time}
                    update_start_time={this.props.update_view_start_time}
                    update_end_time={this.props.update_view_end_time}
                    display={this.state.l_sidebar_visible}
                    get_new_color={this.props.get_new_color}
                    get_new_shape={this.props.get_new_shape}
                    request={this.props.request}
                    sats={this.props.sats}
                    hide_l_sidebar={this.hide_l_sidebar}
                    ui={this.ui}
                    single_panel={window.innerWidth < MIN_SCREEN_X_3PANEL}
                    invert={V3DSpace.icon_shade}
                    sc_filter={this.state.sc_select_filter}
                    update_sc_filter={(e) => this.setState ({sc_select_filter: e})}
                    />
                        
                <Display_Manager
                    start_time={this.props.start_time}
                    end_time={this.props.end_time}
                    set_frame={this.props.set_frame}
                    target={this.props.target}
                    update_master_time={this.props.update_master_time}
                    transport_bar_help={this.display_transport_bar_help_dialog}
                    time={this.props.time}
                    axes_length={this.state.axes_length * Number (! this.state.dark_screen)}
                    hide_time_control={this.state.hide_time_control}
                    block_transport_bar={this.state.dark_screen}
                    show_sc_position={this.state.show_sc_position && ! this.state.dark_screen}
                    msg={this.props.msg}
                    ui={this.ui}
                    display_main_help_dialog={this.display_main_help_dialog}
                    toggle_l_sidebar={this.toggle_l_sidebar}
                    open_save_menu={this.open_save_menu}
                    copy_search_url={this.copy_search_url}
                    open_image_save_menu={this.open_image_save_menu}
                    open_option_menu={this.open_option_menu}
                    open_coord_dialog={this.open_coord_dialog}
                    coord_system={this.props.coord_system}
                    />
                <div>
                    {this.state.dialog_box} 
                </div>

            </>
            )
        }
    }

// This probably needs to go somewhere else.
class Manager extends React.Component
    {
    constructor (props)
        {
        super (props)

        // Example:
        // http://localhost:3000/test3017/4dorbit?spacecraft=ace;wind&start=20211011T121314&stop=20211012T121314

        const default_interval  = this.props.interval ? this.props.interval : 1 ;

        const query = window.location.search
        const params = new URLSearchParams (query)

        const start = date_param_to_epoch (params.get ('start'))
        const stop = date_param_to_epoch (params.get ('stop'))
        const sc = params.get ('sc')
        const spacecraft= params.get ('spacecraft')

        const t0 = (start && stop && start < stop) ? start : default_start_time (default_interval)
        const t1 = (start && stop && start < stop) ? stop : default_end_time ()
            
        this.default_request = []

        if  (sc)
            {
            this.default_request.push (...sc.split (";"))
            }

        if  (spacecraft)
            {
            this.default_request.push (...spacecraft.split (";"))
            }

        this.state =  {
            sats: null,
            GS: null,
            planets: PLANETS,
            selected: [],
            start_time: t0,
            end_time: t1,
            time: t0,
            text: "",
            color: null,
            relative_orbits: false,
            orbit_recolor_key: null,
            show_color_dialog: false,
            display_properties: null,
            target: V3DSpace.target_label,
            coord_system: coord_system_to_key (V3DSpace.coord_system),
            //request: [],
            //orbits: null,
            }

        this.get_obs_list = this.get_obs_list.bind (this)
        this.get_ground_stations = this.get_ground_stations.bind (this)
        //this.get_orbit_data = this.get_orbit_data.bind (this) ;
        //this.update_selection = this.update_selection.bind (this)
        this.update_view_start_time = this.update_view_start_time.bind (this)
        this.update_view_end_time   = this.update_view_end_time.bind (this)
        //this.add_orbit = this.add_orbit.bind (this)
        //this.remove_orbit = this.remove_orbit.bind (this)
        this.get_new_color = this.get_new_color.bind (this)
        this.get_new_shape = this.get_new_shape.bind (this)
        this.handle_OK = this.handle_OK.bind (this)
        this.toggle_relative_orbits=this.toggle_relative_orbits.bind (this) 
        this.set_frame = this.set_frame.bind (this)
        this.handle_keypress = this.handle_keypress.bind (this)
        this.update_master_time = this.update_master_time.bind (this)
        this.set_properties = this.set_properties.bind (this) 
        this.update_coord_system = this.update_coord_system.bind (this)
        this.render = this.render.bind (this)

        this.message = React.createRef() 

        }

    update_view_start_time (time)
        {

        const now = new Date (time).toISOString ()
        const new_start_time = time
        const end_time = this.state.end_time ;
        const sats = this.state.sats ;

        if  (new_start_time < end_time)
            {   
            for (let i = 0 ; i < sats.length - 1 ; i++)
                {
                sats [i].available = (end_time < sats[i].start_time || new_start_time > sats[i].end_time )? false : true ;
                /*
                if  (end_time < sats[i].start_time || new_start_time > sats[i].end_time )
                    {
                    // Orbit data not available for current time range.
                    sats [i].available = false ;
                    }
                else
                    {
                    // Orbit data available!
                    sats [i].available = true ;
                    }
                */
                }

            V3DSpace.set_start_time (new_start_time)

            this.setState ({start_time: new_start_time,
                            }) ;
            }

        else
            {

            const status_msg = `Start Time Must Be Earlier Than End Time.`
    
            V3DSpace.entity_manager.msg_portal.add_alert (ALERT.custom, status_msg, 7) 
            }
        }

    update_view_end_time (time)
        {
        const now = new Date (time).toISOString ()
        const new_end_time = time
        const start_time = this.state.start_time ;
        const sats = this.state.sats ;
    
        if  (new_end_time > start_time)
            {
            for (let i = 0 ; i < sats.length - 1 ; i++)
                {
                sats [i].available = (new_end_time < sats[i].start_time || start_time > sats[i].end_time )? false : true ;
                /*
                if  (new_end_time < sats[i].start_time || start_time > sats[i].end_time )
                    {
                    // Orbit data not available for current time range.
                    sats [i].available = false ;
                    }
                else
                    {
                    // Orbit data available!
                    sats [i].available = true ;
                    }
                */
                }
    
            V3DSpace.set_end_time (new_end_time)

            this.setState ({end_time: new_end_time,
                }) ;
            }

        else
            {
            const status_msg = `End Time Must Be Later Than Start Time.`
    
            V3DSpace.entity_manager.msg_portal.add_alert (ALERT.custom, status_msg, 7) 
            }
        }

    // update_selection (selection)
    /*
    update_selection (record, add_flag)
        {
        alert ('updating selection')
        if  (add_flag)
            {
            this.add_orbit (record) ;
            }

        else
            {
            this.remove_orbit (record) ;
            }
        }
    */

    /*
    add_orbit (record)
        {
        const current_selection = this.state.selected ;
        const start_time = this.state.start_time ;
        const end_time = this.state.end_time ;

        if  (end_time < record.start_time || start_time > record.end_time )
            {
            const status_msg = {
                content: 'Orbit data not available for selected time range.',
                className: 'time_set_error',
                style: {marginTop: '15vh',},
                }

            message.error (status_msg) ;    
            }

        else 
            {
            const new_selection = [...current_selection, record.key] ;

            const index = this.state.sats.findIndex ((item) => record.key === item.key) ;
            const item = this.state.sats [index] ;

            console.log (JSON.stringify (item))

            V3DSpace.add_spacecraft ({
                id: item.id, 
                color: item.color, 
                shape: item.shape, 
                focus: null,
                name: item.name, 
                type: ENT_type.SPACECRAFT, 
                start_time: item.start_time, 
                end_time: item.end_time,
                orbit_class: item.orbit, 
                cadence: item.cadence
                })

            //const request = (({ id, color, shape }) => ({ id, color, shape }))(blah [index]);

            // Mark the display status of the record.
            record.display = true ;

            this.setState ({    
                selected: new_selection,
                }) ;

            }

        }

    remove_orbit (record)
        {
        const current_selection = this.state.selected ;
       //const current_request = this.state.selected_id ;

        const i = current_selection.indexOf (record.key) ;
        //const has_focus = assets.get (record.id).focus ;

        
        
        const selection = 
            (current_selection.length > 0) ?
                [...current_selection.slice(0,i),...current_selection.slice(i+1)] :
                [] ;

        // Mark the display status of the record.
        record.display = false ;

        V3DSpace.remove (record.id)

        // If we have focus, then we will also have to clear that when we update the
        // the display list.

        this.setState ({
            selected: selection,
            request: null,
            })
        }
    */

    set_properties (p)
        {
        this.setState ({display_properties: p})
        }

    get_obs_list (obs) 
        {
        this.setState ({sats: obs}) ;
        }

    get_ground_stations (ground_stations) 
        {
        V3DSpace.set_GS_location (ground_stations)

        this.setState ({GS: ground_stations}) ;
        }

    toggle_relative_orbits ()
        {
        this.setState ({relative_orbits: (this.state.relative_orbits === false)? true : false,}) ;
        }
       
    set_frame (frame="EARTH")
        {
        const msg = V3DSpace.update_frame (frame, this.state.relative_orbits)

        if  (msg)
            {    
            V3DSpace.entity_manager.msg_portal.add_alert (ALERT.custom, msg, 7)     
            } 

        this.setState ({target: V3DSpace.target_label})
        this.update_coord_system ()
        }

    handle_OK ()
        {

        // Note:  We are actually creating a shallow copy of this.state.sats here, so all of the
        // array elements (objects) will be copied by reference.  Doing this so we can force
        // an update.
        const new_sats = [...this.state.sats] 
        const index = new_sats.findIndex ((item) => this.state.orbit_recolor_key === item.key) 
        const item = new_sats [index] 

        item.color = this.state.color 

        V3DSpace.set_color (item.id, item.color) 

        this.setState({sats: new_sats, show_color_dialog: false}) 
        }

    get_new_color (color, record) 
        {
        /*
        const { confirm } = Modal ;

        this.modal_width = 400 ;
        this.orbit_recolor_key = record.key ;

        this.color_select = confirm (
            {
            title: 'Select Orbit Color',
            okButtonProps: {onClick: this.handle_OK},
            content: <SketchPicker   
                        onChangeComplete={ this.handle_color_response } 
                        color={color}
                        width={this.modal_width * .85} 
                        disableAlpha={ true }
                        />,
            icon: null,
            onOk () {},
            onCancel () {},
            }) ;
        */          
        /*
        this.modal_width = 400 ;

        this.orbit_recolor_key = record.key ;

        const select = <SketchPicker   
                            onChangeComplete={ this.handle_color_response } 
                            color={color}
                            width={this.modal_width * .85} 
                            disableAlpha={ true }
                            /> ;

        this.setState ({color_select: select}) ;

        const modal = <V_Modal
            title='Select Orbit Color'
            content= {select}
            width= {MIN_DIALOG_WIDTH}
            onClose={() => this.setState({ color_dialog: null, color_select: null })}
            ref={this.ui}
            buttons={[
                { 
                label: "Cancel", 
                },
                {
                label: "OK",
                onClick: () => {this.handle_OK () ; return false},
                }
                ]}
            /> ;
        */
        
        this.setState ({show_color_dialog: true, color: color, orbit_recolor_key: record.key,}) ;
        } 

    get_new_shape (shape, record)
        {
        // Note:  We are actually creating a shallow copy of this.state.sats here, so all of the
        // array elements (objects) will be copied by reference.  Doing this so we can force
        // an update.
        const new_sats = [...this.state.sats] ;
        const index = new_sats.findIndex ((item) => record.key === item.key) ;
        const item = new_sats [index] ;

        item.shape = shape ;

        V3DSpace.set_shape (item.id, item.shape)

        this.setState({sats: new_sats,}) ;
        }

    handle_keypress (e)
        {
        const ESCAPE_KEY = 27 ;
        
        switch ( e.keyCode ) 
            {
            case ESCAPE_KEY:
                this.setState ({target: V3DSpace.clear_focus ()})
                break;

            default: 
                break;
            }        
        }

    create_color_picker (width = 400)
        {
        return (
            <SketchPicker   
                onChangeComplete={ (color) => this.setState ({color: color.hex}) } 
                color={this.state.color}
                width={width * .85} 
                disableAlpha={ true }
                /> 
            ) ;
        }


    update_master_time (new_time)
        {
        this.setState ({time: new_time}) ;
        }

    update_coord_system ()
        {
        this.setState ({coord_system: coord_system_to_key (V3DSpace.coord_system)})
        }

    componentDidMount ()
        {
        if  (! V3DSpace.init)
            {
            document.addEventListener("keydown", this.handle_keypress)

            V3DSpace.register_msg_portal (this.message.current)
            V3DSpace.set_start_time (this.state.start_time)
            V3DSpace.set_end_time (this.state.end_time)
            V3DSpace.add_all_planets ()
            V3DSpace.update_orbit_data ()

            V3DSpace.init_complete ()
            }

        }

    componentWillUnmount ()
        {
        document.removeEventListener("keydown", this.handle_keypress) ;
        }


    render ()
        {
        const color_dialog = this.state.show_color_dialog ? 
            <V_Modal
                title='Select Orbit Color'
                content= {this.create_color_picker.bind (this) ()}
                onClose={() => this.setState ({show_color_dialog: false })}
                ref={this.ui}
                buttons={[
                    { 
                    label: "Cancel", 
                    },
                    {
                    label: "OK",
                    onClick: () => {this.handle_OK () ; return false},
                    }
                    ]}
                /> : null ;

        return (
              <>
                    {this.state.display_properties
                        
                        ? <Get_Observatories 
                            obs={this.get_obs_list}
                            start_time={this.state.start_time}
                            end_time={this.state.end_time}
                            display_properties={this.state.display_properties}
                            />

                        : <Read_Properties_File 
                            set_properties={this.set_properties}
                            />

                    }

                    <Message_Queue  ref={this.message} />

                    <Get_Ground_Stations ground_stations={this.get_ground_stations} />

                    {this.state.sats

                        ? <Base_Layout
                            start_time={this.state.start_time}
                            end_time={this.state.end_time}
                            sats={this.state.sats}
                            update_view_start_time={this.update_view_start_time}
                            update_view_end_time={this.update_view_end_time}
                            get_new_color={this.get_new_color}
                            get_new_shape={this.get_new_shape}
                            set_frame={this.set_frame}
                            target={this.state.target}
                            time={this.state.time}
                            update_master_time={this.update_master_time}
                            msg={this.message}
                            request={this.default_request}
                            toggle_relative_orbits={this.toggle_relative_orbits}
                            relative_orbits={this.state.relative_orbits}
                            coord_system={this.state.coord_system}
                            update_coord_system={this.update_coord_system}
                            />

                        : null
                    }

                    {color_dialog}
             </>
              
            ) ;
        }
    }


// export default Get_Observatories;
export default Manager ;

