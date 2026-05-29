/*
 * NOSA HEADER START
 *
 * The contents of this file are subject to the terms of the NASA Open
 * Source Agreement (NOSA), Version 1.3 only (the "Agreement").  You may
 * not use this file except in compliance with the Agreement.
 *
 * You can obtain a copy of the agreement at
 *   docs/NASA_Open_Source_Agreement_1.3.txt
 * or
 *   http://sscweb.gsfc.nasa.gov/tipsod/NASA_Open_Source_Agreement_1.3.txt.
 *
 * See the Agreement for the specific language governing permissions
 * and limitations under the Agreement.
 *
 * When distributing Covered Code, include this NOSA HEADER in each
 * file and include the Agreement file at
 * docs/NASA_Open_Source_Agreement_1.3.txt.  If applicable, add the
 * following below this NOSA HEADER, with the fields enclosed by
 * brackets "[]" replaced with your own identifying information:
 * Portions Copyright [yyyy] [name of copyright owner]
 *
 * NOSA HEADER END
 *
 * Copyright (c) 2003-2006 United States Government as represented by the
 * National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S.Code. All Other Rights Reserved.
 *
 * $Id: MHD.java,v 1.20 2015/10/30 14:18:51 rchimiak Exp $
 *
 * Created on December 17, 2002, 1:22 PM
 */

//import { TagsOutlined } from "@ant-design/icons";
import { TagsOutlined } from "@ant-design/icons";
import * as THREE from "three";
import { COORD_System }  from "./Orbit"
import { GSE_to_WS } from "./Orbit"
import { Frame_to_DS } from "./Orbit"
import { GSE_to_ANY } from "./Orbit"
import { Orbit_Data } from './App.jsx'

const sdwp_modes = 
    {
    UNKNOWN: 0, 
    USER: 1,        // User specifies the solar wind pressure independently of whether a value
                    // for the magnetopause has been captured or not.  
    MODEL: 2,       // The solar wind pressure is calculated based on the magnetopause position 
                    // returned by the CCMC HAPI server.  This is the default mode. 
    }

export const SDWP_Modes = Object.freeze (sdwp_modes)

// This probably should live someplace else.
export const MP_STANDOFF_DATASET = 'SWMF2023_RT_STANDOFF_P1M' // Not used right now.
export const MP_STANDOFF_ID = 'mp_standoff'

//package gov.nasa.gsfc.spdf.orb.utils;

//import gov.nasa.gsfc.spdf.orb.OrbitViewer;
//import gov.nasa.gsfc.spdf.orb.gui.SurfaceWindow;
//import javax.media.j3d.Geometry;
//import javax.media.j3d.GeometryArray;
//import javax.media.j3d.IndexedQuadArray;
//import javax.media.j3d.Material;
//import javax.media.j3d.PolygonAttributes;
//import javax.media.j3d.Shape3D;
//import javax.media.j3d.Transform3D;
//import javax.media.j3d.TransformGroup;
//import javax.vecmath.Color3f;
//import javax.vecmath.Color4f;

/**
 * Superclass for MHDSurf and MHDPause, is never instantiated directly
 *
 * @author rchimiak
 * @version $Revision: 1.20 $
 */
class MHD 
    {
    // These are properties
    //protected Shape3D shape = new Shape3D();
    //protected Material mat = new Material();
    //protected Color4f color = null;
    //protected static float swp = 2.04f;
    //protected float xmin = -45;
    //protected static ModifiedJulianCalendar mjc = null;

    /**
     * Constructor for MHD
     *
     * @param surfWind the magnetopause or bow shock window
     */

    constructor (scene=null, name="unnamed", sx=64, sy=64)
        {
        this.is_visible = false 

        this.scene = scene ; 
        this.name = name ;
        this.shape = new THREE.Mesh () ;
        //this.shape.transparent = true ;
        this.shape.visible = this.is_visible 
        this.shape.material = new THREE.MeshPhongMaterial () ;
        this.shape.material.vertexColors = true ;
        this.shape.material.wireframe = false ;
        this.shape.material.transparent = true
        this.shape.material.opacity = 1
        this.shape.name = this.name ;
        //this.shape.geometry = new THREE.BufferGeometry () ;

        this.color = new THREE.Color ("white") ;
        this.swpmode = SDWP_Modes.MODEL
        this.mpstandoff = null
        this.swp = 2.04 ;
        this.xmin = -45.0 ;
        this.indices = [] ;
        this.SIZEX = sx ;
        this.SIZEY = sy ;
        this.points = [] ;
        this.coords = [] ;
        this.colors = [] ;
        this.normals = [] ;
        this.index = [] ;
        this.start = 0.0 ;
        this.end = 360.0 ;
        this._enabled = true 
        this._reactivate_grid = false

        document.addEventListener ("coord_change_evt", e => {
            this.update (e.detail.time, e.detail.system)
            })

        //protected static ModifiedJulianCalendar mjc = null;
        }
    //set_parameters_from_dialog (SurfaceWindow surfWind) 
    set_parameters_from_dialog (surfWind) 
        {

        // Note: The function calls to get parameter values are a holdover from the Java code.  
        // This will likely be an object that is passed if this ever gets used.
        this.set_parameters (
                            surfWind.getSWP_Mode(),
                            surfWind.getSWP(), 
                             0.0, 
                             360.0,
                             surfWind.getColorButton().getBackground()) ;

        }

    // set_parameters (float psw, float sina, float start, float end, Color4f cl) 
    set_parameters (mode = SDWP_Modes.MODEL, swp=2.04, start=0.0, end=360.0, diff_val="white", em_val, sp_val) 
        {
        this.color.set  (diff_val) 

        if  (em_val === undefined)
            {
            this.shape.material.emissive.copy (this.color) 
            this.shape.material.emissive.multiplyScalar (.5) 
            }
        else 
            {
            this.shape.material.emissive.set (em_val) 
            }

        if  (sp_val === undefined)
            {
            this.shape.material.specular.copy (this.color) 
            this.shape.material.specular.lerp (new THREE.Color (0xffffff), 0.15) 
            }
        else 
            {
            this.shape.material.specular.set (sp_val) 
            }
            
        this.swpmode = mode
        this.swp = swp ;
        this.start = start ;
        this.end = end ;

        // const diffuseColor = new THREE.Color (.9, .9, .7);
        // const specularColor = new THREE.Color (.9, .9, .7);

        // this.shape.material.specular.copy (specularColor) ;
        this.shape.material.color.copy (this.color) 
        this.shape.material.shininess = 0.1 

        this.buildModel ()

        // addChild(shape);
        }

    get_mp_standoff (time)
        {
        // Check if the data is available before trying to access it. 
        // I have no idea what to do if the data is not available.
        if  (! Orbit_Data.entity_data_valid (MP_STANDOFF_ID))
            {
            console.log ("MP standoff data not available for id: ", MP_STANDOFF_ID, "returning true")

            this.mpstandoff = null
            return true //??  This should force an update, which is what I want in this case.  I think.
            }

        // Save the current value of the standoff distance so that we can check if it has
        // changed after we get the new value.  If it has not changed, then there is 
        // no need to update the geometry.
        const old_mp_standoff = this.mpstandoff

        // Get the index of vector position that corresponds to the current time.
        // This will actually return an interpolated index value, but that is OK since 
        // we can round it to an integer index value when we access the data.  
        const index = Math.round (Orbit_Data.time_to_index (MP_STANDOFF_ID, time))  

        const obj = Orbit_Data.get_value_at_index (MP_STANDOFF_ID, index)

        // Get the standoff distance value at the current time index.
        const mp_standoff = Object.values (obj)[0]

        // Check if the standoff distance has significantly changed.
        // If it has not, then there is no need to update the geometry.
        if  (Math.abs (mp_standoff - old_mp_standoff) < 1e-3)
            {
            return false ;
            }

        this.mpstandoff = mp_standoff

        return true ;
        }

    set_scene_graph (scene)
        {
        this.scene = scene ;
        }

    parent_to_scene ()
        {
        if  (! this.scene.getObjectByName (this.name))
            {
            if  (this.scene !== null)
                {
                this.scene.add (this.shape) ;
                }
            }
        }

    unparent_from_scene ()
        {
        if  (this.scene.getObjectByName (this.name))
            {
            if  (this.scene !== null)
                {
                this.scene.remove (this.shape) ;
                }
            }
        }

    is_in_scene ()
        {
        return (this.scene.getObjectByName (this.name))? 1 : 0 ; 
        }

    //setMin (float newMin) 
    setMin (newMin) 
        {
        this.xmin = newMin;
        this.buildModel (this.swp, 0.2, 0.0, 360.0);
        }

    //setScale (float newScale) 
    setScale (newScale) 
        {
        let t = new THREE.Matrix4 ();
        t.makeScale(1 / newScale, 1 / newScale, 1 / newScale);
        // this.setTransform(t);  // Needs to have the mesh object to operate on.
        }

    //buildModel(float psw, float sina, float start, float end) 
    buildModel() 
        {
        this.points = [] ;
        this.coords = [] ;
        this.colors = [] ;
        this.normals = [] ;
        this.indices = [] ;
    
        this.create_index_array () ;
        this.set_coordinate (this.swp, this.start, this.end)
        this.update_geometry () ;

        if  (! this.is_in_scene ())
            {
            this.parent_to_scene () ;
            //this.doInitialTransform () ;
            }
        }

    create_index_array ()
        {
        // const vcounts = new Array (4 * (this.SIZEX - 1) * (this.SIZEY - 1));
        this.indices = []

        // vcounts is actually an index array.
        for (let i = 0 ; i < (this.SIZEX - 1); i++) 
            {
            for (let j = 0 ; j < (this.SIZEY - 1); j++) 
                {
                const p1 = i * (this.SIZEX) + ( j + 1 )
                const p2 = i * (this.SIZEX) + j
                const p3 = ( i + 1 ) * ( this.SIZEX) + j
                const p4 = ( i + 1 ) * ( this.SIZEX) + ( j + 1 )

                this.indices.push (p1)
                this.indices.push (p2)
                this.indices.push (p4)
                this.indices.push (p2)
                this.indices.push (p3)
                this.indices.push (p4)
                }
            }
        }

    update_geometry ()
        {
        const clr = [this.color.r, this.color.g, this.color.b] ;

        for (let ii = 0 ; ii < 6 * (this.SIZEX - 1) * (this.SIZEY - 1) ; ii++) 
            {
            this.colors.push (...clr) ;
            }

        this.shape.geometry.setIndex (this.indices)

        // const pos = new THREE.BufferAttribute (new Float32Array(this.coords), 3) ;
        // const nrm = new THREE.BufferAttribute (new Float32Array(this.normals), 3) ;
        const col = new THREE.BufferAttribute (new Float32Array(this.colors), 3) ;
    
        // this.shape.geometry.setAttribute ('position', pos ) ;  
        // this.shape.geometry.setAttribute ('normal', nrm ) ;  
        this.shape.geometry.setAttribute ('color', col ) ;
        }

    update (time, system = COORD_System.GSE)
        {
        if  (! this._enabled)
            {
            if  (this._reactivate_grid)
                {
                this._enabled = true
                this.shape.visible = this.is_visible
                this._reactivate_grid = false
                }
            
            else 
                {
                return 
                }
            }

        if  (this.swpmode === SDWP_Modes.MODEL )
            {
            // Get the standoff distance value at the current time.  If it has not 
            // changed significantly, then there is no need to update the geometry.
            if  (this.get_mp_standoff (time))
                {
                // Adjust the geometry to reflect the new standoff distance value.  
                // This will involve recalculating the coordinates of the vertices
                this.set_coordinate (this.swp, this.start, this.end)
                }
            }
        
        const coords = Frame_to_DS (GSE_to_ANY (this.points, system, time))
        const pos = new THREE.BufferAttribute (new Float32Array (coords), 3)
        this.shape.geometry.setAttribute ('position', pos ) 
        
        this.shape.geometry.computeVertexNormals ()
        }

    /*respond to a change in color on the surface window */
    //setColor(Color4f c) 
    setColor (diffuse, emissive, spec)
        {
        if  (diffuse !== undefined)
            {
            this.color.set (diffuse) 
            this.shape.material.color.copy (this.color) 
            }

        if  (emissive !== undefined)
            {
            this.shape.material.emissive.set (emissive) 
            }

        if  (spec !== undefined)
            {
            this.shape.material.specular.set (spec)
            }

        this.buildModel ();
        }

    /*respond to a change in opacity on the surface window */
    //setOpacity(float opac) 
    setOpacity(opac) 
        {
        this.getShape().material.opacity = opac 
        }

    /**
     * returns the shape for that geometry
     */
    getShape() 
        {
        return this.shape;  // Return shape3D
        }

    doInitialTransform() 
        {

        }

    /*respond to a change in swp value on the surface window */
    //setSWP(float newSwp) 
    setSWP(newSwp) 
        {
        this.swp = newSwp

        // This should just call update_geometry, not buildModel, since that is the only
        // thing that needs to be updated when the swp changes.  
        this.buildModel(this.swp, 0.2, 0.0, 360.0)

        //OrbitViewer.getSatellitePositionWindow().SWPChanged();
        }

    /*Change from surface to wireframe or screen_door
     *@param attribute the surface or wireframe or screen_door PolygonAttributes integer value*/
    //setPolygonAttributes (int attribute) 
    //setPolygonAttributes (attribute) 
    //    {

    //    getShape().getAppearance().setPolygonAttributes(new PolygonAttributes(attribute,
    //           PolygonAttributes.CULL_NONE, 0, true, 0));
    //    }

    /*Change from NICEST to SCREEN_DOOR and vice-versa
     *@param attribute the Nicest or Screen_door transparency mode integer value*/
    //setTransparencyAttributes(int attribute) 
    //setTransparencyAttributes(attribute) 
    //    {
    //    getShape().getAppearance().getTransparencyAttributes().setTransparencyMode(attribute);
    //    }
    set_wire_frame (wf = false)
        {
        this.shape.material.wireframe = wf ;   
        }

    set_visibility (visible)
        {
        this.is_visible = visible
        this.shape.visible = this.is_visible && this._enabled
        }

    enable_grid ()
        {
        // Don't actually enable the grid here, just set the reactivate flag,
        // Re-enabling it outside of the update method risk showing the user an
        // incorrectly transformed grid for a brief moment.
        this._reactivate_grid = true
        }

    disable_grid ()
        {
        this._enabled = false 
        this.shape.visible = false
        this._reactivate_grid = false // Probably not necessary, but just to be safe.
        }

    get visible ()
        {
        return this.is_visible ;
        }

    get enabled ()
        {
        return this._enabled  
        }
    }

/*
 * NOSA HEADER START
 *
 * The contents of this file are subject to the terms of the NASA Open
 * Source Agreement (NOSA), Version 1.3 only (the "Agreement").  You may
 * not use this file except in compliance with the Agreement.
 *
 * You can obtain a copy of the agreement at
 *   docs/NASA_Open_Source_Agreement_1.3.txt
 * or
 *   http://sscweb.gsfc.nasa.gov/tipsod/NASA_Open_Source_Agreement_1.3.txt.
 *
 * See the Agreement for the specific language governing permissions
 * and limitations under the Agreement.
 *
 * When distributing Covered Code, include this NOSA HEADER in each
 * file and include the Agreement file at
 * docs/NASA_Open_Source_Agreement_1.3.txt.  If applicable, add the
 * following below this NOSA HEADER, with the fields enclosed by
 * brackets "[]" replaced with your own identifying information:
 * Portions Copyright [yyyy] [name of copyright owner]
 *
 * NOSA HEADER END
 *
 * Copyright (c) 2003-2009 United States Government as represented by the
 * National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S.Code. All Other Rights Reserved.
 *
 * $Id: MHDPause.java,v 1.22 2020/10/19 21:06:33 rchimiak Exp $
 * Created on November 18, 2002, 9:30 AM
 */
//package gov.nasa.gsfc.spdf.orb.utils;

/*
 * MHDPause.java
 *
 * Created on June 7, 2000, 10:08 AM
 * By Ravi Kulkarni
 * Copyright @2000
 * University of Maryland
 * All Rights Reserved
 */
//import javax.media.j3d.*;
//import javax.vecmath.*;

//import gov.nasa.gsfc.spdf.orb.gui.*;
//import gov.nasa.gsfc.spdf.orb.content.behaviors.SelenoAnimation;


/*  ****************************************
 **** Sibeck's Magnetopause Surface ****
 ****************************************
 po = 2.04
 s1 = 0.14
 s2 = 18.2
 s3 = -217.2
 t1 = s2/(2 s1) = 65.0
 t2 = sqrt(t1**2 - s3/s1) = 76.0028195
 xmin = -45.0
 rho = (po/psw)**(1/6)
 r**2 = y**2+z**2 = s1*[(t2*rho)**2-(x+t1*rho)**2]
 ***********************************************
 */
export class MHDPause extends MHD 
    {
    //static SIZEX = 128 ;
    //static SIZEY = 128 ;

    constructor (scene=null, name="MHDpause", mode = SDWP_Modes.MODEL)
        {
        // super (scene, name, 128, 128) ;
        super (scene, name, 32, 32) ;

        this.set_parameters (mode, 2.0, 0., 360., "indigo" ) ;
        }
    
    //MHDPause(MagnetopauseWindow magWind) 
    set_parameters_from_dialog (magWind) 
        {
        const swp = magWind.getSWP () ;
        const color = magWind.getColorButton().getBackground() ;
        const emissive = [1, 1, 204 / 255] ;

        this.set_parameters (swp, 0., 360., color, emissive) ;
        }        

    // Not sure what this function is supposed to do.
    // setSunLight(boolean sunlight) 
    //setSunLight (sunlight) 
    //    {
    //    shape.getAppearance().setMaterial(sunlight ? mat : null);
    //    }

    // @Override
    // buildModel(float psw, float sina, float start, float end) 
    /* Work on this later
    buildModel(psw, sina, start, end) 
        {
        let tetra = new QuadArray(4 * (SIZEX - 1) * (SIZEY - 1),
                QuadArray.COORDINATES
                | QuadArray.NORMALS
                | QuadArray.BY_REFERENCE
                | QuadArray.COLOR_4);

        //tetra.setCapability(GeometryArray.ALLOW_REF_DATA_READ);
        //tetra.setCapability(GeometryArray.ALLOW_REF_DATA_WRITE);
        //tetra.setCapability(GeometryArray.ALLOW_COUNT_READ);
        shape.setGeometry(tetra);
        setCoordinate(psw, start, end);
        // doRotation();
        }
    */
    //public float frmp(float rho, float x) 
    frmp(rho, x) 
        {
        let s1 = 0.14;
        let t1 = 65.0;
        let t2 = 76.0028195;
        let r;
        if (x < -65) {
            x = -65;
        }
        let t = s1 * (Math.pow(t2 * rho, 2) - Math.pow((x + t1 * rho), 2));

        if (t <= 0.0) {
            r = 0.0;
        } else {

            r = Math.sqrt(t);
        }
        return r;
        }

    // @Override
    // setCoordinate(float psw, float start, float end) 
    set_coordinate (psw, start, end) 
        {
        // Clear the points array before adding new points. 
        this.points.length = 0

        let r, theta
        let x, y, z

        const prsw = psw

        // Determine rho based on mode.
        // MODEL mode back-solves rho from the measured standoff distance.
        // Falls back to USER mode if no standoff value is available.
        let rho
        let xmax

        if  (this.swpmode === SDWP_Modes.MODEL && this.mpstandoff !== null)
            {
            rho  = this.mpstandoff / 11.0028195
            xmax = this.mpstandoff
            }

        else
            {
            rho = Math.pow ((2.04 / prsw), (1. / 6.0))
            xmax = 11.0028195 * rho
            }

        // let xmax = 11.0028195 * rho
        let cmin = this.xmin
        //let ii = 0;

        for (let i = 0; i < this.SIZEX; i++) 
            {

            if  (i === 0) 
                {
                x = this.xmin;

                r = this.frmp(rho, cmin);
                } 

            else 
                {
                x = ((xmax - cmin) * (i - 1) / (this.SIZEX - 2) + cmin);

                r = this.frmp(rho, x);
                }

            for (let j = 0; j < this.SIZEY; j++) 
                {  // Do rotation
                theta = 2 * Math.PI * (start + (end - start) * j / (this.SIZEY - 1)) / 360.0;
                y = r * Math.sin(theta);
                z = r * Math.cos(theta);

                // Don't do any transformations now.  We will have do a transformation once 
                // every time tick.
                // this.points.push (new THREE.Vector3 ().fromArray (GSE_to_WS (x, y, z)))

                // this.points.push (new THREE.Vector3 ().fromArray ([x, y, z]))
                this.points.push (x, y, z)
                }
            }
        }

    doInitialTransform() 
        {
        // Use the default world space for doing this rotation.  Y axis (WS) == Z axis (GSE)
        this.shape.rotateY ((Math.PI / 180) * (-4.)) ;

        }

    //distanceToMagnetopause(float gse[]) 
    distanceToMagnetopause (gse) 
        {
        let S1 = 0.14;
        let rho = Math.pow((2.04 / this.swp), (1. / 6.6));
        let S2 = 18.2 * rho;
        let S3 = -217.2 * rho * rho;

        // -------------------------------------------------------------
        //  taking care of the aberation (4 degrees)
        //  -------------------------------------------------------------
        let gseAlt = [0.9976 * gse[0] - 0.0697 * gse[1],
                      0.0697 * gse[0] + 0.9976 * gse[1],
                      gse[2]
                      ];

        // -------------------------------------------------------------
        //  taking care of the rotation to flatten and staying in the positive Y quadrants
        //  -------------------------------------------------------------
        gseAlt[1] = (Math.sqrt(Math.pow(gseAlt[1], 2) + Math.pow(gse[2], 2)));

        let X0;
        let Y0;
        let distance = 0;
        let stepSize = 0.005;

        // -------------------------------------------------------------
        //  X, Y intersection of spacecraft position with mag
        //  line slope = YSA/XSA   = Y/X
        //  Y = X*YSA/XSA
        //  plug it in function: (S1 + YSA/XSA)**2)*X**2 + S2*X + S3 = 0
        //  T1* X**2 + S2 * X + S3 = 0
        //  T1 is parameter for X square
        //  -------------------------------------------------------------
        if (gseAlt[0] > 0) 
            {
            let T1 = S1 + Math.pow ((gseAlt[1] / gseAlt[0]), 2) ;

            // -------------------------------------------------------------
            // get the X0 roots of line (spacecraft, earth intersecting with mag)
            // solve function  T1 * x**2 + S2 * X + S3 = 0 with respect to X
            // gives Xs where line between spacecraft and earth crosses the mag
            //  -------------------------------------------------------------
            X0 = (-S2 / (2.0 * T1)) + (Math.sqrt(S2 * S2 - 4.0 * T1 * S3) / (2.0 * T1)) ;
            Y0 = Math.abs(X0 * (gseAlt[1] / gseAlt[0])) ;
            } 
        else 
            {
            // -------------------------------------------------------------
            // get the Y0 positive root of line where slope is infinite (X0 = gseAlt[0])
            //  -------------------------------------------------------------
            X0 = gseAlt[0];
            Y0 = Math.sqrt(-S1 * gseAlt[0] * gseAlt[0] - S2 * gseAlt[0] - S3);

            }

        if  (gseAlt[0] < -42.024) 
            {
            distance = Math.abs (gseAlt[1]) - 27.107;

            return distance;
            }

        // -------------------------------------------------------------
        //  check out if spacecraft in or out of the mag
        //  -------------------------------------------------------------
        let si = ((gseAlt[0] * gseAlt[0]) + (gseAlt[1] * gseAlt[1])) - ((X0 * X0) + (Y0 * Y0)) < 0 ? -1 : 1;

        let Y = (1 + stepSize) * Y0 ;
        let X;

        for (let n = 2; n < 2000; n++) 
            {
            let dy = stepSize * Y ;

            dy = si * dy;
            Y = Y + dy;
            // -------------------------------------------------------------
            //  calculate the intersection of a line with a greater y and the mag
            // find the X value by finding the root of a line going from
            //  the spacecraft to the new Y
            // the function is : S1*X**2 + S2*X +S3 +Y**2 = 0
            //  -------------------------------------------------------------

            if  ((S2 * S2 - 4.0 * S1 * (S3 + Y * Y)) < 0) 
                {
                return distance;
                }

            X = -S2 / (2.0 * S1) + Math.sqrt(S2 * S2 - 4.0 * S1 * (S3 + Y * Y)) / (2.0 * S1) ;

            // -------------------------------------------------------------
            //  find the length of this new line from spacecraft to mag
            //  -------------------------------------------------------------

            // Vector3d v = new Vector3d(gseAlt[0] - X, gseAlt[1] - Y, 0) ;
            // this.dist = si * v.length() ;
            const v = new THREE.Vector3 (gseAlt[0] - X, gseAlt[1] - Y, 0) ;
            const dist = si * v.length () ;

            if  (n === 2) 
                {
                distance = 10000;
                }

            // -------------------------------------------------------------
            //  we have gone too far
            //  -------------------------------------------------------------
            if  (Math.abs(dist) - Math.abs(distance) >= 0) 
                {
                if  (n === 3 && stepSize > 0.000005) 
                    {
                    stepSize = stepSize / 10 ;
                    Y = (1 + stepSize) * Y0 ;
                    n = 1;
                    } 

                else 
                    {
                    return distance ;
                    }
                }

            distance = dist;
            }

        return distance;
        }
    }

export class MHDBowshock extends MHD 
    {
    constructor (scene=null, name="MHDBowshock", mode = SDWP_Modes.MODEL)
        {
        // super (scene, name, 128, 128) ;
        super (scene, name, 32, 32) ;

        this.A = 0.0296;
        this.B = -0.0381;
        this.C = -1.280;
        this.D = 45.644;
        this.E = -652.10;

        //this.set_parameters (2.0, 0., 360., "violet", [0, 0.851, 0] ) ;
        //this.set_parameters (2.0, 0., 360., "hsl(300, 76.1%, 72.2%)", "hsl(300, 50%, 72.2%)" ) ;
        this.set_parameters (mode, 2.0, 0., 360., "violet") ;
        }

    set_parameters_from_dialog (bowWind) 
        {
        const swp = bowWind.getSWP () ;
        const color = bowWind.getColorButton().getBackground() ;
        const emissive = [0, 0.851, 0] ;

        this.set_parameters (swp, 0., 360., color, emissive) ;
        }  

    // I don't think this is every used.
    doInitialTransform() 
        {
        this.shape.rotateY ((Math.PI / 180) * (-4.82)) ;
        this.shape.position.fromArray (GSE_to_WS (0, .3131, 0)) ;
        }

    getXmax ()
        {
        const z = (this.B - this.A * this.A / 4.) ;
        const u = (this.D - this.A * this.C / 2.) ;
        const w = (this.E - this.C * this.C / 4.) ;

        return (-u + Math.sqrt (u * u - 4. * z * w)) / (2. * z) ;
        }

    frbs(rho, x) 
        {
        let r;
        let x0 = 14.3 * rho - 14.462 ;
        let x1 = x - x0;

        if (Math.pow(((this.A * x1 + this.C)), 2) - 4 * (this.B * Math.pow(x1, 2) + this.D * (x1) + this.E) < 0.) 
            {
            r = 0.;
            } 
        else 
            {
            r = ((Math.sqrt(Math.pow(((this.A * x1 + this.C)), 2) - 4 * (this.B * Math.pow(x1, 2) + this.D * (x1) + this.E)) / 2));
            }

        if  (r <= 0.) 
            {
            r = 0.;
            }
        
        return r;
        }

    set_coordinate (psw, start, end) 
        {
        this.points.length = 0

        let r, theta;
        let x, y, z;

        const prsw = psw

        // Determine rho based on mode.
        // MODEL mode back-solves rho from the measured standoff distance.
        // Falls back to USER mode if no standoff value is available.
        let rho
        let xmax

        if  (this.swpmode === SDWP_Modes.MODEL && this.mpstandoff !== null)
            {
            // Derive bowshock rho from the SWMF magnetopause standoff distance.
            //
            // Both the magnetopause and the bowshock are empirically scaled by a
            // dimensionless rho parameter that originally depends on solar wind
            // dynamic pressure (psw):
            //
            //     rho_mp = (po / psw)^(1/6.0)        (magnetopause exponent)
            //     rho_bs = (po / psw)^(1/6.6)        (bowshock exponent)
            //
            // At rho_mp = 1 (nominal psw = po = 2.04), the magnetopause noon
            // standoff distance is exactly 11.0028195 Re.  In general:
            //
            //     mpstandoff = 11.0028195 * rho_mp
            //
            // So given a measured (SWMF) standoff distance, the equivalent rho_mp is:
            //
            //     rho_mp = mpstandoff / 11.0028195
            //
            // The two rho values share the same underlying psw, so converting from
            // the magnetopause rho to the bowshock rho only changes the exponent:
            //
            //     rho_bs = (rho_mp)^(6.0/6.6)
            //
            // The bowshock's xmax then follows from its own formula, unchanged from
            // the original USER mode:
            //
            //     xmax = getXmax() + 14.3 * rho_bs - 14.462
            //
            // This keeps the magnetopause and bowshock physically consistent: both
            // surfaces respond to the same effective solar wind pressure, even when
            // that pressure is being inferred from the SWMF standoff rather than
            // supplied directly.
            // (formula derrived by Anthropic/Claude Opus 4.7)
            const ratio = this.mpstandoff / 11.0028195
            rho = Math.pow (ratio, 6.0 / 6.6)
            xmax = this.getXmax () + 14.3 * rho - 14.462

            }

        else
            {
            rho = Math.pow ((2.04 / prsw), (1. / 6.6)) 
            xmax = this.getXmax() + 14.3 * rho - 14.462 
            }

        // let xmax = this.getXmax() + 14.3 * rho - 14.462 ;

        //let ii = 0;
        //let x0 = 14.3 * rho - 14.462 ;

        for (let i = 0; i < this.SIZEX ; i++) 
            {
            x = (xmax - this.xmin) * i / (this.SIZEX - 1) + this.xmin ;
            r = this.frbs (rho, x);

            for (let j = 0; j < this.SIZEY ; j++) 
                {  // Do rotation
                theta = 2 * Math.PI * (start + (end - start) * j / (this.SIZEY - 1)) / 360.0;

                y = r * Math.sin(theta);
                z = r * Math.cos(theta);

                // Don't do any transformations now.  We will have to do transformations later,
                // once very time tick.
                // this.points.push (new THREE.Vector3 ().fromArray (GSE_to_WS (x, y, z))) ;

                this.points.push (x, y, z)
                }
            }
        }
/*
    set_visibility (visible)
        {
        super.set_visibility (visible) ;
        }

*/
    }
