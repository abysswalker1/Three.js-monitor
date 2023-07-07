#define M_PI 3.1415926535897932384626433832795

varying vec3 vColor;

#pragma glslify: perlin4d = require('../partials/perlin4d.glsl');
#pragma glslify: perlin3d = require('../partials/perlin3d.glsl')

vec3 getDisplacedPosition(vec3 _position) {
  return _position * perlin4d(_position, 5.0);  
}

void main()
{
    // Position
    vec3 displacedPosition = getDisplacedPosition(position);
    vec4 viewPosition = viewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    vec3 color = vec3(uv, 1.0);

    // Varying
    vColor = color;
}