/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
'use strict'

var isAllBlank      = require('is-string-blank')
var createBuffer    = require('gl-buffer')
var createVAO       = require('gl-vao')
var createTexture   = require('gl-texture2d')
var pool            = require('typedarray-pool')
var mat4mult        = require('gl-mat4/multiply')
var getExtension    = require('gl-extension')
var shaders         = require('./lib/shaders')
var getGlyph        = require('./lib/glyphs')
var getSimpleString = require('./lib/get-simple-string')
var circleImage     = require('./asset/sphere.js')

var IDENTITY = [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1]

module.exports = createPointCloud

function transformMat4(x, m) {
  var x0 = x[0]
  var x1 = x[1]
  var x2 = x[2]
  var x3 = x[3]
  x[0] = m[0] * x0 + m[4] * x1 + m[8]  * x2 + m[12] * x3
  x[1] = m[1] * x0 + m[5] * x1 + m[9]  * x2 + m[13] * x3
  x[2] = m[2] * x0 + m[6] * x1 + m[10] * x2 + m[14] * x3
  x[3] = m[3] * x0 + m[7] * x1 + m[11] * x2 + m[15] * x3
  return x
}

function project(p, v, m, x) {
  transformMat4(x, x, m)
  transformMat4(x, x, v)
  return transformMat4(x, x, p)
}

function clampVec(v) {
  var result = new Array(3)
  for(var i=0; i<3; ++i) {
    result[i] = Math.min(Math.max(v[i], -1e8), 1e8)
  }
  return result
}

function ScatterPlotPickResult(index, position) {
  this.index = index
  this.dataCoordinate = this.position = position
}

var MAX_OPACITY = 1

function fixOpacity(a) {
  if(a === true) return MAX_OPACITY
  if(a > MAX_OPACITY) return MAX_OPACITY
  return a
}

function PointCloud(
  gl,
  shader,
  orthoShader,
  projectShader,
  pointBuffer,
  colorBuffer,
  pointsizeBuffer,
  idBuffer,
  vao,
  sprite,
  pickPerspectiveShader,
  pickOrthoShader,
  pickProjectShader) {

  this.gl              = gl

  this.pixelRatio      = 1

  this.shader          = shader
  this.orthoShader     = orthoShader
  this.projectShader   = projectShader

  this.pointBuffer     = pointBuffer
  this.colorBuffer     = colorBuffer
  this.pointsizeBuffer = pointsizeBuffer
  this.idBuffer        = idBuffer
  this.vao             = vao
  this.vertexCount     = 0

  this.opacity         = MAX_OPACITY

  this.projectScale    = [2.0/3.0, 2.0/3.0, 2.0/3.0]
  this.projectOpacity  = [MAX_OPACITY, MAX_OPACITY, MAX_OPACITY]

  this.pickId                = 0
  this.pickPerspectiveShader = pickPerspectiveShader
  this.pickOrthoShader       = pickOrthoShader
  this.pickProjectShader     = pickProjectShader
  this.points                = []

  this._selectResult = new ScatterPlotPickResult(0, [0,0,0])

  this.useOrtho = true
  this.bounds   = [[ Infinity,Infinity,Infinity],
                   [-Infinity,-Infinity,-Infinity]]

  //Axes projections
  this.axesProject = [ false, false, false ]
  this.axesBounds = [[-Infinity,-Infinity,-Infinity],
                     [ Infinity, Infinity, Infinity]]

  this.highlightId    = [1,1,1,1]
  this.highlightScale = 2

  this.clipBounds = [[-Infinity,-Infinity,-Infinity],
                     [ Infinity, Infinity, Infinity]]

  this.dirty = true

  this.instancedArrays = getExtension(gl,'ANGLE_instanced_arrays')

  this.sprite = sprite
}

var proto = PointCloud.prototype

proto.pickSlots = 1

proto.setPickBase = function(pickBase) {
  this.pickId = pickBase
}

proto.isTransparent = function() {
  if(this.opacity < MAX_OPACITY)  {
    return true
  }
  for(var i=0; i<3; ++i) {
    if(this.axesProject[i] && this.projectOpacity[i] < MAX_OPACITY) {
      return true
    }
  }
  return false
}

proto.isOpaque = function() {
  if(this.opacity >= MAX_OPACITY)  {
    return true
  }
  for(var i=0; i<3; ++i) {
    if(this.axesProject[i] && this.projectOpacity[i] >= MAX_OPACITY) {
      return true
    }
  }
  return false
}

var VIEW_SHAPE = [0,0]
var U_VEC = [0,0,0]
var V_VEC = [0,0,0]
var MU_VEC = [0,0,0,1]
var MV_VEC = [0,0,0,1]
var SCRATCH_MATRIX = IDENTITY.slice()
var SCRATCH_VEC = [0,0,0]
var CLIP_BOUNDS = [[0,0,0], [0,0,0]]

function zeroVec(a) {
  a[0] = a[1] = a[2] = 0
  return a
}

function augment(hg, af) {
  hg[0] = af[0]
  hg[1] = af[1]
  hg[2] = af[2]
  hg[3] = 1
  return hg
}

function setComponent(out, v, i, x) {
  out[0] = v[0]
  out[1] = v[1]
  out[2] = v[2]
  out[i] = x
  return out
}

function getClipBounds(bounds) {
  var result = CLIP_BOUNDS
  for(var i=0; i<2; ++i) {
    for(var j=0; j<3; ++j) {
      result[i][j] = Math.max(Math.min(bounds[i][j], 1e8), -1e8)
    }
  }
  return result
}

function drawProject(shader, points, camera) {
  var axesProject = points.axesProject

  var gl         = points.gl
  var uniforms   = shader.uniforms
  var model      = camera.model      || IDENTITY
  var view       = camera.view       || IDENTITY
  var projection = camera.projection || IDENTITY
  var bounds     = points.axesBounds
  var clipBounds = getClipBounds(points.clipBounds)

  var cubeAxis
  if(points.axes && points.axes.lastCubeProps) {
    cubeAxis = points.axes.lastCubeProps.axis
  } else {
    cubeAxis = [1,1,1]
  }

  VIEW_SHAPE[0] = 2.0/gl.drawingBufferWidth
  VIEW_SHAPE[1] = 2.0/gl.drawingBufferHeight

  shader.bind()
  uniforms.view           = view
  uniforms.projection     = projection
  uniforms.screenSize     = VIEW_SHAPE
  uniforms.highlightId    = points.highlightId
  uniforms.highlightScale = points.highlightScale
  uniforms.clipBounds     = clipBounds
  uniforms.pickGroup      = points.pickId / 255.0
  uniforms.pixelRatio     = points.pixelRatio

  for(var i=0; i<3; ++i) {
    if(!axesProject[i]) {
      continue
    }

    uniforms.scale          = points.projectScale[i]
    uniforms.opacity        = points.projectOpacity[i]

    //Project model matrix
    var pmodel = SCRATCH_MATRIX
    for(var j=0; j<16; ++j) {
      pmodel[j] = 0
    }
    for(var j=0; j<4; ++j) {
      pmodel[5*j] = 1
    }
    pmodel[5*i] = 0
    if(cubeAxis[i] < 0) {
      pmodel[12+i] = bounds[0][i]
    } else {
      pmodel[12+i] = bounds[1][i]
    }
    mat4mult(pmodel, model, pmodel)
    uniforms.model = pmodel

    //Compute initial axes
    var u = (i+1)%3
    var v = (i+2)%3
    var du = zeroVec(U_VEC)
    var dv = zeroVec(V_VEC)
    du[u] = 1
    dv[v] = 1

    //Align orientation relative to viewer
    var mdu = project(projection, view, model, augment(MU_VEC, du))
    var mdv = project(projection, view, model, augment(MV_VEC, dv))
    if(Math.abs(mdu[1]) > Math.abs(mdv[1])) {
      var tmp = mdu
      mdu = mdv
      mdv = tmp
      tmp = du
      du = dv
      dv = tmp
      var t = u
      u = v
      v = t
    }
    if(mdu[0] < 0) {
      du[u] = -1
    }
    if(mdv[1] > 0) {
      dv[v] = -1
    }
    var su = 0.0
    var sv = 0.0
    for(var j=0; j<4; ++j) {
      su += Math.pow(model[4*u+j], 2)
      sv += Math.pow(model[4*v+j], 2)
    }
    du[u] /= Math.sqrt(su)
    dv[v] /= Math.sqrt(sv)
    uniforms.axes[0] = du
    uniforms.axes[1] = dv

    //Update fragment clip bounds
    uniforms.fragClipBounds[0] = setComponent(SCRATCH_VEC, clipBounds[0], i, -1e8)
    uniforms.fragClipBounds[1] = setComponent(SCRATCH_VEC, clipBounds[1], i, 1e8)

    points.vao.bind()

    //Draw interior
    points.vao.draw(gl.POINTS, points.vertexCount)

    points.vao.unbind()
  }
}


var NEG_INFINITY3 = [-1e8, -1e8, -1e8]
var POS_INFINITY3 = [1e8, 1e8, 1e8]
var CLIP_GROUP    = [NEG_INFINITY3, POS_INFINITY3]

function drawFull(shader, pshader, points, camera, transparent, forceDraw, useSprite) {
  var gl = points.gl



  if(transparent === (points.projectOpacity < MAX_OPACITY) || forceDraw) {
    drawProject(pshader, points, camera)
  }

  if(transparent === (points.opacity < MAX_OPACITY) || forceDraw) {

    shader.bind()
    var uniforms = shader.uniforms

    uniforms.model      = camera.model      || IDENTITY
    uniforms.view       = camera.view       || IDENTITY
    uniforms.projection = camera.projection || IDENTITY

    VIEW_SHAPE[0]       = 2.0/gl.drawingBufferWidth
    VIEW_SHAPE[1]       = 2.0/gl.drawingBufferHeight
    uniforms.screenSize = VIEW_SHAPE

    uniforms.highlightId    = points.highlightId
    uniforms.highlightScale = points.highlightScale

    uniforms.fragClipBounds = CLIP_GROUP
    uniforms.clipBounds     = points.axes.bounds

    uniforms.opacity    = points.opacity
    uniforms.pickGroup  = points.pickId / 255.0

    uniforms.pixelRatio = points.pixelRatio

    uniforms.useSprite = useSprite
    uniforms.sprite = points.sprite

    points.vao.bind()

    //Draw interior
    points.vao.draw(gl.POINTS, points.vertexCount)

    points.vao.unbind()
  }


}

proto.draw = function(camera) {
  var shader = this.useOrtho ? this.orthoShader : this.shader
  drawFull(shader, this.projectShader, this, camera, false, false, this.useSprite)
}

proto.drawTransparent = function(camera) {
  var shader = this.useOrtho ? this.orthoShader : this.shader
  drawFull(shader, this.projectShader, this, camera, true, false, this.useSprite)
}

proto.drawPick = function(camera) {
  var shader = this.useOrtho ? this.pickOrthoShader : this.pickPerspectiveShader
  drawFull(shader, this.pickProjectShader, this, camera, true, true, this.useSprite)
}

proto.pick = function(selected) {
  if(!selected) {
    return null
  }
  if(selected.id !== this.pickId) {
    return null
  }
  var x = selected.value[2] + (selected.value[1]<<8) + (selected.value[0]<<16)
  if(x >= this.pointCount || x < 0) {
    return null
  }

  //Unpack result
  var coord = this.points[x]
  var result = this._selectResult
  result.index = x
  for(var i=0; i<3; ++i) {
    result.position[i] = result.dataCoordinate[i] = coord[i]
  }
  return result
}

proto.highlight = function(selection) {
  if(!selection) {
    this.highlightId = [1,1,1,1]
  } else {
    var pointId = selection.index
    var a0 =  pointId     &0xff
    var a1 = (pointId>>8) &0xff
    var a2 = (pointId>>16)&0xff
    this.highlightId = [a0/255.0, a1/255.0, a2/255.0, 0]
  }
}



proto.update = function(options) {

  options = options || {}

  if('perspective' in options) {
    this.useOrtho = !options.perspective
  }
  if('orthographic' in options) {
    this.useOrtho = !!options.orthographic
  }
  if('project' in options) {
    if(Array.isArray(options.project)) {
      this.axesProject = options.project
    } else {
      var v = !!options.project
      this.axesProject = [v,v,v]
    }
  }
  if('projectScale' in options) {
    if(Array.isArray(options.projectScale)) {
      this.projectScale = options.projectScale.slice()
    } else {
      var s = +options.projectScale
      this.projectScale = [s,s,s]
    }
  }
  if('projectOpacity' in options) {
    if(Array.isArray(options.projectOpacity)) {
      this.projectOpacity = options.projectOpacity.slice()
    } else {
      var s = +options.projectOpacity
      this.projectOpacity = [s,s,s]
    }
    for(var i=0; i<3; ++i) {
      this.projectOpacity[i] = fixOpacity(this.projectOpacity[i]);
    }
  }
  if('opacity' in options) {
    this.opacity = fixOpacity(options.opacity)
  }
  if('useSprite' in options) {
    this.useSprite = !this.instancedArrays || !!options.useSprite
  }

  //Set dirty flag
  this.dirty = true

  //Create new buffers
  var points = options.position

  //Bounds
  var lowerBound = [ Infinity, Infinity, Infinity]
  var upperBound = [-Infinity,-Infinity,-Infinity]

  //Unpack options
  var colors     = options.color
  var sizes      = options.size

  //Picking geometry
  var pickCounter = -1

  //First do pass to compute buffer sizes
  var vertexCount  = 0

  var numPoints = 0;

  if(points.length) {

    //Count number of points and buffer size
    numPoints = points.length

  count_loop:
    for(var i=0; i<numPoints; ++i) {
      var x = points[i]
      for(var j=0; j<3; ++j) {
        if(isNaN(x[j]) || !isFinite(x[j])) {
          continue count_loop
        }
      }

      vertexCount  += 3
    }
  }

  //Preallocate data
  var positionArray  = pool.mallocFloat(3*vertexCount)
  var colorArray     = pool.mallocFloat(4*vertexCount)
  var pointsizeArray = pool.mallocFloat(vertexCount)
  var idArray        = pool.mallocUint32(vertexCount)

  if(vertexCount > 0) {
    var color      = [0,0,0,1]

    var isColorArray      = Array.isArray(colors)     && Array.isArray(colors[0])

    var offset = 0

  fill_loop:
    for(var i=0; i<numPoints; ++i) {
      //Increment pickCounter
      pickCounter += 1

      var x = points[i]
      for(var j=0; j<3; ++j) {
        if(isNaN(x[j]) || !isFinite(x[j])) {
          continue fill_loop
        }

        upperBound[j] = Math.max(upperBound[j], x[j])
        lowerBound[j] = Math.min(lowerBound[j], x[j])
      }

      //Get color
      if(Array.isArray(colors)) {
        var c
        if(isColorArray) {
          if(i < colors.length) {
            c = colors[i]
          } else {
            c = [0,0,0,0]
          }
        } else {
          c = colors
        }

        if(c.length === 3) {
          for(var j=0; j<3; ++j) {
            color[j] = c[j]
          }
          color[3] = 1
        } else if(c.length === 4) {
          for(var j=0; j<4; ++j) {
            color[j] = c[j]
          }
        }
      } else {
        color[0] = color[1] = color[2] = 0
        color[3] = 1
      }


      var size = 0.5
      if(Array.isArray(sizes)) {
        if(i < sizes.length) {
          size = +sizes[i]
        } else {
          size = 12
        }
      } else if(sizes) {
        size = +sizes
      } else if(this.useOrtho) {
        size = 12
      }


      //Write out inner marker
      for(var l=0; l<3; ++l) {
        positionArray[3*offset+l] = x[l]
      }
      for(var l=0; l<4; ++l) {
        colorArray[4*offset+l] = color[l]
      }
      pointsizeArray[offset] = size
      idArray[offset] = pickCounter
      offset += 1
    }

  }

  //Update bounds
  this.bounds = [lowerBound, upperBound]

  //Save points
  this.points = points

  //Save number of points
  this.pointCount = points.length

  //Update vertex counts
  this.vertexCount      = vertexCount

  this.pointBuffer.update(positionArray)
  this.colorBuffer.update(colorArray)
  this.pointsizeBuffer.update(pointsizeArray)
  //this.idBuffer.update(new Uint32Array(idArray))
  this.idBuffer.update(idArray)

  pool.free(positionArray)
  pool.free(colorArray)
  pool.free(pointsizeArray)
  pool.free(idArray)
}

proto.dispose = function() {
  //Shaders
  this.shader.dispose()
  this.orthoShader.dispose()
  this.pickPerspectiveShader.dispose()
  this.pickOrthoShader.dispose()

  //Vertex array
  this.vao.dispose()

  //Buffers
  this.pointBuffer.dispose()
  this.colorBuffer.dispose()
  this.idBuffer.dispose()
}

function createPointCloud(options) {
  var gl = options.gl

  var shader                = shaders.createPerspective(gl)
  var orthoShader           = shaders.createOrtho(gl)
  var projectShader         = shaders.createProject(gl)
  var pickPerspectiveShader = shaders.createPickPerspective(gl)
  var pickOrthoShader       = shaders.createPickOrtho(gl)
  var pickProjectShader     = shaders.createPickProject(gl)

  var pointBuffer     = createBuffer(gl)
  var colorBuffer     = createBuffer(gl)
  var pointsizeBuffer = createBuffer(gl)
  var idBuffer        = createBuffer(gl)
  var vao = createVAO(gl, [
    {
      buffer: pointBuffer,
      size: 3,
      type: gl.FLOAT
    },
    {
      buffer: colorBuffer,
      size: 4,
      type: gl.FLOAT
    },
    {
      buffer: pointsizeBuffer,
      size: 1,
      type: gl.FLOAT
    },
    {
      buffer: idBuffer,
      size: 4,
      type: gl.UNSIGNED_BYTE,
      normalized: true
    }
  ])
  var sprite = createTexture(gl,circleImage);

  var pointCloud = new PointCloud(
    gl,
    shader,
    orthoShader,
    projectShader,
    pointBuffer,
    colorBuffer,
    pointsizeBuffer,
    idBuffer,
    vao,
    sprite,
    pickPerspectiveShader,
    pickOrthoShader,
    pickProjectShader)

  pointCloud.update(options)

  return pointCloud
}
