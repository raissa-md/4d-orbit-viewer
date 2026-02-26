export const chooser_help =
`
# Main Menu Help

The main menu panel lets you select the observatory orbits you wish to display and the period during which you want to view them.

See the following sections below for more information about using the controls.

### Start of Display Interval 

Use the Date and Time selection controls to select the starting day and time of the displayed time interval. The date and time chosen can be no later than the end of the displayed time interval.   

The display time interval is the time period over which observatory orbits will be graphed.

### End of Display Interval 

Use the Date and Time selection controls to select the ending day and time of the displayed time interval. The date and time chosen can be no earlier than the beginning of the displayed time interval.   

The display time interval is the time period over which observatory orbits will be graphed.

### Observatories 

The observatories section consists of two different controls.  Together they allow the user to select which observatory orbits should be displayed in the viewer.  

The topmost control- a series of radio buttons- allows the user to choose whether all possible observatories will be available for selection or just a subset of them.  The following options are available:

|                |                                                                                    |
|----------------|------------------------------------------------------------------------------------|
|**ALL**         | All available observatories will be listed.  Some observatories may not have orbit |
|                | data congruent with the currently selected time interval, and thus not be available|
|                | for display.                                                                       |
|**AVAILABLE**   | Only observatories that have orbit data congruent with the currently selected time |
|                | interval will be listed.  Thus any observatory that is selected will automatically |
|                | be displayed.                                                                      |
|**SELECTED**    | Only the observatories that are currently being display will be listed.  This is   |
|                | useful for quickly focussing the camera on a specific observatory or changing the  |
|                | color of its orbit or its representation.                                          |

The bottom control presents the user with a list of available observatories according to the current selection criteria.  

The primary interaction available to each item in the list is to display or not that observatory.  This is done by selecting the checkbox in the first column.  Selecting an observatory causes its orbit to instantly be displayed, as long its orbit data is congruent to the current display interval.

The second column consists of the name of the observatory.  If the observatory is currently being displayed, left-clicking on the observatory name will focus the camera on that observatory, following it as it moves through its orbit.  To return the camera to its default position, use the 'esc' key.

The third column displays a swatch showing the color of the observatory orbit and its representation.  Left-clicking on the color swatch will bring up a dialog box allowing the selection of a new color.  The swatch color will change immediately, indicating the new color that the orbit and observatory representation will be changed once the slide-out panel is closed.

The fourth column shows the shape currently representing the observatory’s position.  A new shape can be selected by using the drop-down menu.  The observatory shape will be changed once the slide-out panel is closed.  The currently available shapes are **sphere**, **cone**, **cylinder**, or **cube**.

Although changes to the time range and observatories being displayed can be made freely while the slide-out panel is open, these changes are only implemented once this control is closed.  At this point, the displayed time range is updated, newly requested observatories are added to the display, and the display time is returned to the beginning of the requested interval. 
`
export const transport_help =
`
# Time Selection and Animation Controls

The Time Selection/Animation control allows you to display the orbital positions of the selected observatories at any point within the requested time range.  Alternatively, the current display time can be advanced automatically, causing the observatories to be animated along their designated orbits.  

### Manual Time Selection

The main component of the control is a slider that represents the time offset from the beginning of the selected time range. Dragging the slider manually allows you to select a specific display time within the chosen time range.

### Automatic Time Advance

You can also enable automatic time advance to animate the observatories along their orbital tracks. 

- Click the 'Play' button to start automatic time advance.
- Click the 'Pause' button to pause the time advance at the current position.

### Looping and Halting

The application can continuously loop through the selected time range or halt once the end time is reached. 

- Enabling the Loop Switch will cause the display time to continuously advance through the requested time range, returning to the beginning once the end is reached.
- Disabling the Loop Switch will cause the display time to halt once the end of the time range is reached.

### Additional Notes

- By default, the Time Selection/Animation control is always visible.  However, by setting an option in the Options Dialog Box, the control can be rendered invisible except when the mouse hovers at the bottom of the screen.
- The slider's position represents the relative offset of the currently displayed time within the selected time range.
- The slider is labeled with the requested display interval's beginning and end times.
`

export const main_help =
`
# 4D Orbit Display Application Help

The 4D Orbit Display application allows users to select astronomical space observatories (spacecraft) and time ranges of interest and see their orbits as an interactive 3-D animation.

This dialog window provides a general overview of the application and some tips to guide the user in its primary use.  More detailed help is available either by mousing over interface elements to reveal tool tips specific to that control or by clicking on the question mark icon, which appears in various parts of the interface and will bring up detailed instructions related to that part of the program.

### Basic Use

The 4D Orbit Display can plot the orbit(s) of one or more of the over 150 observatories maintained in the Satellite Situation Center (SSC) database. Trajectories are displayed in a virtual 3-D environment which also includes the four inner planets (Mercury, Venus, Earth, and Mars) and the Sun and Moon (Luna).

Click on the button with the 'menu' button (identified by the 'hamburger' icon [image]) to open the main menu panel.  From here, both the desired time range and specific observatories can be selected.  In addition to selecting specific observatories, the user may choose both the color that the orbit will be displayed in and the shape used to denote the observatory’s position.

The current display time is shown at the bottom of the interface.  All observatory positions are displayed relative to this time.  Initially, this will be set to the start of the selected time interval.  This value will change along with all displayed observatories’ positions when animating observatory orbits.

At the bottom of the display is the Time Selection/Animation control.  This can be used to view observatory orbital positions at any point in the requested time range.  Alternately, by pressing the play button, the current display time will be advanced at a fixed rate (this will be adjustable in future releases), causing the observatories to animate through their orbits.

### Observatory Position Display

On the right side of the display is a list of all the currently selected observatories, the color of their orbital trace, and their current orbital position in GSE coordinates. Left-clicking with the mouse on any line in this display will focus the camera on that observatory.  This is the same behavior that is implemented in the observatory selection list from the main menu panel.

The Observatory Position Display can be hidden/revealed by the appropriate control in the Options dialog box.

### Orbit Data Download

To the right of the 'menu' button is the 'download' button [image].  This button opens the Orbit Data Download dialog box.  From here, the user can select one, some, or all of the currently displayed observatories and have their orbit data extracted to a text document that can either be viewed in a separate 'pop-up' window or saved to the user's local file system.

Since both the display of 'pop-up' windows and saving files to the local file systems is browser dependent, the actual behavior of this dialog box may vary depending on the user's local environment. 

* Note: If no observatory has been selected, then attempting to open this dialog box will result in an error.

### Screenshots

To the right of the 'download' button is the 'screenshot' button [image].  Using this button, opens the Screenshot dialog box.  This dialog box allows the user to save a 'screenshot' as a PNG image or to open it in a new 'pop-up' window.  The screenshot image will not show controls, only observatories, orbits, and planets. By default, the image will have a white background. However, the user may set it to one of 18 other colors.

Since both the display of 'pop-up' windows and saving files to the local file systems is browser dependent, the actual behavior of this dialog box may vary depending on the user's local environment.

### Options

To the right of the 'screenshot' button is the 'options' button [image].  Using this button, opens the Options dialog box.  This dialog box contains controls allowing users to set several application options.  These include the display’s background color, hiding the Time Selection/Animation control, as well as the size and position of the grid planes, among others.  

* Note: Currently, options are not saved between sessions.

### Basic Camera Controls

The camera can be focused on any object in the display.  Initially, it will be focused on the planet Earth, but it is easy to change.  Clicking on any planetary icon will cause the camera to focus on that planet.   Alternately, by using the list of observatories in the viewer controls panel (accessed by the 'menu') button, the camera can focus on any currently displayed observatories.

Note: when the display is animated -- observatories are automatically moving along their orbital paths -- the camera will constantly remain focused on that observatory for its entire orbit. 

Using the mouse will cause the camera to orbit or zoom in or out from the object of focus.  The following table lists the available mouse controls.  

|                       |                                                                             |
|-----------------------|-----------------------------------------------------------------------------|
|**Left Mouse Button**  | Hold down the left mouse button while moving the mouse to rotate (orbit)    |
|                       | around the selected object.                                                 |
|**Scroll Wheel**       | Use the mouse scroll wheel to zoom in or out from the selected object at a  |
|                       | slower speed.                                                               |
|**Middle Mouse Button**| Hold down the middle mouse button while moving the mouse to zoom in or out  |
|                       | from the selected object at a faster speed.                                 |
|**Right Mouse Button** | Hold down the right mouse button while moving the mouse to pan the camera.  |

### Aligning the View to an Axis

In the center of the user interface, just below the current display time, are three buttons (marked "X", "Y" and "Z").  Each button will align the camera to the indicated axis.  IE., the "X" button aligns the camera to the X axis, etc.

### Orthogonal View and Perspective View

The camera will be in the orthogonal view when the application is first started.  In this mode, all surfaces are mapped using parallel lines to project their shape onto the view screen.  Because the illusion of depth is not present in this mode, orbits and observatory positions may be easier to analyze, especially with respect to other observatories and planets.

At any time, the camera may be switched to the perspective view.  While in orthogonal view, all visible objects will appear to be the same size, no matter how far from the camera. The perspective view is just the opposite. In this mode, objects which are further from the camera will appear to be smaller than objects that are close to the camera.  This adds the illusion of depth to the scene.

Switching between the orthogonal and perspective views is done by a pair of icons at the top right corner of the display. 

### Other Features

Additional icons at the top-right of the display allow the user to select the following features:

|                |                                                                              |                                                              
|----------------|------------------------------------------------------------------------------|
|**Grid Planes** | Display or hide grid lines in the XY, XZ, and YZ planes                      |                  
|                |                                                                              |
|**Magnetopause**| Display or hide a mesh representing the Earth's magnetopause.                |
|                |                                                                              |
|**Bow Shock**   | Display or hide a mesh representing the magnetic bow shock around the Earth  |
|                | from the solar wind.                                                         |

Enjoy using the 4D Orbit Display web application!
`
export const orbit_data_header = (sc, tstart, tend, unit='Re', system='GSE', unit_definition='') =>

`
#Observatory Name: ${sc}
#Start Time: ${tstart}
#End Time: ${tend}

#Observatory position data in ${unit} in ${system} coordinates.
# ${unit_definition}

#NOTE: Orbital position data may contain errors
#Please visit the SATELLITE SITUATION CENTER (SSCWeb) for definitive results
#https://sscweb.gsfc.nasa.gov/cgi-bin/Locator.cgi

#--------------------------------------------------------------------------
#Time (UTC)                             X                Y                Z
#--------------------------------------------------------------------------
` ;
export const  orbit_data_footer = () =>
`#END OF FILE
` ;