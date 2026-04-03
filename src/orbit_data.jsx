export class Orbit_Data_Store 
    {
    static DEFAULT_MAX_POINTS = 4000 
    static DEFAULT_MAX_FACTOR = 4

    constructor() 
        {
        /**
         * Stores orbit data by Entity ID.
         * Each entry contains:
         * time_vector: Array of timestamps (UTC milliseconds since epoch).
         * pos_vector:  Array of {x, y, z} objects, where x, y, z represent
         * object positions in GSE coordinates at the corresponding time.
         */
        this.registry = new Map ()
        }

    store_orbit_data (id, time, position_data) 
        {
        /**
         * Stores the independent time and position arrays for a body.
         * @param {string} id - The ID of the spacecraft or planet.
         * @param {Array} time - The array of timestamps.
         * @param {Array} position_data - The array of {x, y, z} objects.
         */ 
        // console.log ("Request to store orbit data for ", id, " with ", time.length, " time points.")

        this.registry.set (id, 
            {
            time_vector: time,
            pos_vector: position_data
            });
        }

    create_orbit_data (id, t0, t1, cadence)
        {
        /**
         * Generates pseudo-orbit data for the requested object between
         * times t0 and t1 at the specified cadence.  Pseudo-orbit is 
         * (0,0,0)
         * @param {string} id
         * @param {number} t0 - Start time (UTC milliseconds since epoch)
         * @param {number} t1 - End time (UTC milliseconds since epoch)
         * @param {number} cadence - Time step in milliseconds
         */
        const time_vector = []
        const pos_vector = []

        for (let t = t0; t <= t1; t += cadence)
            {
            time_vector.push (t)
            pos_vector.push ({ x: 0, y: 0, z: 0 })
            }

        this.store_orbit_data(id, time_vector, pos_vector)
        }

    orbit_data_valid (id) 
        {
        /**
         * Checks if orbit data exists for a specific entity ID.
         * @param {string} id 
         * @returns {boolean}
         */
        return this.registry.has (id)
        }

    get_orbit_vector (id) 
        {
        /**
        * Retrieves the full data object for a specific body.
        * @param {string} id 
        * @returns {Array|null} - Orbit position data in GSE coordinates or null if not found.
        */
        return (this.registry.get (id)).pos_vector || null
        }

    /* Old Version.
    // New version retrieves relative position data, which is more flexible.
    get_pos (id, index)
        {
        **
         * Retrieves the position at a specific index for a body.
         * Does not perform bounds checking on index.
         * @param {string} id 
         * @param {number} index 
         * @returns {Object|null} - Position {x, y, z} or null if not found.
         *
        const orbit = this.registry.get(id).pos_vector[index] || null

        return orbit
        }
    */  
   
    get_pos (id, index, center=null)
        {
        /**
         * Retrieves the position of id relative to center at a specific index.
         * Does not perform bounds checking on index.
         * @param {string} id 
         * @param {number} index 
         * @param {string|null} center - The ID of the center body. If null, uses the origin (0,0,0).
         * @returns {Object|null} - Relative position {x, y, z} or null if data is invalid.
         */
        
        // Start with the position of the target body at the specified index.
        const orbit = this.registry.get(id).pos_vector[index] || null

        // Check if center is specified and if data exists. If not, ignore the center.
        if  (center === null || ! this.orbit_data_valid (center))
            {
            return orbit
            }

        // Get the time at the specified index.  
        // This is needed to get the center position, which may require interpolation.
        const time_at_index = this.get_time (id, index)

        // Get the position of the center body at the same time.  This may require interpolation.
        const center_pos = this.get_orbit_pos (center, time_at_index, true)

        // Calculate and return the relative position
        return {
            x: orbit.x - center_pos.x,
            y: orbit.y - center_pos.y,
            z: orbit.z - center_pos.z
            }
        }

    get_length (id)
        {
        /**
         * Retrieves the length of the orbit data for a specific body.
         * @param {string} id 
         * @returns {number|null} - Length of orbit data or null if not found.
         */
        const length = this.registry.get(id).time_vector.length || null

        return length
        }

    get_time (id, index)
        {
        /**
         * Retrieves the time at a specific index for a body.
         * Does not perform bounds checking on index.
         * @param {string} id 
         * @param {number} index 
         * @returns {number|null} - Time (UTC milliseconds since epoch) or null if not found.
         */
        const time = this.registry.get(id).time_vector[index] || null

        return time
        }

    is_last_index (id, index)
        {
        /**
         * Checks if the provided index is the last index for the body's orbit data.
         * @param {string} id 
         * @param {number} index
         * @returns {boolean|null} - True if last index, false if not, null if data not found.
         */
        const length = this.get_length(id)

        return (length === null)? null : index === length - 1
        }


    get_relative_orbit_data (id, center=null)
        {
        /**
         * Retrieves the orbit data of id relative to center.
         * @param {string} id - The ID of the target spacecraft or planet.
         * @param {string|null} center - The ID of the center body. If null, uses the origin (0,0,0).
         * @returns {Array|null} - Relative orbit position data or null if data is invalid.
         */

        // Make sure target data exists
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }

        // Check if center is specified
        if  (center === null)
            {
            // console.log ("Returning absolute orbit data for ", id)

            return this.get_orbit_vector (id)
            }

        // Check if center data exists. If not, ignore the center.
        if  (! this.orbit_data_valid (center))
            {
            return this.get_orbit_vector (id)
            }

        // Get absolute orbit data
        const target_orbit = this.get_orbit_vector (id)

        // Get time data
        const time = this.get_time_vector (id)

        // Calculate relative orbit data
        const relative_orbit = []

        for (let i = 0; i < target_orbit.length; i++)
            {
            // Make sure we interpolate center position.  Planets have different time vectors.
            const center_pos = this.get_orbit_pos (center, time[i], true)

            relative_orbit.push ({
                x: target_orbit[i].x - center_pos.x,
                y: target_orbit[i].y - center_pos.y,
                z: target_orbit[i].z - center_pos.z
                });
            }

        return relative_orbit 
        }

    get_time_vector (id)
        {
        /**
         * Retrieves the time vector for a specific body.
         * @param {string} id 
         * @returns {Array|null} - Array of timestamps (UTC milliseconds since epoch) or null if not found.
         */
        return (this.registry.get (id)).time_vector || null
        }

    delete_orbit (id) 
        {
        /** 
         * Deletes orbit data for a specific entity ID.
         * @param {string} id 
         */
        this.registry.delete (id)
        }


    before_time_range (id, time)
        {
        /** 
         * Checks if the requested time is prior to the start of the orbit data.
         * @param {string} id 
         * @param {number} time - UTC milliseconds since epoch
         * @returns {boolean|null} - True if prior, false if not, null if data invalid.
         */
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }   

        const time_array = this.get_time_vector (id) 

        return (time <= time_array[0])
        }

    after_time_range (id, time)
        {
        /** 
         * Checks if the requested time is after the end of the orbit data.
         * @param {string} id 
         * @param {number} time - UTC milliseconds since epoch
         * @returns {boolean|null} - True if after, false if not, null if data invalid.
         */
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }   

        const time_array = this.get_time_vector (id) 

        return (time >= time_array[time_array.length - 1])
        }

    interpolate_time_at_index (id, index)
        {
        /**
         * Interpolates time at a specific index for a body.
         * Index is a floating-point number; the integer part is the lower bound index,
         * and the fractional part is used for interpolation.
         * @param {string} id 
         * @param {number} index 
         * @returns {number|null} - Interpolated time (UTC milliseconds since epoch) or null if data is invalid.
         */
        // Make sure target data exists
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }

        const i =  Math.floor (index)
        const t0 = this.registry.get(id).time_vector [i] 
        const t1 = this.registry.get(id).time_vector [i + 1]

        const time = t0 + (index - i) * (t1 - t0)

        return time
        }

    interpolate_pos_at_index (id, index)
        {
        /** 
         * Interpolates position at a specific index for a body.
         * Index is a floating-point number; the integer part is the lower bound index,
         * and the fractional part is used for interpolation.
         * @param {string} id 
         * @param {number} index 
         * @returns {Object|null} - Interpolated position {x, y, z} or null if data is invalid.
         */

        // console.log ("Interpolating position for ", id, " at index ", index)

        // Make sure target data exists
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }

        const i =  Math.floor (index)

        // Check if this the last index or beyond.  
        // If so, return the position at the last index to avoid out-of-bounds errors.
        const max_index = this.get_length (id) - 1

        if  (i >= max_index)
            {
            return this.registry.get(id).pos_vector [max_index]
            }

        // Otherwise, perform interpolation between index i and i+1.
        const p0 = this.registry.get(id).pos_vector [i]
        const p1 = this.registry.get(id).pos_vector [i + 1]

        const pos = {
            x: p0.x + (index - i) * (p1.x - p0.x),
            y: p0.y + (index - i) * (p1.y - p0.y),
            z: p0.z + (index - i) * (p1.z - p0.z)
            } ;

        return pos
        }

    time_to_index (id, time, interpolate=true)
        {
        /**
         * Finds the floating-point index corresponding to a specific time for a body.
         * If interpolate is false, returns the nearest integer index.
         * @param {string} id 
         * @param {number} time - UTC milliseconds since epoch
         * @param {boolean} interpolate - Whether to interpolate the index
         * @returns {number|null} - Floating-point index or null if data is invalid.
         */
        
        // Make sure target data exists
        if  (! this.orbit_data_valid (id))  
            {
            return null 
            }

        // Fetch the entire time array.  Since we are doing a binary search, this is more efficient.
        const time_array = this.get_time_vector (id) 

        // Boundary checks
        if (time <= time_array[0]) return 0.0
        if (time >= time_array[time_array.length - 1]) return time_array.length - 1.0

        // Binary Search to find the lower bound index 'i'
        let low = 0
        let high = time_array.length - 2 // We need i and i+1, so stop at the second to last index
        let i = 0

        while (low <= high) 
            {
            let mid = Math.floor ((low + high) / 2)

            if  (time >= time_array [mid] && time < time_array [mid + 1]) 
                {
                i = mid
                break
                }

            else if (time < time_array [mid]) 
                {
                high = mid - 1
                }

            else
                {
                low = mid + 1
                }
            }   


        // Calculate fractional index
        const t0 = time_array [i]
        const t1 = time_array [i + 1]    

        const index = i + (time - t0) / (t1 - t0)

        return interpolate ? index : Math.round (index)
        }

    interpolate_pos_at_time (t0, t1, p0, p1, time) 
        {
        /**
        * Estimates GSE position at time with edge-case checks for efficiency.
        */

        // Should I check for t1 <= t0? p0 != p1?

        // Approximate match for start point (within 1 second)
        // eventually we should have an adjustable tolerance value
        if  ((time <= t0 + 1000)) 
            {
            return { x: p0.x, y: p0.y, z: p0.z }
            }

        // Approximate match for end point (within 1 second)
        // eventually we should have an adjustable tolerance value
        if  ((time >= t1 - 1000)) 
            {
            return { x: p1.x, y: p1.y, z: p1.z }
            }

        // Standard linear interpolation
        const t = (time - t0) / (t1 - t0);

        return {
            x: p0.x + t * (p1.x - p0.x),
            y: p0.y + t * (p1.y - p0.y),
            z: p0.z + t * (p1.z - p0.z)
            };
        }

    get_orbit_pos (id, time, interpolate=true, center=null) 
        {
        /**
         * Uses binary search to find the correct interval and interpolates the position.
         * @param {string} id - The ID of the spacecraft or planet.
         * @param {number} time - UTC milliseconds since epoch
         * @param {boolean} interpolate - Whether to interpolate the position.
         * @returns {Object|null} - Interpolated position {x, y, z} or null if data is invalid.
         */

        // Make sure target data exists
        if  (! this.orbit_data_valid (id))
            {
            return null
            }

        // Find the appropriate index for the given time.  Note, index is a floating-point number.
        const index = this.time_to_index (id, time, interpolate)

        // If no interpolation is needed, return the position at the nearest index
        if  (! interpolate)
            {
            return this.get_pos (id, Math.floor(index), center)
            }

        return this.interpolate_pos_at_index (id, index)
        }

    // I need a better naming scheme for these methods.  It should be obvious which methods return
    // a position based on time and which return a position based on index.
    get_relative_pos (id, time, center=null, interpolate=true)
        {
        /**
         * Retrieves the position of id relative to center at the specified time.
         * @param {string} id - The ID of the target spacecraft or planet.
         * @param {number} time - UTC milliseconds since epoch.
         * @param {string|null} center - The ID of the center body. If null, uses the origin (0,0,0).
         * @param {boolean} interpolate - Whether to interpolate the position.
         * @returns {Object|null} - Relative position {x, y, z} or null if data is invalid.
         */
        
        // Make sure target data exists
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }

        // Get target position
        const target_pos = this.get_orbit_pos (id, time, interpolate)

        // If no center specified, return position relative to origin
        if  (center === null)
            {
            return target_pos
            }

        // Make sure center data exists. If not, ignore the center.
        if  (! this.orbit_data_valid (center))
            {
            return target_pos
            }

        // Get center position
        const center_pos = this.get_orbit_pos (center, time, interpolate)

        // Calculate relative position
        return {
            x: target_pos.x - center_pos.x,
            y: target_pos.y - center_pos.y,
            z: target_pos.z - center_pos.z
            }  ;
        }

    decimate (data, factor=Orbit_Data_Store.DEFAULT_MAX_FACTOR, max_points=Orbit_Data_Store.DEFAULT_MAX_POINTS)
        {
        /**
         * Reduces the number of points in an array by the specified factor,
         * in attempting to keep the total number of points below max_points.
         * @param {Array} data - The original array of points.
         * @param {number} factor - The maximum decimation factor.
         * @param {number} max_points - The maximum allowed number of points.
         * @returns {Array} - The decimated array of points.
         */
        // console.log ("Decimating data with factor ", factor, " and max points ", max_points)

        // Check if decimation is needed
        if  (data.length <= max_points)
            {

            // console.log ("No decimation needed. Returning original data with ", data.length, " points.")
            return data 
            }

        // Calculate actual decimation factor
        const decimation_factor = Math.min (factor, Math.ceil (data.length / max_points)) 

        // Decimate the data
        const decimated_data = []

        for (let i = 0; i < data.length; i += decimation_factor)
            {
            decimated_data.push (data[i])
            }

        // console.log ("Decimation complete. Returning ", decimated_data.length, " points.")

        return decimated_data
        }

    orbit_to_array (orbit)
        {
        /**
         * Converts an orbit array of {x, y, z} objects to a flattened array.
         * @param {Array} orbit - Array of {x, y, z} objects.
         * @returns {Array} - Flattened array of orbit coordinates [x1, y1, z1, x2, y2, z2, ...].
         */
        const result = []

        for (let i = 0; i < orbit.length; i++)
            {
            result.push (orbit[i].x)    
            result.push (orbit[i].y)
            result.push (orbit[i].z)
            }

        return result
        }

    get_orbit_as_array (id)
        {
        /** 
         * Returns entity orbit as an array of [x1, y1, z1, x2, y2, z2, ...].
         * @param {string} id - The ID of the target spacecraft or planet.
         * @returns {Array|null} - Flattened array of orbit coordinates or null if data is invalid.
         */

        // Make sure target data exists
        if  (! this.orbit_data_valid (id))
            {
            return null 
            }

        // Get the orbit data  
        const orbit = this.get_orbit_vector (id)

        // Use an internal method to convert to array.
        return this.orbit_to_array(orbit)
        }

    delete_all_orbits () 
        {
        /**
         * Clears all stored data.
         */
        this.registry.clear ()
        }
    }