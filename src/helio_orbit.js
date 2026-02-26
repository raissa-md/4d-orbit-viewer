//import { MSEC_PER_YEAR } from './Orbit.js'
import { mltply } from './Orbit.js'
import { DEG2RD } from './Orbit.js'
import { add_vectors } from './Orbit.js'
import { create_rotation_matrix } from './Orbit.js'
import { transpose } from './Orbit.js'
import { MJD } from './Orbit.js'
import { RD90 } from './Orbit.js'
import { RD180 } from './Orbit.js'
import { RD270 } from './Orbit.js'
import { PI2 } from './Orbit.js'
import { AU } from './Orbit.js'


class Helio
    {
    // All coordinate conversion methods in this class are based on the paper 
    // "Space physics coordinate transformations: A user guide" 
    // by Mark Hapgood (1992).

    // Hapgood, M. A. (1992). Space physics coordinate transformations: A user guide. 
    // Planetary and Space Science, 40(5), 711-717. https://doi.org/10.1016/0032-0633(92)90012-D
    constructor ()
        {
        }

    GSE_to_HEE (gse, sun_pos)
        {
        // Should we return values in Re?  If so, we will need to multiply R by AU
        // Yes we do need to return values in Re.
        const d = [sun_pos.R * AU, 0, 0]

        let a = Array.from(Array(3), () => new Array(3)) 

        // Create matrix to rotate 180 degrees around the Z axis
        a [0] [0] = -1.  // cos (180)
        a [0] [1] = 0.0  // sin (180)
        a [0] [2] = 0.0

        a [1] [0] = 0.0  // -sin (180)
        a [1] [1] = -1.  // cos (180)
        a [1] [2] = 0.0

        a [2] [0] = 0.0
        a [2] [1] = 0.0
        a [2] [2] = 1.0

        return add_vectors (mltply (a, gse), d)
        }

    HEE_to_GSE (hee, sun_pos)
        {
        // The same function that is used to convert GSE to HEE can also
        // be used to convert HEE to GSE

        return this.GSE_to_HEE (hee, sun_pos)
        }

    HAE_to_HEE (hae, sun_pos)
        {
        // Solar longitude allong the ecliptic plus 180 degree (in radians).
        const α = sun_pos.λ * DEG2RD + Math.PI

        const R = create_rotation_matrix (α, 'Z') 

        return mltply (R, hae)
        }

    HEE_to_HAE (hae, sun_pos)
        {
        // Solar longitude allong the ecliptic plus 180 degree (in radians).
        const α = sun_pos.λ * DEG2RD + Math.PI

        // Here we use the transpose of the rotation matrix we created 
        // in HAE_to_HEE
        const R = transpose (create_rotation_matrix (α, 'Z')) 

        return mltply (R, hae)
        }

    HAE_to_HEEQ (hae, sun_pos, utc)
        {
        // Note all angles calculated in radians

        // Rotation in the plane of the ecliptic From the First Point
        // of Aries to the ascending node of the solar equator 
        const Ω = (73.6667 + 0.013958 * ((MJD (utc) + 3242) / 365.25)) * DEG2RD

        // Rotation from the plane of the ecliptic to the solar equator
        const i = 7.25 * DEG2RD

        // Angle between the solar longitude along the ecliptic and the ascending node
        // of the solar equator
        const Δ = sun_pos.λ - Ω
        
        // Rotation in the plane of the solar equator from the ascending 
        // node to the central meridian
        let θ = Math.atan (Math.cos (i) * Math.tan (Δ))

        // Need to adjust θ so that the quadrant of 0 is opposite that of Δ (sun_pos.λ - Ω)
        // We will use the angle Δ180 (Δ + 180 degrees) to determine the exact quadrant 
        // θ should be in.
        const Δ180 = Δ + Math.PI

        if  (Δ180 >= RD90 && Δ180 < RD180) 
            {
            // Quadrant II: Reflect across the y-axis
            θ = RD180 - θ
            } 

        if  (Δ180 >= RD180 && Δ180 < RD270) 
            {
            // Quadrant III: Add π to the angle
            θ =  RD180 + θ
            }

        if  (Δ180 >= RD270 && Δ180 < PI2) 
            {
            // Quadrant IV: If baseAngle is negative, add 2π to make it positive
            θ =(θ < 0) ? PI2 + θ : θ
            }

        const MΩ = create_rotation_matrix (Ω, 'Z')
        const Mi = create_rotation_matrix (i, 'X')
        const Mθ = create_rotation_matrix (θ, 'Z')
        
        return mltply (MΩ, mltply (Mi, mltply (Mθ, hae)))
        }

    HEEQ_to_HAE ()
        {

        }



    }



export default Helio
