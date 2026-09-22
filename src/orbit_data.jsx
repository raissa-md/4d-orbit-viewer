import { DATA_Format } from "./entity_manager.js"
import { MSEC_PER_HOUR } from "./Orbit.js"
import { COORD_System } from "./Orbit.js"
import { GSE_to_ANY } from "./Orbit.js"

export class Orbit_Data_Store 
    {
    static DEFAULT_MAX_POINTS = 4000 
    static DEFAULT_MAX_FACTOR = 4

    constructor() 
        {
        /**
         * Stores data by Entity ID.
         * Each entry contains:
         * time_vector: Array of timestamps (UTC milliseconds since epoch).
         * data_vector:  Array of {} objects.  For orbit data, each object 
         * contains x, y, z representing positions in GSE coordinates at 
         * the corresponding time.
         */
        this.registry = new Map ()
        }

    create_empty_data_obj (format=DATA_Format.COORD)
        {
        /**
         * Creates an empty data object with the specified format.
         * @param {enum} format - The format of the data (default is COORD).
         * @returns {Object} - An empty data object with the specified format.
         */

        switch (format)
            {
            case DATA_Format.SCALAR:
                return {x: 0}

            case DATA_Format.COORD:
                return {x: 0, y: 0, z: 0}

            // Currently not used, but could be useful for future extensions.
            case DATA_Format.DUAL:
                return {x: 0, y: 0, z: 0, aux_x: 0, aux_y: 0, aux_z: 0}

            default:
                return {}
            }
        }

    store_data (id, time, data, format=DATA_Format.UNKNOWN) 
        {
        /**
         * Stores the independent time and position arrays for a body.
         * @param {string} id - The ID of the spacecraft or planet.
         * @param {Array} time - The array of timestamps.
         * @param {Array} data - The array of {} objects.
         * @param {enum} format - The format of the data.
         * Note: No attempt is made to validate the data format or consistency.
         * It is assumed that the caller is providing valid data format.
         */ 
        // console.log ("Request to store data for ", id, " with ", time.length, " time points in format ", format)

        this.registry.set (id, 
            {
            time_vector: time,
            data_vector: data,
            format: format,
            child: null,
            type: null         // Not currently used, but could be useful for future extensions.
            });

        return id
        }

    create_pseudo_data (id, t0, t1, cadence, format=DATA_Format.COORD)
        {
        /**
         * Generate pseudo data for the requested object between times t0 and t1
         * at the specified cadence.  Pseudo data is set to all zeros.
         * @param {string} id
         * @param {number} t0 - Start time (UTC milliseconds since epoch)
         * @param {number} t1 - End time (UTC milliseconds since epoch)
         * @param {number} cadence - Time step in milliseconds
         * @param {enum} format - The format of the data (default is COORD).
         */
        const time_vector = []
        const data_vector = []

        for (let t = t0; t <= t1; t += cadence)
            {
            time_vector.push (t)
            data_vector.push (this.create_empty_data_obj (format))  
            }

        this.store_data(id, time_vector, data_vector, format)
        }

    entity_data_valid (id) 
        {
        /**
         * Checks if data exists for a specific entity ID.
         * @param {string} id 
         * @returns {boolean}
         */
        return this.registry.has (id)
        }

    get_data_vector (id, system = COORD_System.GSE, start_time = null, end_time = null) 
        {
        /**
        * Retrieves the full data object for a specific entity.
        * @param {string} id 
        * @param {number|null} start_time - If provided, only data at/after this time (UTC ms) is returned.
        * @param {number|null} end_time - If provided, only data at/before this time (UTC ms) is returned.
        * @returns {Array|null} - An array of data objects or null if not found.
        */

        const data = (this.registry.get (id)).data_vector 

        if  (!data || data.length === 0)
            {
            return null
            }

        // Get the time vector as we will need it for coordinate transformations and/or time filtering.
        const time_vector = (this.registry.get (id)).time_vector

        // GSE is the default coordinate system.  So just use the data as is; otherwise transform.
        const result = (system === COORD_System.GSE)? data : GSE_to_ANY (data, system, time_vector)

        if  (start_time === null && end_time === null)
            {
            return result
            }

        const filter = []

        for (let i = 0; i < time_vector.length; i++)
            {
            const pre_test = start_time === null || time_vector[i] > start_time
            const post_test = end_time === null || time_vector[i] < end_time

            if (pre_test && post_test)
                {
                filter.push (result[i])
                }
            }

        return filter
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
        const orbit = this.registry.get(id).data_vector[index] || null

        return orbit
        }
    */  
   
    get_pos (id, index, center=null, interpolate=true)
        {
        /**
         * Retrieves the position of the entity with id relative to center at a specific 
         * index. Does not perform bounds checking on index.  Does not do interpolation for
         * the target object, but will do interpolation for the center object if requested.
         * If center is null, returns absolute position.
         * @param {string} id 
         * @param {number} index 
         * @param {string|null} center - The ID of the center body. If null, uses the origin (0,0,0).
         * @param {boolean} interpolate - Whether to interpolate the center position.
         * @returns {Object|null} - Relative position {x, y, z} or null if data is invalid.
         */

        // Check that the data is in COORD format. If not, return null.
        if  (! this.entity_data_valid (id) || this.registry.get(id).format !== DATA_Format.COORD)
            {
            return null 
            }
        
        // Get the time at the specified index.  
        // This may be used for interpolation of the center position or coordinate transformations.
        const time_at_index = this.get_time (id, index)

        // Start with the position of the target body at the specified index.
        let orbit = this.registry.get(id).data_vector[index] || null

        // Convert the target orbit position to the requested coordinate system if necessary.
        // if  (system !== COORD_System.GSE)
        //     {
        //     orbit = GSE_to_ANY (orbit, system, time_at_index)
        //       }

        // Check if center is specified and if data exists. If not, ignore the center.
        if  (center === null || ! this.entity_data_valid (center))
            {
            return orbit
            }

        // Get the position of the center body at the same time.  This may require interpolation.
        const center_pos = this.get_orbit_pos (center, time_at_index, interpolate)

        // Calculate and return the relative position
        return {
            x: orbit.x - center_pos.x,
            y: orbit.y - center_pos.y,
            z: orbit.z - center_pos.z
            }
        }

    get_value_at_index (id, index, system = COORD_System.GSE)
        {
        /**
         * Retrieves the value at a specific index for an entity.
         * Does not perform bounds checking on index.
         * @param {string} id 
         * @param {number} index 
         * @returns {number|null} - Value at the specified index or null if not found.
         */
        const value = this.registry.get(id).data_vector[index] || null

        // Convert the target orbit position to the requested coordinate system if necessary.
        if  (system !== COORD_System.GSE && value !== null)
            {
            // Get the time at the specified index for the entity.
            const time = this.get_time (id, index)

            return GSE_to_ANY (value, system, time)
            }

        return value
        }   

    get_length (id)
        {
        /**
         * Retrieves the length of the data vector for a specific entity.
         * @param {string} id 
         * @returns {number|null} - Length of data vector or null if not found.
         */
        const length = this.registry.get(id).time_vector.length || null

        return length
        }

    get_time (id, index = 0)
        {
        /**
         * Retrieves the time at a specific index for an entity.
         * Does not perform bounds checking on index.
         * @param {string} id 
         * @param {number} index - The index of the time value to retrieve. Defaults to 0.
         * @returns {number|null} - Time (UTC milliseconds since epoch) or null if not found.
         */
        const time = this.registry.get(id).time_vector[index] || null

        return time
        }

    is_last_index (id, index)
        {
        /**
         * Checks if the provided index is the last index for the entity's data vector.
         * @param {string} id 
         * @param {number} index
         * @returns {boolean|null} - True if last index, false if not, null if data not found.
         */
        const length = this.get_length (id)

        return (length === null)? null : index === length - 1
        }


    get_relative_orbit_data (id, center=null, system = COORD_System.GSE, start_time = null, end_time = null)
        {
        /**
         * Retrieves the orbit data of an entity relative to center.
         * @param {string} id - The ID of the target spacecraft or planet.
         * @param {string|null} center - The ID of the center body. If null, uses the origin (0,0,0).
         * @param {number|null} start_time - If provided, only data at/after this time (UTC ms) is returned.
         * @param {number|null} end_time - If provided, only data at/before this time (UTC ms) is returned.
         * @returns {Array|null} - Relative orbit position data or null if data is invalid.
         */

        // Make sure target data exists
        if  (! this.entity_data_valid (id))
            {
            return null 
            }

        // Check that the data is in COORD format. If not, return null.
        if  (this.registry.get(id).format !== DATA_Format.COORD)
            {
            return null 
            }   

        // Check if center is specified
        if  (center === null)
            {
            // console.log ("Returning absolute orbit data for ", id)

            return this.get_data_vector (id, system, start_time, end_time)
            }

        // Check if center data exists. If not, ignore the center.
        if  (! this.entity_data_valid (center))
            {
            return this.get_data_vector (id, system, start_time, end_time)
            }

        // Get absolute orbit data
        const target_orbit = this.get_data_vector (id, system, start_time, end_time)

        // Get time data
        const time = this.get_time_vector (id, start_time, end_time)

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

    get_time_vector (id, start_time = null, end_time = null)
        {
        /**
         * Retrieves the time vector for a specific entity.
         * @param {string} id 
         * @param {number|null} start_time - If provided, only times at/after this time (UTC ms) are returned.
         * @param {number|null} end_time - If provided, only times at/before this time (UTC ms) are returned.
         * @returns {Array|null} - Array of timestamps (UTC milliseconds since epoch) or null if not found.
         */
        const time_vector = (this.registry.get (id)).time_vector || null

        if  (! time_vector || (start_time === null && end_time === null))
            {
            return time_vector
            }

        const filter = time_vector.filter ((t) => {
            return (start_time === null || t > start_time) && (end_time === null || t < end_time)
            })

        return filter
        }

    delete_data (id) 
        {
        /** 
         * Deletes the data for a specific entity ID.
         * @param {string} id 
         */
        this.registry.delete (id)
        }


    before_time_range (id, time)
        {
        /** 
         * Checks if the requested time is prior to the start of the data vector.
         * @param {string} id 
         * @param {number} time - UTC milliseconds since epoch
         * @returns {boolean|null} - True if prior, false if not, null if data invalid.
         */
        if  (! this.entity_data_valid (id))
            {
            return null 
            }   

        const time_array = this.get_time_vector (id) 

        return (time <= time_array[0])
        }

    after_time_range (id, time)
        {
        /** 
         * Checks if the requested time is after the end of the data vector.
         * @param {string} id 
         * @param {number} time - UTC milliseconds since epoch
         * @returns {boolean|null} - True if after, false if not, null if data invalid.
         */
        if  (! this.entity_data_valid (id))
            {
            return null 
            }   

        const time_array = this.get_time_vector (id) 

        return (time >= time_array[time_array.length - 1])
        }

    interpolate_time_at_index (id, index)
        {
        /**
         * Interpolates time at a specific index for an entity.
         * Index is a floating-point number; the integer part is the lower bound index,
         * and the fractional part is used for interpolation.
         * @param {string} id 
         * @param {number} index 
         * @returns {number|null} - Interpolated time (UTC milliseconds since epoch) or null if data is invalid.
         */
        // Make sure target data exists
        if  (! this.entity_data_valid (id))
            {
            return null 
            }

        const i =  Math.floor (index)
        const t0 = this.registry.get(id).time_vector [i] 
        const t1 = this.registry.get(id).time_vector [i + 1]

        const time = t0 + (index - i) * (t1 - t0)

        return time
        }

    ///* Need to refactor every method that invokes this one *///
    interpolate_pos_at_index (id, index)
        {
        /** 
         * Interpolates position at a specific index for an entity.
         * Index is a floating-point number; the integer part is the lower bound index,
         * and the fractional part is used for interpolation.
         * Note: This method always returns a position in the native coordinate system (GSE).
         * @param {string} id 
         * @param {number} index 
         * @returns {Object|null} - Interpolated position {x, y, z} or null if data is invalid.
         */

        // console.log ("Interpolating position for ", id, " at index ", index)

        // Make sure target data exists
        if  (! this.entity_data_valid (id))
            {
            return null 
            }

        // Check that the data is in COORD format. If not, return null.
        if  (this.registry.get(id).format !== DATA_Format.COORD)
            {
            return null 
            }

        const i =  Math.floor (index)

        // Check if this the last index or beyond.  
        // If so, return the position at the last index to avoid out-of-bounds errors.
        const max_index = this.get_length (id) - 1

        if  (id === 'MOON')
            {
            //console.log ("Max index for ", id, " is ", max_index, " i = ", i, " index = ", index)
            //console.log (this.registry.get(id).data_vector)
            }

        if  (i >= max_index)
            {
            return this.registry.get(id).data_vector [max_index]
            }

        // Otherwise, perform interpolation between index i and i+1.
        const p0 = this.registry.get(id).data_vector [i]
        const p1 = this.registry.get(id).data_vector [i + 1]

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
        if  (! this.entity_data_valid (id))  
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

    static interpolate_pos_at_time (t0, t1, p0, p1, time) 
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
    // Ideally, this should be done using coordinates in a solar inertial reference frame, 
    // but for now we will use GSE coordinates to do the calculations.
    get_velocity_normal (id, time, interpolate = null, system = COORD_System.GSE)
        {
        /**
         * Estimates the velocity of an entity at the specified time by calculating the 
         * change in position between previous and next positions.  This is a simple numerical 
         * differentiation. 
         * Note: If center is not specified, velocity normals are calculated in a geocentric frame
         * of reference. Specify the SUN as the center for a heliocentric frame.
         * @param {string} id - The ID of the target spacecraft or planet.
         * @param {number} time - UTC milliseconds since epoch.
         * // not used @param {string|null} center - Optional ID of the center body for relative velocity calculations. 
         * @param {string|null} new_id - Optional new ID for the stored velocity normals. If null, a default ID is generated.
         * @returns {string|null} - The new ID of the stored velocity normals or null if data is invalid.
         */

        
        // Make sure target data exists
        if  (! this.entity_data_valid (id))
            {
            return null 
            }

        // Check that the data is in COORD format. If not, return null.
        if  (this.registry.get(id).format !== DATA_Format.COORD)
            {
            return null 
            }

        // Find the appropriate index for the given time.  Note, index is a floating-point number.
        const time_before = Math.max (time - MSEC_PER_HOUR, this.get_time (id))
        const time_after = Math.max (time + MSEC_PER_HOUR, this.get_time (id))

        // Get the indices for the time before and after the specified time.
        // Fortunately, the time_to_index method can handle times outside the range of the time vector.
        const index_t0 = this.time_to_index (id, time_before, interpolate)  
        const index_t1 = this.time_to_index (id, time_after, interpolate)  

        // Calculate before and after positions for numerical differentiation.
        let before 
        let after

        if  (interpolate)
            {
            // Perform interpolation logic here if needed.
            before = this.interpolate_pos_at_index (id, index_t0)
            after = this.interpolate_pos_at_index (id, index_t1)
            }
        else
            {
            before = this.get_value_at_index (id, index_t0)
            after = this.get_value_at_index (id, index_t1)
            }

        // Check if center is specified and if data exists. If not, ignore the center.
        /* Center-relative velocity calculation is currently disabled. //
        if  (center !== null && this.entity_data_valid (center))
            {
            // Find the appropriate indices for the center body at the same times.
            // We need to interpolate the center position, since planets may have different 
            // time vectors.
            const center_t0 = this.time_to_index (center, time_before, true)
            const center_t1 = this.time_to_index (center, time_after, true)

            const center_before = this.interpolate_pos_at_index (center, center_t0)
            const center_after = this.interpolate_pos_at_index (center, center_t1)

            // Adjust the before and after positions to be relative to the center.
            before.x -= center_before.x
            before.y -= center_before.y
            before.z -= center_before.z

            after.x -= center_after.x
            after.y -= center_after.y
            after.z -= center_after.z
            }
        */

        if  (system !== COORD_System.GSE)
            {   

            before = GSE_to_ANY (before, system, time_before)
            after = GSE_to_ANY (after, system, time_after)

            // Check if the conversion to the target coordinate system was successful.
            if  (before === null || after === null)
                {
                return null
                }
            }

        const dx = after.x - before.x
        const dy = after.y - before.y
        const dz = after.z - before.z

        const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

        // Create a new data object for the velocity normal and populate it.
        const vel = {...this.create_empty_data_obj (DATA_Format.COORD)}

        // Insert the velocity vector components into the new data object.
        vel.x = dx
        vel.y = dy
        vel.z = dz

        // Normalize the velocity vector to get the velocity normal.  
        // If length is zero, create a zero vector.
        if (length !== 0)
            {
            vel.x /= length
            vel.y /= length
            vel.z /= length
            }
        else
            {
            vel.x = 0
            vel.y = 0
            vel.z = 0
            }

        return vel
        }

    get_orbit_pos (id, time, interpolate=true, system = COORD_System.GSE) 
        {
        /**
         * Uses binary search to find the correct interval and interpolates the position.
         * @param {string} id - The ID of the spacecraft or planet.
         * @param {number} time - UTC milliseconds since epoch
         * @param {boolean} interpolate - Whether to interpolate the position.
         * @returns {Object|null} - Interpolated position {x, y, z} or null if data is invalid.
         */

        // Make sure target data exists
        if  (! this.entity_data_valid (id))
            {
            //console.log ("Entity data for id = " + id + " is not valid.")
            return null
            }

        // Check that the data is in COORD format. If not, return null.
        if  (this.registry.get(id).format !== DATA_Format.COORD)
            {
            return null 
            }

        // Find the appropriate index for the given time.  Note, index is a floating-point number.
        const index = this.time_to_index (id, time, interpolate)

        //console.log ("object id = " + id + ". Interpolate = " + interpolate + ". Index for time " + time + " is " + index)

        // If no interpolation is needed, return the position at the nearest index
        if  (! interpolate)
            {
            // We can only return a position without reference to a center.
            return this.get_pos (id, Math.floor(index), null)
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
        if  (! this.entity_data_valid (id))
            {
            return null 
            }

        // Check that the data is in COORD format. If not, return null.
        if  (this.registry.get(id).format !== DATA_Format.COORD)
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
        if  (! this.entity_data_valid (center))
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

    data_to_array (data, format=DATA_Format.UNKNOWN)
        {
        /**
         * Converts an orbit array of data {} objects to a flattened array.
         * @param {Array} data - Array of data {} objects.
         * @param {enum} format - The format of the data (SCALAR, COORD or UNKNOWN).
         * @returns {Array} - Flattened array of data values.  For orbit coordinates
         *      it will look like [x1, y1, z1, x2, y2, z2, ...].
         */
        const result = []

        switch (format)
            {
            case DATA_Format.COORD:

                for (let i = 0; i < data.length; i++)
                    {
                    result.push (data[i].x)    
                    result.push (data[i].y)
                    result.push (data[i].z)
                    }

                break

            default:

                for (let i = 0; i < data.length; i++)
                    {
                    const values = Object.values (data[i])
                    // Use the spread operator to push all values of the object into the result array.
                    result.push (...values)
                    }
            }

        return result
        }

    get_data_as_array (id, start_time = null, end_time = null)
        {
        /** 
         * Returns entity data as a flattened array of values.  For orbit data, the format will be
         * [x1, y1, z1, x2, y2, z2, ...].
         * @param {string} id - The ID of the target entity.
         * @param {number|null} start_time - If provided, only data at/after this time (UTC ms) is included.
         * @param {number|null} end_time - If provided, only data at/before this time (UTC ms) is included.
         * @returns {Array|null} - Flattened array of data values or null if id is invalid.
         */

        // Make sure target data exists
        if  (! this.entity_data_valid (id))
            {
            return null 
            }

        // Get the orbit data  
        const data = this.get_data_vector (id, COORD_System.GSE, start_time, end_time)

        // Use an internal method to convert to array.
        return this.data_to_array(data, this.registry.get(id).format)
        }

    delete_all_data () 
        {
        /**
         * Clears all stored data.
         */
        this.registry.clear ()
        }
    }