import { EARTH_RADIUS } from './Orbit.js'
import { COORD_Unit } from './Orbit.js'
import { SSC_WS_ACCESS } from './constants.js'
import { DATA_Format } from './entity_manager.js'
import { Orbit_Data } from './App.jsx'


const SSC_REQ_HEADERS = new Headers ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Content-Length': 0,
    })

class coord_component
    {
    constructor (component, coord_system='GSE')
        {
        this.Component = component
        this.CoordinateSystem = coord_system
        }
    }

class coordinate_system_options
    {
    constructor (coord_system='GSE')
        {
        this.CoordinateOptions =  [
            "java.util.ArrayList", [
                new coord_component ('X', coord_system), 
                new coord_component ('Y', coord_system), 
                new coord_component ('Z', coord_system)
                ]
            ]
        }
    }

class ssc_request_time_interval
    {
    constructor (start_time=0, end_time=0)
        {
        this.End =this.ssc_time_component (end_time) 
        this.Start = this.ssc_time_component (start_time)
        }

    ssc_time_component (time=0)
        {
        const r = []
        
        r.push ("javax.xml.datatype.XMLGregorianCalendar")
        r.push (new Date (time).toUTCString())

        return r 
        }
    }

class ssc_obs_request 
    {
    constructor (id=0, rf=2)
        {
        this.Id = id
        this.ResolutionFactor = rf
        }
    }

class orbit_data_request  
    {
    constructor (id=0, start_time=0, end_time=0, rf=2, coord_system='GSE')
        {
        this.OutputOptions = new coordinate_system_options (coord_system)
        this.TimeInterval = new ssc_request_time_interval (start_time, end_time)
        this.Satellites = this.create_obs_request (id, rf)
        }

    create_ssc_request (id=0, rf=2)
        {
        const r = []

        r.push (new ssc_obs_request (id, rf))

        return r
        }

    create_obs_request (id=0, rf=2)
        {
        const r = []

        r.push ("java.util.ArrayList")
        r.push (this.create_ssc_request (id, rf))

        return r
        }
    }

export class JN
    {
    static format_time (t = undefined)
        {
        const time = (t !== undefined)? new Date (t) : new Date ()

        const yr = time.getUTCFullYear ()
        const mn = SSC_WS.month_to_str (time.getUTCMonth ())
        const dy = time.getUTCDate ().toString ().padStart (2, '0')

        const hr = time.getUTCHours ().toString ().padStart (2, '0')
        const min = time.getUTCMinutes ().toString ().padStart (2, '0')
        const sec = time.getUTCSeconds ().toString ().padStart (2, '0')

        return `${yr} ${mn} ${dy} ${hr}:${min}:${sec}`
        }

    static get_browser_string ()
        {
        const { userAgent } = navigator

        if (userAgent.includes('Firefox/')) 
            {
            return 'Firefox'
            }

        else if (userAgent.includes('Edg/')) 
            {
            return 'Edge'
            }

        else if (userAgent.includes('Chrome/'))
            {
            return 'Chrome'
            }

        else if (userAgent.includes('Safari/')) 
            {
            return 'Safari'
            }
            
        return 'Unknown'
        }        

    static format_duration (delta) 
        {
        // Calculate the minutes, seconds, and milliseconds
        let  min = Math.floor (delta / 60000)
        let  sec = Math.floor((delta % 60000) / 1000)
        let  ms = delta % 1000
    
        // Format minutes and seconds to always have two digits
        min = min.toString().padStart(2, '0')
        sec = sec.toString().padStart(2, '0')

        // Format milliseconds to always have three digits
        ms = ms.toString().padStart(3, '0')
    
        // Return the formatted time
        return `${min} min ${sec} sec ${ms} ms`
        }
 
    static log (str)
        {
        console.log (JN.format_time () + ' - ' + str)    
        }

    static log_browser ()
        {
        JN.log ("Using browser: " + JN.get_browser_string ())
        }
    }

export class SSC_WS 
    {
    static ERR_HTTP = 1
    static ERR_TIMEOUT = 2
    static ERR_INVALID = 3

    static err_msg_timeout_error = 'Orbit Data Request Timed Out'
    static err_msg_server_error = 'Server Error: '
    static err_msg_record_error = 'Server returned invalid record.' 
    static err_msg_gen_error = 'Network error detected while retrieving orbit data.'


    static server_err_msg (err)
        {
        switch (err)
            {
            case 200:

                return "Ok"

            case 304:

                return "Not Modified"

            case 404:

                return "Not Found"

            case 406:

                return "Not Acceptable"

            case 415:

                return "Unsupported Media Type"

            case 429:

                return "Too Many Requests. Check Retry-After header value"

            case 503:

                return "Service Unavailable. Check Retry-After header value"

            default:

                return "Unknown Error"
            }
        }

    static month_to_str (month)
        {
        switch (month)
            {
            case 0:
                return 'Jan'
            case 1:
                return 'Feb'
            case 2:
                return 'Mar'
            case 3:
                return 'Apr'
            case 4:
                return 'May'
            case 5:
                return 'Jun'
            case 6:
                return 'Jul'
            case 7:
                return 'Aug'
            case 8:
                return 'Sep'
            case 9:
                return 'Oct'
            case 10:
                return 'Nov'
            case 11:
                return 'Dec'
            default:
                // Don't do anything
            }
        }   

    static log_event (event)
        {
        const t0 =  ('t0' in event)? event.t0 : 0
        const t1 =  ('time' in event)? event.time : 0

        const delta = (t0 > 0 && t1 > 0)? JN.format_duration (t1 - t0) : 'undefined'
        const time0 = (t0 > 0)? JN.format_time (t0) : 'undefined'
        const time1 = (t1 > 0)? JN.format_time (t1) : 'undefined'

        const timestr = (t0 > 0 && t1 > 0)? `Request Start: ${time0} End: ${time1} Delta: ${delta}` : 'undefined'

        switch ((event.name).toUpperCase ())
            {
            case "SUCCESS":

                return `Successfully retrieved orbit data for: ${event.id}. ${timestr}` 

            case "HTTPERROR":

                return `${event.message} ${event.status} ${event.server_msg} S/C Id: ${event.id} ${timestr}`

            case "TYPEERROR":

                return `${SSC_WS.err_msg_gen_error}`

            case "TIMEOUTERROR":

                return `${event.message} S/C Id: ${event.id} ${timestr}` 

            case "RECORDERROR":

                return `${event.message} S/C Id: ${event.id} ${timestr}`
                
            default: 

                return `Unknown Event. Msg:${event.msg} S/C Id: ${event.id} ${timestr}`
                
            }
        }

    static timestamp (err, t0 = 0)
        {
        err.time = new Date ().getTime ()
        err.t0 = t0

        return err
        }

    static create_error (msg, id, t0)
        {
        const err = new Error (`${msg}`)

        err.id = id
        err.error = true

        return SSC_WS.timestamp (err, t0)    
        }

    static create_http_error (status, id, t0)
        {
        const err = SSC_WS.create_error (SSC_WS.err_msg_server_error, id, t0)

        err.server_msg = SSC_WS.server_err_msg (status)
        err.name = 'HTTPError'
        err.status = status

        return err 
        }

    static create_timeout_error (id, t0)
        {
        const err = SSC_WS.create_error (SSC_WS.err_msg_timeout_error, id, t0)

        err.name = 'TimeoutError'

        return err 
        }

    static create_record_error (id, t0)
        {
        const err = SSC_WS.create_error (SSC_WS.err_msg_record_error, id, t0)

        err.name = 'RecordError'

        return err 
        }
        
    static fetch_with_timeout (id, t0, request, timeout)
        {
        return Promise.race (
            [
            fetch (request),
            new Promise (
                (_, reject) => setTimeout (() => reject (SSC_WS.create_timeout_error (id, t0)), timeout)
                )
            ]) ;    
        }

     // Pads numbers to ensure two digit
     static pad (number) 
        {
        if (number < 10) 
            {
            return '0' + number.toString ()
            }

        return number.toString ()
        }

    static format_Date_to_UTC (time) 
        {
        const date = new Date (time)

        // Extracting date components in UTC
        const year = date.getUTCFullYear ().toString ()
        const month = SSC_WS.pad (date.getUTCMonth () + 1)  // getUTCMonth returns 0-11, so add 1
        const day = SSC_WS.pad (date.getUTCDate ())
        const hours = SSC_WS.pad (date.getUTCHours ())
        const minutes = SSC_WS.pad (date.getUTCMinutes ())
        const seconds = SSC_WS.pad (date.getUTCSeconds ())

        // Format to YYYYMMDDTHHmmssZ
        return year + month + day + 'T' + hours + minutes + seconds + 'Z';
        }

    
    static extract_orbit_data (data, unit)
        {           
        if  (! data.hasOwnProperty ('Result') || ! data.Result[1].hasOwnProperty ('Data'))
            {
            return null
            }
    
        const times = data.Result [1].Data[1][0][1].Time [1]

        const x = data.Result [1].Data[1][0][1].Coordinates[1][0][1].X[1] 
        const y = data.Result [1].Data[1][0][1].Coordinates[1][0][1].Y[1] 
        const z = data.Result [1].Data[1][0][1].Coordinates[1][0][1].Z[1] 
    
        let orbit = {time: [], coord: []} 

        for (let i = 0 ; i < times.length ; i++)
            {
            orbit.time.push (new Date (times [i] [1]).getTime())

            if  (unit === COORD_Unit.RE)
                {
                orbit.coord.push ({
                    x: x [i] / EARTH_RADIUS,
                    y: y [i] / EARTH_RADIUS,
                    z: z [i] / EARTH_RADIUS,
                        })
                }

            else 
                {
                orbit.coord.push ({
                    x: x [i],
                    y: y [i],
                    z: z [i],
                    })
                }
            }

        return orbit
        }

    static async get_orbit_data (id, t0, t1, frequency = 2, coord_system = 'GSE', unit = COORD_Unit.RE, ref_id = null)
        {
        // const odr = new orbit_data_request (id, t0, t1, frequency, coord_system)

        /*
        const obs_request = new Request
            (   'https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations',
                {
                method: 'POST',
                headers: SSC_REQ_HEADERS,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify (odr),
                }
            );
        */

        // ref_id is the identifier used to store and retrieve the orbit data from the Orbit_Data class.
        // If ref_id is null, then id will be used as the identifier.  
        // This allows for planets where the actual id is different from the id used to retrieve the data.
        if  (ref_id === null)
            {
            ref_id = id
            }

        // const url_base = 'https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations' 
        const url_base = SSC_WS_ACCESS + 'WS/sscr/2/locations' 

        const client_name = 'spdf_orbit_viewer'

        const time_1 = SSC_WS.format_Date_to_UTC (t0)
        const time_2 = SSC_WS.format_Date_to_UTC (t1)

        JN.log (`Getting orbit data for ${id} between ${time_1} and ${time_2} `)

        // const url = url_base + '/' + id + '/' + time_1 + ',' + time_2 + '/gse/?resolutionFactor=' + frequency
        // const url = url_base + '/' + id + '/' + time_1 + ',' + time_2 + '/gse/'
        const url = `${url_base}/${id}/${time_1},${time_2}/gse/?resolutionFactor=${frequency}&client=${client_name}`


        console.log (url)
        const obs_request = new Request
            (   url,
                {
                method: 'GET',
                headers: SSC_REQ_HEADERS,
                mode: 'cors',
                cache: 'default',
                }
            );

        const req_time = new Date ().getTime ()
        
        return SSC_WS.fetch_with_timeout (id, req_time, obs_request, 30000)

        .then ( (res) =>
            {
            if  (! res.ok) 
                {
                throw SSC_WS.create_http_error  (res.status, id, req_time) 
                }

            return res
            })

        .then (res => 
                {
                // Return the json response.  
                return res.json()
                })
        
        .then ( (data) => 
                {
                let orbit = SSC_WS.extract_orbit_data (data [1], unit)

                if  (! orbit)
                    {
                    throw SSC_WS.create_record_error (id, req_time)
                    }

                const success = {name: 'success', t0: req_time, time: new Date ().getTime (), id: id}
                JN.log ((SSC_WS.log_event (success)))

                // Instead of returning the orbit data, store it in a central location.
                Orbit_Data.store_data (ref_id, orbit.time, orbit.coord, DATA_Format.COORD)

                return true // Not really sure what should be returned here.
                })
        }
    }

export class CCMC_HAPI
    {
    static BASE_URL     = 'https://iswa.ccmc.gsfc.nasa.gov/hapi'
    //static DATASET_ID   = 'SWMF2023_RT_STANDOFF_P1M'
    //static PARAMETER    = 'mp_standoff_noon_lt'
    static TIMEOUT      = 30000

    static format_time (t)
        {
        // Convert JavaScript epoch to ISO 8601 UTC string for HAPI request.
        return new Date (t).toISOString ().replace ('.000', '')
        }

    static build_url (t0, t1, dataset, parameter)
        {
        const start = CCMC_HAPI.format_time (t0)
        const stop  = CCMC_HAPI.format_time (t1)

        return `${CCMC_HAPI.BASE_URL}/data?id=${dataset}` +
            `&parameters=${parameter}` +
            `&time.min=${start}` +
            `&time.max=${stop}` +
            `&format=json` ;
        }

    // Note that this function does not have any concept of data cadence
    // I may want to add it eventually to avoid storing extremely long data vectors.
    static extract_data (json, parameter, fill_value)
        {
        /**
         * Parses HAPI JSON response into parallel time and data arrays.
         * Skips records where the parameter value is the fill value "null".
         * @param {Object} json - Parsed HAPI JSON response.
         * @returns {Object|null} - { time: [], data: [] } or null if response is invalid.
         */
        if  (! json.hasOwnProperty ('data') || ! Array.isArray (json.data))
            {
            return null
            }

        const time_vector = []
        const data_vector = []

        for (const record of json.data)
            {
            const iso_time = record [0]
            const value    = record [1]

            // Skip fill values
            if  (value === fill_value || value === null)
                {
                continue
                }

            time_vector.push (new Date (iso_time).getTime ())
            data_vector.push ({ [parameter]: parseFloat (value) })
            }

        if  (time_vector.length === 0)
            {
            return null
            }

        return { time: time_vector, data: data_vector }
        }

    static async get_data (id, t0, t1, dataset, parameter, fill_value = 'null' )
        {
        /**
         * Fetches a parameter from the CCMC HAPI server for a specified time range, parses
         * the response, and stores it in Orbit_Data.
         * @param {string} id  - Entity ID used to store data in Orbit_Data.
         * @param {number} t0  - Start time (JavaScript epoch, ms).
         * @param {number} t1  - End time (JavaScript epoch, ms).
         * @param {string} dataset - CCMC HAPI dataset ID
         * @param {string} parameter - Parameter name to extract from HAPI response
         * @return {Promise<boolean>} - Resolves to true if data is successfully 
         *      retrieved and stored, otherwise throws an error.
         */
        const url       = CCMC_HAPI.build_url (t0, t1, dataset, parameter)
        const req_time  = new Date ().getTime ()

        JN.log (`Getting CCMC HAPI data for ${id} from ${CCMC_HAPI.format_time (t0)} to ${CCMC_HAPI.format_time (t1)}`)

        const request = new Request (url,
            {
            method: 'GET',
            mode:   'cors',
            cache:  'default',
            })

        return SSC_WS.fetch_with_timeout (id, req_time, request, CCMC_HAPI.TIMEOUT)

            .then ((res) =>
                {
                if  (! res.ok)
                    {
                    throw SSC_WS.create_http_error (res.status, id, req_time)
                    }

                return res.json ()
                })

            .then ((json) =>
                {
                const result = CCMC_HAPI.extract_data (json, parameter, fill_value)

                if  (! result)
                    {
                    throw SSC_WS.create_record_error (id, req_time)
                    }

                const success = { name: 'success', t0: req_time, time: new Date ().getTime (), id: id }
                JN.log (SSC_WS.log_event (success))

                Orbit_Data.store_data (id, result.time, result.data, DATA_Format.SCALAR)

                return true
                })
        }
    }
