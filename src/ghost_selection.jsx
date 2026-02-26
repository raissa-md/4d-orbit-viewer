import React, { createRef } from 'react'
import flatpickr from 'flatpickr'
import './tipsod_flatpickr.css'
import { V3DSpace } from './App.jsx'
import { V_Button } from './UI.jsx'

import { ENT_type } from './entity_manager.js'
//import { Space } from 'antd' 
import { Dropdown } from 'antd'
//import { Button } from "antd"
import { message } from 'antd' 
import { DownOutlined } from '@ant-design/icons'

//import { MDJ_to_UTC } from './Orbit.js' 
import { days_in_month } from './Orbit.js'
import { YMD_to_MJD } from './Orbit.js' 
import { MJD_to_YMD } from './Orbit.js'
import { MJD_to_YMD_DOY } from './Orbit.js'
import { FORMAT_YMD } from './Orbit.js'
import { MSEC_PER_DAY } from './Orbit.js'
import { decompose_epoch } from './Orbit.js'
import { compose_epoch } from './Orbit.js'
import { MJDHMS_to_str } from './Orbit.js'
import { YMD_to_DOY } from './Orbit.js'
import { TOP_BUTTON_STYLE } from './constants.js'
import { MIN_SCREEN_X_WIDEPNL } from './constants.js'
import { ALERT } from './message_box.jsx'

import next_icon from './images/next.png'
import prev_icon from './images/prev.png'
import first_dot from './images/first_dot.png'
import second_dot from './images/second_dot.png'
import third_dot from './images/third_dot.png'

const DEF_DATE_LIMITS = {
    year: [1959, 2300],
    month: [1, 12],
    day: [1, 31],
    doy: [0, 366]
    };

export const SELECT_TYPE = {
    all : 0,
    available : 1,
    selected : 2,
    }

const SELECT_SC_BTN_STYLE = {
    color: "white",
    background: "rgb(65,102,245)",
    border: "1px solid rgb(65,102,245)",
    borderRadius: "4px",
    padding: "0.4rem 0.9rem",
    marginLeft: "10px",
    marginRight: "10px",
    marginTop: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    }
  
const DOY_VIEW_BTN_STYLE = {
    ...SELECT_SC_BTN_STYLE,
    color: "white",
    background: "transparent",
    border : "1px solid white" 
    }

class Ghost_SC_Selection extends React.Component
    {
    constructor (props)
        {
        super (props)
        
        this.render = this.render.bind (this)
        this.filter_buttons = this.filter_buttons.bind (this)
        this.select_filter = this.select_filter.bind (this)
        }

    focus_pad (obs_name, record)
        {
        const call_if_active = () => {
            if  (record.display) 
                {
                this.props.set_focus (record.id)
                }
            } ;

        const s = {} 

        s.width = '100%'
        s.minHeight = '25px' 
        //s.padding = '0px 1rem 0px 1rem'
        s.cursor = (record.display)? 'pointer' : 'default'
        s.color = (record.display)? 'white' : 'lightgray'        
        const render =      
            <div
                role="button"
                tabIndex={0}
                onClick={call_if_active}
                style={s}
                >
                {obs_name}
            </div> ;
            
        return (render) 
        }

    color_select (color, record)
        {
        const s = {} 

        s.padding = 2 
        s.width = 40 
        s.height = 15 
        s.backgroundColor = color 

        const button_style = {}
        
        button_style.backgroundColor = 'transparent'
        button_style.border = 'none'
        button_style.cursor = 'pointer'
        button_style.padding = '0' 
        button_style.outline = 'none'
        button_style.textAlign = 'left'     

        return (
            <div>
                <button style={button_style}
                    onClick={() => this.props.get_new_color (color, record)}>
                    <div style={s}></div>
                </button>                    
            </div>
            )
        }

    shape_select_menu (shape, record)
        {
        const menu_items = [
            {key: 'sphere', label: 'sphere'},
            {key: 'cylinder', label: 'cylinder'},
            {key: 'cone', label: 'cone'},
            {key: 'diamond', label: 'diamond', disabled: 'true'},
            {key: 'cube', label: 'cube'},
            ]

        const menu_props = {
            items: menu_items,        
            onClick: (item) => this.props.get_new_shape (item.key, record),
            };

        const button_style = {}

        button_style.backgroundColor = 'transparent' ;
        button_style.border = '1px solid white';
        button_style.cursor = 'pointer';
        button_style.borderRadius = '4px' ;
        button_style.overflow = 'hidden';
        button_style.outline = 'none';
        button_style.color = 'white';

        return (
            <Dropdown 
                menu={menu_props} 
                trigger={['click']}
                >
                <button 
                    type='button'
                    style={button_style}
                    >
                    {shape} <DownOutlined />
                </button>
            </Dropdown>
            ) ;
        }

    select_filter (e)
        {
        let filter = SELECT_TYPE.all

        switch (e.target.innerText)
            {
            case "all" :

                break 

            case "selected" :

                filter = SELECT_TYPE.selected

                break 

            case "available" :

                filter = SELECT_TYPE.available

                break

            default :
            }

        this.props.update_sc_filter (filter)
        }

    filter_buttons ()
        {
        const base = "ghs-sc-selection-filter-btn ghs-base-font"

        const all_btn = (this.props.sc_filter === SELECT_TYPE.all)? base + " filter-btn-selected" : base
        const sel_btn = (this.props.sc_filter === SELECT_TYPE.selected)? base + " filter-btn-selected" : base
        const avl_btn = (this.props.sc_filter === SELECT_TYPE.available)? base + " filter-btn-selected" : base

        return (
            <div className='ghs-sc-selection-btn-row'>
                <div 
                    role="button"
                    tabIndex={0}
                    className={all_btn}
                    onClick={this.select_filter}
                    >
                    all
                </div>
                <div 
                    tabIndex={0}
                    role="button"
                    className={avl_btn}
                    onClick={this.select_filter}
                    >
                    available
                </div>
                <div
                    tabIndex={0}
                    role="button" 
                    className={sel_btn}
                    onClick={this.select_filter}
                    >
                    selected
                </div>
            </div>) ;
        }

    render ()
        {
        const fb = this.filter_buttons ()

        let display_orbits = null

        if  (this.props.single_panel)
            {
            display_orbits = 
            <div className='sc_selection_orb_btn'>

                <V_Button 
                    size="fit"
                    style={SELECT_SC_BTN_STYLE}
                    onClick={this.props.close_action}
                    alt="Close Selection Panel and Display Orbits"
                    label= 'Display Orbits'      
                    />
            </div> ;
            }

        return (
            <>
                {fb}
                <div className='ghs-base-font'>
                    <table className='sc-selection-table'>
                        <thead>
                            <tr>
                                <th className='sc-selection-table-col1-wd'>Select</th>
                                <th className='sc-selection-table-col2-wd'>Name</th>
                                <th className='sc-selection-table-col-other-wd'>Color</th>
                                <th className='sc-selection-table-col-other-wd'>Shape</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className='sc-selection-wrapper ghs-base-font'>
                    <table className='sc-selection-table'>
                        <tbody>
                            {this.props.sats.map((sc) => {
                                if  (this.props.sc_filter === SELECT_TYPE.available && ! sc.available)
                                    {
                                    return null
                                    }

                                if  (this.props.sc_filter === SELECT_TYPE.selected && ! sc.display)
                                    {
                                    return null
                                    }
                                return (
                                    <tr key={sc.id}>
                                        <td className='sc-selection-table-col1-wd'>
                                            <input
                                                type='checkbox'
                                                checked={this.props.selected.includes (sc.id)}
                                                onChange={() => this.props.handle_change (sc.id)}
                                            />
                                        </td>
                                        <td className='sc-selection-table-col2-wd'>
                                            {this.focus_pad (sc.name, sc)}
                                        </td>
                                        <td className='sc-selection-table-col-other-wd'>
                                            {this.color_select (sc.color, sc)}
                                        </td>
                                        <td className='sc-selection-table-col-other-wd'>
                                            {this.shape_select_menu (sc.shape, sc)}
                                        </td>
                                    </tr>) ;
                                })}
                        </tbody>
                    </table>
                    
                </div>
                {display_orbits}
            </>
            ) ;
        }
    }

class Ghost_Time_Scroll_Entry extends React.Component
    {
    // Called by Ghost_Time_Select
    // Receives time in UTC (JavaScript Date in milliseconds).
    // Stores time in MJD time structure

    // Does this really need to keep time in its state?
    // No, but keeping time in state reduces the number of times decompose_epoch()
    // needs to be called.   
    constructor (props)
        {
        super (props) 

        this.state = {...decompose_epoch (this.props.utc)}

        this.update_time = this.update_time.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        }

    update_time (key, value)
        {
        const new_mjd = {...this.state, [key]: Number (value)}

        this.props.handle_time (compose_epoch (new_mjd))
        }

    componentDidUpdate (prevProps)
        {
        if  (this.props.utc !== prevProps.utc)
            {
            this.setState (decompose_epoch (this.props.utc))
            }
        }

    render_scrollable_column (key, max)
        {
        const seed = [...Array (max + 1).keys ()]
        
        return (
            <div className="ghs-tm-scroll-column">
                {
                seed.map ((i) => {
                    const select = (this.state [key] === i) ? 
                        'ghs-tm-scroll-time-selected' : 
                        ''

                    return (
                        <div
                            key={i}
                            className={`ghs-tm-scroll-item ${select}`}
                            onClick={() => this.update_time (key, i)}
                            >
                            {i.toString().padStart(2, '0')}
                        </div>
                        ) ;
                    }) 
                }
            </div>
            ) ;
        }

    render ()
        {
        return (
            <div className="ghs-tm-scroll-container">
                <div className="ghs-tm-scroll">
                    <div className="ghs-tm-scroll-time-column">
                        {this.render_scrollable_column ('hour', 23)}
                        <span className="ghs-tm-scroll-time-label">H</span>
                    </div>
                    <div className="ghs-tm-scroll-time-column">
                        {this.render_scrollable_column ('min', 59)}
                        <span className="ghs-tm-scroll-time-label">M</span>
                    </div>
                    <div className="ghs-tm-scroll-time-column">
                        {this.render_scrollable_column ('sec', 59)}
                        <span className="ghs-tm-scroll-time-label">S</span>
                    </div>
                </div>
            </div>
      
            ) ;
        }
    }


class Ghost_Time_Text_Entry extends React.Component
    {
    // Called by Ghost_Time_Select
    // Receives time in UTC (JavaScript Date in milliseconds).
    // Stores time in MJD time structure
    constructor (props)
        {
        super (props) 

        this.state = {...decompose_epoch (this.props.utc)}

        this.update_time = this.update_time.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        }

    update_time (key, value)
        {
        const new_mjd = {...this.state, [key]: Number (value)}

        this.props.handle_time (compose_epoch (new_mjd))
        }

    componentDidUpdate (prevProps)
        {
        if  (this.props.utc !== prevProps.utc)
            {
            this.setState (decompose_epoch (this.props.utc))
            }
        }

    render ()
        {
        const {hour, min, sec} = MJDHMS_to_str (this.state)
  
        return (
            <div className='ghs-tm-text-container'>
                <div className='ghs-tm-text-box'>
                    <input
                        type="number"
                        value={hour}
                        onChange={(e) => this.update_time ('hour', e.target.value)}
                        min="0"
                        max="23"
                        className='ghs-tm-text-entry'
                        /> 
                    <span >:</span>
                    <input
                        type="number"
                        value={min}
                        onChange={(e) => this.update_time ('min', e.target.value)}
                        min="0"
                        max="59"
                        className='ghs-tm-text-entry'
                        />
                    :
                    <input
                        type="number"
                        value={sec}
                        onChange={(e) => this.update_time ('sec', e.target.value)}
                        min="0"
                        max="59"
                        className='ghs-tm-text-entry'
                        />
                    UTC
                </div>
            </div>
            ) ;
        }
    }

class Ghost_Time_Select extends React.Component
    {
    // Called by Ghost_Calendar

    // Uses components:

    //  Ghost_Time_Text_Entry
    //  Ghost_Time_Scroll_Entry

    // Uses UTC (JavaScript Date in milliseconds) for time.
    constructor (props)
        {
        super (props) 
        }

    render ()
        {    
        return (
            <div className='ghs-tm-container'>
                <Ghost_Time_Text_Entry
                    handle_time={this.props.handle_time}
                    utc={this.props.utc}
                    />

                <Ghost_Time_Scroll_Entry
                    handle_time={this.props.handle_time}
                    utc={this.props.utc}
                    /> 
            </div>
            );
        }
    }

class Ghost_Date_Text_Entry extends React.Component
    {
    // Called by Ghost_Calendar_Day_Select
    constructor (props)
        {
        super (props) 

        // this.state = {...decompose_epoch (this.props.utc)}

        const {year, month, day, doy} = MJD_to_YMD_DOY (this.props.mjd)
        this.state = {
            year: year,
            month: month+1,
            day: day,
            doy: doy,
            }


        this.update_from_mjd = this.update_from_mjd.bind (this)
        this.check_date_component = this.check_date_component.bind (this)
        this.blank_field = this.blank_field.bind (this)
        this.change_value = this.change_value.bind (this)
        this.update_time = this.update_time.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        this.render_year_month_day = this.render_year_month_day.bind (this)
        }

    update_from_mjd ()
        {
        const {year, month, day, doy} = MJD_to_YMD_DOY (this.props.mjd)

        this.setState ({
            year: year,
            month: month+1,
            day: day,
            doy: doy,
            })
        }

    check_date_component (key, val, limits = {}) 
        {
        const component_limits = {...DEF_DATE_LIMITS, ...limits}

        // Clamp value based on the field
        const [min, max] = component_limits [key]

        if (val < min) val = min
        if (val > max) val = max
    
        const new_date = {...this.state, [key]: parseInt (val)}

        // Adjust because months are displayed as 1-12 but numbered 0-11
        const len = days_in_month (new_date.year, new_date.month - 1)
        
        if  (len < new_date.day)
            {
            new_date.day = len
            }

        return new_date
        }

    blank_field (key)
        {
        this.setState ({...this.state, [key]: -1})
        }

    change_value (key, value)
        {
        let int_value = parseInt (value, 10)

            // console.log ("int value: ", int_value)
    
        if  (isNaN (int_value)) 
            {
            this.setState ({...this.state, [key]: -1})

            return 
            }

        // Don't use lower limits when processing new values to add to a field
        // 2 may be the leading digit of 2122
        const limits = {
            year: [0, 2300],
            month: [0, 12],
            day: [0, 31],
            doy: [0, 366]
            };

        const new_date = this.check_date_component (key, int_value, limits)

        this.setState (new_date)
        }

    update_time (key, value)
        {
        
        //console.log ("target: ", e.target)
        //console.log ("value: ", value)
        //console.log (" key: ", key)
        //console.log ("value: ", value.slice (-2))

        let int_value = parseInt (value, 10)

            // console.log ("int value: ", int_value)
    
        if  (isNaN (int_value)) 
            {
            // Reset the time to its current value
            this.update_from_mjd ()

            return 
            }

        const new_date = this.check_date_component (key, int_value)

        // this.setState (new_date)

        // Adjust because months are displayed as 1-12 but numbered 0-11
        // new_ymd.month-- 

        const year = new_date.year
        const month = new_date.month - 1
        const day = new_date.day

        this.props.select_day (YMD_to_MJD (year, month, day))
    
        }

    componentDidUpdate (prevProps)
        {
        if  (this.props.mjd !== prevProps.mjd)
            {
            this.update_from_mjd ()
            }
        }

    render_year_month_day ()
        {
        const {year, month, day} = FORMAT_YMD (this.state) 

        const min = 0 
        const max = 1

        const date_format_display =
            <div className='ghs-tm-text-box'>
                <input
                    type="number"
                    value={year}
                    onBlur={(e) => this.update_time ('year', e.target.value)}
                    onChange={(e) => this.change_value ('year', e.target.value)}
                    onFocus={() => this.blank_field ('year')}
                    min= {DEF_DATE_LIMITS.year [min]}
                    max={DEF_DATE_LIMITS.year [max]}
                    className='ghs-tm-text-entry'
                    /> 
                <span >-</span>
                <input
                    type="number"
                    value={month}
                    onBlur={(e) => this.update_time ('month', e.target.value)}
                    onChange={(e) => this.change_value ('month', e.target.value)}
                    onFocus={() => this.blank_field ('month')}
                    min={DEF_DATE_LIMITS.month [min]}
                    max={DEF_DATE_LIMITS.month [max]}
                    className='ghs-tm-text-entry'
                    />
                <span>-</span>
                <input
                    type="number"
                    value={day}
                    onBlur={(e) => this.update_time ('day', e.target.value)}
                    onChange={(e) => this.change_value ('day', e.target.value)}
                    onFocus={() => this.blank_field ('day')}
                    min={DEF_DATE_LIMITS.day [min]}
                    max={DEF_DATE_LIMITS.day [max]}
                    className='ghs-tm-text-entry'
                    />
            </div> ;
  
        return date_format_display ;
        }

    render ()
        {  
        const date_entry = this.render_year_month_day ()
        return (
            <div className='ghs-tm-text-container'>
                    {date_entry}
            </div>            
            ) ;
        }
    }

class Ghost_Date_Calendar_Entry extends React.Component
    {
    // Called by Ghost_Calendar_Day_Select

    constructor (props)
        {
        super (props)    

        //this.state = {
        //  day: 0,
        //    month: 0,
        //    year: 0
        //    }

        this.render_calender = this.render_calender.bind (this)
        this.render = this.render.bind (this)
        }


    date_to_doy (date)
        {
        const start = new Date (Date.UTC (date.getUTCFullYear(), 0, 0))
        const diff = date - start;
            
        return Math.floor (diff / MSEC_PER_DAY);
        }

    render_calender ()
        {
        const now = MJD_to_YMD (this.props.mjd)

        const days_in_month = new Date (now.year, now.month + 1, 0).getUTCDate ()   
        const first_day = new Date (Date.UTC (now.year, now.month, 1)).getUTCDay ()
            
        const calendar = []

        // Add blank cells for days before the first day of the month
        for (let i = 0; i < first_day; i++) 
            {
            calendar.push (
                <div key={`pre-blank-${i}`} className="ghs-day-cal-calendar-day blank">
                </div>
                );
            }
        
        // Add cells for each day of the month
        const base_day_number = (this.props.doy_view)? YMD_to_DOY (now.year, now.month, 0) : 0

        for (let day = 1 ; day <= days_in_month ; day++) 
            {
            const mjd = YMD_to_MJD (now.year, now.month, day)
            //console.log ("year: " + now.year + " month: " + now.month + " day: " + day)
            const day_number = base_day_number + day
            const selected = (now.day === day ) ? 'selected' : ''
            calendar.push (
                <div
                    key={day}
                    className={`ghs-day-cal-calendar-day ${selected}`}
                    onClick={() => this.props.select_day (mjd)}
                    >
                    {day_number}
                </div>
                );
            }

        // Add in extra blank cells to make sure we always have exactly 6 lines in 
        // our calendar.
        let i = 0 
        while (calendar.length < 42)
            {
            calendar.push (
                <div key={`post-blank-${i}`} className="ghs-day-cal-calendar-day blank">
                </div>
                );

            i++
            }
         
        
        return (
            <div className="ghs-day-cal-grid">
                {calendar}
            </div> 
            );
        }

    get_local_month_year ()
        {
        const local_options = { 
            month: 'short', 
            year: 'numeric', 
            timeZone: 'UTC' 
            }

        const {year, month, day} = MJD_to_YMD (this.props.mjd)        
        
        const d = new Date ()
        
        d.setUTCMonth (month, day)
        d.setUTCFullYear (year)

        return d.toLocaleString ('default', local_options)
        }

    render ()
        {
        const local_options = { month: 'short', year: 'numeric', timeZone: 'UTC' }
        return (
            <div className="ghs-day-cal-container">
                <div className="ghs-day-cal-date-header">
                    <div 
                        className='ghs-day-cal-month-year-select-btn'
                        onClick={() => this.props.handle_year_change (-1)}>
                        {'<<'}
                    </div>
                    <div 
                        className='ghs-day-cal-month-year-select-btn'
                        onClick={() => this.props.handle_month_change (-1)}>
                        {'<'}
                    </div>
                    <span
                        className='ghs-day-cal-date-header-label'
                        >
                        {this.get_local_month_year ()}
                    </span>
                    <div 
                        className='ghs-day-cal-month-year-select-btn'
                        onClick={() => this.props.handle_month_change (1)}>
                        {'>'}
                    </div>
                    <div 
                        className='ghs-day-cal-month-year-select-btn'
                        onClick={() => this.props.handle_year_change (1)}>
                        {'>>'}
                    </div>
                </div>
                <div className="ghs-day-cal-grid-container">
                    {this.render_calender ()}
                </div>
            </div>
            ) ;
        }
    }

class Ghost_Calendar_Day_Select extends React.Component
    {
    // Called by Ghost_Calendar

    // Uses components:

    //  Ghost_Date_Calendar_Entry
     
    // Time is stored locally MJD+HMSS.  Derived externally from this.props.utc.
    constructor (props)
        {
        super (props)    
        
        /*
        this.state = {
            doy_view: false,
            date: new Date (this.props.utc)
            }
        */

        this.state = {...decompose_epoch (this.props.utc)}

        this.update_time = this.update_time.bind (this)
        this.select_year = this.select_year.bind (this)
        this.select_month = this.select_month.bind (this)
        this.select_day = this.select_day.bind (this)
        this.handle_month_change = this.handle_month_change.bind (this)
        this.handle_year_change = this.handle_year_change.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        this.render = this.render.bind (this)
        }

    update_time (mjd)
        {
        this.props.handle_time (compose_epoch (mjd))
        }

    handle_month_change (inc = 0)
        {
        let {year, month, day} = MJD_to_YMD (this.state.mjd)

        month += inc

        while (month < 0) 
            {
            year -= 1
            month += 12
            }
    
        while (month > 11) 
            {
            year += 1
            month -= 12
            }
    
        this.select_day (YMD_to_MJD (year, month, day))
        }

    handle_year_change (inc = 0)
        {
        const {year, month, day} = MJD_to_YMD (this.state.mjd)

        this.select_day (YMD_to_MJD (year + inc, month, day))
        }

    select_year (year)
        {
        const ymd = {...MJD_to_YMD (this.state.mjd), year: year}

        this.select_day (YMD_to_MJD (ymd))
        }

    select_month (month)
        {
        const ymd = {...MJD_to_YMD (this.state.mjd), month: month}

        this.select_day (YMD_to_MJD (ymd))
        }
    
    select_day (mjd)
        {
        this.props.handle_time (compose_epoch (mjd))
        }

    select_doy (doy)
        {
        // Currently not used. Needs to be reimplemented 
        // const new_date = new Date (Date.UTC (this.state.date.getUTCFullYear(), 0, doy))

        // this.setState ({date: new_date})
        }

    componentDidUpdate (prevProps)
        {
        if  (this.props.utc !== prevProps.utc)
            {
            this.setState (decompose_epoch (this.props.utc))
            }
        }

    render ()
        {
        return (
            <div className='ghs-day-container'>
                <Ghost_Date_Text_Entry
                    doy_view={this.props.doy_view}
                    mjd={this.state.mjd}
                    select_day={this.select_day}
                    select_doy={this.select_doy}
                    />

                <Ghost_Date_Calendar_Entry
                    doy_view={this.props.doy_view}
                    mjd={this.state.mjd}
                    handle_month_change={this.handle_month_change}
                    handle_year_change={this.handle_year_change}
                    select_day={this.select_day}
                    select_doy={this.select_doy}
                    />
            </div>
            ) ;
        }

    }

/*
class Ghost_Calendar extends React.Component
    {
    // Top level time and date.  Ultimately all other time/date controls should initialize 
    // time based on this control.

    // Called by Ghost_Misc_Control

    // Receives start_time and end_time as props
    // Calls update_start_time and update_end_time as props.

    // Uses components:

    //  Ghost_Calendar_Day_Select
    //  Ghost_Time_Select
     
    constructor (props)
        {
        super (props) 

        }
    
    render () 
        {
        const t = (this.props.title)? 
            <div className='ghs-calendar-title'>
                {this.props.title}
            </div>
        :
            null ;

        const arrange = (this.props.row)? 
            {flexDirection: 'row', alignItems: 'flex-start'} 
            : {flexDirection: 'column', alignItems: 'center'}

        return (
            <div className="calendar_display">
                {t}
                <div className="time_select_display" style={arrange}>
                    
                    <Ghost_Calendar_Day_Select
                        utc={this.props.time}
                        handle_time={this.props.update_time}
                        doy_view={this.props.doy_view}
                        />
                        
                    <Ghost_Time_Select
                        utc={this.props.time}
                        handle_time={this.props.update_time}
                        />

                </div>
            </div>
            );
        }
    }
*/

class Ghost_Calendar extends React.Component
    {
    // Top level time and date.  Ultimately all other time/date controls should initialize 
    // time based on this control.

    // Called by Ghost_Misc_Control

    // Receives start_time and end_time as props
    // Calls update_start_time and update_end_time as props.

    // Uses components:

    //  Ghost_Calendar_Day_Select
    //  Ghost_Time_Select
     
    constructor (props)
        {
        super (props) 

        this.mount = React.createRef (null)
        this.fp = null

        this.create_day_numbers = this.create_day_numbers.bind (this)
        this.convert_time = this.convert_time.bind (this)
        this.componentDidMount = this.componentDidMount.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        this.render = this.render.bind (this)
        }
    
    create_day_numbers (Obj, dStr, fp, dayElem)
        {
        if  (this.props.doy_view)
            {
            const year = dayElem.dateObj.getUTCFullYear ()
            const month = dayElem.dateObj.getUTCMonth ()
            const day = dayElem.dateObj.getUTCDate ()

            dayElem.innerHTML = YMD_to_DOY (year, month, day)
            }
        }

    convert_time (a, time_string, b)
        {
        const [date_part, time_part] = time_string.split (' ')

        const [year, month, day] = date_part.split ('-').map (Number)
        const [hour, minute, sec] = time_part.split (':').map (Number)

        const d = new Date ()

        d.setUTCFullYear (year)
        d.setUTCMonth (month - 1)
        d.setUTCDate (day)
        d.setUTCHours (hour)
        d.setUTCMinutes (minute)
        d.setUTCSeconds (sec)

        this.props.update_time (d.valueOf ())
        }

    componentDidMount ()
        {
        const opts = {
            time_24hr: true,
            inline: true,
            enableTime: true,
            enableSeconds: true,
            allowInput: true,
            dateFormat: "Y-m-d H:i:S",
            }
  
        const date = new Date (this.props.time)
        const pad = (n) => String(n).padStart (2, '0')

        const year = date.getUTCFullYear ()
        const month = pad (date.getUTCMonth () + 1)
        const day = pad (date.getUTCDate ())
        const hours = pad (date.getUTCHours ())
        const min = pad (date.getUTCMinutes ())
        const sec = pad (date.getUTCSeconds ())

        const t = `${year}-${month}-${day} ${hours}:${min}:${sec}`

        this.fp = flatpickr (this.mount.current, {
            ...opts,
            defaultDate: t,
            onChange: this.convert_time,
            onDayCreate: this.create_day_numbers, 
            }) ;

        }

    componentWillUnmount () 
        {
        // Clean up to avoid memory leaks
        if  (this.fpInstance) 
            {
            this.fp.destroy();
            }
        }

    componentDidUpdate (prevProps, prevState)
        {
        if (prevProps.doy_view !== this.props.doy_view)
            {
            this.fp.redraw ()
            }
        }

    render () 
        {
        const t = (this.props.title)? 
            <div className='ghs-calendar-title'>
                {this.props.title}
            </div>
        :
            null ;

        /*
        return (
            <div className="calendar_display">
                {t}
                <div className="time_select_display" style={arrange}>
                    <div ref={this.mount}>
                    </div>
                        
                    <Ghost_Time_Select
                        utc={this.props.time}
                        handle_time={this.props.update_time}
                        />

                </div>
            </div>
            );
        */

        return (
            <div className="calendar_display">
                {t}
                    <div ref={this.mount}>
                    </div>
                        
            </div>
            );

        }
    }

class DOY_Display_Orbits extends React.Component
    {
    // Renders the DOY/DATE selection button and the Dispay Orbit button
   constructor (props)
        {
        super (props)
        }

    render ()
        {
        return (
            <div className='ghs-doy-orb-display'>
 
                <V_Button 
                    size="fit"
                    style={DOY_VIEW_BTN_STYLE}
                    onClick={this.props.toggle_doy_date}
                    alt="Switch between DOY and Date View"
                    label={this.props.doy_view ? "Date View" : "DOY View"}      
                    />

                <V_Button 
                    size="fit"
                    style={SELECT_SC_BTN_STYLE}
                    onClick={this.props.close_action}
                    alt="Close Selection Panel and Display Orbits"
                    label= 'Display Orbits'      
                    />
            </div>
            ) ;
        }
    }

class Ghost_Title extends React.Component
    {
    constructor (props)
        {
        super (props)

        this.render = this.render.bind (this)
        }

    render ()
        {
        return (
            <div className='sc-title-container'>
                {this.props.text}
            </div>
            ) ;
        }
    }

class Ghost_Single_Panel extends React.Component
    {
    constructor (props)
        {
        super (props)    

        this.visible = {  
            opacity: 1,
            visibility: 'visible',
            interEvents: 'auto',
            zIndex: 2,
            }

        this.hide = {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -10,
            }

        this.render_sc_select = this.render_sc_select.bind (this)
        this.render_start_time = this.render_start_time.bind (this)
        this.render_stop_time = this.render_stop_time.bind (this)
        this.render = this.render.bind (this)
        }

    render_sc_select ()
        {
        const display = (this.props.panel === 0)? this.visible : this.hide
        const r = 
                <div className='sc-panel-container'  style={display}>
                    <Ghost_Title
                        text={'Select Spacecraft'}
                        />
                    <Ghost_SC_Selection
                        selected={this.props.selected}
                        get_new_color={this.props.get_new_color}
                        get_new_shape={this.props.get_new_shape}
                        set_focus={this.props.set_focus}
                        handle_change={this.props.handle_change}
                        sats={this.props.sats}
                        close_action={this.props.close_action}
                        single_panel={true}
                        sc_filter={this.props.sc_filter}
                        update_sc_filter={this.props.update_sc_filter}
                        />
                </div> ;

        return r 
        }

    render_start_time ()
        {
        const display = (this.props.panel === 1)? this.visible : this.hide
        const r = 
                <div className='sc-panel-container' style={display}>
                    <Ghost_Title
                        text={'Select Start Date/Time'}
                        />
                    <div className='ghs-cal-single-panel'>
                        <Ghost_Calendar
                            doy_view={this.props.doy_view}
                            time={this.props.start_time}
                            update_time={this.props.update_start_time}
                            title=""
                            />
                        <DOY_Display_Orbits
                            doy_view={this.props.doy_view}
                            close_action={this.props.close_action}
                            toggle_doy_date={this.props.toggle_doy_date}
                            />
                    </div>
                </div> ;

        return r 

        }

    render_stop_time ()
        {
        const display = (this.props.panel === 2)? this.visible : this.hide
        const r = 
                <div className='sc-panel-container' style={display}>
                    <Ghost_Title
                        text={'Select End Date/Time'}
                        />

                    <div className='ghs-cal-single-panel'>
                        <Ghost_Calendar
                            doy_view={this.props.doy_view}
                            time={this.props.end_time}
                            update_time={this.props.update_end_time}
                            title=""
                            />
                        <DOY_Display_Orbits
                            doy_view={this.props.doy_view}
                            close_action={this.props.close_action}
                            toggle_doy_date={this.props.toggle_doy_date}
                            />
                    </div>
                </div> ;

        return r 
        }

    render ()
        {
        let indicator_dots = null

        if  (this.props.panel === 0)
            {
            indicator_dots = first_dot
            }

        if  (this.props.panel === 1)
            {
            indicator_dots = second_dot
            }

        if  (this.props.panel === 2)
            {
            indicator_dots = third_dot
            }

        const filter = {filter: "invert(" + this.props.invert.toFixed() + "%)"}


        return (
            <>            
                <div className='sc-menu-container-sp'>
                    <div className='sc-pnl-select-btn'>
                        <V_Button 
                            size="small"
                            style={TOP_BUTTON_STYLE}
                            onClick={this.props.prev_panel}
                            alt="Move to Previous Panel"
                            image= {prev_icon}      
                            />

                    </div>

                    <div style={{height: "100%", width: "100%"}}>
                        {this.render_sc_select ()}
                        {this.render_start_time ()}
                        {this.render_stop_time ()}
                    </div>

                    <div className='sc-pnl-select-btn'>
                        <V_Button 
                            size="small"
                            style={TOP_BUTTON_STYLE}
                            onClick={this.props.next_panel}
                            alt="Move to Next Panel"
                            image= {next_icon}      
                            />
                    </div>
                </div>
                <div className='sc-indicator-dots'>
                    <img style={filter} src={indicator_dots}/>
                </div>
            </>
            ) ;
        }
    }

class Ghost_Full_Screen extends React.Component
    {
    constructor (props)
        {
        super (props)    

        this.render = this.render.bind (this)
        }

    render ()
        {
        return (
           <div className='sc-menu-container'>
                <Ghost_Title
                    text={'Please Select Spacecraft and Time Interval to Display Spacecraft'}
                    />
                <div className='sc-selection-container'>
                    <Ghost_SC_Selection
                        selected={this.props.selected}
                        get_new_color={this.props.get_new_color}
                        get_new_shape={this.props.get_new_shape}
                        set_focus={this.props.set_focus}
                        handle_change={this.props.handle_change}
                        sats={this.props.sats}
                        close_action={this.props.close_action}
                        single_panel={false}
                        sc_filter={this.props.sc_filter}
                        update_sc_filter={this.props.update_sc_filter}

                        />
                </div>

                <div className='sc-misc-container'>

                    <div className='ghs-calendar-container'>
                        <Ghost_Calendar
                            doy_view={this.props.doy_view}
                            time={this.props.start_time}
                            update_time={this.props.update_start_time}
                            title="Select Start Time"
                            />

                        <Ghost_Calendar
                            doy_view={this.props.doy_view}
                            time={this.props.end_time}
                            update_time={this.props.update_end_time}
                            title="Select End Time"
                            />
                    </div>

                    <DOY_Display_Orbits
                        doy_view={this.props.doy_view}
                        close_action={this.props.close_action}
                        toggle_doy_date={this.props.toggle_doy_date}
                        />
                </div>
            </div>
            ) ;
        }
    }

class Ghost_Menu extends React.Component
    {
    // Receives start_time and end_time as props
    // Calls update_start_time and update_end_time as props.
    constructor (props)
        {
        super (props)    

        this.state =  {
            selected: [],
            pannels: [],
            active_panel: 0, 
            doy_view: false,
            }

        this.handle_change = this.handle_change.bind (this)
        this.toggle_doy_date = this.toggle_doy_date.bind (this)
        this.handle_select_change  = this.handle_select_change.bind (this) 
        this.componentDidMount = this.componentDidMount.bind (this)
        this.add_spacecraft = this.add_spacecraft.bind (this)
        this.close_action = this.close_action.bind (this)
        this.prev_panel = this.prev_panel.bind (this)
        this.next_panel = this.next_panel.bind (this)
        this.render_single_panel = this.render_single_panel.bind (this)
        this.render_full_screen = this.render_full_screen.bind (this)
        this.render = this.render.bind (this)
        }

    toggle_doy_date ()
        {
        this.setState ({doy_view: ! this.state.doy_view})
        }

    add_spacecraft (record)
        {
        if  (V3DSpace.end_time < record.start_time || V3DSpace.start_time > record.end_time )
            {
            const content =  "No orbit data available for curreent time range." 

            V3DSpace.entity_manager.msg_portal.add_alert (ALERT.custom, content, 7)

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

    handle_change (id) 
        {
        if  (this.state.selected.includes (id))
            {
            this.handle_select_change (this.props.sats.find (s => s.id === id), false)
            }

        else
            {
            this.handle_select_change (this.props.sats.find (s => s.id === id), true)
            }
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
            const new_selection = [...current_selection, record.id] 

            this.setState ({selected: new_selection,})

            return true
            }

        else
            {
            const current_selection = this.state.selected 
            const i = current_selection.indexOf (record.id) 
                
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
            const indx = sc_id.indexOf (e)

            if  (indx !== -1)
                {
                if  (this.add_spacecraft (this.props.sats [indx]))
                    {
                    select.push (this.props.sats [indx].id)
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

    next_panel ()
        {
        const active = (this.state.active_panel >= 2)? 0 : this.state.active_panel + 1
        this.setState ({active_panel: active})
        }

    prev_panel ()
        {
        const active = (this.state.active_panel <= 0)? 2 : this.state.active_panel - 1
        this.setState ({active_panel: active})
        }

    render_single_panel ()
        {
        const r = 
            <Ghost_Single_Panel
                selected={this.state.selected}
                get_new_color={this.props.get_new_color}
                get_new_shape={this.props.get_new_shape}
                set_focus={this.props.set_focus}
                handle_change={this.handle_change}
                sats={this.props.sats}
                close_action={this.close_action}
                start_time={this.props.start_time}
                end_time={this.props.end_time}
                update_start_time={this.props.update_start_time}
                update_end_time={this.props.update_end_time}
                doy_view={this.state.doy_view}
                toggle_doy_date={this.toggle_doy_date}
                panel={this.state.active_panel}
                next_panel={this.next_panel}
                prev_panel={this.prev_panel}
                invert={this.props.invert}
                sc_filter={this.props.sc_filter}
                update_sc_filter={this.props.update_sc_filter}

                />

            return r
        }

    render_full_screen ()
        {
        const r = 
            <Ghost_Full_Screen
                selected={this.state.selected}
                get_new_color={this.props.get_new_color}
                get_new_shape={this.props.get_new_shape}
                set_focus={this.props.set_focus}
                handle_change={this.handle_change}
                sats={this.props.sats}
                close_action={this.close_action}
                start_time={this.props.start_time}
                end_time={this.props.end_time}
                update_start_time={this.props.update_start_time}
                update_end_time={this.props.update_end_time}
                doy_view={this.state.doy_view}
                toggle_doy_date={this.toggle_doy_date}
                invert={this.props.invert}
                sc_filter={this.props.sc_filter}
                update_sc_filter={this.props.update_sc_filter}
                /> ;

        return r
        }

    render ()
        {
        const r = (this.props.single_panel)? this.render_single_panel () : this.render_full_screen () 
        //const r = (true)? this.render_single_panel () : this.render_full_screen () 

        if  (this.props.display === false)
            {
            return (null)
            }
    
        return (
            <>
                {r}
            </>
            ) ;
        }
    }

export default Ghost_Menu