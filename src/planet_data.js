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
import { DEF_STEP_SIZE } from './constants.js'
import { rotate_earth } from './Rotation'

export const PLANETS =
    [
        {
            id: "EARTH",
            name: "Earth",
            ssc_id: "",
            radii: 1.0,
            color: 'blue',
            diffuse: earth_diffuse,
            normal: earth_bump,
            specular: earth_spec,
            terminator: true,
            kindex: 1, 
            sscweb: false, 
            step_size: DEF_STEP_SIZE * 6, 
            dist: 6,
        },
        {
            id: "SUN",
            name: "Sun",
            ssc_id: "sun",
            radii: SOLAR_RADIUS / EARTH_RADIUS,
            color: 'gold',
            emit_light: .08,
            lc: 0xFFFFFF,
            diffuse: null,
            normal: null,
            specular: null,
            kindex: -1, 
            sscweb: true, 
            step_size: DEF_STEP_SIZE * 8, 
            dist: 300,
        },
        {
            id: "MOON",
            name: "Moon",
            ssc_id: "moon",
            radii: .272,
            color: 'ivory',
            diffuse: moon_diffuse,
            normal: null,
            specular: null,
            kindex: -1, 
            sscweb: true, 
            step_size: DEF_STEP_SIZE * 8, 
            dist: 2,
        },
        {
            id: "MERCURY",
            name: "Mercury",
            ssc_id: "mercury",
            radii: .382,
            color: 'ivory',
            diffuse: mercury_diffuse,
            normal: null,
            specular: null,
            kindex: 0, 
            sscweb: false, 
            step_size: DEF_STEP_SIZE * 5, 
            dist: 5,
        },
        {
            id: "VENUS",
            name: "Venus",
            ssc_id: "venus",
            radii: .94,
            color: 'yellow',
            diffuse: venus_diffuse,
            normal: null,
            specular: null,
            kindex: 1, 
            sscweb: false, 
            step_size: DEF_STEP_SIZE * 6, 
            dist: 6,
        },
        {
            id: "MARS",
            name: "Mars",
            ssc_id: "mars",
            radii: .53,
            color: 'red',
            diffuse: mars_diffuse,
            normal: null,
            specular: null,
            kindex: 3, 
            sscweb: false, 
            step_size: DEF_STEP_SIZE * 9, 
            dist: 5,
        },
        {
            id: "L1",
            name: "L1",
            ssc_id: "l1sat",
            radii: .1,
            color: 'white',
            diffuse: null,
            normal: null,
            specular: null,
            kindex: 3, 
            sscweb: false, 
            step_size: DEF_STEP_SIZE * 9, 
            dist: 5,
        },
    ] ;

    // Function to return the appropiate rotation function foa a Planet
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