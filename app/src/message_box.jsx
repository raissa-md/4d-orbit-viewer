import React from 'react' ;
//import { Circles } from  'react-loader-spinner' ;
import { ExclamationCircleOutlined } from '@ant-design/icons' ;
import { InfoCircleOutlined } from '@ant-design/icons' ;

//import * as THREE from "three";
//import { LineSegments } from '../objects/LineSegments.js';

export const ALERT = {
    unknown: 0,
    data_loading: 1,
    failure: 2,
    error: 3,
    custom: 4,
    } ;

function get_unique_id ()
    {
    const rdm = Math.floor(10000000 + Math.random() * 90000000).toString().slice(3,6)  ; 
    const tm  = Date.now().toString(36).slice (-4) ;

    return tm + rdm 
    }

class Message_Box extends React.Component
    {
    constructor (props)
        {
        super (props) ;

        }


    componentDidMount ()
        {
        }

    render ()
        {
        let icon ;
        let color = "green" ;

        switch (this.props.alert.type)
            {
            case ALERT.error :
            case ALERT.failure : 
                color = "red" ;
                icon = <ExclamationCircleOutlined 
                    style={{color: color}}
                    />
                break ;

            case ALERT.data_loading :
                color = "green" ;
                //icon = <Circles 
                //    height = "30"
                //    width = "30"
                //    radius = "9"
                //    color = {color}
                //    /> ;
                break ;
            
            case ALERT.custom :
                color = "blue" ;
                icon = <InfoCircleOutlined 
                    style={{color: color}}
                    /> ;
            break ;

            default :
                color = "red" ;
                icon = <ExclamationCircleOutlined 
                    style={{color: color}}
                    /> ;
                break ;
            }

        return (
            <div className="message-box" style={{borderColor: color}}>
                <div className="message-box-content">
                    {icon}
                    <span className='message-text'>{this.props.alert.txt}</span>
                </div>
            </div>
            ) ;
        }
    }

class Message_Queue extends React.Component 
    {
    constructor (props)
        {
        super (props) ;

        this.state = {
            } 

        this.alerts = []

        this.clear_alert = this.clear_alert.bind (this) ;
        this.add_alert = this.add_alert.bind (this) ;
        this.create_alert = this.create_alert.bind (this) ;
        this.update = this.update.bind (this) ;
        this.componentDidMount = this.componentDidMount.bind (this) ;
        }

    update ()
        {
        if  (this.alerts.length !== 0)
            {
            let update = false

            for (let i = 0 ; i < this.alerts.length ; i++)
                {
                if  (this.alerts[i].ttd !== 0 && Date.now () > this.alerts[i].ttd)
                    {
                    this.alerts.splice (i, 1)

                    update = true
                    } 
                }   
                
            if  (update) this.forceUpdate ()
            }
        }

    create_alert (type, txt='', t=0)
        {
        // ttl is time to live in seconds
        let ttl = 0 ;

        switch (type)
            {
            case ALERT.failure :
                ttl = 20 * 1000 ;
                break ;

            case ALERT.error :
                ttl = 20 * 1000;
                break ;

            case ALERT.custom :
                ttl = t * 1000;
                break ;
    
            default:
                break ;
            }

        //const r = this.state.alerts.slice() ;
        //const r = this.state.alerts ;
        const id = get_unique_id ()

        this.alerts.unshift ({
            id: id,
            txt: txt,
            type: type,
            ttd: (ttl !== 0)? Date.now () + ttl : 0,
            }) ;

        return id ;
        }


    // This must be called through a reference.
    clear_alert (id)
        {
        const pos  = this.alerts.findIndex (alert => alert.id === id) 

        if  (pos !== -1)
            {
            this.alerts.splice (pos, 1) ;

            this.forceUpdate ()
            }

        return pos
        }

    add_alert (type, s="", ttl=0)
        {
        let txt = '' ;

        //alert ('Adding alert: ' + type + ', ' + s) ;

        switch (type)
            {
            case ALERT.data_loading :
                txt = "Loading orbit data.  Please wait." ;
                break ;

            case ALERT.failure :
                txt = "Could not load orbit data for " + s ;
                break ;

            case ALERT.error :
                txt = 'An error occurred.' ;
                break ;

            case ALERT.custom :
                txt = s ;
                break ;

            default:
                break ;
            }

        const id = this.create_alert (type, txt, ttl)

        this.forceUpdate ()
        
        return id 
        }

    componentDidMount ()
        {
        // Add some alerts for testing

        /*
        this.add_alert (ALERT.data_loading) ;
        this.add_alert (ALERT.custom, 'Disappears in 20s.', 20) ;
        this.add_alert (ALERT.failure, 'Test') ;
        this.add_alert (ALERT.custom, 'Disappears in 10s.', 10) ;
        this.add_alert (ALERT.custom, 'Disappears in 30s.', 30) ;
        this.add_alert (ALERT.custom, 'Disappears in 20s.', 20) ;
        this.add_alert (ALERT.custom, 'Disappears in 30s.', 30) ;
        this.add_alert (ALERT.custom, 'Disappears in 40s.', 40) ;
        */

        setInterval (this.update, 5000) ;
        }

    render ()
        {
        const queue = (this.alerts) ?
            this.alerts.map ((alert, index) => <Message_Box alert={alert} key={index} row={index} />)
            : null ;

        return (
            <div className='messages'>
                {queue}
            </div>
            ) ;
        }

    }

export default Message_Queue ;