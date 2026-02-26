import * as THREE from "three"
import { ORTHO_TARGET_DIST } from './constants'


// const DEFAULT_SCALE_FACTOR = 100
// const BASE_SCALE = .055
const ORTHO_SCALE = 2.2
const PERSPECTIVE_SCALE = 2.2
const VIEW_DIST = 20

const DEFAULT_ZOOM = ORTHO_TARGET_DIST / 5

export class sprite_text extends THREE.Sprite

    {
    constructor (text= "", color = 'rgba(255, 255, 255, 1)', view_dist = VIEW_DIST, options = {})
        {
        super () 

        Object.assign (this, {
                    padding : 0,
                    borderWidth : 0,
                    borderRadius : 0,
                    borderColor : 'white',
                    strokeColor : 'white',
                    fontFace : 'system-ui',
                    fontSize : 18,   // Font size in points 
                    fontWeight : 'normal',
                    backgroundColor : false, // no background color
                    }, options)

        this.set_visible = this.set_visible.bind (this)

        this.sizeAttenuation = true // Sprite size affected by perspective by default
        this.material.opacity = 1.0
        this.transparent = true
        
        this.textHeight = this.fontSize * 1.33  // approx height of text in pixels

        this.canvas = new OffscreenCanvas (400, 400)
        this.ctx = this.canvas.getContext('2d')

        this.text = text
        this.color = new THREE.Color (color)
        this.view_dist = view_dist

        this.border = Array.isArray (this.borderWidth) ? 
                this.borderWidth 
                : [this.borderWidth, this.borderWidth]
        this.relative_border = this.border.map (b => b * this.fontSize * 0.1) 

        this.border_radius = Array.isArray(this.borderRadius) ? 
                this.borderRadius 
                : [this.borderRadius, this.borderRadius, this.borderRadius, this.borderRadius] 
        this.rel_border_radius = this.border_radius.map ( b => b * this.fontSize * 0.1)

        this.padding = Array.isArray(this.padding) ? this.padding : [this.padding, this.padding]
        this.rel_padding = this.padding.map (p => p * this.fontSize * 0.1) 

        this.lines = this.text.split ('\n')

        this.font = "".concat(this.fontWeight, " ").concat(this.fontSize, "px ").concat(this.fontFace)
        this.ctx.font = this.font

        this.inner_width = this.max_line_width (this.lines, this.ctx)
        this.inner_height = this.textHeight * this.lines.length

        this.canvas.width = this.inner_width + this.border[0] * 2 + this.padding[0] * 2
        this.canvas.height = this.inner_height + this.border[1] * 2 + this.padding[1] * 2
       
        this.create_text ()
        }

    max_line_width (lines, ctx)
        {
        let max = 0
          
        for (let i = 0; i < lines.length; i++) 
            {
            const line = lines[i]
            const width = ctx.measureText(line).width

            if  (width > max) 
                {
                max = width
                }
            }

        return max
        }

    clear_canvas ()
        {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }

    write_text_to_canvas ()
        {
        // Set font again after canvas is resized, as context properties are reset
        this.ctx.font = this.font

        this.ctx.fillStyle = this.color.getStyle ()
        this.ctx.textBaseline = 'bottom'

        this.lines.forEach ((line, index) =>
            {
            const line_x = (this.inner_width - this.ctx.measureText(line).width) / 2
            const line_y = (index + 1) * this.fontSize 

            this.ctx.fillText(line, line_x, line_y)
            })
        }

    inject_texture_to_sprite ()
        {
        if (this.material.map) this.material.map.dispose () 

        const texture = this.material.map = new THREE.CanvasTexture (this.canvas)

        texture.minFilter = THREE.LinearFilter
        texture.colorSpace = 'srgb'
        // texture.colorSpace = THREE.SRGBColorSpace // THREE.SRGBColorSpace
        this.material.map = texture
        this.material.sizeAttenuation = this.sizeAttenuation
        texture.needsUpdate = true
    
        }

    create_text ()
        {
        // paint text
        this.write_text_to_canvas ()
        
        // Inject canvas into sprite
        this.inject_texture_to_sprite ()

        this.y_scale = this.textHeight * this.lines.length + this.border[1] * 2 + this.padding[1] * 2
        this.x_scale = this.y_scale * this.canvas.width / this.canvas.height

        
        this.set_text_scale ()
        }

    set_visible (state=true)
        {
        if  (state)
            {
            this.material.opacity = 1.0
            }

        else
            {
            this.material.opacity = 0.0
            }
        }

    clone (recursive) 
        {
        return new this.constructor(this.text, this.textHeight, this.color).copy(this)
        }

    set_text_scale (zoom=DEFAULT_ZOOM, perspective = false, top = 1, vpHeight, fov = 50)
        {
        // Visible world height at the object's distance from the camera
        let vw_height = 0

        if  (! perspective)
            {
           // Orthographic world height in world units (after zoom)
            vw_height = top * 2 / zoom  // top - bottom = 2 * top usually          

            // vw_height *= ORTHO_SCALE
            }   
  
        else
            {
            // Vertical FOV in radians
            const v_fov = fov * Math.PI / 180
        
            // Visible world height at that distance
            vw_height  = 2 * Math.tan (v_fov / 2) * this.view_dist

            // vw_height *= PERSPECTIVE_SCALE
            }

        // Desired world height to match pixel size
        const scale = this.y_scale * (vw_height / vpHeight)

        // Scale the text sprite
        this.scale.set ((this.x_scale / this.y_scale) * scale, scale, 1)
        }

    set_color (color)
        {
        this.color = new THREE.Color (color)

        this.clear_canvas ()
        this.write_text_to_canvas ()
        this.inject_texture_to_sprite ()
        }

    set_view_distance (camera_pos = new THREE.Vector3 (), ...args)
        {
        this.view_dist = this.parent.position.distanceTo (camera_pos)


        this.set_text_scale  (...args)
        }

    dispose ()
        {
        if (this.material.map) this.material.map.dispose () 
        this.material.dispose ()
        }
        
    copy (source, recursive) 
        {
        // three.Sprite.prototype.copy.call(this, source)
    
        this.color = source.color;
        this.backgroundColor = source.backgroundColor;
        this.padding = source.padding;
        this.borderWidth = source.borderWidth;
        this.borderColor = source.borderColor;
        this.fontFace = source.fontFace;
        this.fontSize = source.fontSize;
        this.fontWeight = source.fontWeight;
        this.strokeWidth = source.strokeWidth;
        this.strokeColor = source.strokeColor;
    
        return this;
        }

    }


export default sprite_text