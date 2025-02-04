// this file must use UNIX Style End of Line
// otherwise the regex for #extension in Cesium.ShaderSource won't work
#extension GL_EXT_draw_buffers : enable

uniform sampler2D fromParticlesPosition;
uniform sampler2D toParticlesPosition;
uniform sampler2D particlesRelativeSpeed;

// range (min, max)
uniform vec2 lonRange;
uniform vec2 latRange;

uniform float randomCoef; // use to improve the pseudo-random generator
uniform float dropRate; // drop rate is a chance a particle will restart at random position to avoid degeneration
uniform float dropRateBump;

varying vec2 v_textureCoordinates;

// pseudo-random generator
const vec3 randomConstants = vec3(12.9898, 78.233, 4375.85453);
const vec2 normalRange = vec2(0.0, 1.0);
float rand(vec2 seed, vec2 range) {
	vec2 randomSeed = randomCoef * seed;
    float temp = dot(randomConstants.xy, randomSeed);
    temp = fract(sin(temp) * (randomConstants.z + temp));
    return temp * (range.y - range.x) + range.x;
}

vec4 generateRandomParticle(vec2 seed, float lev) {
    // ensure the longitude is in [0, 360]
    float randomLon = mod(rand(seed, lonRange), 360.0);
    float randomLat = rand(-seed, latRange);

    return vec4(randomLon, randomLat, lev, 0.0);
}

void main() {
    vec3 relativeSpeed = texture2D(particlesRelativeSpeed, v_textureCoordinates).rgb;
    float particleDropRate = dropRate + dropRateBump * length(relativeSpeed);

    vec4 fromParticle = texture2D(fromParticlesPosition, v_textureCoordinates);
    vec4 toParticle = texture2D(toParticlesPosition, v_textureCoordinates);
	
	vec2 seed1 = fromParticle.xy + v_textureCoordinates;
	vec2 seed2 = toParticle.xy + v_textureCoordinates;
    vec4 randomParticle = generateRandomParticle(seed1, fromParticle.z);

    float randomNumber = rand(seed2, normalRange);
    if (randomNumber > particleDropRate) {
        gl_FragData[0] = fromParticle;
        gl_FragData[1] = toParticle;
    } else {
        gl_FragData[0] = randomParticle;
        gl_FragData[1] = randomParticle;
    }
}