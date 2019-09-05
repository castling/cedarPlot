precision mediump float;

#pragma glslify: outOfRange = require(glsl-out-of-range)

attribute vec3 position;
attribute vec4 color;
attribute float pointsize;
attribute vec4 id;

uniform vec4 highlightId;
uniform float highlightScale;
uniform mat4 model, view, projection;
uniform vec3 clipBounds[2];

varying vec4 interpColor;
varying vec4 pickId;
varying vec3 dataCoordinate;

void main() {
  if (outOfRange(clipBounds[0], clipBounds[1], position)) {

    gl_Position = vec4(0,0,0,0);
  } else {
    float scale = 1.0;
    if(distance(highlightId, id) < 0.0001) {
      scale = highlightScale;
    }

    vec4 worldPosition = model * vec4(position, 1);
    vec4 viewPosition = view * worldPosition;
    viewPosition = viewPosition / viewPosition.w;
    vec4 clipPosition = projection * viewPosition;

    gl_Position = clipPosition;
    gl_PointSize = pointsize;
    interpColor = color;
    pickId = id;
    dataCoordinate = position;
  }
}