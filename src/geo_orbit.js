import { MSEC_PER_YEAR } from './Orbit.js'
import { mult3x1 } from './Orbit.js'
import { mltply } from './Orbit.js'
import { UTC_to_YDH } from './Orbit.js'
import { DEG2RD } from './Orbit.js'

import dipole from './dipole.txt' 

import {xyz_2_ρϕλ} from './Orbit.js'


// JavaScript equivalent of parms.inc

// Constants for dipole angles - these might be replaced or supplemented
// by the values from dipole.inc and setdip.for, depending on your application
// const DILON = -71.2746 * DEG2RD;
// const DICLAT = 10.7868 * DEG2RD;
// const DILAT = HALFPI - DICLAT;

// Region identifiers
const NONE = 0;
const INTMED = 1;
const DMSH = 2;
const NMSH = 3;
const DMSPH = 4;
const NMSPH = 5;
const PSHEET = 6;
const LOBE = 7;
const HLBL = 8;
const LLBL = 9;
const DPSPH = 10;
const NPSPH = 11;

const NCUSP = 1;
const SCUSP = 2;
const NCLEFT = 3;
const SCLEFT = 4;
const NAOVAL = 5;
const SAOVAL = 6;
const NPCAP = 7;
const SPCAP = 8;
const NMIDLAT = 9;
const SMIDLAT = 10;
const LOWLAT = 11;

// Cosine and sine of 4 degrees for aberration angle
const COS4DG = 0.9975640502598243;
const SIN4DG = -0.069756473744125301;

// JavaScript equivalent of dipole.inc

// Class to replace the DIPOLE common block
class Dipole
    {
    constructor ()
        {         
        this.DCCLT = 0     // Double precision in Fortran, using Number in JavaScript
        this.DSCLT =  0    // Double precision in Fortran, using Number in JavaScript
        this.DCLON =  0    // Double precision in Fortran, using Number in JavaScript
        this.DSLON =  0    // Double precision in Fortran, using Number in JavaScript
        this.YCOLAT = 0    // Double precision in Fortran, using Number in JavaScript
        this.YLON =  0     // Double precision in Fortran, using Number in JavaScript
        this.IDIPYR = 0    // Integer in Fortran, using Number in JavaScript (as JS does not have integer type)

        this.MINYR = 1965  // Minimum Year of Dipole Availability 
        this.MAXYR = 2020  // Minimum Year of Dipole Availability

        this.dipclt = []   // Table of Colatitudes.  Should have entry for every five years of coverage
        this.diplon = []   // Table of Longitudes.  Should have entry for every five years of coverage        
        
        this.initialize_tables ()
        this.dpload ()
        }
    
    set_dipole_paremeters (year, colat, lon) 
        {
        // Method to set dipole properties.
        // Assume colat and lon are retrieved before calling this method

        console.log ("setting dipole parameters ", year, colat, lon)

        this.YCOLAT = colat
        this.YLON = lon
        this.DCCLT = Math.cos (colat)
        this.DSCLT = Math.sin (colat)
        this.DCLON = Math.cos (lon)
        this.DSLON = Math.sin (lon)
        this.IDIPYR = year
        }

    initialize_tables ()
        {
        // Initialize the table of Colititudes and Longitudes.  These values will be use in
        // case the file 'dipole.txt' can not be found or read.

        // It is assumed that the values from 'dipole.txt' are more accurate.
                        
        // **********************************************************************
        //   Following is a table containing the angles with the corresponding
        //   year.
        //        YYYY      Colatitude        Longitude
        //        1965        11.435           -69.761
        //        1970        11.41            -70.2
        //        1975        11.398           -70.454
        //        1980        11.200           -70.756
        //        1985        11.018           -70.905
        //        1990        10.872           -71.115
        //        1995        10.730           -71.381
        //   for the following: 1970 uses linear interpolation,
        //   2000 and 2005 use linear  extrapolation
        // ***********************************************
        //  RCJ 08/06/2003 The numbers above are old. Here's a new list provided
        //                 by Sardi and Ryan Boller(from another code).
        //                 The min colat is also used in func diplat (in this prog) 
        //        YYYY      Colatitude        Longitude
        //        1965         11.465          -69.854
        //        1970         11.409          -70.177
        //        1975         11.313          -70.470
        //        1980         11.194          -70.759
        //        1985         11.026          -70.896
        //        1990         10.862          -71.127
        //        1995         10.704          -71.407
        //        2000         10.458          -71.572
        //        2005         10.251          -71.735
    
        // RCJ 04/07/2011  List as in dipole.txt (some values are slightly different from above) :
        // 	1965 11.465 -69.854
        // 	1970 11.409 -70.177
        // 	1975 11.313 -70.470
        // 	1980 11.194 -70.759
        // 	1985 11.026 -70.896
        // 	1990 10.862 -71.127
        // 	1995 10.677 -71.416
        // 	2000 10.457 -71.570
        // 	2005 10.252 -71.805
        // 	2010 09.984 -72.211
        // 	2015 09.688 -72.625 
    
        // Note:  This now uses the DIPOLE object to replace the COMMON block from the orginal
        // FORTRAN code.
    
        const C65 = 11.465 * DEG2RD
        const L65 = -69.854 * DEG2RD
        const C70 = 11.409 * DEG2RD
        const L70 = -70.177 * DEG2RD
        const C75 = 11.313 * DEG2RD
        const L75 = -70.470 * DEG2RD
        const C80 = 11.194 * DEG2RD
        const L80 = -70.759 * DEG2RD
        const C85 = 11.026 * DEG2RD
        const L85 = -70.896 * DEG2RD
        const C90 = 10.862 * DEG2RD
        const L90 = -71.127 * DEG2RD
        const C95 = 10.677 * DEG2RD
        const L95 = -71.416 * DEG2RD
        const C00 = 10.457 * DEG2RD
        const L00 = -71.570 * DEG2RD
        const C05 = 10.252 * DEG2RD
        const L05 = -71.805 * DEG2RD
        const C10 = 9.984 * DEG2RD
        const L10 = -72.211 * DEG2RD
        const C15 = 9.687 * DEG2RD
        const L15 = -72.613 * DEG2RD
        const C20 = 9.411 * DEG2RD
        const L20 = -72.680 * DEG2RD
    
        this.dipclt = [C65, C70, C75, C80, C85, C90, C95, C00, C05, C10, C15, C20]
        this.diplon = [L65, L70, L75, L80, L85, L90, L95, L00, L05, L10, L15, L20]
        }

    dpload ()
        {
        const MINLON = -73.0
        const MAXLON = -67.0
        const MINCLT = 9.0
        const MAXCLT = 12.0

        console.log ('started dpload')
            
        fetch (dipole)
            .then(r => r.text())
            .then(text => {
                const lines = text.split ("\n") 

                const regex = /(\d{4})\s+([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)/
    
                const temp_dipclt = []
                const temp_diplon = []
    
                for (let i = 0 ; i < lines.length ; i++)
                    {
                    // Check if the line begins with an exclamation point.
                    if  (lines [i].substring (0,1) === '!')
                        {
                        continue 
                        }

                    // Check for blank lines (or lines with only spaces)
                    if  (lines [i].replace(/\s/g, '').length === 0)
                        {
                        continue
                        }

                    // Read the data from the line.
                    const match = lines [i].match(regex)
                    let year, colat, lon

                    if (match) 
                        {
                        year = parseInt (match[1], 10)
                        colat = parseFloat (match[2])
                        lon = parseFloat (match[3])
                        }
                
                    // Check if the year is OK
                    if  (year % 5 !== 0 || year < this.MINYR || year > this.MAXYR)
                        {
                        continue
                        }

                    // Check the colat 
                    if  (colat < MINCLT || colat > MAXCLT)
                        {
                        continue
                        }

                    // Check the lon
                    if  (lon < MINLON || lon > MAXLON)
                        {
                        continue
                        }

                    // Convert degrees to radians
                    colat = colat * DEG2RD
                    lon = lon * DEG2RD
                
                    // Store the values
                    temp_dipclt.push (colat)
                    temp_diplon.push (lon)
                    }         
                    
                // Check that we got a reasonable set of values
                if  (temp_dipclt.length !== temp_diplon.length || temp_diplon.length === 0)
                    {
                    return
                    }

                // Everything looks OK.  Stash the values.
                this.dipclt.length = 0
                this.diplon.length = 0

                this.dipclt = temp_dipclt
                this.diplon = temp_diplon
                console.log ('loaded dipole')
                });
        }

    set_dipole (iyr)
        {
        //     Parameter: integer iyr - year for interpolating the dipole
        //         if the day of year is >= 183, it is recommended that
        //         the year be rounded up before calling setdip
        //        
        //     Purpose:   update the COMMON area containing the year,
        //           sine/cosine of the colatitude/longitude of the dipole
        //           angle.  The colatitude and longitude are interpolated 
        //           using two appropriate values in a table defined below.
    
        //           This configuration assumes that the dipole angle is
        //           always obtained at the beginning of a year which is a 
        //           multiple of 5.
    
        //   IY   - year (IYR) minus the minimum year
        //   IYLO - year rounded down to a multiple of 5
        //   ILO  - subscript to the item in the arrays corresponding
        //          to the year rounded down to a multiple of 5.
        //   IHI  - ILO + 1 -- used as a subscript
        //   DIFF - number to multiply by the difference of the two
        //          numbers subscripted by IHI and ILO, i.e. (IY - IYLO) * 0.2

        // This routine was split from the original SETDIP.FOR module.  This now 
        // retrieves year appropriate value from the table of Colatitudes and Longitudes
        // that is part of the Dipole class.   

        if  (iyr === this.IDIPYR)
            {
            return
            }
    
        let ycolat, ylon, iy, ilo, iylo
    
        if  (iyr < this.MINYR)
            {
            ycolat = this.dipclt [0]
            ylon = this.diplon [0]
            }
    
        else if  (iyr > this.MAXYR)
            {
            ycolat = this.dipclt [this.dipclt.length - 1]
            ylon = this.diplon [this.diplon.length - 1]
            }
    
        else
            {
            iy = iyr - this.MINYR
            ilo = (iy / 5)
            iylo = ilo * 5
            ilo = ilo + 1
    
            if  (iylo === iy) 
                {
                ycolat = this.dipclt [ilo]
                ylon   = this.diplon [ilo]
                }
    
            else
                {
                const ihi = ilo + 1
                const diff = (iy - iylo) * 0.2
                
                ycolat = this.dipclt [ilo] + ( diff * (this.dipclt [ihi] - this.dipclt [ilo]) )
                ylon   =this.diplon [ilo] + ( diff * (this.diplon [ihi] - this.diplon [ilo]) )
                }
            }
    
        this.set_dipole_paremeters (iyr, ycolat, ylon)
        }

    iyr_from_UTC (utc)
        {
        // Extract the iyr (year rounded up if in the latter half of the year) from
        // the UTC (milleseconds since January 1, 1970)

        // Allowing calling functions with no time value so current time is used.
        const tm = utc === undefined? new Date () : new Date (utc)

        // Get the day of the year
        // Jan 0 is Dec 31 of the previous year, effectively giving us Dec 31 midnight
        const start_off_year = new Date (Date.UTC (tm.getUTCFullYear (), 0, 0))

        // Difference in milliseconds
        const diff = tm - start_off_year 

        // Check if we are in the later half of the year.  Return the year rounded up.
        if  (diff / MSEC_PER_YEAR > .5)
            {
            return tm.getUTCFullYear () + 1
            }
        
        // Otherwise, just return the year.
        return tm.getUTCFullYear ()       
        }
    
    // Wrapper for the set_dipole method.  This uses the same name from the original
    // FORTRAN code.  In addition, it takes the time as UTC and converts it to iyr.
    setdip (utc)
        {
        this.set_dipole (this.iyr_from_UTC (utc))
        }
    }

// Class to encapsulate Latitude/Longitude
export class Lat_Lon 
    {
    constructor (lat = 0., lon = 0.)
        {
        this._lat = this.set_lat (lat)
        this._lon = this.set_lon (lon)
        }

   // Helper function to convert DMS to decimal
   DMS_to_decimal (degrees, minutes, seconds) 
        {
        return degrees + minutes / 60 + seconds / 3600
        }

    // Helper function to validate latitude
    is_valid_latitude (lat) 
        {
        return lat >= -90 && lat <= 90
        }

    // Helper function to validate longitude
    is_valid_longitude (lon) 
        {
        return lon >= -180 && lon <= 180
        }

    // Set latitude in decimal
    set_lat (lat)
        {
        if  (this.is_valid_latitude (lat)) 
            {
            this._lat = lat
            } 

        else 
            {
            throw new Error ('Invalid latitude. Must be between -90 and 90.');
            }
        }

    // Set longitude decimal
    set_lon (lon)
        {
        if  (this.is_valid_longitude (lon))
            {
            this._lon = lon
            } 

        else 
            {
            throw new Error ('Invalid longitude. Must be between -180 and 180.');
            }
        }

    // Set latitude with DMS
    set_lat_DMS (degrees, minutes, seconds) 
        {
        const lat = this.DMS_to_decimal (degrees, minutes, seconds) 

        this.set_lat (lat)
        }

    // Set longitude with DMS
    set_lon_DMS (degrees, minutes, seconds) 
        {
        const lon = this.DMS_to_decimal (degrees, minutes, seconds) 

        this.set_lon (lon)
        }
  
    get lat ()
        {
        return this._lat
        }

    get lon ()
        {
        return this._lon
        }
    } 

function juldat (y, m, d) 
    {
    // - converts Julian Date from the year, month, and day

    const jd = Math.floor (367 * y - 7 * (y + Math.floor ((m + 9) / 12)) / 4 
              - 3 * Math.floor ((y + Math.floor ((m - 9) / 7)) / 100 + 1) / 4 
              + 275 * m / 9 + d + 1721029)
    return jd
    }

export function cepoch (year, month, day, hour, minute, second, msec) 
    {
    let epoch

    epoch = juldat (year, month, day) - 1721060
    epoch = epoch * 24 + hour
    epoch = epoch * 60 + minute
    epoch = epoch * 60 + second
    epoch = epoch * 1000 + msec

    return epoch
    }

export function ebreak (epoch) 
    {
    // Computes year, month, day..... from "epoch time"

    const msecAD = epoch + .4999
    const secAD = msecAD / 1000.
    const minAD = secAD / 60.
    const hrAD = minAD / 60.
    const dayAD = hrAD / 24.

    const jd = 1721060 + dayAD
    
    let i, j, k, l, n

    l = jd + 68569
    n = 4 * l /146097
    l = l - (146097 * n + 3) / 4
    i = 4000 * (l + 1) / 1461001

    l = l - 1461 * i / 4 + 31
    j = 80 * l / 2447
    k = l - 2447 * j / 80
    l = j / 11
    j = j + 2 - 12 * l

    i = 100 * (n - 49) + i + l

    const day = k
    const year = i

    const MODHR = hrAD % 24
    const MODMIN = minAD % 60
    const MODSC = secAD % 60
    const MODMSC = msecAD % 1000
    const month = j
    const hour = Math.floor (MODHR)
    const minute = Math.floor (MODMIN)
    const second = Math.floor (MODSC)
    const msec = Math.floor (MODMSC)

    return { year, month, day, hour, minute, second, msec };
    }

export function Lat_Lon_to_XYZ (r, lat, lon)
    {
    const x = r * Math.cos (lat) * Math.cos (lon)
    const y = r * Math.cos (lat) * Math.sin (lon)
    const z = r * Math.sin (lat)
 
    return [x, y, z]
    }

class Geo
    {
    constructor ()
        {
        this.DIPOLE = new Dipole ()

        this.GEI_to_GSM = this.GEI_to_GSM.bind (this)
        this.GEI_to_SM = this.GEI_to_SM.bind (this)
        this.GEO_to_MAG = this.GEO_to_MAG.bind (this)
        this.GSM_to_GEI = this.GSM_to_GEI.bind (this)
        this.MAG_to_GEO = this.MAG_to_GEO.bind (this)
        this.SM_to_GEI = this.SM_to_GEI.bind (this)
        }

    GEI2000_to_GEI (gei2000, time) 
        {
        //   INPUT:
        //      GEI2000  = X,Y,Z gei2000 elements 
        //      IYEAR
        //      IDAY  
        //   OUTPUT
        //      GEI  = X,Y,Z GEOCENTRIC EQUATORIAL INERTIAL
        // CONVERTS GEI2000 X,Y,Z COORDS TO GEI X,Y,Z COORDS.

        const { year, day, hrs } = UTC_to_YDH (time)
            
        const julday = juldat (year, 1, day)
        const fjul = julday + hrs / 24.0
        const cent = (fjul - 2451545.0) / 36525.0
        const rad = 57.29578
        const zeta = (0.6406161 * cent + 0.838556e-4 * cent**2) / rad
        const thet = (0.5567531 * cent - 0.11851e-4 * cent**2) / rad
        const epsi = (0.6406161 * cent + 0.304078e-4 * cent**2) / rad

        let a = Array.from(Array(3), () => new Array(3)) 

        a [0] [0] = -Math.sin (zeta) * Math.sin (epsi) + Math.cos (zeta) * Math.cos (epsi) * Math.cos (thet) 
        a [0] [1] = -Math.cos (zeta) * Math.sin (epsi) - Math.sin (zeta) * Math.cos (epsi) * Math.cos (thet)
        a [0] [2] = -Math.cos (epsi) * Math.sin (thet)

        a [1] [0] = Math.sin (zeta) * Math.cos (epsi) + Math.cos (zeta) * Math.sin (epsi) * Math.cos (thet);
        a [1] [1] = Math.cos (zeta) * Math.cos (epsi) - Math.sin (zeta) * Math.sin (epsi) * Math.cos (thet);
        a [1] [2] = -Math.sin (epsi) * Math.sin (thet)

        a [2] [0] = Math.cos (zeta) * Math.sin (thet)
        a [2] [1] = -Math.sin (zeta) * Math.sin (thet)
        a [2] [2] = Math.cos (thet)

        return mltply (a, gei2000)
        }

    GEI_to_GEI2000 (gei, time)
        {
        //   INPUT:
        //      GEI  = X,Y,Z gei2000 elements 
        //      IYEAR
        //      IDAY  
        //   OUTPUT
        //      GEI2000  = X,Y,Z GEOCENTRIC EQUATORIAL INERTIAL
        // CONVERTS GEI2000 X,Y,Z COORDS TO GEI X,Y,Z COORDS.

        const { year, day, hrs } = UTC_to_YDH (time)

        const julday  =juldat (year, 1, day)
        const fjul = julday + hrs / 24.0
        const cent = (fjul - 2451545.0) / 36525.0
        const rad  = 57.29578
        const zeta = (0.6406161 * cent + .0000838556 * cent**2) / rad
        const thet = (0.5567531 * cent - .000011851 * cent**2) / rad
        const epsi = (0.6406161 * cent + .0000304078 * cent**2) / rad

        let a = Array.from(Array(3), () => new Array(3)) 

        a [0] [0] = -Math.sin (zeta) * Math.sin (epsi) + Math.cos (zeta) * Math.cos (epsi) * Math.cos (thet)
        a [1] [0] = -Math.cos (zeta) * Math.sin (epsi) - Math.sin (zeta) * Math.cos (epsi) * Math.cos (thet)
        a [2] [0] = -Math.cos (epsi) * Math.sin (thet)

        a [0] [1] = Math.sin (zeta) * Math.cos (epsi) + Math.cos (zeta) * Math.sin (epsi) * Math.cos (thet)
        a [1] [1] = Math.cos (zeta) * Math.cos (epsi) - Math.sin (zeta) * Math.sin (epsi) * Math.cos (thet)
        a [2] [1] = -Math.sin (epsi) * Math.sin (thet)

        a [0] [2] = Math.cos (zeta) * Math.sin (thet)
        a [1] [2] = -Math.sin (zeta) * Math.sin (thet)
        a [2] [2] = Math.cos (thet)

        return mltply (a, gei)
        }

    GEI_to_GEO (gei, gmst)

        {
        //    CONVERT GEI X,Y,Z COORDS TO GEO X,Y,Z COORDS.
        //    INPUT:
        //       GEI  = X,Y,Z GEOCENTRIC EQUATORIAL INERTIAL
        //       GMST = GREENWICH MEAN SIDEREAL TIME (DEGS) <- nope, this is in rad  (RCJ 10/2010)
        //              (ANGLE BETWEEN GREENWICH AND GEI X AXIS.)
        //    OUTPUT:
        //       GEO  = X,Y,Z GEOGRAPHIC COORDS.
            
        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] = Math.cos (gmst)
        a [0] [1] = 0.0
        a [0] [2] = 0.0

        a [1] [0] = -Math.sin (gmst)
        a [1] [1] = 0.0
        a [1] [2] = 0.0

        a [2] [0] = 0.0
        a [2] [1] = 0.0
        a [2] [2] = 1.0

        a [1] [1] = a [0] [0]
        a [0] [1] = -a [1] [0]

        return mltply (a, gei)
        }

    GEI_to_GSM (gei, sunpos, gmst, time)

        {
        //   INPUT:
        //      GEI  = X,Y,Z GEOCINTRIC EQUATORIAL INERTIAL
        //      S    = X,Y,Z UNIT VECTOR OF SUN IN GEI COORDS
        //      GMST = GREENWICH MEAN SIDEREAL TIME (DEGS)
        //      IYR  = YEAR, ROUNDED UP IF AFTER FIRST HALF OF THE YEAR
        //   OUTPUT:
        //      GSM  = X,Y,Z GEOCENTRIC SOLAR MAGNETOSPHERIC
        // CONVERT GEI X,Y,Z COORDS TO GSM X,Y,Z COORDS

        // Defintion of the sunpos structure:
        //    seps : SEPS (sine of the angle of obliquity)
        //    ceps : CEPS (cosine fo the angle of obliquity)
        //    sdec : Solar apparent declination
        //    srasn : Solar apparent right ascension
        //    L : Mean longitude of the Sun
        //    M : Mean Anomaly of the Sun 
        //    λ : Solar longitude along the ecliptic
        //    R : Distance from the Earth to the Sun in AU
        //    ε : Obliquity of the Ecliptic (in Radians)
        //    x : X component of the unit vector of the Sun in GEI coordinates
        //    y : Y component of the unit vector of the Sun in GEI coordinates
        //    z : Z component of the unit vector of the Sun in GEI coordinates
        //    Xe: X-coordinate of the Sun in the ecliptic plane, where the x-axis 
        //         aligns with the direction of the vernal equinox.
        //    Ye: Y-coordinate of the Sun in the ecliptic plane, perpendicular 
        //         to the x-axis and in the plane of the Earth's orbit.

        // Note: GMST needs to be in radians, not degrees.

        const dgeo = []

        this.DIPOLE.setdip (time)

        

        dgeo [0] = this.DIPOLE.DCLON * this.DIPOLE.DSCLT
        dgeo [1] = this.DIPOLE.DSLON * this.DIPOLE.DSCLT
        dgeo [2] = this.DIPOLE.DCCLT

        const dgei = this.GEO_to_GEI (dgeo, gmst)

        let y1 = dgei [1] * sunpos.z - dgei [2] * sunpos.y
        let y2 = dgei [2] * sunpos.x - dgei [0] * sunpos.z
        let y3 = dgei [0] * sunpos.y - dgei [1] * sunpos.x

        const den = Math.sqrt (y1*y1 + y2*y2 + y3*y3)

        y1 = y1 / den
        y2 = y2 / den
        y3 = y3 / den

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] = sunpos.x
        a [0] [1] = sunpos.y
        a [0] [2] = sunpos.z

        a [1] [0] = y1
        a [1] [1] = y2
        a [1] [2] = y3

        a [2] [0] = (sunpos.y * y3 - sunpos.z * y2)
        a [2] [1] = (sunpos.z * y1 - sunpos.x * y3)
        a [2] [2] = (sunpos.x * y2 - sunpos.y * y1)

        return mltply (a, gei)
        }

    GEI_to_SM (gei, sunpos, gmst, time)
        {
        //    INPUT:
        //       GEI  = X,Y,Z GEOCINTRIC EQUATORIAL INERTIAL
        //       S    = X,Y,Z UNIT VECTOR OF SUN IN GEI COORDS.
        //       GMST = GREENWICH MEAN SIDEREAL TIME (RADIANS)
        //              (ANGLE BETWEEN GREENWICH AND GEI X AXIS.)
        //       IYR  = YEAR, ROUNDED UP IF AFTER FIRST HALF OF THE YEAR
        //    OUTPUT:
        //       SM   = X,Y,Z SOLAR MAGNETIC
        //  CONVERTS GEI X,Y,Z COORDS. TO SM X,Y,Z COORDS.

        // Defintion of the sunpos structure:
        //    seps : SEPS (sine of the angle of obliquity)
        //    ceps : CEPS (cosine fo the angle of obliquity)
        //    sdec : Solar apparent declination
        //    srasn : Solar apparent right ascension
        //    L : Mean longitude of the Sun
        //    M : Mean Anomaly of the Sun 
        //    λ : Solar longitude along the ecliptic
        //    R : Distance from the Earth to the Sun in AU
        //    ε : Obliquity of the Ecliptic (in Radians)
        //    x : X component of the unit vector of the Sun in GEI coordinates
        //    y : Y component of the unit vector of the Sun in GEI coordinates
        //    z : Z component of the unit vector of the Sun in GEI coordinates
        //    Xe: X-coordinate of the Sun in the ecliptic plane, where the x-axis 
        //         aligns with the direction of the vernal equinox.
        //    Ye: Y-coordinate of the Sun in the ecliptic plane, perpendicular 
        //         to the x-axis and in the plane of the Earth's orbit.


        const dgeo = []

        this.DIPOLE.setdip (time)

        dgeo [0] = this.DIPOLE.DCLON * this.DIPOLE.DSCLT
        dgeo [1] = this.DIPOLE.DSLON * this.DIPOLE.DSCLT
        dgeo [2] = this.DIPOLE.DCCLT

        // console.log (dgeo)

        const dgei = this.GEO_to_GEI (dgeo, gmst)

        let y1 = dgei [1] * sunpos.z - dgei [2] * sunpos.y
        let y2 = dgei [2] * sunpos.x - dgei [0] * sunpos.z
        let y3 = dgei [0] * sunpos.y - dgei [1] * sunpos.x

        const den = Math.sqrt (y1*y1 + y2*y2 + y3*y3)

        y1 = y1 / den
        y2 = y2 / den
        y3 = y3 / den

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] = (y2 * dgei [2] - y3 * dgei [1])
        a [0] [1] = (y3 * dgei [0] - y1 * dgei [2])
        a [0] [2] = (y1 * dgei [1] - y2 * dgei [0])

        a [1] [0] = y1
        a [1] [1] = y2
        a [1] [2] = y3

        a [2] [0] = dgei [0]
        a [2] [1] = dgei [1]
        a [2] [2] = dgei [2]

        return mltply (a, gei)
        }

    GEI_to_GSE (gei, sun_pos)
        {
        //    Converts GEI x,y,z coords. to GSE x,y,z coords.

        //    Input:

        //       gei  = x,y,z geocentric equatorial inertial
        //       sun_pos  

        //       S    = X,Y,Z UNIT VECTOR OR SUN IN GEI COORDS.
        //       SEPS = SIN OF EARTH'S OBLIQUENESS
        //       CEPS = COS OF EARTH'S OBLIQUENESS

        //    OUTPUT:
        //       returns a vector of X,Y,Z in Geocentric Solar Ecliptic coordinates.

        let transform = Array.from(Array(3), () => new Array(3)) ;

        transform [0] [0] = sun_pos.x ;
        transform [0] [1] = sun_pos.y ;
        transform [0] [2] = sun_pos.z ;

        transform [1] [0] = -sun_pos.seps * sun_pos.z - sun_pos.ceps * sun_pos.y ;
        transform [1] [1] = sun_pos.ceps * sun_pos.x ;
        transform [1] [2] = sun_pos.seps * sun_pos.x ;

        transform [2] [0] = 0. ;
        transform [2] [1] = -sun_pos.seps ;
        transform [2] [2] = sun_pos.ceps ;

        return mult3x1 (transform, gei) ;
        }



    GEO_to_GEI (geo, gmst)
        {
        //    INPUT:
        //       GEO  = X,Y,Z GEOGRAPHIC COORDS.
        //       GMST = GREENWICH MEAN SIDEREAL TIME (DEGS)
        //              (ANGLE BETWEEN GREENWICH AND GEI X AXIS.)
        //    OUTPUT
        //       GEI  = X,Y,Z GEOCENTRIC EQUATORIAL INERTIAL
        //    CONVERTS GEO X,Y,Z COORDS TO GEI X,Y,Z COORDS.

        // Converted to use GMST in radians to be consistent with other coordinate
        // conversion routines.

        let a = Array.from(Array(3), () => new Array(3)) 

        a [0] [0] = Math.cos (gmst)
        a [0] [1] = 0.0
        a [0] [2] = 0.0

        a [1] [0] = Math.sin (gmst)
        a [1] [1] = 0.0
        a [1] [2] = 0.0

        a [2] [0] = 0.0
        a [2] [1] = 0.0
        a [2] [2] = 1.0

        a [1] [1] = a [0] [0]
        a [0] [1] = -a [1] [0]

        return mltply (a, geo)
        }


    GEO_to_MAG (geo, time)
        {
        //    INPUT:
        //       GEO  = X,Y,Z GEOGRAPHIC COORDS.
        //       IYR  = YEAR, ROUNDED UP IF AFTER FIRST HALF OF THE YEAR
        //    OUTPUT:
        //       MAG  = X,Y,Z MAGNETIC DIPOLE COORDS.
        //  CONVERT GEOGRAPHIC X,Y,Z COORDS TO MAGNETIC X,Y,Z COORDS.

        this.DIPOLE.setdip (time)

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] =  this.DIPOLE.DCCLT * this.DIPOLE.DCLON
        a [0] [1] =  this.DIPOLE.DCCLT * this.DIPOLE.DSLON
        a [0] [2] = -this.DIPOLE.DSCLT

        a [1] [0] = -this.DIPOLE.DSLON
        a [1] [1] =  this.DIPOLE.DCLON
        a [1] [2] = 0.

        a [2] [0] =  this.DIPOLE.DCLON * this.DIPOLE.DSCLT
        a [2] [1] =  this.DIPOLE.DSCLT * this.DIPOLE.DSLON
        a [2] [2] =  this.DIPOLE.DCCLT

        return mltply (a, geo)
        }

    GSE_to_GEI (gse, sunpos)
        {
        //    CONVERTS GSE X,Y,Z COORDS. TO GEI X,Y,Z COORDS.
        //    INPUT:
        //       GSE  = X,Y,Z GEOCENTRIC SOLAR ECLIPTIC
        //       S    = X,Y,Z UNIT VECTOR OR SUN IN GEI COORDS.
        //       SEPS = SIN OF EARTH'S OBLIQUENESS
        //       CEPS = COS OF EARTH'S OBLIQUENESS
        //    OUTPUT:
        //       GEI  = X,Y,Z GEOCENTRIC EQUATORIAL INERTIAL

        // Defintion of the sunpos structure:
        //    seps : SEPS (sine of the angle of obliquity)
        //    ceps : CEPS (cosine fo the angle of obliquity)
        //    sdec : Solar apparent declination
        //    srasn : Solar apparent right ascension
        //    L : Mean longitude of the Sun
        //    M : Mean Anomaly of the Sun 
        //    λ : Solar longitude along the ecliptic
        //    R : Distance from the Earth to the Sun in AU
        //    ε : Obliquity of the Ecliptic (in Radians)
        //    x : X component of the unit vector of the Sun in GEI coordinates
        //    y : Y component of the unit vector of the Sun in GEI coordinates
        //    z : Z component of the unit vector of the Sun in GEI coordinates
        //    Xe: X-coordinate of the Sun in the ecliptic plane, where the x-axis 
        //         aligns with the direction of the vernal equinox.
        //    Ye: Y-coordinate of the Sun in the ecliptic plane, perpendicular 
        //         to the x-axis and in the plane of the Earth's orbit.

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] =  sunpos.x
        a [0] [1] =  -sunpos.seps * sunpos.z - sunpos.ceps * sunpos.y
        a [0] [2] =  0.

        a [1] [0] =  sunpos.y
        a [1] [1] =  sunpos.ceps * sunpos.x
        a [1] [2] =  -sunpos.seps

        a [2] [0] =  sunpos.z
        a [2] [1] =  sunpos.seps * sunpos.x
        a [2] [2] =  sunpos.ceps

        return mltply (a, gse) 
        //return mltply (a, [100., 100., 100.]) 
        }

    GSM_to_GEI (gsm, sunpos, gmst, time)
        {
        //    INPUT:
        //       GSM  = X,Y,Z GEOCENTRIC SOLAR MAGNETOSPHERIC
        //       S    = X,Y,Z UNIT VECTOR OF SUN IN GEI COORDS
        //       GMST = GREENWICH MEAN SIDEREAL TIME (DEGS)
        //       IYR  = YEAR, ROUNDED UP IF AFTER FIRST HALF OF THE YEAR
        //    OUTPUT:
        //       GEI  = X,Y,Z GEOCINTRIC EQUATORIAL INERTIAL
        //  CONVERT GSM X,Y,Z COORDS TO GEI X,Y,Z COORDS

        // Defintion of the sunpos structure:
        //    seps : SEPS (sine of the angle of obliquity)
        //    ceps : CEPS (cosine fo the angle of obliquity)
        //    sdec : Solar apparent declination
        //    srasn : Solar apparent right ascension
        //    L : Mean longitude of the Sun
        //    M : Mean Anomaly of the Sun 
        //    λ : Solar longitude along the ecliptic
        //    R : Distance from the Earth to the Sun in AU
        //    ε : Obliquity of the Ecliptic (in Radians)
        //    x : X component of the unit vector of the Sun in GEI coordinates
        //    y : Y component of the unit vector of the Sun in GEI coordinates
        //    z : Z component of the unit vector of the Sun in GEI coordinates
        //    Xe: X-coordinate of the Sun in the ecliptic plane, where the x-axis 
        //         aligns with the direction of the vernal equinox.
        //    Ye: Y-coordinate of the Sun in the ecliptic plane, perpendicular 
        //         to the x-axis and in the plane of the Earth's orbit.

        // NOTE: GMST needs to be in radians, not in degrees. 

        const dgeo = []

        this.DIPOLE.setdip (time)

        dgeo [0] = this.DIPOLE.DCLON * this.DIPOLE.DSCLT
        dgeo [1] = this.DIPOLE.DSLON * this.DIPOLE.DSCLT
        dgeo [2] = this.DIPOLE.DCCLT

        const dgei = this.GEO_to_GEI (dgeo, gmst)

        let y1 = dgei [1] * sunpos.z - dgei [2] * sunpos.y
        let y2 = dgei [2] * sunpos.x - dgei [0] * sunpos.z
        let y3 = dgei [0] * sunpos.y - dgei [1] * sunpos.x

        const den = Math.sqrt (y1*y1 + y2*y2 + y3*y3)

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] =  sunpos.x
        a [1] [0] =  sunpos.y
        a [2] [0] =  sunpos.z

        a [0] [1] =  y1 / den
        a [1] [1] =  y2 / den
        a [2] [1] =  y3 / den

        a [0] [2] =  (sunpos.y * y3 - sunpos.z * y2) / den
        a [1] [2] =  (sunpos.z * y1 - sunpos.x * y3) / den
        a [2] [2] =  (sunpos.x * y2 - sunpos.y * y1) / den

        return mltply (a, gsm)
        }

    MAG_to_GEO (mag, time)
        {
        //    MAGGEO - converts dipole to geographic coordinates (cartesian)

        this.DIPOLE.setdip (time)

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] =  this.DIPOLE.DCCLT * this.DIPOLE.DCLON
        a [1] [0] =  this.DIPOLE.DCCLT * this.DIPOLE.DCLON
        a [2] [0] =  -this.DIPOLE.DSCLT

        a [0] [1] =  -this.DIPOLE.DSLON
        a [1] [1] =  this.DIPOLE.DCLON
        a [2] [1] =  0.0

        a [0] [2] =  this.DIPOLE.DCLON * this.DIPOLE.DSCLT
        a [1] [2] =  this.DIPOLE.DSCLT * this.DIPOLE.DSLON
        a [2] [2] =  this.DIPOLE.DCCLT

        return mltply (a, mag)
        }

    SM_to_GEI (sm, sunpos, gmst, time)
        {
        //   INPUT:
        //      SM  = X,Y,Z  SOLAR MAGNETOSPHERIC
        //      S    = X,Y,Z UNIT VECTOR OF SUN IN GEI COORDS
        //      GMST = GREENWICH MEAN SIDEREAL TIME (DEGS)
        //      IYR  = YEAR, ROUNDED UP IF AFTER FIRST HALF OF THE YEAR
        //   OUTPUT:
        //      GEI  = X,Y,Z GEOCINTRIC EQUATORIAL INERTIAL
        // CONVERT GEI X,Y,Z COORDS TO SM X,Y,Z COORDS
            
        // Defintion of the sunpos structure:
        //    seps : SEPS (sine of the angle of obliquity)
        //    ceps : CEPS (cosine fo the angle of obliquity)
        //    sdec : Solar apparent declination
        //    srasn : Solar apparent right ascension
        //    L : Mean longitude of the Sun
        //    M : Mean Anomaly of the Sun 
        //    λ : Solar longitude along the ecliptic
        //    R : Distance from the Earth to the Sun in AU
        //    ε : Obliquity of the Ecliptic (in Radians)
        //    x : X component of the unit vector of the Sun in GEI coordinates
        //    y : Y component of the unit vector of the Sun in GEI coordinates
        //    z : Z component of the unit vector of the Sun in GEI coordinates
        //    Xe: X-coordinate of the Sun in the ecliptic plane, where the x-axis 
        //         aligns with the direction of the vernal equinox.
        //    Ye: Y-coordinate of the Sun in the ecliptic plane, perpendicular 
        //         to the x-axis and in the plane of the Earth's orbit.

        // NOTE: GMST needs to be in radians, not in degrees. 

        const dgeo = []

        this.DIPOLE.setdip (time)

        dgeo [0] = this.DIPOLE.DCLON * this.DIPOLE.DSCLT
        dgeo [1] = this.DIPOLE.DSLON * this.DIPOLE.DSCLT
        dgeo [2] = this.DIPOLE.DCCLT

        const dgei = this.GEO_to_GEI (dgeo, gmst)

        let y1 = dgei [1] * sunpos.z - dgei [2] * sunpos.y
        let y2 = dgei [2] * sunpos.x - dgei [0] * sunpos.z
        let y3 = dgei [0] * sunpos.y - dgei [1] * sunpos.x

        const den = Math.sqrt (y1*y1 + y2*y2 + y3*y3)

        y1 = y1 / den
        y2 = y2 / den
        y3 = y3 / den

        let a = Array.from (Array(3), () => new Array(3))

        a [0] [0] =  y2 * dgei [2] - y3 * dgei [1]
        a [1] [0] =  y3 * dgei [0] - y1 * dgei [2]
        a [2] [0] =  y1 * dgei [1] - y2 * dgei [0]

        a [0] [1] =  y1
        a [1] [1] =  y2
        a [2] [1] =  y3

        a [0] [2] =  dgei [0]
        a [1] [2] =  dgei [1]
        a [2] [2] =  dgei [2]

        return mltply (a, sm)
        }
    }

export default Geo
