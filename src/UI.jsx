import React from "react";
import "./UI.css";

function build_font_string (...args)
    {
    let size = '10px'
    let family = 'sans-serif'
    let style = 'normal'
    let weight = 'normal'
    let variant = 'normal'
    let stretch = 'normal'
    let lineHeight
    

    if  (args.length === 1 && typeof args[0] === 'object')
        {
        args [0].size      && (size       = args[0].size)
        args [0].family    && (family     = args[0].family)
        args [0].style     && (style      = args[0].style)
        args [0].weight    && (weight     = args[0].weight)
        args [0].variant   && (variant    = args[0].variant)
        args [0].stretch   && (stretch    = args[0].stretch)
        args [0].lineHeight&& (lineHeight = args[0].lineHeight)
        }

    else
        {
        size        = args[0] || size
        family      = args[1] || family
        style       = args[2] || style
        weight      = args[3] || weight
        variant     = args[4] || variant
        stretch     = args[5] || stretch
        lineHeight  = args[6] || lineHeight
        }
    
    const font_size = lineHeight? `${size}/${lineHeight}` : size 

    return [
        style,
        variant,
        weight,
        stretch,
        font_size,
        family
        ].join(' ') ;
    }


function parse_padding (padding) 
    {
    if (typeof padding !== "string") return null

    const parts = padding.trim().split(/\s+/)

    let top, right, bottom, left

    switch (parts.length) 
        {
        case 1:
            top = right = bottom = left = parts[0]
            break

        case 2:
            top = bottom = parts[0]
            right = left = parts[1]
            break

        case 3:
            top = parts[0];
            right = left = parts[1]
            bottom = parts[2]
            break

        case 4:
            [top, right, bottom, left] = parts
            break
            
        default:
            return null
        }

    return { top, right, bottom, left }
    }

function parse_css_size (value = '0px')
    {
    // If it's a number, assume pixels
    if  (typeof value === "number" && isFinite (value)) 
        {
        return { number: value, unit: "px" }
    }

    // If it's not a string at this point, just return it unchanged
    if  (typeof value !== "string") 
        {
        return value
        }

    const trimmed = value.trim ()

    const match = trimmed.match (/^([+-]?\d*\.?\d+)\s*([a-z%]*)$/i)

    if  (! match)
        {
        // Can't parse it — return original input
        return value
        }

    const number = parseFloat (match [1])
    const unit = match [2] || "px"

    return { number, unit }
    }

function set_anchor_point (pos="center")
    {
    const r = {top: .5, left: .5}

    switch (pos.toLowerCase ())
        {
        case "center":
            return r 

        case "top":
            r.top = 0
            r.left = .5
            //r.y_offset = 0
            //r.x_offset = -.5
            return r 

        case "top-right":
            r.top = 0
            r.left = 1
            //r.x_offset = -1
            //r.y_offset = 0
            return r 

        case "right":
            r.top = .5
            r.left = 1
            //r.x_offset = 0
            //r.y_offset = -.5
            return r

        case "bottom-right":
            r.top = 1
            r.left = 1
            //r.x_offset = -1
            //r.y_offset = -1
            return r

        case "bottom":  
            r.top = 1
            r.left = .5
            //r.x_offset = -.5
            //r.y_offset = -1
            return r

        case "bottom-left":
            r.top = 1
            r.left = 0
            //r.x_offset = 0
            //r.y_offset = -1
            return r

        case "left":
            r.top = .5
            r.left = 0
            //r.x_offset = 0
            //r.y_offset = -.5
            return r

        case "top-left":
            r.top = 0 
            r.left = 0
            //r.x_offset = 0
            //r.y_offset = 0
            return r

        default:
            return r
        }
    }

function position_to_transform (pos, offset = "100px")
    {
    if  (! pos) return {}

    const {number:scalar, unit} = parse_css_size (offset)

    const r = {dx: 0, dy: 0, x_ratio: 0, y_ratio: 0, unit: unit}

    switch (pos.toLowerCase ())
        {
        case "center":
            r.x_ratio = -0.5
            r.y_ratio = -0.5
            break

        case "top":
            r.dy = -scalar
            r.x_ratio = -0.5
            r.y_ratio = -1.0
             break

        case "top-right":
            r.dx = scalar * Math.sqrt (2) / 2
            r.dy = -scalar * Math.sqrt (2) / 2
            r.x_ratio = 0
            r.y_ratio = -1.0
            break
            
        case "right":
            r.dx = scalar
            r.x_ratio = 0
            r.y_ratio = -0.5
            break

        case "bottom-right":
            r.dx = scalar * Math.sqrt (2) / 2
            r.dy = scalar * Math.sqrt (2) / 2
            r.x_ratio = 0
            r.y_ratio = 0
            break

        case "bottom":
            r.dy = scalar
            r.x_ratio = -.5
            r.y_ratio = 0
            break

        case "bottom-left":
            r.dx = -scalar * Math.sqrt (2) / 2
            r.dy = scalar * Math.sqrt (2) / 2
            r.x_ratio = -1.0
            r.y_ratio = 0
            break

        case "left":
            r.dx = -scalar
            r.x_ratio = -1.0
            r.y_ratio = -0.5
            break

        case "top-left":
            r.dx = -scalar * Math.sqrt (2) / 2
            r.dy = -scalar * Math.sqrt (2) / 2
            r.x_ratio = -1.0
            r.y_ratio = -1.0
            break

        default:
            r.x_ratio = -0.5
            r.y_ratio = -0.5
            break
        }

    console.log ("position_to_transform result: ", JSON.stringify(r))

    return r
    }

function make_transform_string (...args)
    {
    let dx = 0
    let dy = 0
    let x_ratio = .5
    let y_ratio = .5
    let unit = "px"

    if  (args.length === 1 && typeof args[0] === 'object')
        {
        dx = args[0].dx ?? dx
        dy = args[0].dy ?? dy
        x_ratio = args[0].x_ratio ?? x_ratio
        y_ratio = args[0].y_ratio ?? y_ratio
        unit = args[0].unit ?? unit 
        }

    else
        {
        dx = args[0] ?? dx
        dy = args[1] ?? dy
        x_ratio = args[2] ?? x_ratio
        y_ratio = args[3] ?? y_ratio
        unit = args[4] ?? unit
        }

    const x_offset = Math.round (dx * 100) / 100
    const y_offset = Math.round (dy * 100) / 100
    const x_base = (x_ratio * 100).toString () + "%"
    const y_base = (y_ratio * 100).toString () + "%"
    
    const r = `translate(calc(${x_base} + ${x_offset}${unit}), calc(${y_base} + ${y_offset}${unit}))`

    return r
    }

function position_to_CSS (target_pos, offset="100px", anchor_pos="center")
    {
    if  (! target_pos) return {}   

    const {top, left} = set_anchor_point (anchor_pos)

    const new_transform =  make_transform_string (position_to_transform (target_pos, offset))

    const style = {transform: new_transform} 

    style.position = "absolute" 
    style.top = (top * 100).toString () + "%"
    style.left = (left * 100).toString () + "%"

    console.log ("anchor_pos: ", anchor_pos, " top: ", style.top, " left: ", style.left)
    console.log ("target_pos: ", target_pos, " new_transform: ", new_transform)

    return style 
    }

function measure_text_width (text, font) 
    {
    const canvas = new OffscreenCanvas (1, 1)
    const ctx = canvas.getContext ('2d')
    ctx.font = font

    console.log ("measuring text:", text, "with font:", font)

    const w = ctx.measureText ('Y').width

    const r = w * text.length

    console.log ("character width", w, "estimated width", r)

    return r
    }

function compute_box_width (text, max_width, font = '10px sans-serif')
    {
    const natural_width = measure_text_width (text, font)

    console.log ("natural width", natural_width, "max width", max_width)

    return Math.min (natural_width, parseInt (max_width)) 
    }

export class V_Button extends React.Component 
    {
    static defaultProps = {
        disabled: false,
        tabIndex: 0,
        style: {},
        className: "",
        alt: "button",
        size: "standard",
        image: null,
        label: null,
        onClick: null,
        onContextMenu: null,
        onMouseOver: null,
        onMouseLeave: null,
        toggle: false,
        dark: 0,  // this value will eventually be truthy/falsy
        } ;

    render() 
        {
        const {
            disabled,
            tabIndex,
            alt,
            image,
            dark,
            toggle,
            onClick,
            onContextMenu,
            onMouseOver,
            onMouseLeave,
            style,
            className,
            ...rest
            } = this.props ;

        const merged = {
            background: "transparent",
            border: "none",
            padding: "0",
            display: "flex",
            width: null,
            height: null,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "10px",
            marginRight: "10px",
            marginTop: "10px",
            marginBottom: "10px",
            cursor: disabled ? "not-allowed" : "pointer",
            ...style,
            };

        let btn_size = ""
        let effect = ""
        let payload = null

        if  (merged.width === null && merged.height === null)
            {
            switch (this.props.size)
                {
                case "small":
                    btn_size = "VUI-btn-small" 
                    break 

                case "large":
                    btn_size = "VUI-btn-large" 
                    break 

                case "medium":
                    btn_size = "VUI-btn-med" 
                    break 

                case "spdf":
                    btn_size = "VUI-btn-spdf" 
                    break

                case "fit":
                    merged.width = "fit-content"
                    merged.height = "fit-content"
                    break

                case "full":
                    merged.width = "100%"
                    merged.height = "100%"
                    break

                case "standard":
                    btn_size = "VUI-btn-standard" 
                    break

                default:
                    break 
                }
            }

        if  (toggle)
            {
            effect += "VUI-btn-selected "
            }

        if  (dark > 0)
            {
            effect += "VUI-btn-dark-mode "
            }

        if  (this.props.label)
            {
            payload = this.props.label
            }

        if  (this.props.image)
            {
            payload = 
                <img 
                    src={image}
                    alt={alt}
                    className={`${btn_size} ${effect}`}
                    /> ;
            }

        return (
            <button
                disabled={disabled}
                onClick={onClick}
                onContextMenu={onContextMenu}
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
                style={merged}
                className={`VUI-btn ${btn_size} ${className || ""}`}
                {...rest}
                >
                {payload}
            </button>
            )  ;
        }   
    }

export class V_Modal extends React.Component 
    {
    componentDidMount () 
        {
        document.addEventListener("keydown", this.handleKey)
        document.body.style.overflow = "hidden"
        }

    componentWillUnmount () 
        {
        document.removeEventListener("keydown", this.handleKey)
        document.body.style.overflow = ""
        }

    handleKey = (e) => {
        if  (e.key === "Escape") 
            {
            this.close ()
            }
        }

    close = () => {
        if  (this.props.onClose) 
            {
            this.props.onClose ()
            }
        }

    render_action_button = (btn, idx, n_buttons) => {
        if (!btn) return null

        // Default styles for the cancel button but only if two buttons are present
        let def_color = "rgba(20, 20, 20, 1)"
        let def_background = "transparent"
        let def_border = "1px solid rgba(20, 20, 20, 0.5)" 

        // If this is the second button or only button, make it the primary action button style
        if  (idx === 1 || n_buttons === 1)
            {
            def_color = "white"
            def_background = "rgb(65,102,245)"
            def_border = "1px solid rgb(65,102,245)"
            }

        const { label, onClick, style } = btn

        const merged = {
            background: def_background,
            color: def_color,
            border: def_border,
            borderRadius: "4px",
            padding: "0.4rem 0.9rem",
            marginLeft: "10px",
            marginRight: "10px",
            marginTop: "10px",
            marginBottom: "10px",
            cursor: "pointer",
            ...style,
            };

        return (
            <V_Button
                size="fit"
                key={idx}
                style={merged}
                onClick={onClick || this.close}
                label={label || "Close"}
                />);
        }

    render () 
        {
        const {
            title = null,
            content = null,
            width = "500px",
            height = "auto",
            fontSize = "medium",
            fontWeight = 500,
            fontFamily= "Roboto, Lato, Ubuntu, Nunito, Manrope, sans-serif",
            color = "rgba(0, 0, 0, 0.88)",
            background = "rgb(245, 245, 245)",
            titleColor = color,
            titleFont = "inherit",
            overflow_x = "hidden",
            buttons = [],
            ref = null,
            } = this.props 

        const button_list = buttons.slice (0, 2)

        const create_buttons = button_list.map ((btn, index, arr) => {
            return this.render_action_button (btn, index, arr.length);
            });

        let footer = null

        if  (buttons.length > 0) 
            {
            footer = (
                 <footer className="VUI-modal-footer">
                    {create_buttons}
                </footer>);
                }

        return (
            <div className="VUI-modal-backdrop" onClick={this.close} ref={ref}>
                <div
                    className="VUI-modal-container"
                    onClick={e => e.stopPropagation()}
                    style={{ width, height, background, color, fontSize, fontFamily, fontWeight}}
                    >

                    <header
                        className="VUI-modal-header"
                        style={{ color: titleColor, fontFamily: titleFont }}
                        >

                        <span>{title}</span>
                        <button className="VUI-modal-close" onClick={this.close}>×</button>
                    </header>

                    <div className="VUI-modal-body" style={{overflowX: overflow_x}}>
                        {content}
                    </div>

                    {footer}
                </div>
            </div>);
        }   
    }


export class V_Checkbox extends React.Component 
    {
    handle_change = (event) => {
        const { name, index, onChange } = this.props
        const checked = event.target.checked

        if  (onChange) 
            {
            onChange (name, index, checked) ;
            }
        } ;

    render () 
        {
        const 
            {
            checked = false,
            disabled = false,
            offset = ".5em",
            label
            } = this.props;

        const checkbox_label = label ? 
                <span style={{marginLeft: offset}} className="VUI-checkbox-label">
                    {label}
                </span>
                : null ;

        return (
            <label className="VUI-checkbox-container">
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={this.handle_change}
                    />

                <span className="VUI-checkbox-box" />

                {checkbox_label}
            </label>
            );
        }
    }

export class V_Radio_Button extends React.Component 
    {

    handleChange = (event) => {
        const { name, onChange } = this.props;

        if  (onChange) 
            {
            onChange (name, event.target.value === "on");
            }
        };

    render () 
        {
        const {
            checked = false,
            disabled = false,
            required = false,
            offset = ".5em",
            group = "radio_group",
            label,
            } = this.props;

        const radio_label = label ? 
                <span style={{marginLeft: offset}} className="VUI-radio-label">
                    {label}
                </span>
                : null ;

        return (
            <label className="VUI-radio-container">
                <input
                    type="radio"
                    name={group}
                    checked={checked}
                    disabled={disabled}
                    onChange={this.handleChange}
                    required={required}
                    />

                <span className="VUI-radio-dot" />

                {radio_label}
            </label>
            );
        }
    }

export class V_Dropdown extends React.Component 
    {
    constructor (props) 
        {
        super(props)

        this.state = {
            open: false,
            context_pos: null // { x, y } when trigger = contextmenu
            };

        this.ref = React.createRef ()
        }

    componentDidMount () 
        {
        document.addEventListener ("mousedown", this.handle_mouse_down)
        document.addEventListener ("keydown", this.handle_key_down)
        }

    componentWillUnmount () 
        {
        document.removeEventListener ("mousedown", this.handle_mouse_down)
        document.removeEventListener ("keydown", this.handle_key_down)
        }

    handle_mouse_down = (event) => {
        const root = this.ref.current

        if  (! root) return

        if  (! root.contains (event.target)) 
            {
            this.close_menu ({ reason: "outside-click", event })
            }
        }

    handle_key_down = (event) => {
        if  (event.key === "Escape")
            {
            this.close_menu ({ reason: "escape", event })
            }
        }

    set_open_state = (open, info = {}) => {
        const { onOpenChange, name } = this.props
        const is_open = this.state.open

        if  (open !== is_open)
            {
            this.setState ({ open: open }, () => {
                if  (onOpenChange) 
                    {
                    onOpenChange (open, name, info)
                    }
                })
            }
        }

    open_menu = (info) => {
        this.set_open_state (true, info)
        }

    close_menu = (info) => {
        this.set_open_state (false, info)
        }

    // Trigger handlers
    click_trigger = (event) => {
        event.preventDefault ()
        
        if (this.state.open)
            {
            this.close_menu ({reason: 'click', event: event})
            }
        else
            {
            this.open_menu ({reason: 'click', event: event})
            }   
        }

    handle_mouse_enter = (event) => {
        this.open_menu ({reason: 'hover', event: event})
        }

    handle_mouse_leave = (event) => {
        this.close_menu ({reason: 'hover', event: event})
        }

    context_menu_trigger = (event) => {
        event.preventDefault ()

        this.open_menu ({reason: 'contextmenu', event: event}) 
        };

    // Menu click behavior (optional)
    menu_click = (event) => {
        const { close_on_select } = this.props

        if  (! close_on_select) return

        // Only close if the click was on something that looks like a “menu item”.
        // You can mark elements with data-dropdown-item="true".
        const target = event.target
        const item = target.closest ? target.closest('[data-dropdown-item]') : null

        if  (item) 
            {
            this.close_menu ({ reason: "item-click", event })
            }
        }

    render () 
        {
        const {
            trigger = "click", // "click" | "hover" | "contextmenu"
            anchor,     // function ({ open }) => ReactNode
            dropdown,          // menu content
            align = "bottom",    // "top" | "top-right" | "right" | etc. 
            width = "auto",
            background = "#1e1f22",
            border = "1px solid rgba(255,255,255,0.12)",
            padding = "6px",
            visible = true,
            gap = "4px",
            offset = "1em",
            zIndex = 9999,
            name = "",
            } = this.props ;

        const { open, context_pos } = this.state

        // Decide which handlers apply
        let anchor_props = {}

        if  (trigger === "click") 
            {
            anchor_props.onClick = this.click_trigger;
            } 
            
        else if (trigger === "hover") 
            {
            anchor_props.onMouseEnter = this.handle_mouse_enter;
            anchor_props.onMouseLeave = this.handle_mouse_leave;
            } 
            
        else if (trigger === "contextmenu") 
            {
            anchor_props.onContextMenu = this.context_menu_trigger;
            }

        // Menu positioning
        // - click/hover: positioned relative to wrapper
        // - contextmenu: positioned fixed at cursor
        let dropdown_style = {
            width: width,
            background: background,
            border: border,
            padding: padding,
            gap: gap,
            zIndex: zIndex,
            ...position_to_CSS (align, offset)
            }            

        const container = {}

        // For hover, keep menu open while hovering the whole wrapper (trigger + menu)
        if  (trigger === "hover") 
            {
            container.onMouseEnter = this.handle_mouse_enter;
            container.onMouseLeave = this.handle_mouse_leave;
            }

        const menu = (open && visible) ? 
            <div className="VUI-dropdown-menu" 
                style={dropdown_style} 
                onClick={this.menu_click}
                >
                {dropdown}
            </div>
            : null ;

        return (
            <div className="VUI-dropdown-root" 
                ref={this.ref} 
                {...container}
                >

                <div className="VUI-dropdown-trigger" 
                    {...anchor_props}
                    >
                    {anchor ? anchor ({ open: open }) : null}
                </div>

                {menu}

            </div>
            ) ;
        }
    }

export class V_Tooltip extends React.Component 

    {
    static 
        {
        const element = document.getElementById ("root")
        const computed_style = window.getComputedStyle (element)

        this.doc_font_style = computed_style ['font-style']
        this.doc_font_weight = computed_style ['font-weight']
        this.doc_font_size = computed_style ['font-size']
        this.doc_font_family = computed_style ['font-family']
        this.doc_font_variant = computed_style ['font-variant']
        this.doc_font_stretch = computed_style ['font-stretch']

        console.log ("Font-Variant:", this.doc_font_variant)
        console.log ("Font-Stretch:", this.doc_font_stretch)

       }

    static defaultProps = {
        align: "top",
        offset: "100px",
        font_size: "16px",
        font_family: 'system-ui',
        font_style: V_Tooltip.doc_font_style,
        font_weight: V_Tooltip.doc_font_weight,
        background: "#111827",
        color: "#f9fafb",
        padding: "8px 12px",
        active: true,
        display: false,
        anchor_point: "",
        maxwidth: 250,
        } ;

    constructor (props) 
        {
        super (props)

        this.state = {
            visible: false,
            text_width: 0,
            } ;

        this.tooltip_ref = React.createRef ()
        this.anchor_ref = React.createRef ()

        this.render = this.render.bind (this)
        this.componentDidUpdate = this.componentDidUpdate.bind (this)
        this.componentDidMount = this.componentDidMount.bind (this)
        }   

    show = () => {
        this.setState ({ visible: true })
        } ;

    hide = () => {
        this.setState ({ visible: false })
        } ;

    toggle = () => {
        this.setState (prev => ({ visible: !prev.visible }))
        } ;

    set_tooltip_width = (maxwidth = 250) => {

        // const { left, right } = parse_padding (padding) || {}

        // const new_width = compute_box_width (text, max_width, font_string) + parseInt (left) + parseInt (right)


        if  (this.tooltip_ref.current.style.visibility === "hidden")
            {
            const new_text_width = this.tooltip_ref.current.clientWidth

            const width= Math.min (new_text_width, parseInt (maxwidth))

            this.tooltip_ref.current.style.width = width + "px"
            this.tooltip_ref.current.style.whiteSpace = "normal"
            this.tooltip_ref.current.style.visibility = "visible"

            this.setState ({text_width: new_text_width})

            return width
            }

        return undefined
        }

    componentDidMount ()
        {
        if  (this.tooltip_ref?.current) 
            {
            // I don't think this ever gets called   
            this.set_tooltip_width (this.props.maxwidth)
            }
        }

    componentDidUpdate (prevProps)
        {
        if  (this.tooltip_ref?.current) 
            {
            this.set_tooltip_width (this.props.maxwidth)

            if  (prevProps.align !== this.props.align || prevProps.offset !== this.props.offset)
                {
                const {align, offset} = this.props

                const transform = this.tooltip_ref.current.style.transform

                console.log (">>>> current transform: ", transform)

                const new_transform =  make_transform_string (position_to_transform (align, offset))

                console.log (">>>> new transform: ", new_transform)

                // Update the transform only if it has changed.
                // This prevents unnecessary style updates which can cause jank.
                // Also, sometimes the transform is undefined initially.
                if  (transform !== new_transform)
                    {
                    this.tooltip_ref.current.style.transform = new_transform
                    console.log ("Updating tooltip transform")
                    }
                    
                }
            }
        }            

    render() 
        {
        const {
            text,
            align,
            offset,
            font_size,
            font_family,
            font_style,
            font_weight,
            background,
            color,
            padding,
            display,
            active,
            children
            } = this.props;

        const visible = (this.state.visible && active) || display

        const anchor_point = (this.props.anchor_point)? this.props.anchor_point : align

        return (
            <div
                className="tooltip-wrapper"
                onMouseEnter={this.show}
                onMouseLeave={this.hide}
                onFocus={this.show}
                onBlur={this.hide}
                tabIndex={0}
                >
                {children}

                {visible && (
                <div
                    ref={this.tooltip_ref}
                    className={`tooltip-bubble`}
                    style={{
                        background: background,
                        color: color,
                        padding: padding,
                        fontSize: font_size,
                        fontFamily: font_family,
                        fontStyle: font_style,
                        fontWeight: font_weight,
                        visibility: 'hidden',
                        whiteSpace: "nowrap",
                        ...position_to_CSS (align, offset, anchor_point),
                        }}
                    >
                    {text}
                </div>
                )}
            </div>
            ) ;
        }
    }