import moon_diffuse from './images/moon_diffuse.jpg' 
import mercury_diffuse from './images/mercury_diffuse.jpg' 
//import sun_diffuse from './images/sun_diffuse.jpg' 
import venus_diffuse from './images/venus_diffuse.jpg' 
import mars_diffuse from './images/mars_diffuse.jpg' 
import earth_diffuse    from './images/earthmap1k.jpg' 
import earth_bump       from './images/earthbump1k.jpg' 
import earth_spec       from './images/earthspec1k.jpg' 

import { SOLAR_RADIUS } from './Orbit'
import { EARTH_RADIUS } from './Orbit'
import { rotate_earth } from './Rotation'
import { JD } from './Orbit'
import { J2000_Epoch } from './Orbit'

export const PLANETS =
    [
        {
            id: "EARTH",
            name: "Earth",
            ssc_id: "",
            origin: true, // Indicates that this is the reference origin (Earth)
            radii: 1.0,
            color: 'blue',
            diffuse: earth_diffuse,
            normal: earth_bump,
            specular: earth_spec,
            terminator: true,
            kindex: 1, 
            sscweb: false, 
            def_axis_len: 1,
            dist: 6,
        },
        {
            id: "SUN",
            name: "Sun",
            ssc_id: "sun",
            origin: false,
            radii: SOLAR_RADIUS / EARTH_RADIUS,
            color: 'gold',
            emit_light: .08,
            lc: 0xFFFFFF,
            diffuse: null,
            normal: null,
            specular: null,
            kindex: -1, 
            sscweb: true, 
            def_axis_len: 1,
            dist: 300,
        },
        {
            id: "MOON",
            name: "Moon",
            ssc_id: "moon",
            origin: false,
            radii: .272,
            color: 'ivory',
            diffuse: moon_diffuse,
            normal: null,
            specular: null,
            kindex: -1, 
            sscweb: true, 
            def_axis_len: 2,
            dist: 2,
        },
        {
            id: "MERCURY",
            name: "Mercury",
            ssc_id: "mercury",
            origin: false,
            radii: .382,
            color: 'ivory',
            diffuse: mercury_diffuse,
            normal: null,
            specular: null,
            kindex: 0, 
            sscweb: false, 
            def_axis_len: 9,
            dist: 5,
        },
        {
            id: "VENUS",
            name: "Venus",
            ssc_id: "venus",
            origin: false,
            radii: .94,
            color: 'yellow',
            diffuse: venus_diffuse,
            normal: null,
            specular: null,
            kindex: 1, 
            sscweb: false, 
            def_axis_len: 9,
            dist: 6,
        },
        {
            id: "MARS",
            name: "Mars",
            ssc_id: "mars",
            origin: false,
            radii: .53,
            color: 'red',
            diffuse: mars_diffuse,
            normal: null,
            specular: null,
            kindex: 3, 
            sscweb: false, 
            def_axis_len: 5,
            dist: 4,
        },
        {
            id: "L1",
            name: "L1",
            ssc_id: "l1sat",
            origin: false,
            radii: .1,
            color: 'white',
            diffuse: null,
            normal: null,
            specular: null,
            kindex: 3, 
            sscweb: false, 
            def_axis_len: 9,
            dist: 8,
        },
    ] ;

// This array contains the inclination (I) in degrees and its rate of change (d) in  degrees 
// per century for each major planet.  All values relative to J2000.0.
// Values taken from TABLE 1 of https://ssd.jpl.nasa.gov/planets/approx_pos.html
// Note: The inclination for Earth is given as 0.0 degrees, although this is not strictly accurate.
export const PLANET_INCLINATION = [
    {
        id: 'MERCURY',
        I: 7.00497902,
        d: -0.00594749
    },
    {
        id: 'VENUS',
        I: 3.39467605,
        d: -0.00078890
    },
    {
        id: 'EARTH',
        I: 0.0,
        d: 0.0
    },
    {
        id: 'MARS',
        I: 1.84969142,
        d: -0.00813131
    },
    {
        id: 'JUPITER',
        I: 1.30439695,
        d: -0.00183714
    },
    {
        id: 'SATURN',
        I: 2.48599187,
        d: 0.00193609
    },
    {
        id: 'URANUS',
        I: 0.77263783,
        d: -0.00242939
    },
    {
        id: 'NEPTUNE',
        I: 1.77004347,
        d: 0.00035372
    }
    ]

// This array contains the longitude of the ascending node (Ω) in degrees and its rate of 
// change (d) in degrees per century for each major planet.  All values relative to J2000.0.
// Values taken from TABLE 1 of https://ssd.jpl.nasa.gov/planets/approx_pos.html
export const PLANET_OMEGA = [
    {
        id: 'MERCURY',
        Omega: 48.33076593,
        d: -0.12534081
    },
    {
        id: 'VENUS',
        Omega: 76.67984255,
        d: -0.27769418
    },
    {
        id: 'EARTH',
        Omega: 0.0,
        d: 0.0
    },
    {
        id: 'MARS',
        Omega: 49.55953891,
        d: -0.29257343
    },
    {
        id: 'JUPITER',
        Omega: 100.47390909,
        d: 0.20469106
    },
    {
        id: 'SATURN',
        Omega: 113.66242448,
        d: -0.28867794
    },
    {
        id: 'URANUS',
        Omega: 74.01692503,
        d: 0.04240589
    },
    {
        id: 'NEPTUNE',
        Omega: 131.78422574,
        d: -0.00508664
    }
    ]

// These functions return the inclination and longitude of the ascending node in degrees.
export function get_planet_inclination (planet, time)
    {
    const entry = PLANET_INCLINATION.find (p => (p.id).toUpperCase () === planet.toUpperCase ())

    // bail out if the planet is not found.
    if  (! entry)
        {
        return null
        }

    // Convert time to Julian centuries since J2000.0
    const t = J2000_Epoch (JD (time)) 

    // Compute the inclination at the given time.
    const I = entry.I + entry.d * t

    return I 
    }

export function get_planet_omega (planet, time)
    {
    const entry = PLANET_OMEGA.find (p => (p.id).toUpperCase () === planet.toUpperCase ())

    // bail out if the planet is not found.
    if  (! entry)
        {
        return null
        }

    // Convert time to Julian centuries since J2000.0
    const t = J2000_Epoch (JD (time)) 

    // Compute the longitude of the ascending node at the given time.
    const Omega = entry.Omega + entry.d * t

    return Omega 
    }

/// Note for Monday's work:

/*
Mars' perpendicular vector from Earth's is:\(\vec{N}_{\text{Mars}}=\left[\begin{matrix}\sin (i)\cdot \sin (\Omega )\\ -\sin (i)\cdot \cos (\Omega )\\ \cos (i)\end{matrix}\right]\)
*/

// Function to return the appropriate rotation function for a Planet
// Currently, only Earth has a rotation function, but others may someday have them as well.
export function get_rotation_function (planet)
    {
    switch (planet.toUpperCase())
        {
        case "EARTH" :

            return rotate_earth 

        default :

            return null 
        }
    }