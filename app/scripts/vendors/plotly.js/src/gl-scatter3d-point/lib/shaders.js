/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
'use strict'

var createShaderWrapper = require('gl-shader')
var glslify = require('glslify')

var perspectiveVertSrc = glslify('./perspective.glsl')
var orthographicVertSrc = glslify('./orthographic.glsl')
var projectionVertSrc = glslify('./projection.glsl')
var drawFragSrc = glslify('./draw-fragment.glsl')
var pickFragSrc = glslify('./pick-fragment.glsl')

var ATTRIBUTES = [
  {name: 'position', type: 'vec3'},
  {name: 'color', type: 'vec4'},
  {name: 'pointsize', type: 'float'},
  {name: 'id', type: 'vec4'}
]

var perspective = {
    vertex: perspectiveVertSrc,
    fragment: drawFragSrc,
    attributes: ATTRIBUTES
  },
  ortho = {
    vertex: orthographicVertSrc,
    fragment: drawFragSrc,
    attributes: ATTRIBUTES
  },
  project = {
    vertex: projectionVertSrc,
    fragment: drawFragSrc,
    attributes: ATTRIBUTES
  },
  pickPerspective = {
    vertex: perspectiveVertSrc,
    fragment: pickFragSrc,
    attributes: ATTRIBUTES
  },
  pickOrtho = {
    vertex: orthographicVertSrc,
    fragment: pickFragSrc,
    attributes: ATTRIBUTES
  },
  pickProject = {
    vertex: projectionVertSrc,
    fragment: pickFragSrc,
    attributes: ATTRIBUTES
  }

function createShader(gl, src) {
  var shader = createShaderWrapper(gl, src)
  var attr = shader.attributes
  attr.position.location = 0
  attr.color.location = 1
  attr.pointsize.location = 2
  attr.id.location = 3
  return shader
}

exports.createPerspective = function(gl) {
  return createShader(gl, perspective)
}
exports.createOrtho = function(gl) {
  return createShader(gl, ortho)
}
exports.createProject = function(gl) {
  return createShader(gl, project)
}
exports.createPickPerspective = function(gl) {
  return createShader(gl, pickPerspective)
}
exports.createPickOrtho = function(gl) {
  return createShader(gl, pickOrtho)
}
exports.createPickProject = function(gl) {
  return createShader(gl, pickProject)
}
