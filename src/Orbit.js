//import moment from 'moment' 
import * as THREE from "three"
import { PLANET_ORBIT_INTERVAL } from './constants.js' 
import { GEO } from "./App.jsx"
import { HELIO } from "./App.jsx"

    
export const MSEC_PER_SEC  = 1000
export const MSEC_PER_MIN  = 1000 * 60 ;
export const MSEC_PER_HOUR = 1000 * 60 * 60 ;
export const MSEC_PER_DAY  = 1000 * 60 * 60 * 24 ;
export const MSEC_PER_YEAR = MSEC_PER_DAY * 365.25
export const MJD_START     = 'November 17, 1858 00:00:00 GMT+00:00' ;
export const DAYS_PER_CENT = 36525 ;
export const JD_UNIX_EPOCH = 2440587.5   // 2440587.5
export const SIDEREAL_DAY  = 86400000.   // Seconds in a solar day.  Not sure why I named it SIDEREAL_DAY
export const DEG2RD = Math.PI / 180.
export const RD2DEG = 180. / Math.PI
export const PI2 = 2. * Math.PI
export const RD90  = Math.PI / 2
export const RD180 = Math.PI
export const RD270 = 3 * Math.PI / 2

export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export const EARTH_RADIUS = 6378.16  // Km (nominal)
export const SOLAR_RADIUS = 695700 // Km (nominal)
export const AUKM = 149597870.7  // Km (exact)
export const AU = AUKM / EARTH_RADIUS // ~23454.7 Nominal Earth Radii 


export function JD (utc)
    {
    // Return the Julian Day Number
    // Requires UTC time.
    return ( utc / SIDEREAL_DAY ) + JD_UNIX_EPOCH
    }

export function MJD (utc)
    {
    // Return the Modified Julian Day Number
    // Requires UTC time.
    return JD (utc) - 2400000.5
    }

export function decompose_epoch (utc)
    {
    // Convert computer epoch time to a MJD time structure

    // Create a new Date object in UTC using the epoch time in milliseconds
    const date = new Date (utc)
  
    // Extract hours, minutes, and seconds from the Date object in UTC
    const hour = date.getUTCHours ()
    const min = date.getUTCMinutes ()
    const sec = date.getUTCSeconds ()
    const msec = date.getUTCMilliseconds ()
  
    // Get the MJD
    const mjd = Math.floor (MJD (utc))

    // Return the decomposed values as a MDJ time object
    return {mjd: mjd, hour: hour, min: min, sec: sec, msec: msec}
    }

export function MJDHMS_to_str (mjd)
    {
    // Convert each component of a MJD time to a string

    mjd.hour = mjd.hour.toString ().padStart (2, '0')
    mjd.min = mjd.min.toString ().padStart (2, '0')
    mjd.sec = mjd.sec.toString ().padStart (2, '0')
    mjd.msec = mjd.msec.toString ().padStart (3, 0)

    mjd.mjd = String (mjd.mjd)

    return mjd 
    }
  
export function MDJ_to_UTC (mjd)
    {
    // Calculate Julian Day from MJD
    const jd = mjd + 2400000.5

    // Calculate the difference in days from the Unix epoch
    const days_since_epoch = jd - JD_UNIX_EPOCH

    // Convert days to milliseconds
    const utc = days_since_epoch * SIDEREAL_DAY

    return utc
    }

export function compose_epoch (...args)
    {
    let mjd = 0 
    let hour = 0
    let min = 0 
    let sec = 0
    let msec = 0

    if  (args.length === 1 && typeof args[0] === 'object')
        {
        args [0].mjd  && (mjd = Number (args [0].mjd))
        args [0].hour && (hour = Number (args [0].hour))
        args [0].min  && (min = Number (args [0].min))
        args [0].sec  && (sec = Number (args [0].sec))
        args [0].msec && (msec = Number (args [0].msec))            
        }

    else
        {
        args [0] && (mjd = Number (args [0]))
        args [1] && (hour = Number (args [1]))
        args [2] && (min = Number (args [2]))
        args [3] && (sec = Number (args [3]))
        args [4] && (msec = Number (args [4]))                
        }

    const utc = MDJ_to_UTC (mjd) + HHMMSS_to_msec (hour, min, sec, msec)
    
    return utc
    }

export function days_in_month (year, month)
    {
    // Determine if the year is a leap year
    const is_leap_year = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  
    // Create an array of days in each month for the current year. 
    const days_in_months = [...MONTH_DAYS]

    if  (is_leap_year)
        {
        days_in_months [1]++
        }
 
    // Return the number of days in the requested month.
    return days_in_months [month]
    }

export function YMD_to_DOY (year, month, day) 
    {
    // alert ("year: " + year + " month: " + month + " day: " + day)
    // Determine if the year is a leap year
    const is_leap_year = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  
    // Create an array of days in each month for the current year. 
    const days_in_months = [...MONTH_DAYS]

    if  (is_leap_year)
        {
        days_in_months [1]++
        }
  
    // Calculate day-of-year by summing the days of previous months and 
    // adding the current day.
    let doy = 0
  
    for (let i = 0 ; i < month ; i++) 
        {
        doy += days_in_months [i]
        }
  
    doy += day
  
    return doy
    }

export function YMD_to_MJD (...args)
    {
    let year = 0 
    let month = 0
    let day = 0 

    if  (args.length === 1 && typeof args[0] === 'object')
        {
        args [0].year  && (year = Number (args [0].year))
        args [0].month && (month = Number (args [0].month))
        args [0].day  && (day = Number (args [0].day))
        }

    else
        {
        args [0] && (year = Number (args [0]))
        args [1] && (month = Number (args [1]))
        args [2] && (day = Number (args [2]))
        }

    // Need to to this since JavaScript month runs 0-11
    month++

    if  (month <= 2) 
        {
        year -= 1;
        month += 12;
        }

    // console.log ("year: " + year + " month: " + month + " day: " + day)
    
    // This is part of the formula to take leap years into account.
    const a = Math.floor (year / 100)
    const b = 2 - a + Math.floor (a / 4)

    //JD = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + B - 1524.5

    // JD formula
    const jd = Math.floor (365.25 * (year + 4716)) +
                Math.floor (30.6001 * (month + 1)) + 
                day + b - 1524.5 ;

    return jd - 2400000.5
    }

export function MJD_to_YMD (mjd)
    {
    const d = new Date (MDJ_to_UTC (mjd))

    const r = {
        year: d.getUTCFullYear (),
        month: d.getUTCMonth (),
        day: d.getUTCDate (),
        }

    return r 
    }

export function MJD_to_YMD_DOY (mjd)
    {
    const r = MJD_to_YMD (mjd)

    r.doy = YMD_to_DOY (r.year, r.month, r.day) 

    return r
    }

export function FORMAT_YMD (ymd) // Should be renamed
    {
    const r = {year: "", month: "", day: ""}

    if  (ymd.day !== -1)
        { 
        r.day = (ymd.day < 10)? String (ymd.day).padStart (2, '0') : String (ymd.day)
        }

    if  (ymd.month !== -1)
        {
        r.month = (ymd.month < 10)? String (ymd.month).padStart (2, '0') : String (ymd.month)
        }

    if  (ymd.year !== -1)
        {
        r.year = String (ymd.year)
        }

    return r
    }

export function J2000 (jd)
    {
    // Number of days since Greenwich noon, Terrestrial Time, on 1 January 2000
    // This value may be negative 
    return jd - 2451543.5
    }

export function eccentricity_anomaly  (M, ε, error=.005)
    {
    let E0 = M +  ε * Math.sin (M) * (1 + ε * Math.cos (M))

    let E1 = E0 - (E0 - ε * Math.sin (E0) - M) / (1 - ε * Math.cos (E0))

    while (Math.abs (E1 - E0) > error)
        {
        E0 = E1

        E1 = E0 - (E0 - ε * Math.sin (E0) - M) / (1 - ε * Math.cos (E0))
        }

    return E1 
    }

export function distance_from_orbit_pos (xy)
    {
    return Math.sqrt (xy.x*xy.x + xy.y*xy.y)
    }

export function true_anomaly_from_orbit_pos (xy)
    {
    const θ = Math.atan2 (xy.y, xy.x) % PI2
    
    return (θ < 0)? θ + PI2 : θ
    }

export function get_ecliptic_coord (Ω, ω, i, θ, r)  
    {
    // Generate Ecliptic Coordinates from Orbital Elements

    // Ω: Longitude of the Ascending Node
    // ω: Argument of Perigee
    // i: Inclination 
    // θ: True Anomaly
    // r: Distance

    const x = r * ( Math.cos (Ω) * 
                    Math.cos (θ + ω) - 
                    Math.sin (Ω) * 
                    Math.sin (θ + ω) * 
                    Math.cos (i) )

    const y = r * ( Math.sin (Ω) * 
                    Math.cos (θ + ω) + 
                    Math.cos (Ω) * 
                    Math.sin (θ + ω) * 
                    Math.cos (i) )

    const z = r * Math.sin (θ + ω) * Math.sin (i)

    return {x:x, y:y, z:z}
    }

export function get_orbit_pos (a, ε, E)
    {
    const x = a * (Math.cos (E) - ε)
    const y = a * Math.sqrt (1 - ε*ε) * Math.sin(E)

    return {x:x, y:y}
    }

export function normalize_elements (Κ)
    {
    // Κ     Keplerian Elements

    // Normalize all angles to 0 < a < 360 degrees.
    // Also return all values as Radians.
    const normalize = α => 
        {
        const A = α % 360

        return (A < 0)? A + 360 : A
        }

    Κ.Ω = normalize (Κ.Ω) * DEG2RD
    Κ.i = normalize (Κ.i) * DEG2RD
    Κ.ω = normalize (Κ.ω) * DEG2RD
    Κ.M = normalize (Κ.M) * DEG2RD

    return Κ
    }

// ***********************************************
// All of the following functions are based on the web page:
// Computing planetary positions - a tutorial with worked examples
// By Paul Schlyter
// https://www.stjarnhimlen.se/comp/tutorial.html
// Accessed: February, 2023
// ************************************************
export const moon_elements = (j2000) =>
    {    
    const Ω = 125.1228 - 0.0529538083  * j2000 // Longitude of Ascending Node
    const i =   5.1454                         // Inclination
    const ω = 318.0634 + 0.1643573223  * j2000 // Argument of Perihelion
    const a =  60.2666                         // Semi-Major Axis
    const ε = 0.054900                         // Eccentricity
    const M = 115.3654 + 13.0649929509 * j2000 // Mean Anomaly

    return {Ω: Ω, i:i, ω:ω, a:a, ε:ε, M:M}
    }

export const mercury_elements = (j2000) =>
    {
    const Ω =  48.3313 + 3.24587E-5   * j2000 // Longitude of Ascending Node
    const i =   7.0047 + 5.00E-8      * j2000 // Inclination
    const ω =  29.1241 + 1.01444E-5   * j2000 // Argument of Perihelion
    const a = 0.387098                        // Semi-Major Axis
    const ε = 0.205635 + 5.59E-10     * j2000 // Eccentricity
    const M = 168.6562 + 4.0923344368 * j2000 // Mean Anomaly

    return {Ω: Ω, i:i, ω:ω, a:a, ε:ε, M:M}
    }

export const venus_elements = (j2000) =>
    {
    const Ω =  76.6799 +  2.46590E-5  * j2000 // Longitude of Ascending Node
    const i =   3.3946 +  2.75E-8     * j2000 // Inclination
    const ω =  54.8910 +  1.38374E-5  * j2000 // Argument of Perihelion
    const a = 0.723330
    const ε = 0.006773     - 1.302E-9 * j2000 // Eccentricity
    const M =  48.0052 + 1.6021302244 * j2000 // Mean Anomaly

    return {Ω: Ω, i:i, ω:ω, a:a, ε:ε, M:M}
    }

export const mars_elements = (j2000) =>
    {
    const Ω =  49.5574 + 2.11081E-5   * j2000 // Longitude of Ascending Node
    const i =   1.8497 - 1.78E-8      * j2000 // Inclination
    const ω = 286.5016 + 2.92961E-5   * j2000 // Argument of Perihelion
    const a = 1.523688
    const ε = 0.093405     + 2.516E-9 * j2000 // Eccentricity
    const M =  18.6021 + 0.5240207766 * j2000 // Mean Anomaly

    return {Ω: Ω, i:i, ω:ω, a:a, ε:ε, M:M}
    }

export function xyz_2_ρϕλ (x, y, z)
    {
    // Convert cartesian coordinates to longitude (λ) [0-2π rad], 
    // latitude (ϕ), and distance (ρ) in the ecliptic plane.
    const λ  =  Math.atan2 ( y, x ) % PI2
    const ϕ  =  Math.atan2 ( z, Math.sqrt ( x*x + y*y ) ) 
    const ρ  =  Math.sqrt  ( x*x + y*y + z*z )

    return { 
        λ : (λ < 0)? λ + PI2 : λ, 
        ϕ: ϕ, 
        ρ: ρ
        }
    }
export function lunar_perturbations (moon, Ls, Ms)
    {
    // Ls       Mean longitude of the Sun
    // Ms       Mean anomaly of the Sun
    // moon     Orbital elements for the moon
    const normalize = (i) => {
        
        const n = i % PI2
        return (n < 0.) ? n + PI2 : n
        }

    // Moon's mean longitude:        
    const Lm  =  normalize (moon.Ω + moon.ω + moon.M)
    // Moon's mean elongation:       
    const D   =  normalize (Lm - Ls)
    // Moon's argument of latitude:  
    const F   =  normalize (Lm - moon.Ω)

    // console.log ("Lm ", Lm, " D ",  D, " F ", F, " Ls ", Ls, " Ms ",  Ms,  " Ω ", moon.Ω )

    // Perturbations in longitude (degrees):
    const Pλ =
    -1.274 * Math.sin (moon.M - 2*D)     // Evection
    +0.658 * Math.sin (2*D)              // Variation
    -0.186 * Math.sin (Ms)               // Yearly equation
    -0.059 * Math.sin ( 2*moon.M - 2*D)
    -0.057 * Math.sin ( moon.M - 2*D + Ms)
    +0.053 * Math.sin (moon.M + 2*D)
    +0.046 * Math.sin (2*D - Ms)
    +0.041 * Math.sin (moon.M - Ms)
    -0.035 * Math.sin (D)                // Parallactic equation
    -0.031 * Math.sin (moon.M + Ms)
    -0.015 * Math.sin (2*F - 2*D)
    +0.011 * Math.sin (moon.M - 4*D)

    // Perturbations in latitude (degrees):
    const Pϕ = 
    -0.173 * Math.sin (F - 2*D)
    -0.055 * Math.sin (moon.M - F - 2*D)
    -0.046 * Math.sin (moon.M + F - 2*D)
    +0.033 * Math.sin (F + 2*D)
    +0.017 * Math.sin (2*moon.M + F)

    // Perturbations in lunar distance (Earth radii):
    const Pρ = 
    -0.58 * Math.cos (moon.M - 2*D)
    -0.46 * Math.cos (2*D)

    return { Pλ : Pλ * DEG2RD, Pϕ : Pϕ * DEG2RD, Pρ : Pρ }    
    }

export function ρϕλ_2_xyz (ρ, ϕ, λ)
    {
    // Convert longitude (λ) [0-2π rad], latitude (ϕ), and distance (ρ)
    // to cartesian coordinates in the ecliptic plane.
    const x = ρ * Math.cos (λ) * Math.cos (ϕ)
    const y = ρ * Math.sin (λ) * Math.cos (ϕ)
    const z = ρ * Math.sin (ϕ) 

    return {x: x, y: y, z: z}
    }

export function ecl_2_equ (x, y, z, ε)
    {
    // Convert cartesian coordinates in the ecliptic place to cartesian 
    // coordinates in the equatorial plane.

    // ε    Obliquity of the Ecliptic 

    return ({
        x: x,
        y: y * Math.cos (ε) - z * Math.sin (ε),
        z: y * Math.sin (ε) + z * Math.cos (ε),
        })
    }

export function ρδα_2_xyz (ρ, δ, α)
    {
    // Convert distance (ρ), declination (δ), right ascension (α) to cartesian 
    // coordinates
    const x = ρ * Math.cos (δ) * Math.cos(α)
    const y = ρ * Math.cos (δ) * Math.sin(α)
    const z = ρ * Math.sin (δ) 

    return {x: x, y: y, z: z} ;
    }


export function mult3x1 (m, v)
    {
    // Convert a location vector (x, y, z coordinates) to another frame of
    // reference by multiplying by a 3x3 transformation matrix

    let r = [0, 0, 0] 
    // let v = [v3.x, v3.y, v3.z] ;

    for (let i = 0 ; i < 3 ; i++)
        {
        r [i] = 0. ;

        for (let j = 0 ; j < 3 ; j++)
            {
            r [i] += m [i][j] * v [j]
            }
        }

    //return new THREE.Vector3 (r [0], r [1], r [2]) ;
    return r
    }

export function mltply (a, b)
    {
    //    INPUT:
    //       a = 3X3 MATRIX
    //       a = 3 COMPONENT VECTOR
    //    OUTPUT:
    //       r = 3 COMPONENT VECTOR
    //    CONVERT X,Y,Z COORDS. TO ANOTHER FRAME BY MATRIX MLTPLY

    let r = [0., 0., 0.]

    for (let i = 0 ; i < 3 ; i++)
        {
        r [i] = 0. ;

        for (let j = 0 ; j < 3 ; j++)
            {
            r [i] += a [i][j] * b [j]
            }
        }

    // return new THREE.Vector3 (r [0], r [1], r [2]) ;    
    return r    
    }


export function transpose (M)
    {
    // This only works on a 3x3 array!

    const M01 = M [0] [1]
    const M02 = M [0] [2]
    const M10 = M [1] [0]
    const M12 = M [1] [2]
    const M20 = M [2] [0]
    const M21 = M [2] [1]

    M [0] [1] = M10
    M [0] [2] = M20

    M [1] [0] = M01
    M [1] [2] = M21

    M [2] [0] = M02
    M [2] [1] = M12
   
    return M
    }

export function create_rotation_matrix (α, axis)
    {
    switch (axis.toUpperCase ())
        {
        case 'X':

            return create_rotation_matrix_x (α)

        case 'Y':

            return create_rotation_matrix_y (α)

        case 'Z':

            return create_rotation_matrix_z (α)

        default:

            return undefined
        }
    }

export function create_rotation_matrix_x (α)
    {
    const sinα = Math.sin (α)
    const cosα = Math.cos (α)

    let a = Array.from(Array(3), () => new Array(3)) 

    // Create matrix to rotate α radians around the X axis
    a [0] [0] = 1.0 
    a [0] [1] = 0.0
    a [0] [2] = 0.0

    a [1] [0] = 0.0
    a [1] [1] = cosα 
    a [1] [2] = sinα

    a [2] [0] = 0.0
    a [2] [1] = -sinα
    a [2] [2] = cosα

    return a
    }

export function create_rotation_matrix_y (α)
    {
    const sinα = Math.sin (α)
    const cosα = Math.cos (α)

    let a = Array.from(Array(3), () => new Array(3)) 

    // Create matrix to rotate α radians around the Y axis
    a [0] [0] = cosα  
    a [0] [1] = 0.0
    a [0] [2] = sinα

    a [1] [0] = 0.0
    a [1] [1] = 1.0  
    a [1] [2] = 0.0

    a [2] [0] = -sinα
    a [2] [1] = 0.0
    a [2] [2] = cosα

    return a
    }

export function create_rotation_matrix_z (α)
    {
    const sinα = Math.sin (α)
    const cosα = Math.cos (α)

    let a = Array.from(Array(3), () => new Array(3)) 

    // Create matrix to rotate α radians around the Z axis
    a [0] [0] = cosα  
    a [0] [1] = sinα
    a [0] [2] = 0.0

    a [1] [0] = -sinα 
    a [1] [1] = cosα  
    a [1] [2] = 0.0

    a [2] [0] = 0.0
    a [2] [1] = 0.0
    a [2] [2] = 1.0

    return a
    }

export function add_vectors (a, b)
    {
    // Make sure both a and b are the same lenght
    if  (a.length !== b.length)
        {
        return undefined
        }

    // Add vectors a and b
    return a.map ((v, i) => v + b [i])
    }

export function calc_planet_gei (J2000, kepler_orbit, sun, moon_flag)
    {
    // Get the orbital elements for the planet we calculating the position of.
    const orbit = normalize_elements (kepler_orbit (J2000))

    // Calculate the anomaly of eccentricity (E)
    const E = eccentricity_anomaly (orbit.M, orbit.ε)

    // Calculate the position of the planet in its orbital plane in cartesian 
    // coordinates.
    const xy = get_orbit_pos (orbit.a, orbit.ε,  E)

    // Calculate the distance to the planet 
    const d = distance_from_orbit_pos (xy)

    // Calculate the true anomaly of the planet
    const θ = true_anomaly_from_orbit_pos (xy)

    const gei = new THREE.Vector3 ()

    // Check if we calculating the the orbital position of the moon.
    if  (moon_flag)
        {
        //  First order approximation of the ecliptic position of the
        //  Moon convreted to spherical coordinates
        const blah = get_ecliptic_coord (orbit.Ω, orbit.ω, orbit.i, θ, d)

        const ecl0 = xyz_2_ρϕλ (blah.x, blah.y, blah.z)

        // Calculate lunar perturbations.
        const p = lunar_perturbations (orbit, sun.L * DEG2RD, sun.M * DEG2RD)

        const ecl1 = ρϕλ_2_xyz (ecl0.ρ + p.Pρ, ecl0.ϕ + p.Pϕ, ecl0.λ + p.Pλ)

        // Convert to the GEI coordinate system.
        const r = ecl_2_equ (ecl1.x, ecl1.y, ecl1.z, sun.ε)

        gei.set (r.x, r.y, r.z)
        }

    else 
        {
        // Calculate the ecliptic coordinates of the planet
        const ecl =  get_ecliptic_coord (orbit.Ω, orbit.ω, orbit.i, θ, d)

        // Convert to the GEI coordinate system.
        const r = ecl_2_equ (ecl.x + sun.Xe, ecl.y + sun.Ye, ecl.z, sun.ε)

        gei.set (r.x, r.y, r.z)

        gei.multiplyScalar (AU)
        }
        
    return gei
    }

export function UTC_to_YDH (time)
    {
    // Time in Year, DOY, and hours is used by many of geocentric coordinate 
    // system conversion routines.  

    // Allowing calling functions with no time value so current time is used.
    const tm = time === undefined? new Date () : new Date (time)

    // Convert to UTC and get the start of the day (midnight)
    const midnight = new Date (Date.UTC (tm.getUTCFullYear (), tm.getUTCMonth (), tm.getUTCDate ()))

    // Get the year
    const year = tm.getUTCFullYear ()
    
    // Get the day of the year
    // Jan 0 is Dec 31 of the previous year, effectively giving us Dec 31 midnight
    const start_off_year = new Date (Date.UTC (tm.getUTCFullYear (), 0, 0))
    // Difference in milliseconds
    const diff = tm - start_off_year 
    // Milliseconds in one day
    const day = Math.floor (diff / MSEC_PER_DAY)
    
    // Calculate the hours since midnight
    // Difference in hours
    const hrs = (tm - midnight) / MSEC_PER_HOUR

    return {year: year, day: day, hrs: hrs}
    }

export function calc_gmst (time)
    {
    // Calculate GMST from a scalar time value.  Returns value in radians.
    const { year, day, hrs } = UTC_to_YDH (time)

    // convert hours to fraction of a day
    const frac_of_day = hrs / 24.0 

    // find the number of days since Jan 1, 1900.  Include the fraction of day.
    const d1900 = 365 * (year - 1900) + Math.floor ((year - 1901) / 4) + day + frac_of_day - 0.5 

    const gmst_deg = ((279.690983 + 0.9856473354 * d1900 + 360.0 * frac_of_day + 180.0) % 360.0) 
    
    const gmst_rad = gmst_deg * DEG2RD 

    return gmst_rad 
    }

export function gmst (time)
    {
    return (Array.isArray (time))? time.map (t => calc_gmst (t)) : calc_gmst (time)
    }

export function msec_to_HHMMSS (msec)
    {
    const hours = Math.floor (msec / MSEC_PER_HOUR)

    const min = Math.floor ((msec - HHMMSS_to_msec (hours, 0, 0)) / MSEC_PER_MIN)

    const sec = Math.floor ((msec - HHMMSS_to_msec (hours, min, 0)) / MSEC_PER_SEC)

    return ({hours: hours, min: min, sec: sec})
    }

export function HHMMSS_to_msec (hours = 0, min = 0, sec = 0, msec = 0)
    {
    return hours * MSEC_PER_HOUR + min * MSEC_PER_MIN + sec * MSEC_PER_SEC + msec
    }

export function HHMMSS_to_radians (hours = 0, min = 0, sec = 0, msec) 
    {
    // Convert hours, minutes, seconds and milliseconds to total milliseconds
    const total = HHMMSS_to_msec (hours, min, sec, msec)

    // There are 86400000 milliseconds in a sidereal day, which 
    // corresponds to 2*pi radians
    const radians = (total / MSEC_PER_DAY) * (2 * Math.PI)

    return radians
    }
    
export function radians_to_HHMMSS (radians) 
    {
    // Convert radians to total seconds. There are 2*pi radians in a 86400-second sidereal day
    const msec = (radians / (2 * Math.PI)) * MSEC_PER_DAY

    // Calculate the hours, minutes, and seconds
    return msec_to_HHMMSS (msec)
    }
      
export function midnight (utc)
    {
    // Convert UTC time in milliseconds to a Date object
    const utc_date = new Date (utc)

    // Create a new Date object representing the beginning of the day (midnight)
    const beginning_of_day = new Date(utc_date)

    // Reset the time to midnight
    beginning_of_day.setUTCHours (0, 0, 0, 0)

    return beginning_of_day.valueOf ()
    }

export function rotate_around_origin (point, axis, theta) 
    {    
    // Extract components for readability
    const [px, py, pz] = point
    const [kx, ky, kz] = axis

    // Calculate the components of the Rodrigues' rotation formula
    const cosTheta = Math.cos (theta)
    const sinTheta = Math.sin (theta)
    const oneMinusCosTheta = 1 - cosTheta;

    // Cross product of k and p (axis and point)
    const crossKxP = [ky * pz - kz * py, kz * px - kx * pz, kx * py - ky * px] 

    // Dot product of k and p
    const dotKxP = kx * px + ky * py + kz * pz

    // Rodrigues' rotation formula components
    const rotatedX = px * cosTheta + crossKxP[0] * sinTheta + kx * dotKxP * oneMinusCosTheta
    const rotatedY = py * cosTheta + crossKxP[1] * sinTheta + ky * dotKxP * oneMinusCosTheta
    const rotatedZ = pz * cosTheta + crossKxP[2] * sinTheta + kz * dotKxP * oneMinusCosTheta

    return [rotatedX, rotatedY, rotatedZ];
    }
    
export function HHMMSS_to_rad (hours, min, sec)
    {
    const degrees = (hours + min/60 + sec/3600) * 15

    return degrees * DEG2RD ;
    }


export function sun_position (time)
    {
    //const tm = moment.utc(time) ;
    //const midnight = tm.clone().utc().startOf('day') ;

    //const year = tm.utc().year() ;
    //const day  = tm.utc().dayOfYear() ;
    //const hrs  = tm.utc().diff(midnight, 'hours', 1) ;

    // Convert the epoch time to Year, DOY, and hours
    const { year, day, hrs } = UTC_to_YDH (time)

    // convert hours to fraction of a day
    const frac_of_day = hrs / 24.0 

    // 1−0.01672∗cos(0.9856∗(day−4))

    // find the number of days since Jan 1, 1900.  Include the fraction of day.
    const d1900 = 365 * (year - 1900) + Math.floor ((year - 1901) / 4) + day + frac_of_day - 0.5 ;

    // Julian Centuries (centuries since 1900)
    const c1900 = d1900 / DAYS_PER_CENT ;

    // Mean longitude of the Sun
    const L = (279.696678 + 0.9856473354 * d1900) % 360 

    // Mean Anomaly of the Sun
    const M = (358.475845 + 0.985600267 * d1900) % 360 
    
    // Mean Anomaly of the Sun in Radians
    const g = M * DEG2RD ;

    // Obliquity of the Ecliptic (in Radians)
    const ε = (23.45229444 - .0130125 * c1900) * DEG2RD ;

    // sine and cosine of the angle of obliquity
    const seps  = Math.sin (ε) ;
    const ceps  = Math.cos (ε) ;

    // Solar longitude along the ecliptic (in degrees)
    let λ = L + (1.91946 - 0.004789 * c1900) * Math.sin (g) + 0.020094 * Math.sin (2*g) ;
    
    if  (λ > 360)
        {
        λ -= 360 ;
        }

    if  (λ < 0)
        {
        λ += 360 ;
        }

    let slp = (λ - 0.005686) * DEG2RD  ;

    // Distance from the Earth to the Sun in AU
    const R = 1.00014 - 0.01671 * Math.cos (g) - 0.00014 * Math.cos (2*g)

    let sind = seps * Math.sin (slp) ;

    let cosd = Math.sqrt (1.0 - sind * sind) ;

    // Solar apparent declination 
    let sdec = Math.atan (sind / cosd) ;

    // Solar apparent right ascension 
    let srasn = Math.PI - Math.atan2 ((ceps * sind) / (seps * cosd), -Math.cos(slp) / cosd) ;

    // Cosine of apparent solar declination 
    let cosdec = Math.cos (sdec) ;

    let sx = Math.cos (srasn) * cosdec  ;
    let sy = Math.sin (srasn) * cosdec ;
    let sz = Math.sin (sdec)  ;

    let pos = {
        seps : seps,
        ceps : ceps,
        sdec : sdec,
        srasn : srasn,
        L : L,
        M : M, 
        λ : λ,
        R : R,
        ε : ε,
        x : sx,
        y : sy,
        z : sz,
        Xe : R * Math.cos ( λ * DEG2RD),
        Ye : R * Math.sin ( λ * DEG2RD),
        } ;

    return pos ;
    }

export const Sun = (function() 
    {
    const store = {} // Private cache
        
    return (
        {
        get_sun_pos: function (time) 
            {
            // Use seconds as the hash value.
            const s = Math.floor (time /1000.)

            if  (! store.hasOwnProperty (s))
                {
                store [s] = sun_position (time)
                }

            return store [s]
            }
        }) ;
    }) () ;

// const xml_date_format = "YYYY-MM-DDTHH:mm:ssZ" ;

export function sph2rect (coords) 
    {
    // const {lon, lat, radiusVector} = coords ;
    const lon = coords.x ;
    const lat = coords.y ;
    const radiusVector = coords.z ;

    const lonRad = lon * DEG2RD
    const latRad = lat * DEG2RD

    const x = radiusVector * Math.cos(latRad) * Math.cos(lonRad);
    const y = radiusVector * Math.cos(latRad) * Math.sin(lonRad);
    const z = radiusVector * Math.sin(latRad);

    return new THREE.Vector3 (x, y, z) ;
    }

export function xyz (obj)
    {
    // Convert an object containing the properties (x, y, z) representing 
    // a point in some coordinate system to to an array of the form [x, y, z]
    return [obj.x, obj.y, obj.z]
    }

export function GSE_to_WS_base (gse)
    {
    let x = gse [0]
    let y = gse [1]
    let z = gse [2]

    return [x, z, -y]
    }

export function Frame_to_DS_base (xyz)
    {
    // DS is new designation for the THREE.js coordinate system
    // A wrapper for GSE_to_WS_base, but with name that more appropriately reflects 
    // its purpose.
    // Eventually GSE_to_WS will go away.

    return GSE_to_WS_base (xyz)
    }
    
export function GSE_to_DS (gse, time = 0, frame = REF_FRAME.ECI)
    {
    // DS is new designation for the THREE.js coordinate system
    // This function replaces old functionality of GSE_to_WS but includes
    // a frame conversion by including GSE_to_Frame
    return Frame_to_DS (GSE_to_Frame (gse, time, frame))   
    }

export function GSE_to_Frame_base (gse, time, frame = REF_FRAME.ECI)
    {
    switch (frame)
        {
        case  REF_FRAME.ECI:

            return gse

        case  REF_FRAME.ECER:
            // Get the GMST angle in radians
            const theta = gmst (time)

            // GMST @ midnight UTC
            const theta_0 = gmst (midnight (time))

            const earth_axis_angle = GEI_to_GSE ([0, 0, 1], Sun.get_sun_pos (time))

            return rotate_around_origin (gse, earth_axis_angle, -(theta - theta_0))

        default:
            return 
        }
    }

export const coord_unit =
    {
    RE: 1,
    AU: 2,
    KM: 3,
    RS: 4, 
    UNKNOWN: 0,
    }

export const COORD_Unit = Object.freeze (coord_unit)

export class CONVERT_UNIT 
    {
    static To_RE (v, unit)
        {
        switch (unit)
            {
            case COORD_Unit.RE :

                return v

            case COORD_Unit.AU :

                return v * AU

            case COORD_Unit.KM :

                return v / EARTH_RADIUS

            case COORD_Unit.RS :

                return (v * SOLAR_RADIUS) / EARTH_RADIUS

            default :

                return v
            }
        }

    static To_KM (v, unit)
        {
        switch (unit)
            {
            case COORD_Unit.RE :

                return v * EARTH_RADIUS

            case COORD_Unit.AU :

                return v * AUKM

            case COORD_Unit.KM :

                return v

            case COORD_Unit.RS :

                return v * SOLAR_RADIUS

            default :

                return v
            }
        }

    static To_RS (v, unit)
        {
        switch (unit)
            {
            case COORD_Unit.RE :

                return (v * EARTH_RADIUS) / SOLAR_RADIUS

            case COORD_Unit.AU :

                return (v * AUKM) / SOLAR_RADIUS

            case COORD_Unit.KM :

                return v / SOLAR_RADIUS

            case COORD_Unit.RS :

                return v

            default :

                return v
            }
        }

    static To_AU (v, unit)
        {
        switch (unit)
            {
            case COORD_Unit.RE :

                return v / AU

            case COORD_Unit.AU :

                return v

            case COORD_Unit.KM :

                return v / AUKM

            case COORD_Unit.RS :

                return (v * SOLAR_RADIUS) / AUKM

            default :

                return v
            }
        }
    }

export function convert (v, unit = COORD_Unit.RE, to = COORD_Unit.RE)
    {
    switch (to)
        {
        case COORD_Unit.RE :

            return CONVERT_UNIT.To_RE (v, unit)

        case COORD_Unit.AU :

            return CONVERT_UNIT.To_AU (v, unit)

        case COORD_Unit.KM :

            return CONVERT_UNIT.To_KM (v, unit)

        case COORD_Unit.RS :

            return CONVERT_UNIT.To_RS (v, unit)

        default :

            return v
        }
    }

export const coord_formats =
    {
    VECTOR3: 3,
    OBJ: 2,
    ARRAY: 1,
    UNKNOWN: 0,
    }

export const COORD_Format = Object.freeze (coord_formats)

export const coord_system = 
    {
    UNKNOWN: 0,
    GSE: 1,
    GEI: 2,
    GEI2000: 3,
    GEO: 4,
    GSM: 5, 
    SM: 6, 
    MAG: 7,
    HEE: 8,
    HAE: 9,
    HEEQ: 10,
    }

export const COORD_System = Object.freeze (coord_system)

export const DEF_HELIO_COORD_SYS = COORD_System.HEE
export const DEF_GEO_COORD_SYS = COORD_System.GSE

export const reference_frame = 
    {
    UNKNOWN: 0,
    ECI: 1,
    ECER: 2,
    }

export const REF_FRAME = Object.freeze (reference_frame)

export function key_to_unit (key)
    {
    switch (key.toUpperCase())
        {
        case "RE" :

            return COORD_Unit.RE

        case "AU" :

            return COORD_Unit.AU

        case "KM" :

            return COORD_Unit.KM

        case "RS" :

            return COORD_Unit.RS

        default:

            return null

        }
    }

export function unit_to_key (unit)
    {
    switch (unit)
        {
        case COORD_Unit.RE :

            return "Re"

        case COORD_Unit.AU :

            return "AU"

        case COORD_Unit.KM :

            return "Km"

        case COORD_Unit.RS :

            return "Rs"

        default:

            return null
        }
    }

export function unit_to_string (unit)
    {
    switch (unit)
        {
        case COORD_Unit.RE :

            return "Earth Radii (Re = 6378.16 km)"

        case COORD_Unit.AU :

            return "Astronomical Unit (au = 1.50e8 km)"

        case COORD_Unit.KM :

            return "Kilometer (km)"

        case COORD_Unit.RS :

            return "Solar Radii (Rs = 6.96e5 km)"

        default:

            return null
        }
    }

export function get_default_unit (system)
    {
        switch (system)
        {
        case COORD_System.GSE :

            return COORD_Unit.RE

        case COORD_System.GEI :

            return COORD_Unit.RE

        case COORD_System.GEI2000 :

            return COORD_Unit.RE

        case COORD_System.GEO :

            return COORD_Unit.RE

        case COORD_System.GSM :

            return COORD_Unit.RE

        case COORD_System.SM :

            return COORD_Unit.RE

        case COORD_System.MAG :

            return COORD_Unit.RE

        case COORD_System.HEE :

            return COORD_Unit.RS

        case COORD_System.HAE :

            return COORD_Unit.RS

        case COORD_System.HEEQ :

            return COORD_Unit.RS

        default:

            return COORD_Unit.RE
        }        
    }

export function key_to_coord_system (key)
    {
    switch (key.toUpperCase())
        {
        case "GSE" :

            return COORD_System.GSE

        case "GEI" :

            return COORD_System.GEI

        case "GEI2000" :

            return COORD_System.GEI2000

        case "GEO" :

            return COORD_System.GEO

        case "GSM" :

            return COORD_System.GSM

        case "SM" :

            return COORD_System.SM

        case "MAG" :

            return COORD_System.MAG

        case "HEE" :

            return COORD_System.HEE

        case "HAE" :

            return COORD_System.HAE

        case "HEEQ" :

            return COORD_System.HEEQ

        default:

            return null
        }
    }

export function coord_system_to_key (system)
    {
    switch (system)
        {
        case COORD_System.GSE :

            return "GSE"

        case COORD_System.GEI :

            return "GEI"

        case COORD_System.GEI2000 :

            return "GEI2000"

        case COORD_System.GEO :

            return "GEO"

        case COORD_System.GSM :

            return "GSM"

        case COORD_System.SM :

            return "SM"

        case COORD_System.MAG :

            return "MAG" 

        case COORD_System.HEE :

            return "HEE" 

        case COORD_System.HAE :

            return "HAE"

        case COORD_System.HEEQ :

            return "HEEQ" 

        default:

            return null
        }
    }

export function coord_system_to_frame (system)
    {
    switch (system)
        {
        case COORD_System.GSE :

            return "EARTH"

        case COORD_System.GEI :

            return "EARTH"

        case COORD_System.GEI2000 :

            return "EARTH"

        case COORD_System.GEO :

            return "EARTH"

        case COORD_System.GSM :

            return "EARTH"

        case COORD_System.SM :

            return "EARTH"

        case COORD_System.MAG :

            return "EARTH" 

        case COORD_System.HEE :

            return "SUN" 

        case COORD_System.HAE :

            return "SUN"

        case COORD_System.HEEQ :

            return "SUN" 

        default:

            return null
        }
    }


// Class to accept the parameters to a function where is expected that either first
// parameter will be object that represents the coordinate tuple(s) or the first three
// parameters represent the x, y, z coordinates

// 
export function transform_coordinates (transform, ...args)
    {

    let work = null
    let input_type = COORD_Format.UNKNNOWN

    if  (args.length === 0)
        {
        return null
        }

    if  (typeof args [0] === 'object')
        {
        const obj = args [0]


        if  (obj.isVector3 === true)
            {
            work = obj.toArray ()
            input_type = COORD_Format.VECTOR3
            
            args.shift ()
            }

        else if (obj.hasOwnProperty ('x') && obj.hasOwnProperty ('y') && obj.hasOwnProperty ('z'))
            {
            work = [obj.x, obj.y, obj.z]
            input_type = COORD_Format.OBJ

            args.shift ()
            }

        else if (Array.isArray (obj) && obj.length > 2)
            {
            work = [...obj]
            input_type = COORD_Format.ARRAY

            args.shift ()
            }

        else
            {
            return null
            }
        }

    else 
        {
        if  (args.length > 2)
            {
            const x = args.shift ()
            const y = args.shift ()
            const z = args.shift ()

            work = [x, y, z]

            input_type = COORD_Format.ARRAY
            }

        else
            {
            return null
            }
        }
        
    const len = work.length / 3
    const len_3 = len * 3

    for (let i = 0 ; i < len ; i++)
        {
        const first = i * 3
        const last = (i + 1) * 3

        // Create an array of parameters to use to call the function.
        // Parameters will depend on the corresponding function arguments.
        let p = [work.slice (first, last)]
        
        for (let j = 0 ; j < args.length ; j++)
            {
            // Array
            if  (Array.isArray (args [j]))
                {
                if  (args [j].length === len_3)
                    {
                    p.push (args [j].slice (first, last))

                    continue
                    }

                if  (args [j].length === len)
                    {
                    p.push (args [j] [i])

                    continue
                    }
                }

            // Scalar
            else 
                {
                p.push (args [j])
                }
            }

        work.splice (first, 3, ...transform.apply (undefined, p))
        }

    switch (input_type)
        {
        case COORD_Format.VECTOR3:

            return new THREE.Vector3 (work [0], work [1], work [2])

        case COORD_Format.OBJ:

            return {x: work [0], y: work [1], z: work [2]}

        case COORD_Format.ARRAY:

            return work

        default: 

            return null
        }

    }

export function ANY_to_GSE (any, system = COORD_System.UNKNOWN, time)
    {
    //    UNKNOWN: 0,
    //    GSE: 1,
    //    GEI: 2,
    //    GEI2000: 3,
    //    GEO: 4,
    //    GEO: 5, 
    //    SM: 6, 
    //    MAG: 7
    
    if  (system === COORD_System.GSE)
        {
        return any
        }


    const sunpos = sun_position (time)

    let gei = null

    switch (system)
        {
        // Heliocentric coordinate systems.  These coordinate systems do not resolve to GEI
        // but are transformed into GSE directly.
        case COORD_System.HEE :
            
            return HEE_to_GSE (any, sunpos)

        case COORD_System.HAE :

            return HAE_to_HEE (HEE_to_GSE (any, sunpos), sunpos)

        // Geocentric Coordinate Systems.  These coordinate systems are transformed first
        // to GEI before being transformed into GSE.
        case COORD_System.GEI2000:

            gei = GEI2000_to_GEI (any, time)
            break

        case COORD_System.GEO:

            gei = GEO_to_GEI (any, gmst (time))
            break

        case COORD_System.GSM:

            gei = GSM_to_GEI (any, sunpos, gmst (time), time)
            break

        case COORD_System.SM:
 
            gei = SM_to_GEI (any, sunpos, gmst (time), time)
            break

        case COORD_System.MAG:
            
            gei = GEO_to_GEI (MAG_to_GEO (any, time), gmst (time))
            break

        case COORD_System.GEI:

            gei = any
            break 

        default :

            console.log ("Unknown coordinate system supplied")

            return null
        }

    return GEI_to_GSE (gei, sunpos)
    }

export function GSE_to_ANY (gse, system = COORD_System.UNKNOWN, time)
    {
    if  (system === COORD_System.GSE)
        {
        return gse
        }

    // const sunpos = sun_position (time)
    // get_sun_pos really needs to be modified to correclty handle arrays
    const sunpos = (Array.isArray (time))? time.map ( t => Sun.get_sun_pos (t) ) : Sun.get_sun_pos (time) 

    if  (system === COORD_System.HEE)
        {
        //alert (gse)
        //alert (GSE_to_HEE (gse, sunpos))
        return GSE_to_HEE (gse, sunpos)
        }

    if  (system === COORD_System.HAE)
        {
        return HEE_to_HAE (GSE_to_HEE (gse, sunpos), sunpos)
        }


    const gei = GSE_to_GEI (gse, sunpos)

    //console.log (JSON.stringify (gei))

    switch (system)
        {
        case COORD_System.GEI2000:

            return GEI_to_GEI2000 (gei, time)

        case COORD_System.GEO:

            return GEI_to_GEO (gei, gmst (time))

        case COORD_System.GSM:

            return GEI_to_GSM (gei, sunpos, gmst (time), time)

        case COORD_System.SM:
 
            return GEI_to_SM (gei, sunpos, gmst (time), time)

        case COORD_System.MAG:
            
            return GEO_to_MAG (GEI_to_GEO (gei, gmst (time)), time)

        case COORD_System.GEI:

            return gei

        default :

            console.log ("Unknown coordinate system requested")

            return null
        }
    }

export function GEI2000_to_GEI (...args)
    {
    //console.log ('GEI2000_to_GEI')
    return transform_coordinates (GEO.GEI2000_to_GEI, ...args)
    }

export function GEI_to_GEI2000 (...args)
    {
    //console.log ('GEI_to_GEI2000')
    return transform_coordinates (GEO.GEI_to_GEI2000, ...args)
    }

export function GEI_to_GEO (...args)
    {
    //console.log ('GEI_to_GEO')
    return transform_coordinates (GEO.GEI_to_GEO, ...args)
    }

export function GEI_to_GSM (...args)
    {
    //console.log ('GEI_to_GSM')
    return transform_coordinates (GEO.GEI_to_GSM, ...args)
    }

export function GEI_to_SM (...args)
    {
    //console.log ('GEI_to_SM')
    return transform_coordinates (GEO.GEI_to_SM, ...args)
    }

export function GEI_to_GSE (...args)
    {
    //console.log ('GEI_to_GSE')
    return transform_coordinates (GEO.GEI_to_GSE, ...args)
    }

export function GEO_to_GEI (...args)
    {
    //console.log ('GEO_to_GEI')
    return transform_coordinates (GEO.GEO_to_GEI, ...args)
    }

export function GEO_to_MAG (...args)
    {
    //console.log ('GEO_to_MAG')
    return transform_coordinates (GEO.GEO_to_MAG, ...args)
    }

export function GSE_to_GEI (...args)
    {
    //console.log ('GSE_to_GEI')
    return transform_coordinates (GEO.GSE_to_GEI, ...args)
    }

export function GSM_to_GEI (...args)
    {
    //console.log ('GSM_to_GEI')
    return transform_coordinates (GEO.GSM_to_GEI, ...args)
    }

export function MAG_to_GEO (...args)
    {
    //console.log ('MAG_to_GEO')
    return transform_coordinates (GEO.MAG_to_GEO, ...args)
    }

export function SM_to_GEI (...args)
    {
    //console.log ('SM_to_GEI')
    return transform_coordinates (GEO.SM_to_GEI, ...args)
    }
    
export function GSE_to_HEE (...args)
    {
    return transform_coordinates (HELIO.GSE_to_HEE, ...args)
    }

export function HEE_to_GSE (...args)
    {
    return transform_coordinates (HELIO.HEE_to_GSE, ...args)
    }

export function HAE_to_HEE (...args)
    {
    return transform_coordinates (HELIO.HAE_to_HEE, ...args)
    }

export function HEE_to_HAE (...args)
    {
    return transform_coordinates (HELIO.HEE_to_HAE, ...args)
    }

//export function GSE_to_WS (x, y, z, normalize = 0)
export function GSE_to_WS (...args)
    {
    return transform_coordinates (GSE_to_WS_base, ...args)
    }

export function Frame_to_DS (...args)
    {
    return transform_coordinates (Frame_to_DS_base, ...args)
    }

export function GSE_to_Frame (...args)
    {
    return transform_coordinates (GSE_to_Frame_base, ...args) 
    }

/* No longer used.
export class Calculate_Planet_Orbit
    {
    constructor ()
        {
        // Ensure only one actual version of this object exists
        if  (Calculate_Planet_Orbit.instance) 
            {
            return Calculate_Planet_Orbit.instance
            }

        Calculate_Planet_Orbit.instance = this

        // Use the following object properties to keep track of previous results from calling 
        this.recalc = true
        this.sun_pos = []
        this.j2000 = []
        }

    add_orbit_pos (r, time, gse)
        {
        // add the time
        r.time.push (time)

        // add the GSE coordinate position
        r.orbit.push ({x: gse.x, y:gse.y, z:gse.z})

        //console.log (ws.x, ws.y, ws.z)
        }


    calculate_orbit (planet, record, start_time, end_time)
        {
        let utc = start_time

        let index = 0 

        //console.log ("recalc: ", this.recalc)

        while (utc <= end_time)
            {
            //console.log (planet, index, utc)

            // Do Earth as a special case, since its always at GSE (0, 0, 0)
            if  (planet.toUpperCase () === 'EARTH')
                {
                this.add_orbit_pos (record, utc,  new THREE.Vector3 (0, 0, 0))
    
                utc += PLANET_ORBIT_INTERVAL * 60 * 1000 ;   
    
                index++ 

                continue        
                }

            // Get information about the current position of the sun
            const sunpos = (this.recalc) ?  sun_position (utc) : this.sun_pos [index] 

            // Get the julian day number
            const j2000 =  (this.recalc) ? J2000 (JD (utc)) : this.j2000 [index]  

 
            let orbit 
            let moon_flag = false 

            switch (planet.toUpperCase ()) 
                {
                case "MOON" :
                    orbit = moon_elements 
                    moon_flag = true

                    break ;

                case "MERCURY" :
                    orbit = mercury_elements 

                    break;

                case "VENUS" :
                    orbit = venus_elements 

                    break;

                case "MARS" :
                    orbit = mars_elements 

                    break;

                default:
                    break ;
                }
            
            const gei = (planet.toUpperCase () === 'SUN') ?  new THREE.Vector3 (
                            sunpos.x * sunpos.R * AU,
                            sunpos.y * sunpos.R * AU,
                            sunpos.z * sunpos.R * AU
                            )

                        : calc_planet_gei (j2000, orbit, sunpos, moon_flag)

            // convert to GSE 
            const gse = GEI_to_GSE (gei, sunpos)

            if  (planet.toUpperCase () === 'SUN')
                {
                //console.log (utc, JSON.stringify (gse))
                }

            if  (this.recalc)
                {
                this.j2000.push (j2000)
                this.sun_pos.push (sunpos)
                }

            this.add_orbit_pos (record, utc, gse)
          
            utc += PLANET_ORBIT_INTERVAL * 60 * 1000 ;   

            index++ 
            }
        
        this.recalc = false
        }
    
    reset ()
        {
        this.recalc = true 

        this.sun_pos.length = 0
        this.j2000.length = 0
        }

    calculate_orbit_data (planet, start_time, end_time)
        {

        const starttm = Date.now ()

        return new Promise ((resolve, reject) =>
            {
            try 
                {
                let orbit_data = {
                    time: [],
                    orbit: [],
                    }

                this.calculate_orbit (planet, orbit_data, start_time, end_time)

                console.log ('Planet orbit calculation took : ', (Date.now () - starttm) / 1000, 's')

                resolve (orbit_data)
                }

            catch (error)
                {
                reject(error)
                }
            }) ;
        } 
    }
*/

