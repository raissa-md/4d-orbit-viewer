export const TITLE = "4D Orbit Viewer"
export const CODE_SORCERESS = "Raissa Woodland"
export const BUILD = "0-2026.04.03.1352"
export const BUILD_DATE = "April 3, 2026"

// Use npm run build to build

// export const SSC_WS_ACCESS = 'https://sscweb-dev.sci.gsfc.nasa.gov/'
// use https://sscweb-dev.sci.gsfc.nasa.gov/4dorbit/
export const SSC_WS_ACCESS = 'https://sscweb.gsfc.nasa.gov/'
// use "https://sscweb.gsfc.nasa.gov/test3017/4dorbit/"

export const MIN_SCREEN_X = 480
export const MIN_SCREEN_Y = 800

export const GH_PANEL_X = 400
export const MIN_SCREEN_X_3PANEL = 1800
export const MIN_SCREEN_X_WIDEPNL = 720

export const ORTHO_CAMERA = 0 
export const PERSP_CAMERA = 1 
export const DEFAULT_CAM = ORTHO_CAMERA 

export const NEAR_PLANE = 1 
//export const FAR_PLANE_PERSP = 10000000 
export const FAR_PLANE_PERSP = 10000000
// const FAR_PLANE_ORTHO = FAR_PLANE_PERSP
// const FAR_PLANE_ORTHO = 20 ;  // Must be changed based on perspective / orthogonal view
export const VFOV = 70      // Vertical Field of View
//export const ORTHO_TARGET_DIST = 20 // Distance of the orthographic camera from the target. 
export const PERSP_TARGET_DIST = 5
export const ORTHO_TARGET_DIST = PERSP_TARGET_DIST * 4
export const INITIAL_ASPECT_RATIO = 2 

// Constants for ambient lighting
export const AMBIENT_COLOR = 0x999999   // Original Value
export const DEF_AMBIENT_INTENSITY = .7
export const DIM_AMBIENT_INTENSITY = .25

const root_style = getComputedStyle (document.documentElement)

const def_button_height = root_style.getPropertyValue("--button_req_height").trim()
const def_button_width  = root_style.getPropertyValue("--button_req_width").trim()

// const def_button_height = "48px"
// const def_button_width  = "48px"

export const DEF_GRID_SIZE = 20 
export const DEF_GRID_SCALE = 1
export const DEF_GRID_OFFSET = 0 

// These values are different from the default spacecraft color, etc. 
export const UNASSIGNED_SC_COLOR = [140, 243, 27]
export const UNASSIGNED_SC_SHAPE = 'cone'
export const UNASSIGNED_ORBIT_STYLE = 'solid'

export const MAX_MESHLINE_PTS = 4000

// number of minutes between time intervals to calculate planet positions.
export const PLANET_ORBIT_INTERVAL = 5  // currently is 30 minutes, was 8 hours
export const DEF_STEP_SIZE = 1000


export const TOP_BUTTON_STYLE = {
    color: "white",
    //minWidth: def_button_width,
    //height: def_button_height,
    margin: "1rem",
    }

// Not currently used 
export const SPDF_BUTTON_STYLE = {
    color: "red",
    //minWidth: def_button_width * 1.2,
    //height: def_button_height * .7,
    marginLeft: "5px",
    marginRight: "5px",
    }

export const SIDE_BUTTON_STYLE = {
    color: "white",
    //\width: def_button_width,
    //height: def_button_height,
    margin: "0.8rem 0.5rem",
    }

export const DARK_ICON_SHADE = 100
export const LIGHT_ICON_SHADE = 0     
export const DARK_TEXT_COLOR = "#111121"
export const LIGHT_TEXT_COLOR = "#EEEEDE"

export const DEF_BACKGROUND_COLOR = "#000000"

export const STROBE_SHADER_CYCLE = 666

export const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
    ]

export const BASE_ANIM_RATE = 7200.0
export const TIME_RATE = 1000

export const DEF_DIALOG_WIDTH = 530
export const DEF_DIALOG_HEIGHT = 510
export const DIALOG_HEIGHT = DEF_DIALOG_HEIGHT

export const DIALOG_SPACE_FACTOR = 1.8

export const EXPORT_DIALOG_WIDTH = 500
export const EXPORT_DIALOG_HEIGHT = DEF_DIALOG_HEIGHT

export const SCREENSHOT_DIALOG_WIDTH = 600
export const SCREENSHOT_DIALOG_HEIGHT = DEF_DIALOG_HEIGHT

export const OPTIONS_DIALOG_WIDTH = DEF_DIALOG_WIDTH
export const OPTIONS_DIALOG_HEIGHT = DEF_DIALOG_HEIGHT

export const HELP_DIALOG_WIDTH = 580
export const HELP_DIALOG_HEIGHT = DEF_DIALOG_HEIGHT

export const MIN_DIALOG_HEIGHT = Math.floor (MIN_SCREEN_Y * .6)
export const MIN_DIALOG_WIDTH = Math.floor (MIN_SCREEN_X * .9)

export const DEF_SC_COLOR = "#FFFF00" 
export const DEF_SC_SHAPE = "sphere" 
export const DEF_ORB_STYLE = "solid"
export const DEF_FOCUS_DISTANCE = 6
export const DEF_FOCUS_DISTANCE_PLANET = 6

export const TT_BGCOLOR = "darkblue" 

export const OVERLAY_NAME_FIELD_SZ = "12rem"

export const DOT_COLOR_PALLETTE_CIRCLE_SIZE = 28
export const DOT_COLOR_PALLETTE_SPACING = 16
export const DOT_COLOR_PALLETE_HEIGHT = DOT_COLOR_PALLETTE_CIRCLE_SIZE * 3 + DOT_COLOR_PALLETTE_SPACING * 2

export const GRID_LINE_HEIGHT = 16  + 20