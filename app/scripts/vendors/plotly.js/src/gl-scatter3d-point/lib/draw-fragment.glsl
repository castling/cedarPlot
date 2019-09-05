precision mediump float;

#pragma glslify: outOfRange = require(glsl-out-of-range)

uniform vec3 fragClipBounds[2];
uniform float opacity;
uniform int useSprite;
uniform sampler2D sprite;

varying vec4 interpColor;
varying vec4 pickId;
varying vec3 dataCoordinate;

void main() {
  if (outOfRange(fragClipBounds[0], fragClipBounds[1], dataCoordinate)) discard;

  gl_FragColor = interpColor * opacity;

  vec4 smpColor = vec4(1.0);
  if( useSprite==1 ) {
    smpColor = texture2D(sprite, gl_PointCoord);
  }
  if(smpColor.a == 0.0){
    discard;
  }
  gl_FragColor = gl_FragColor * smpColor * vec4(vec3(1.0),opacity);
}
