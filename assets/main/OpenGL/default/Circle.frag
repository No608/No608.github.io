precision mediump float;

uniform float uTime;
uniform vec2 u_resolution;
uniform vec2 u_mouse;


const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 BLUE = vec4(0.0, 0.0, 1.0, 1.0);

const float Circle_Radius = 0.5;
const vec4 InColor = RED;
const vec4 OutColor = BLUE;


float CirclePct(vec2 uv, vec2 O, float Radius)
{
	if (distance(uv, O) <= Radius)
	{
		return 1.0;
	}

	return 0.0;
}

void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 mousest = u_mouse / u_resolution;
	
	float p = CirclePct(st, mousest, Circle_Radius);
	vec4 Color = p * InColor + (1.0 - p) * OutColor;
	
    gl_FragColor = Color;
}
