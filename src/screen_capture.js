import { V3DSpace } from './App.jsx'
import { epoch_to_date_time } from './Orbit_Display'
import { system_time } from './entity_manager.js'

import { TIME_RATE } from './constants.js'

const capture_mode =
    {
    UNKNOWN: 0,
    STREAM: 1,
    IMAGE: 2,
    RENDER: 3
    }

export const CAPTURE_Mode = Object.freeze (capture_mode)

const MAX_REC_TIME = 30
const DEFAULT_FPS = 30

/*
        const render_frame = (current_time) => {

            if  (current_time >= video_end) 
                {
                this.recorder.stop()
                space.entity_manager.set_time(saved_time)
                if (!saved_pause) space.play()
                space.start_event_loop()    // hand control back
                return
                }

            // Advance sim to exact time
            space.entity_manager.set_time(current_time)
            space.update_grids()
            space._mhd.update(space.entity_manager.time, space.entity_manager.coord_system)
            space._bowshock.update(space.entity_manager.time, space.entity_manager.coord_system)
            space.update_camera_to_follow()

            // Render this frame
            space._controls.update()
            space._renderer.render(space.scene, space._camera)

            // Schedule next frame
            requestAnimationFrame(() => render_frame(current_time + sim_step_ms))
            }
*/

const audio_context = new AudioContext ()

export const wait_ms = (ms, callback) => {

    // Arbitrary high precision time stamp in seconds.  May be accuracy limited by 
    // the browser (2ms on Firefox), but should be more accurate than setTimeout.
    const t = audio_context.currentTime + ms / 1000

    // Create a silent audio buffer.  Single channel, 1 sample, sample rate of the audio context.  
    // This is just a placeholder to create a buffer source node that we can use to schedule the callback.
    const buf = audio_context.createBuffer (1, 1, audio_context.sampleRate)

    // Create the audio node that will 'play' the silent buffer.  
    const node = audio_context.createBufferSource ()

    // Set it to play the silent buffer.  
    node.buffer = buf

    // Connect the node to the audio context destination.  This is necessary to ensure that
    // the node is processed and the onended event fires.
    node.connect (audio_context.destination)

    // Callback function to be called when the node finishes playing 
    // (which will be almost immediately since the buffer is silent and only 1 sample long). 
    node.onended = callback

    // When to start playing the node.  Effectively acts as a high precision timer since the audio buffer
    // is only 1 sample long and silent
    node.start (t)
    }

export const render_anim_frame = (time = 0, frame_count = 0, ms_per_frame = 1000 / DEFAULT_FPS) => {

    if  (frame_count > 0)
        {
        V3DSpace.animate (time)

        const next_time = time + ms_per_frame

        wait_ms (ms_per_frame, () => {
            render_anim_frame (next_time, frame_count - 1, ms_per_frame)
            })

        return 
        }

    // Animation is done.  Trigger an event or something to let the caller know.
    const event = new CustomEvent ("render_complete", { bubbles: true, detail: { final_time: time - ms_per_frame } })

    window.dispatchEvent (event)

    return  // not needed but WTF. 
    }


export const render_animation = (time_start = 0, frame_count = 0, ms_per_frame = 1000 / DEFAULT_FPS) => {

    // Make sure the input parameters are valid.  We need a positive frame count and start time.
    if  (frame_count <= 0 || time_start <= 0)
        {
        return Promise.reject (new Error ("Invalid frame count or start time"))
        }

    // Basically just a wrapper around render_anim_frame.  Returns a promise that resolves 
    // when the animation is done.
    return new Promise ((resolve) => {
        const on_render_complete = (event) => {
            window.removeEventListener("render_complete", on_render_complete);
            resolve(event.detail.final_time);
            };

        window.addEventListener("render_complete", on_render_complete);
        render_anim_frame (time_start, frame_count, ms_per_frame);
        });
    }

class Screen_Capture 
    {
    constructor (display, W=256, H=256, fps=DEFAULT_FPS)
        {
        this.chunks = []
        this.timer_id = null 
        this.video_blob = null
        this.req_interval = 1000 // ms
        this.req_timer = null 
        this.stop_flag = false
        this.start_time = 0
        this.fps = fps
        
        this.compost = new OffscreenCanvas (W, H).getContext('2d')
        this.capture = new OffscreenCanvas (W, H).getContext('2d')
        this._display = display 
        this._mode = CAPTURE_Mode.IMAGE

        this.Hd = H
        this.Wd = W

        // Stream captures a frame every time the the canvas is updated.  
        this.stream = this._display.captureStream ()
        // MediaRecorder captures the stream and encodes it as a video.  
        // MediaRecorder.start () begins the recording
        // MediaRecorder.stop () ends the recording and makes the video data available in 
        //      the ondataavailable event handler.
        // MediaRecorder.requestData () forces the ondataavailable event to fire immediately, 
        //      making the video data available in the event handler.
        // We can use this to save the video data as it is being recorded.
        this.recorder = new MediaRecorder (this.stream, { mimeType: 'video/webm' })

        // Definition needs to be moved into start_recording if I want the ondataavailable()
        // function to be used.
        this.recorder.ondataavailable = (event) => {
            // console.log ('video')
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

    async render_animation ()
        {
        if  (this._is_rendering)
            {
            return
            }

        // How long should the video created by the animation render last in ms.
        const delta = V3DSpace.end_time - V3DSpace.start_time 

        // Total number of frames to render for this animation.  
        const n_frames = Math.ceil ((delta / TIME_RATE) / this.fps)

        // Do I want this in seconds or ms?  MS makes more sense.
        const frame_time = 1000 / this.fps 

        this._mode = CAPTURE_Mode.RENDER

        // Stop any currently playing animation
        V3DSpace.pause ()

        // Force the display back to the beginning of the animation.
        V3DSpace.set_time (V3DSpace.start_time)

        // Stop the animation loop so we can drive it ourselves.
        V3DSpace.stop_event_loop ()

        // Do the rendering.  This will drive the animation loop ourselves and capture 
        // each frame as it is rendered.
        const final_time = await render_animation (V3DSpace.start_time, n_frames, frame_time)

        // Do our cleanup here and restart the animation loop.  

        // .... not implemented yet

        return final_time
        }

    // Note: methods like start_recording and stop_recording should eventually be
    // renamed to start_streaming and stop_streaming, etc.
    // Or maybe start_stream_record ...
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


    /*

    // DO NOT USE THIS.  This is just example code that I copied from the web.  
    // It is not integrated with the rest of the Screen_Capture class and is not tested.  
    // It is just here for reference for how to drive the animation loop ourselves to
    // capture a video of a specific time range.
    async start_range_recording(space, video_start, video_end, options = {}) 
        {
        const { fps = 30, speed = 1 } = options

        const sim_duration_ms = video_end - video_start
        const sim_step_ms     = (1000 / fps) * speed   // sim ms to advance per frame

        // Save state
        const saved_time  = space.entity_manager.time
        const saved_pause = space.pause_state

        // Stop the live loop
        space.stop_event_loop()
        space.entity_manager.set_time (video_start)

        // Start recording
        this.chunks.length = 0
        this.recorder.start()
        this._mode = CAPTURE_Mode.STREAM

        // Drive the render loop ourselves
        const render_frame = (current_time) => {

            if  (current_time >= video_end) 
                {
                this.recorder.stop()
                space.entity_manager.set_time(saved_time)
                if (!saved_pause) space.play()
                space.start_event_loop()    // hand control back
                return
                }

            // Advance sim to exact time
            space.entity_manager.set_time(current_time)
            space.update_grids()
            space._mhd.update(space.entity_manager.time, space.entity_manager.coord_system)
            space._bowshock.update(space.entity_manager.time, space.entity_manager.coord_system)
            space.update_camera_to_follow()

            // Render this frame
            space._controls.update()
            space._renderer.render(space.scene, space._camera)

            // Schedule next frame
            requestAnimationFrame(() => render_frame(current_time + sim_step_ms))
            }

        requestAnimationFrame(() => render_frame(video_start))
        }
    */

    capture_video ()
        {
        this._mode = CAPTURE_Mode.STREAM
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
        this._mode = CAPTURE_Mode.IMAGE 

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
        if  (this._mode === CAPTURE_Mode.STREAM)
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
        return this._mode === CAPTURE_Mode.STREAM
        }

    get recording ()
        {
        return this.is_recording ()
        }

    }

export default Screen_Capture