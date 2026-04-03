import * as THREE from 'three'
import { Clock } from 'three'
import { saveAs } from 'file-saver'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { entity_manager } from './entity_manager.js'
import { Terra } from './new_earth.js'
import { MHDBowshock, MHDPause } from './MHDpause'
import { PLANETS } from './planet_data.js'


import { ORTHO_CAMERA } from './constants'
//import { PERSP_CAMERA } from './constants'
import { NEAR_PLANE } from './constants'
import { FAR_PLANE_PERSP } from './constants'
import { VFOV } from './constants'
import { ORTHO_TARGET_DIST } from './constants'
import { PERSP_TARGET_DIST } from './constants'
import { DEFAULT_CAM } from './constants'
import { INITIAL_ASPECT_RATIO } from './constants'
//import { STROBE_SHADER_CYCLE } from './constants'
import { BASE_ANIM_RATE } from './constants'
import { DEF_FOCUS_DISTANCE } from './constants.js'
import { DEF_GRID_SIZE, DEF_GRID_SCALE, DEF_GRID_OFFSET } from './constants'
import { AMBIENT_COLOR } from './constants'
import { DEF_AMBIENT_INTENSITY } from './constants'
import { DIM_AMBIENT_INTENSITY } from './constants'

import { AXIS_X, AXIS_Y, AXIS_Z } from './Orbit_Display'
import { epoch_to_date_time } from './Orbit_Display'

import { get_default_unit } from './Orbit.js'
import { convert } from './Orbit.js'
import { ANY_to_GSE } from './Orbit.js'
import { GSE_to_Frame } from './Orbit.js'
import { GSE_to_WS } from './Orbit.js' 
import { COORD_System } from './Orbit.js'
import { DEF_HELIO_COORD_SYS } from './Orbit.js'
import { DEF_GEO_COORD_SYS } from './Orbit.js'
import { COORD_Unit } from './Orbit.js'
import { coord_system_to_frame } from './Orbit.js'
import { coord_system_to_key } from './Orbit.js'
import { JN, SSC_WS } from './ssc_ws.js'
import Grid from './grids';
import Axes from './Axes.js'
import { system_time } from './entity_manager.js'
import { resolveOnChange } from 'antd/lib/input/Input.js'

function ortho_camera_distance (d)
    {
    return d * 4
    }

class my_orbital_controls extends OrbitControls
    {
    constructor ( camera, domElement, assets) 
        {
        super ( camera, domElement)

        // Initialize the event listener
        this._focus_dist = DEF_FOCUS_DISTANCE
        this._assets = assets
        this._zoom = this.object.zoom

        this._enable_axis_event = false
        this._delta = 0.005

        this._off_axis_event = new CustomEvent ("off_axis", 
            {
            bubbles: true,
            detail: { value: null }
            })
  
        this.init ()
       
        }
        
    is_off_axis ()
        {
        const a = (Math.abs (this.object.position.x) > this._delta)? 1 : 0 
        const b = (Math.abs (this.object.position.y) > this._delta)? 1 : 0 
        const c = (Math.abs (this.object.position.z) > this._delta)? 1 : 0 

        return (a + b + c > 1)
        }

    init () 
        {
        // Add an event listener for the custom event 'myCustomEvent'
        this.addEventListener ('change', this.handle_change_event)
        // this.update_sprite_size ()
        }
    
    handle_change_event (e) 
        {
        // Check if event was triggered by a change in zoom distance
        if  (this.object.zoom !== this._zoom)
            {
            this._zoom = this.object.zoom
            // this.update_sprite_size ()
            }

        if  (this._enable_axis_event && this.is_off_axis ())
            {
            document.dispatchEvent (new CustomEvent ('off_axis', 
                    {
                    bubbles: true,
                    detail: { value: e.value }
                    })
                ) ;

            this._enable_axis_event = false
            }
        }

    enable_off_axis_event ()
        {
        // When called this enable sending the off axis event once when the camera moves
        // in any way that isn't being zoomed.
        this._enable_axis_event = true
        }

    get_distance_to_target ()
        {
        if  (this.object.isOrthographicCamera)
            {
            return this.object.position.distanceTo (this.target) / this.object.zoom
            }
    
        return this.object.position.distanceTo (this.target)
        }

    set_target (target_pos)
        {
        this.target.copy (target_pos)

        this.update ()
        }

    tether (target_pos)
        {
        const t = new THREE.Vector3 ().subVectors (target_pos, this.target )

        this.object.position.add (t)
        this.target.add (t)

        this.update ()
        }

    set_camera_pos (direction, distance = 0, target_pos = null)
        {
        if  (target_pos)
            {
            this.set_target (target_pos)
            }

        const dist = (distance === 0)? this.get_distance_to_target () : distance

        const focus_dist = ortho_camera_distance (dist)

        const camera_dist = (this.object.isOrthographicCamera === true)?
            focus_dist
            : dist

        // this.update_view_distance (focus_dist)  // From both target & switch camera


        // Implements set_zoom (distance, focus_dist)
        // Set the zoom factor for both the orthogonal camera and the perspective camera.
        // The perspective camera will always have a zoom factor of 1
        if  (this.object.isOrthographicCamera === true)
            {      
            this.object.zoom = focus_dist / dist
            }
        else
            {
            this.object.zoom = 1.
            }

        this.object.updateProjectionMatrix ()
        // end set_zoom

        direction.multiplyScalar (camera_dist)                    // position_camera (target, dist_to_target, direction)

        this.object.position.addVectors (this.target, direction)  // position_camera
        this.object.lookAt (this.target)                          // position_camera

        return focus_dist
        }
        
    update_sprite_size ()
        {
        //this.zoom = this.object.zoom
        this._assets.update_text_scale (
            this.object.zoom? this.object.zoom : ORTHO_TARGET_DIST / 5, 
            this.object.isPerspectiveCamera? true : false,
            this.object.top? this.object.top : 0,
            this.domElement.height,
            this.object.fov)
        //assets.update_zoom_scale (.16)
        }

    update_view_distance (distance = DEF_FOCUS_DISTANCE)
        {
        this._focus_dist = distance
        this._assets.update_label_view_distance (
            this._focus_dist, 
            this.object.zoom? this.object.zoom : ORTHO_TARGET_DIST / 5, 
            this.object.isPerspectiveCamera? true : false,
            this.object.top? this.object.top : 0,
            this.domElement.height,
            this.object.fov

            )
        }

    get focus_dist ()
        {
        return this._focus_dist
        }
    }

const MAX_REC_TIME = 30

class Screen_Capture 
    {
    constructor (display, W=256, H=256, fps=30)
        {
        this.chunks = []
        this.timer_id = null 
        this.video_blob = null
        this.req_interval = 1000 // ms
        this.req_timer = null 
        this.stop_flag = false
        this.start_time = 0
        

        this.compost = new OffscreenCanvas (W, H).getContext('2d')
        this.capture = new OffscreenCanvas (W, H).getContext('2d')
        this._display = display 
        this._is_video = false

        this.Hd = H
        this.Wd = W

        this.stream = this._display.captureStream ()
        this.recorder = new MediaRecorder (this.stream, { mimeType: 'video/webm' })

        // Definition needs to be moved into start_recording if I want the ondataavailable()
        // function to be used.
        this.recorder.ondataavailable = (event) => {
            console.log ('video')
            if  (event.data && event.data.size > 0) 
                {
                this.chunks.push (event.data)
                }
            };

        this.event_name = "RecordStop"
        this.quit_event = new CustomEvent (this.event_name, { detail: { answer: 42 } })

        this.update_compost_bg_color = this.update_compost_bg_color.bind (this)
        this.set_screen_capture_background = this.set_screen_capture_background.bind (this)
        this.add_time_date = this.add_time_date.bind (this)
        this.start_recording = this.start_recording.bind  (this)
        this.capture_video = this.capture_video.bind (this)
        this.start_recording = this.start_recording.bind (this)
        this.is_recording = this.is_recording.bind (this)
        this.get_video_data = this.get_video_data.bind (this)
        }    

    start_recording (t = MAX_REC_TIME)
        {
        if  (this.is_recording ())
            {
            return 
            }

        const timer = new Promise (resolve => {setTimeout (() => resolve (), t * 1000)})

        const waiter = new Promise (resolve => {
            function handle_stop_req (event) 
                {
                window.removeEventListener  (this.event_name, handle_stop_req.bind (this))
                resolve (event);
                }       

            window.addEventListener (this.event_name, handle_stop_req);
            }) ;

        this.capture_video ()

        return Promise.race ([timer, waiter])
            .then (() => {
                clearInterval (this.req_timer)
                this.recorder.stop ()
                return Promise.resolve (this.get_video_data ())
                }) ;

        }

 
    capture_video ()
        {
        this._is_video = true 
        this.chunks.length = 0

        this.recorder.start ()

        this.start_time = new Date ().valueOf ()  

        this.req_timer = setInterval(() => {
            if  (this.is_recording ())
                { 
                this.recorder.requestData ()
                }

            }, this.req_interval) ;
        }

    stop_recording ()
        {
        if  (! this.is_recording ())
            {
            return
            }

        window.dispatchEvent (this.quit_event)

        // This gets moved someplace else


        return // a promise resolve?
        }

    get_video_data ()
        {
        return new Blob (this.chunks, {type: 'video/webm' })
        }

    is_recording () 
        {
        return this.recorder.state === 'recording';
        }

    update_compost_bg_color (color) 
        {
        // We can probably just clear the canvas here since the size isn't going to change.
        // const compost = new OffscreenCanvas (V3DSpace.width, V3DSpace.height) 
        this.compost.clearRect(0, 0, this.Wd, this.Hd)

        this.set_screen_capture_background (color)
        
        this.add_time_date ()
        }

    set_screen_capture_background (clr="white")
        {
        // Input must be a CSS color value.
        this.compost.beginPath ()
        this.compost.rect (0, 0, this.Wd, this.Hd)
        this.compost.fillStyle = clr
        this.compost.fill()
    
        this.compost.drawImage (this.capture.canvas, 0, 0)
        }

    add_time_date ()
        {
        const display_time = epoch_to_date_time (system_time.time, true)

        this.compost.font = "22px Arial"
        this.compost.fillStyle = "white"
        this.compost.strokeStyle = 'DarkSlateGrey'
        this.compost.lineWidth = 2

        const text = "Time: " + display_time 
        const width = this.compost.measureText (text).width

        // Draw the time and date on the image
        this.compost.strokeText(text, (this.Wd / 2 - width / 2).toFixed (), this.Hd - 30)
        // ctx.fillText(text, 10, compost.height - 10);
        // ctx.fillText(text, 10, 10);
        }

    capture_image ()
        {
        // Take the screen shot as soon as the image is requested.
        this._is_video = false

        this.capture.drawImage (this._display, 0, 0)  // Where does this come from?


        this.set_screen_capture_background ()

        this.add_time_date ()

        // this.setState ({show_image_dialog: true, compost: compost})

        }

    elapsed_time ()
        {
        return new Date ().now - this.start_time 
        }

    save_media (save_to_file, file_name)
        {
        if  (this._is_video)
            {
            return this.save_video (save_to_file, file_name)
            }
            
        else
            {
            return this.save_image (save_to_file, file_name)
            }
        }

    save_image (save_to_file = false, file_name = "image")
        {
        this.compost.canvas.convertToBlob ({type: "image/png"})
            .then (png => {
                if  (save_to_file)
                    {
                    saveAs (png, file_name)
                    }
                else 
                    {
                    window.open (URL.createObjectURL (png), 'screenshot')
                    }
                })
        }

    save_video (save_to_file = false, file_name = "video") 
        {  
        if  (save_to_file)
            {
            saveAs (this.get_video_data (), file_name)
            }
        else 
            {
            window.open (URL.createObjectURL (this.get_video_data ()), 'video capture')
            }
        }

    wait (ms = 1000) 
        {
        return new Promise ((resolve) => setTimeout (resolve, ms))
        }

    get img_width ()
        {
        return this.Wd 
        }

    get img_height ()
        {
        return this.Hd
        }

    get img ()
        // Actually returns the 2D context to the compost offscreen canvas
        {
        return this.compost.canvas
        }

    get is_video ()
        {
        return this._is_video
        }

    get recording ()
        {
        return this.is_recording ()
        }

    }


class display_space
    {
    constructor (display_target=null)
        {
        this.slider_position = this.slider_position.bind (this)
        this.toggle_pause_play = this.toggle_pause_play.bind (this)
        this.loop = this.loop.bind (this)
        this.speed = this.speed.bind (this)
        this.set_focus = this.set_focus.bind (this)
        this.toggle_xz_grid_visible = this.toggle_xz_grid_visible.bind (this)
        this.toggle_yz_grid_visible = this.toggle_yz_grid_visible.bind (this)
        this.toggle_xy_grid_visible = this.toggle_xy_grid_visible.bind (this)
        this.update_xz_grid_options = this.update_xz_grid_options.bind (this)
        this.update_yz_grid_options = this.update_yz_grid_options.bind (this)
        this.update_xy_grid_options = this.update_xy_grid_options.bind (this)

        // Global object to store log messages
        window.log_messages = []

        // Custom event to trigger when focus changes.  This is used to update the camera align button label.
        this._focus_change_event = new CustomEvent ("focus_change", 
            {
            bubbles: true,
            detail: { label: "not used" }
            })


        // Function to emulate the sprintf like functionality of console.log
        // This needs to do more to decompose integer specifications
        const sprintf = (str, ...args) =>
            { 
            if  (args.length === 0)
                {
                return str
                }

            if  (/%[oOdisf]/.test (str))
                {
                return (sprintf (str = str.replace (/%[oOdisf]/, args.shift()), ...args)) 
                }

            return sprintf (str + args.shift (), ...args) 
            }

        // Override the console.log method
        const original_log = console.log;

        console.log = function (...args) 
            {
            // Save the message to the global object
            window.log_messages.push (sprintf (...args) + '\n')

            // Call the original console.log method
            original_log.apply (console, args)
            } ;

        JN.log_browser ()

        // Make sure a valid display canvas was specified.  If it wasn't blow up.
        if  (! display_target)
            {
            console.log ('no valid display canvas was specified')
            }

        // Create a THREE scene
        this.scene = new THREE.Scene () 

        // Create the entity manager
        this.entity_manager = new entity_manager (this.scene)

        // Just a flag to keep track of initialization status for other parts of the program.
        this._init = false

        // Initialize the units 
        // this.entity_manager.set_unit (COORD_Unit.RE)

        // Initialize display width and display height to 0
        // They will be reset later
        this._width = 0
        this._height = 0

        // The target the camera is pointing at
        this._target_label = "none"

        // Initialize the slider width
        this._slider_width = 0 

        // Slider value that matches current time ( initialize to 0 )
        this._slider_value = 0        

        // Frame ID of next frame for animation
        this._frame_id = 0

        // Set spacecraft animation to be paused
        this._pause = true

        // Set the looping behavior to loop 
        // (return to the beginning after reaching the end of the time range during animation)
        this._loop = true

        this._x = false
        this._y = false
        this._z = false
        this._alt_x = false
        this._alt_y = false
        this._alt_z = false

        // Set the initial display rate to the base animation rate
        this._rate = BASE_ANIM_RATE

        // Time increment that is currently being processed
        this._delta = 0

        // Set up the camera
        this._persp_camera = new THREE.PerspectiveCamera ()  
        this._ortho_camera = new THREE.OrthographicCamera () 
        this._aspect_ratio = INITIAL_ASPECT_RATIO
        this._camera = null
    
        if  (DEFAULT_CAM === ORTHO_CAMERA)
            {
            this._ortho_camera.position.set (ORTHO_TARGET_DIST, 0, 0)   
            this._ortho_camera.zoom = ORTHO_TARGET_DIST / 5
            this._camera = this._ortho_camera ;
            }

        else
            {
            this._persp_camera.position.set (PERSP_TARGET_DIST, 0, 0)     
            this._camera = this._persp_camera ;
            }

        this.update_camera_view ()

        // Add some lights to the scene

        // Create a light for the Sun (We use a point light for this)
        //this._slight = new THREE.PointLight (0xcccccc, 1.2, 0., 0, 0) 
        
        // Position the Sun light at the approximate position of the Sun.
        //const sun_pos_ws = GSE_to_WS (new THREE.Vector3 (AU, 0, 0))
        //this._slight.position.copy (sun_pos_ws)

        //this.scene.add (this._slight)

        // Create an ambient light so that all bodies are always partially illuminated.
        this._alight = new THREE.AmbientLight (AMBIENT_COLOR, DEF_AMBIENT_INTENSITY)
        this.scene.add (this._alight)

        // Add the Earth.
        //this._earth = new Terra (this.scene, 1)  // Should use a default initial axes length.

        // Add axes
        this._axes = new Axes (this.scene, 1, this.entity_manager.unit)
        this._axes.update_axes ()
        this._axes_length = this._axes.axes_length

        // Add the heliopause and bowshock meshes
        this._mhd = new MHDPause (this.scene) 
        this._mhd.setOpacity (.4)
        this._mhd.set_wire_frame (true)
        this._bowshock = new MHDBowshock (this.scene)
        this._bowshock.setOpacity (.4)
        this._bowshock.set_wire_frame (true)

        this._mhd_visible = this._mhd.visible
        this._bowshock_visible = this._bowshock.visible
        
        this._labels_visible_all = true
        this._labels_visible_sc = true
        this._labels_visible_planet = true

        // Create new xz grid 
        this._xz_grid = new Grid ('Z', 
            'Y', 
            DEF_GRID_SIZE, 
            DEF_GRID_SCALE, 
            AXIS_X, 
            AXIS_Y, 
            this.entity_manager.unit)

        this._xz_grid.set_grid_position (DEF_GRID_OFFSET, this.entity_manager.unit)

        this.scene.add (this._xz_grid)

        this._xz_grid_visible = this._xz_grid.is_visible ()

        // Create new yz grid 
        this._yz_grid = new Grid ('Z', 
            'X', 
            DEF_GRID_SIZE, 
            DEF_GRID_SCALE, 
            AXIS_X, 
            AXIS_Y, 
            this.entity_manager.unit)
            
        this._yz_grid.set_grid_position (DEF_GRID_OFFSET, this.entity_manager.unit)

        this.scene.add (this._yz_grid)

        this._yz_grid_visible = this._yz_grid.is_visible ()

        // Create new xy grid 
        this._xy_grid = new Grid (
            'X', 
            'Z', 
            DEF_GRID_SIZE, 
            DEF_GRID_SCALE, 
            AXIS_X, 
            AXIS_Y,
            this.entity_manager.unit)

        this._xy_grid.set_grid_position (DEF_GRID_OFFSET, this.entity_manager.unit)

        this.scene.add (this._xy_grid)

        this._xy_grid_visible = this._xy_grid.is_visible ()

        // Start up the clock
        this._clock = new Clock ()

        // Get the canvas that we will be our render target
        this._display = (document.getElementsByClassName ("orbit")) [0]

        this._renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: true,
            canvas: this._display,
            })

        this._renderer.setClearColor('#000000', 0) 

        this.resize_canvas () 

        window.addEventListener('resize', this.resize_canvas.bind (this)) 

        this._controls = new my_orbital_controls ( this._camera, this._display, this.entity_manager)
        
        // Start with the Earth as the focus.
        this.update_frame ('EARTH')

        this.set_coord_system (DEF_GEO_COORD_SYS)

        this.start_event_loop ()
        }

    add_all_planets ()
        {
        PLANETS.map ( (p) => this.entity_manager.add_planet (p))
        }

    get_camera_vector (axis="X")
        {
        // Return a normalized directional matrix for the requested axis.
        const v = new THREE.Vector3 (0, 0, 0)

        switch (axis)
            {
            case "X" : 
                v.setX (1)
                break

            case "Y" :
                v.setY (1)
                break

            case "Z" :
                v.setZ (1)
                break

            case "XY" :
                v.setX (Math.sqrt (2) / 2)
                v.setZ (Math.sqrt (2) / 2)
                break

            case "XZ" :

                v.setX (Math.sqrt (2) / 2)
                v.setZ (Math.sqrt (2) / 2)
                break

            case "YZ" :

                v.setY (Math.sqrt (2) / 2)
                v.setZ (Math.sqrt (2) / 2)
                break

            default: 
                v.setX (1)
            }

        //const gse = ANY_to_GSE (v, this.entity_manager.coord_system, this.entity_manager.time)

        //const gse_frame = GSE_to_Frame (gse, this.entity_manager.time, this.entity_manager.reference_frame)

        //return GSE_to_WS (gse_frame) 
        return GSE_to_WS (v) 
        // Elon Musk says ‘get off your work-from-home bullshit’
        }
    
    set_axis (axis, reverse = false)
        {
        if  (['X', 'Y', 'Z'].includes (axis))
            {

            const d = (reverse)? -1 : 1 

            //const target = this._controls.target
            //const distance = this._controls.get_distance_to_target ()

            const focus_dist = this._controls.set_camera_pos (this.get_camera_vector (axis).multiplyScalar (d))

            //this.target (distance, this.get_camera_vector (axis).multiplyScalar (d))
            this.update_frustum (focus_dist)

            this._controls.enable_off_axis_event ()

            //this._camera.lookAt (target) 
            //this._controls.target.copy (target) 
            }
        }

    /* replaced by set_camera_pos() method.
    position_camera (target, dist_to_target, direction)
        {
        this._camera.position.addVectors (target, direction.multiplyScalar (dist_to_target))
        this._camera.lookAt (target)
        }
    */

    update_frustum (distance)
        {
        const frustum_height = 2 * distance * Math.tan (VFOV * 0.5 * (Math.PI / 180))
        // const frustum_height = 2.0 * far_plane * Math.tan (VFOV * 0.5 * (Math.PI / 180)) ;
        const frustum_width = frustum_height * this._aspect_ratio 

        this._ortho_camera.left = (frustum_width / -2)
        this._ortho_camera.right = (frustum_width / 2) 
        this._ortho_camera.top = (frustum_height / 2)  
        this._ortho_camera.bottom = (frustum_height / -2)  
        this._ortho_camera.near = NEAR_PLANE 
        this._ortho_camera.far = FAR_PLANE_PERSP 

        this._ortho_camera.updateProjectionMatrix ()
        }

    target (distance, direction)
        {
        // Does this ever need to update orbit controls target ? Yes!
        // const focus_dist = ortho_camera_distance (distance)

        // Call here (pos, distance, direction)
        // pos - new camera postion

        // This may not be needed. 
        // const camera_dist = (this._camera.isOrthographicCamera === true)?
        //    focus_dist
        //    : distance

        // Always do this now, even when using the perspective camera.  That was the
        // orthogonal camera will be ready.
        const focus_dist = this._controls.set_camera_pos (direction, distance)


        this.update_frustum (focus_dist)

        // this._controls.update_view_distance (focus_dist)   // done by set_camera_pos

        // this.set_zoom (distance, focus_dist)               // done by set_camera_pos
        // this.position_camera (pos, camera_dist, direction) // done by set_camera_pos
        }

    /*
    moved to myOrbitControls
    set_zoom (distance, focus_dist)
        {
        // Set the zoom factor for both the orthogonal camera and the perspective camera.
        // The perspective camera will always have a zoom factor of 1
        if  (this._camera.isOrthographicCamera === true)
            {      
            this._camera.zoom = focus_dist / distance
            }
        else
            {
            this._camera.zoom = 1.
            }

        this._camera.updateProjectionMatrix ()
        }
    */

    switch_camera ()
        {
        // Same important information from the current controls object
        const target     = this._controls.target.clone ()
        const distance   = this._camera.position.distanceTo (target) / this._camera.zoom
        // const focus_dist = this._controls.focus_dist 
        const direction  = new THREE.Vector3 ().subVectors(this._camera.position, target).normalize ()

        // console.log (" switch camera - distance (actual) %f distance (calc) %f focus %f", this._camera.position.distanceTo (target), distance, focus_dist)
        console.log (" switch camera - current zoom is ",  this._camera.zoom)

        // Get rid of the Orbit Controls object. 
        this._controls.dispose ()

        // activate the opposite camera
        // this._camera = (this._camera.isOrthographicCamera === true)? this._persp_camera : this._ortho_camera 
        if  (this._camera.isOrthographicCamera === true)
            {      
            this._camera = this._persp_camera 
            // this.position_camera (target, distance, direction) // Done
            }
        else
            {
            this._camera = this._ortho_camera 
            // this.position_camera (target, focus_dist, direction) // Done
            }

        // this.set_zoom (distance, focus_dist) // done

        console.log (" switch camera - reset zoom to ",  this._camera.zoom)

        // Recreate the controls
        // Must do this first
        this._controls = new my_orbital_controls (this._camera, this._display, this.entity_manager)
        // this._controls.update_view_distance (focus_dist) // done
        // this._controls.target.copy (target) // need to do this before calling 
        // this._controls.update ()   // need to do this after calling set_camera_pos
        this._controls.set_target (target)    
        this._controls.set_camera_pos (direction, distance)          
        }

    /* Not used
    set_camera_position (target, dist_to_target, direction)
        {
        if  (this._camera.isPerspectiveCamera)
            {
            this._camera.position.addVectors (target, direction.multiplyScalar (dist_to_target))
            }
        else
            {

            this._camera.position.addVectors (target, direction.multiplyScalar (ortho_camera_distance (dist_to_target)))
            this._camera.zoom = ortho_camera_distance (dist_to_target) / dist_to_target
            //this._camera.position.addVectors (target, direction.multiplyScalar (ORTHO_TARGET_DIST))
            //this._camera.zoom = ORTHO_TARGET_DIST / dist_to_target
            this._camera.updateProjectionMatrix ()
            }

        console.log ("updating view distance: ", dist_to_target, " zoom ", this._camera.zoom, " ortho ", ortho_camera_distance (dist_to_target))


        this._controls.update_view_distance (dist_to_target)

        this._camera.lookAt (target) ;
        }
    */

    update_frame (frame, enable_relative_orbits = false)
        {   
        // frame is the center of a fixed coordinate system. 

        let distance = 5

        // Return value.
        // When not an empty string, an appropriate message that the coordinate system has 
        // changed.  This is used by Manager.set_frame.
        let coord_reset_msg = ""

        if (frame === "EARTH" )
            {
            if  (frame !== coord_system_to_frame (this.entity_manager.coord_system))
                {
                this.entity_manager.set_coord_system (DEF_GEO_COORD_SYS)

                const new_system = coord_system_to_key (DEF_GEO_COORD_SYS)
                
                this.set_unit (get_default_unit (DEF_GEO_COORD_SYS))

                coord_reset_msg = `Coordinate has been changed to ${new_system} to align
                         with new target`
                }

            this.entity_manager.set_coord_center ()

            this.entity_manager.clear_focus ()

            let pl = PLANETS.find (item => item.id === frame)

            distance = (pl)? pl.dist : distance
            
            this._target_label = "Earth"
 
    
            /*
            if  (frame === coord_system_to_frame (this.entity_manager.coord_system))
                {
                this.entity_manager.clear_focus ()

                let pl = PLANETS.find (item => item.id === frame)

                distance = (pl)? pl.dist : distance
                
                this._target_label = "Earth"
                }

            else 
                {
                // Just set the focus to the earth
                return this.set_focus ("EARTH", false)
                }
            */
            }

        else if (frame === "SUN")
            {            
            if  (frame !== coord_system_to_frame (this.entity_manager.coord_system))
                {
                this.entity_manager.set_coord_system (DEF_HELIO_COORD_SYS)

                const new_system = coord_system_to_key (DEF_HELIO_COORD_SYS)

                this.set_unit (get_default_unit (DEF_HELIO_COORD_SYS))

                coord_reset_msg = `Coordinate has been changed to ${new_system} to align
                         with new target`
                }

            this.entity_manager.set_coord_center ()

            this.entity_manager.clear_focus ()

            let pl = PLANETS.find (item => item.id === frame)

            distance = (pl)? pl.dist : convert (distance, COORD_Unit.RS, COORD_Unit.RE)

            this._target_label = "Sun"


            /*
            if  (frame === coord_system_to_frame (this.entity_manager.coord_system))
                {
                this.entity_manager.clear_focus ()

                let pl = PLANETS.find (item => item.id === frame)

                distance = (pl)? pl.dist : convert (distance, COORD_Unit.RS, COORD_Unit.RE)
 
                this._target_label = "Sun"
                }

            else 
                {
                // Just set the focus to the sun
                return this.set_focus ("SUN", false)
                }
            */
            }

        else
            {
            // Otherwise, we are focusing on a planetary without a defined coordinate system.  
            // In this case we will just switch the focus to the planet and if relative orbits
            // are enabled we will switch to GSE and set the coordinate center to the planet.
            if (enable_relative_orbits)
                {
                coord_reset_msg = `Viewing spacecraft relative to ${frame} in GSE-aligned coordinate system.`

                // Check for GSE here.  If it's not GSE then we will switch to GSE 
                // and update the coordinate center to the requested object.  If it 
                // is GSE then we will just update the coordinate center.
                if  (this.entity_manager.coord_system !== COORD_System.GSE)
                    {
                    this.entity_manager.set_coord_system (COORD_System.GSE)

                    const new_system = coord_system_to_key (COORD_System.GSE)

                    this.set_unit (get_default_unit (COORD_System.GSE))

                    // This is probably too long for the current message box. 
                    //  We may want to shorten it or split it into two messages.
                    coord_reset_msg += ` Coordinate system has been changed to ${new_system} to support relative
                                            orbit display.`
                    }
                

                // Not implemented yet.
                // this._sub_title = 'Body-Centered GSE' ?? Check wording here

                this.entity_manager.set_coord_center (frame)
                }

            else
                {
                this.entity_manager.set_coord_center (null)
                this.set_focus (frame)

                // Not best logic, but it should work.
                return ""
                }

            this._target_label = frame

            // this.entity_manager.set_focus (frame)
            }

        document.dispatchEvent (this._focus_change_event)

        const target = new THREE.Vector3 (0., 0., 0.)

        // this.state.camera.position.addVectors (target, this.get_camera_vector ("X", distance)) ;
        // this.state.camera.lookAt (target) ;
        // this.set_camera_position (target, distance, this.get_camera_vector ('X'))
        this._controls.target.copy (target)
        this.target (distance, this.get_camera_vector ('X'))  //No need to specify target

        return coord_reset_msg
        }

    update_camera_to_follow (refocus=false)
        {
        const actor = this.entity_manager.get_focus ()

        if  (! actor)
            {
            return false
            }

        if  (refocus)
            {
            //this._controls.target.copy  (actor.position)
            //this._camera.position.copy  (actor.position)

            this._controls.set_target (actor.position)

            const distance = (actor.focus_dist)? actor.focus_dist : DEF_FOCUS_DISTANCE   
            
            const direction = this.get_camera_vector ('XZ') 

            //this.set_camera_position (actor.position, distance, direction)
            this.target (distance, direction)
        }

        else 
            {
            // Need separate method for this
            // const t = new THREE.Vector3 ().subVectors (actor.position, this._controls.target )

            // this._camera.position.add (t)
            // this._controls.target.add (t)
            this._controls.tether (actor.position)
            }

        // this._controls.update () ;
        }

    update_grids ()
        {
        //const time = this.entity_manager.time
        //const system = this.entity_manager.coord_system
        //const frame = this.entity_manager.reference_frame

        this._xz_grid.update_grid (this.entity_manager.unit)

        this._yz_grid.update_grid (this.entity_manager.unit)

        this._xy_grid.update_grid (this.entity_manager.unit)
        }

    time_from_slider_position (pos)
        {
        const start_time = this.entity_manager.start_time
        const end_time = this.entity_manager.end_time
        const slider_range = this.slider_width - 1

        return ((pos- 1) / slider_range) * (end_time - start_time) + start_time 
        }

    slider_position_from_time (time)
        {
        const start_time = this.entity_manager.start_time
        const end_time = this.entity_manager.end_time
        const slider_range = this.slider_width - 1
    
        return  Math.round (slider_range * (time - start_time) / (end_time - start_time)) + 1
        }


    switch_camera_old ()
        {
        // Update the view parameters for each camera.
        const target = this._controls.target.clone ()

        // Get the distance from the camera to the target.  If we are using 
        let dist_to_target = (this._controls)? this._camera.position.distanceTo (target) : DEF_FOCUS_DISTANCE
        
        if  (this._controls)
            {
            console.log (" focus ", this._controls.focus_dist, " zoom ", dist_to_target / this._camera.zoom)
            }

        if  (this._camera.isOrthographicCamera)
            {
            dist_to_target = dist_to_target / this._camera.zoom
            }

        // Get rid of the Orbit Controls object. 
        this._controls.dispose ()

        const direction = new THREE.Vector3 ().subVectors(this._camera.position, target).normalize ()

        this._camera = (this._camera.isOrthographicCamera === true)? this._persp_camera : this._ortho_camera 

        /*
        if  (this._camera.isOrthographicCamera === true)
            {      
            this._persp_camera.position.addVectors (target, direction.multiplyScalar (dist_to_target))
            this._camera = this._persp_camera 
            }

        else
            {
            this._ortho_camera.position.addVectors (target, direction.multiplyScalar (ORTHO_TARGET_DIST))
            this._ortho_camera.zoom = ORTHO_TARGET_DIST / dist_to_target
            this._ortho_camera.updateProjectionMatrix ()
            this._camera = this._ortho_camera
            }
        */

        this._camera.lookAt (target) 
        this._controls = new my_orbital_controls (this._camera, this._display, this.entity_manager)
        this._controls.target.copy (target)
        this._controls.update ()             
        }

    update_camera_view ()
        {        
        // Note:  Only use this when the aspect ratio changes !!! 
        //const horz_FOV = 2 * Math.atan (Math.tan (VFOV / 2) * aspect_ratio)

        // Calculate parameters for orthogonal camera
        const far_plane = FAR_PLANE_PERSP 

        const frustum_height = 2 * ORTHO_TARGET_DIST * Math.tan (VFOV * 0.5 * (Math.PI / 180))
        // const frustum_height = 2.0 * far_plane * Math.tan (VFOV * 0.5 * (Math.PI / 180)) ;
        const frustum_width = frustum_height * this._aspect_ratio 

        this._ortho_camera.left = (frustum_width / -2) 
        this._ortho_camera.right = (frustum_width / 2) 
        this._ortho_camera.top = (frustum_height / 2)  
        this._ortho_camera.bottom = (frustum_height / -2)  
        this._ortho_camera.near = NEAR_PLANE 
        this._ortho_camera.far = far_plane 

        // Calculate parameters for perspective camera
        this._persp_camera.far = FAR_PLANE_PERSP 
        this._persp_camera.near = NEAR_PLANE 
        this._persp_camera.aspect = this._aspect_ratio 
        this._persp_camera.fov = VFOV 
        
        this._ortho_camera.updateProjectionMatrix () 
        this._persp_camera.updateProjectionMatrix () 
        }

    calc_slider_range ()
        {
        const r = (this._width / 3.3).toFixed ()
        
        this._slider_width = r < 100? 100 : r
        }
    
    resize_canvas () 
        {
        this._width =  window.innerWidth
        this._height = window.innerHeight
        this._aspect_ratio = this._width / this._height

        this.calc_slider_range ()

        this.update_camera_view ()

        this.entity_manager.set_display_size (this._width, this._height)
        
        this._renderer.setSize (this._width, this._height, false)  
        }

    start_event_loop ()
        {
        // Start animation
        if  (! this._frame_id)
            {
            this._frame_id = window.requestAnimationFrame (this.animate.bind (this))
            }
        }

    stop_event_loop ()
        {
        cancelAnimationFrame (this._frame_id) 
        }

    pause ()
        {
        this._pause = true
        }

    toggle_pause_play ()
        {
        this._pause = ! this._pause
        }

    play ()
        {
        this._pause = false
        }

    loop (loop = true)
        {
        this._loop = loop
        }

    speed (s = BASE_ANIM_RATE)
        {
        this._rate = s
        }

    update_time ()
        {
        if  (! this._pause)
            {
            // delta is the amount of time to animate over.
            this._pause = this.entity_manager.update_time (this._delta * this._rate, this._loop)

            // *** this._earth.set_earth_rotation (this.entity_manager.time, this.entity_manager.reference_frame, this.entity_manager.coord_system)
            // *** this._earth.update_axes (this.entity_manager.time, this.entity_manager.coord_system, this.entity_manager.reference_frame)
            this.update_grids ()
            // Convert the time into a slider position and update the slider.
            //const new_pos = Math.round (SLIDER_RANGE * (new_time - this.props.start_time) / (this.props.end_time - this.props.start_time)) + SLIDER_LOW_VAL ;
            this._slider_value = this.slider_position_from_time (this.entity_manager.time)

            this.update_camera_to_follow ()

            // Update the Spacecraft Position List
            this.entity_manager.update_sc_pos_list ()

            // Update the bowshock and magnetopause objects
            this._mhd.update (this.entity_manager.time, this.entity_manager.coord_system)
            this._bowshock.update (this.entity_manager.time, this.entity_manager.coord_system)
            }
        }

    slider_position (pos)
        {
        if  (pos !== this._slider_value)
            {
            this._slider_value = pos

            if  (pos <= 1)
                {
                this._slider_value = 1
                }

            if (pos >= this._slider_width)
                {
                this._slider_value = this._slider_width
                }

            // Convert the slider position into a time and update the time.
            this.entity_manager.set_time (this.time_from_slider_position (this._slider_value))

            // *** this._earth.set_earth_rotation (this.entity_manager.time, this.entity_manager.reference_frame, this.entity_manager.coord_system)
            // *** this._earth.update_axes (this.entity_manager.time, this.entity_manager.coord_system,this.entity_manager.reference_frame)
            this.update_grids ()

            this.update_camera_to_follow ()

            // Update the bowshock and magnetopause objects
            this._mhd.update (this.entity_manager.time, this.entity_manager.coord_system)
            this._bowshock.update (this.entity_manager.time, this.entity_manager.coord_system)


            // Update the Spacecraft Position List
            // this.props.update_sc_pos_list ()
            }
        
        }

    set_GS_location (...args)
        {
        // *** this._earth.update_GS_location (...args)
        this.entity_manager.add_GS_to_planet ('EARTH', ...args)
        }

    set_unit (unit)
        {
        this.entity_manager.set_unit ( unit )

        this._axes.set_coord_units (unit)
        this._axes.update_axes ()

        return unit
        }

    update_axes_length (...args)
        {
        console.log ("axes length: ", args [0])

        this._axes.update_axes_length (...args)
        this._axes.update_axes ()
        this._axes_length = this._axes.axes_length
        }

    animate ()
        {
        this._delta = this._clock.getDelta ()

        //console.log (this.scene.children)

        this.update_time ()
        //this.cycle_strobe_shader (STROBE_SHADER_CYCLE)

        this._controls.update ()

        this._renderer.render (this.scene, this._camera)

        this.entity_manager.update_label_view_distance (
            this._camera.position, 
            this._camera.zoom, 
            this._camera.isPerspectiveCamera? true : false,
            this._camera.top? this._camera.top : 0,
            this._display.height,
            this._camera.fov
            )

        this._frame_id =window.requestAnimationFrame (this.animate.bind(this))
        }

    get_screen ()
        {
        return new Screen_Capture (this._display, this._width, this._height)
        }

    set_label_visible (visible = true)
        {
        this._labels_visible_all = visible

        this.entity_manager.set_label_visible (this._labels_visible_all)

        return this._labels_visible_all
        }

    set_sc_label_visible (visible = true)
        {
        this._labels_visible_sc = visible

        this.entity_manager.set_sc_label_visible (this._labels_visible_sc)

        return this._labels_visible_sc
        }

    set_planet_label_visible (visible = true)
        {
        this._labels_visible_planet = visible
        
        this.entity_manager.set_planet_label_visible (this._labels_visible_planet)

        return this._labels_visible_planet
        }

    get_entity_pos (id)
        {
        return this.entity_manager.get (id).get_orbit_pos ()
        }

    get_entity_name (id)
        {
        return this.entity_manager.get (id).name
        }

    get_entity_color (id)
        {
        return this.entity_manager.get (id).color
        }

    init_complete ()
        {
        this._init = true

        return true
        }

    get text_color ()
        {
        return this.entity_manager.text_color 
        }

    get slider_width ()
        {
        return this._slider_width
        }

    get icon_shade ()
        {
        return this.entity_manager.icon_shade
        }

    get width ()
        {
        return this._width
        }

    get unit ()
        {
        return this.entity_manager.unit
        }

    get height ()
        {
        return this._height
        }

    get sc_pos_list ()
        {
        return this.entity_manager.sc_pos_list
        }

    get slider_value ()
        {
        return this._slider_value
        }

    get pause_state ()
        {
        return this._pause
        }

    get start_time ()
        {
        return this.entity_manager.start_time
        }

    get end_time ()
        {
        return this.entity_manager.end_time
        }

    get time ()
        {
        return this.entity_manager.time
        }

    get display ()
        {
        return this._display
        }

    get target_label ()
        {
        return this._target_label
        }

    get coord_system ()
        {
        return this.entity_manager.coord_system
        }

    get terminator_line ()
        {
        return this.entity_manager.terminator_line
        }

    get reference_frame ()
        {
        return this.entity_manager.reference_frame
        }

    get ambient ()
        {
        return this._alight.visible
        }

    get init ()
        {
        return this._init
        }
        
    xz_grid_visible ()
        {
        return this._xz_grid.is_visible ()
        }

    yz_grid_visible ()
        {
        return this._yz_grid.is_visible ()
        }

    xy_grid_visible ()
        {
        return this._xy_grid.is_visible ()
        }

    get_all_sc_id (...args)
        {
        return this.entity_manager.get_all_sc_id (...args)
        }

    hide_all_2D (hide=false)
        {
        if  (hide)
            {
            this._xz_grid.set_grid_visible (false)
            this._yz_grid.set_grid_visible (false)
            this._xy_grid.set_grid_visible (false)
            this._mhd.set_visibility (false)
            this._bowshock.set_visibility (false)

            this._axes.update_axes_length (0)
            this._axes.update_axes ()

            this.entity_manager.set_label_visible (false)
            this.entity_manager.set_orbit_visible (false)

            
            }

        else
            {
            this._xz_grid.set_grid_visible (this._xz_grid_visible)
            this._yz_grid.set_grid_visible (this._yz_grid_visible)
            this._xy_grid.set_grid_visible (this._xy_grid_visible)
            this._mhd.set_visibility (this._mhd_visible)
            this._bowshock.set_visibility (this._bowshock_visible)

            this._axes.update_axes_length (this._axes_length)
            this._axes.update_axes ()

            // alert ("all: " + this._labels_visible_all + " sc: " + this._labels_visible_sc + " planet: " + this._labels_visible_planet)

            if  (! this._labels_visible_sc || ! this._labels_visible_planet)
                {
                // alert ("all: " + this._labels_visible_all + " sc: " + this._labels_visible_sc + " planet: " + this._labels_visible_planet)

                this.entity_manager.set_planet_label_visible (this._labels_visible_planet)
                this.entity_manager.set_sc_label_visible (this._labels_visible_sc)
                }

            else
                {
                this.entity_manager.set_label_visible (this._labels_visible_all)
                }
            
            this.entity_manager.set_orbit_visible (true)
            }
        }

    update_orbit_data (...args)
        {
        this._pause = true

        this._slider_value = 1
    
        // *** this._earth.set_earth_rotation (this.entity_manager.time, this.entity_manager.reference_frame, this.entity_manager.coord_system)
        // *** this._earth.update_axes (this.entity_manager.time, this.entity_manager.coord_system, this.entity_manager.reference_frame)
        this.update_grids ()

        // Update the bowshock and magnetopause objects
        this._mhd.update (this.entity_manager.start_time, this.entity_manager.coord_system)
        this._bowshock.update (this.entity_manager.start_time, this.entity_manager.coord_system)
    
        return this.entity_manager.update (...args)
        }

    set_color (...args)
        {
        return this.entity_manager.set_color (...args)
        }

    set_shape (...args)
        {
        return this.entity_manager.set_shape (...args)
        }

    set_coord_system (system)
        {
        const current = this.entity_manager.coord_system

        this.entity_manager.set_coord_system (system)

        // Check if the default coordinate system changed.  
        // This is bad because it relies on each class of coordinate systems having
        // a unique default unit.  We should probably have a more explicit way 
        // to check this.
        // I doubt this will work for anything other than the Earth and the Sun.
        // The point here is to automatically switch to the central object of the selected coordinate 
        // system.  For instance, switching to the Sun when a Heliocentric coordinate system
        // is selected.
        if (get_default_unit (system) !== get_default_unit (current))
            {
            const unit = get_default_unit (system)

            this.set_unit (unit)

            switch (unit)
                {
                case COORD_Unit.RE :

                    this.update_frame ("EARTH")
                    break

                case COORD_Unit.RS :

                    this.update_frame ("SUN")
                    break

                default:
                }
            }

         // this.update_frame (coord_system_to_frame (this.entity_manager.coord_system))

        // *** this._earth.set_earth_rotation (this.entity_manager.time, this.entity_manager.reference_frame, this.entity_manager.coord_system)
        // *** this._earth.update_axes (this.entity_manager.time, 
        //    this.entity_manager.coord_system,
        //    this.entity_manager.reference_frame)
        this.update_grids ()

        // Update the bowshock and magnetopause objects
        this._mhd.update (this.entity_manager.time, this.entity_manager.coord_system)
        this._bowshock.update (this.entity_manager.time, this.entity_manager.coord_system)
        }

    /* No longer used
    set_reference_frame (...args)
        {
        this.entity_manager.set_reference_frame (...args)

        // *** this._earth.set_earth_rotation (this.entity_manager.time, this.entity_manager.reference_frame, this.entity_manager.coord_system)
        // *** this._earth.update_axes (this.entity_manager.time, 
        //    this.entity_manager.coord_system,
        //    this.entity_manager.reference_frame)
        // alert (this.entity_manager.time)
        this.update_grids ()
        }
    */

    set_ambient_light (val = true)
        {
        this._alight.visible = val
        }

    add_spacecraft (...args)
        {
        return this.entity_manager.add_spacecraft (...args)
        }

    add_planet (...args)
        {
       return  this.entity_manager.add_planet (...args)
        }

    display_terminator (d = true)
        {
        this._alight.intensity = (d)? DIM_AMBIENT_INTENSITY : DEF_AMBIENT_INTENSITY

        return this.entity_manager.display_terminator (d)
        }

    remove  (id)
        {
        const focus = this.entity_manager.get_focus ()

        if  (focus && focus.id === id)
            {
            // Reset the focus to the central object of the current coordinate system.
            this.update_frame (coord_system_to_frame (this.entity_manager.coord_system))
            }

        return this.entity_manager.remove (id)
        }

    set_bg_color (...args)
        {
        this.entity_manager.set_bg_color (...args)
        }

    set_start_time (...args)
        {
        this.entity_manager.set_start_time (...args)
        // *** h.update_axes (this.entity_manager.time, this.entity_manager.coord_system, this.entity_manager.reference_frame) 
        // *** this._earth.set_earth_rotation (this.entity_manager.timem, this.entity_manager.reference_frame, this.entity_manager.coord_system)
        this.update_grids ()

        // Update the bowshock and magnetopause objects
        this._mhd.update (this.entity_manager.time, this.entity_manager.coord_system)
        this._bowshock.update (this.entity_manager.time, this.entity_manager.coord_system)
        }

    get_orbit_coord (...args)
        {
        return this.entity_manager.get_orbit_coord (...args)   
        }

    get_orbit_times (...args)
        {
        return this.entity_manager.get_orbit_times (...args)   
        }

    set_focus (target, ...args)
        {
        
        if  (this.entity_manager.get_all_valid ().includes (target) === false)
            {
            console.log ("3DSpace: set_focus: Target " + target + " not valid.")
            return null
            }
        this._target_label = this.entity_manager.set_focus (target, ...args)

        // Send the focus_event so that camera align can update the target label.  
        // The event itself doesn't specify a new label, this information is queried from 
        // the 3DSpace object by the camera align code.
        document.dispatchEvent (this._focus_change_event)

        console.log ("Setting focus to " + this._target_label)

        // Actually have to focus the camera maybe?
        this.update_camera_to_follow (true)

        return this._target_label
        }

    create_url ()
        {
        const p = []

        const host = window.location.origin  
        const path = window.location.pathname

        p.push ("start=" + SSC_WS.format_Date_to_UTC (this.entity_manager.start_time))
        p.push ("stop=" + SSC_WS.format_Date_to_UTC (this.entity_manager.end_time))

        const sc = this.entity_manager.get_all_sc_id ()

        if  (sc.length > 0)
            {
            p.push ("spacecraft=" + sc.join (';'))
            }

        const url = host + path + "?" + p.join ('&')

        return url
        }

    clear_focus (...args)
        {
        // This needs to return the name of the new focus so that the Manager
        // can update the target label. 

        this.entity_manager.clear_focus ()

        // Reset the focus to the central object of the current coordinate system.
        const new_target = coord_system_to_frame (this.entity_manager.coord_system)

        this.update_frame (new_target)

        return new_target
        }

    set_magnetopause_visible (visible)
        {
        this._mhd.set_visibility (visible)
        this._mhd_visible = this._mhd.visible
        }

    set_bowshock_visible (visible)
        {
        this._bowshock.set_visibility (visible)
        this._bowshock_visible = this._bowshock.visible
        }

    toggle_xz_grid_visible ()
        {
        this._xz_grid.set_grid_visible (! this._xz_grid.is_visible ())
        this._xz_grid_visible = this._xz_grid.is_visible ()
        }

    toggle_yz_grid_visible ()
        {
        this._yz_grid.set_grid_visible (! this._yz_grid.is_visible ())
        this._yz_grid_visible = this._yz_grid.is_visible ()
        }

    toggle_xy_grid_visible ()
        {
        this._xy_grid.set_grid_visible (! this._xy_grid.is_visible ())
        this._xy_grid_visible = this._xy_grid.is_visible ()
        }

    update_xz_grid_options (option, value)
        {
        switch (option) 
            {
            case 'size' : 

                this._xz_grid.set_requested_size (value)
                
                break

            case 'scale' : 

                this._xz_grid.set_scale (value)
                
                break

            case 'offset' : 

                this._xz_grid.set_grid_position (value, this.entity_manager.unit )
                
                break

           default :
                console.log ('Received invalid option: ', option)
            }
        }

    update_yz_grid_options (option, value)
        {
        switch (option) 
            {
            case 'size' : 

                this._yz_grid.set_requested_size (value)
                
                break

            case 'scale' : 

                this._yz_grid.set_scale (value)
                
                break

            case 'offset' : 

            this._xz_grid.set_grid_position (value, this.entity_manager.unit )
            
                break

           default :
                console.log ('Received invalid option: ', option)
            }
        }

    update_xy_grid_options (option, value)
        {
        switch (option) 
            {
            case 'size' : 

                this._xy_grid.set_requested_size (value)
                
                break

            case 'scale' : 

                this._xy_grid.set_scale (value)
                
                break

            case 'offset' : 

            this._xz_grid.set_grid_position (value, this.entity_manager.unit)
            
                break

           default :
                console.log ('Received invalid option: ', option)
            }
        }

    dim_lights (...args)
        {
        return this.entity_manager.dim_lights (...args)
        }

    register_msg_portal (...args)
        {
        this.entity_manager.register_msg_portal (...args)
        }

    set_end_time (...args)
        {
        this.entity_manager.set_end_time (...args)
        }

    n_entities (...args)
        {
        return this.entity_manager.size (...args)
        }

    get_number_sc () 
        {
        return this.entity_manager.get_number_sc ()
        }

    get_all_id (...args)
        {
        return this.entity_manager.get_all_id (...args)
        }
    }

export default display_space