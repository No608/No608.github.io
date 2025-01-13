precision mediump float;

uniform float uTime;
uniform vec2 u_resolution;
uniform vec2 u_mouse;


const float Circle_Value = 0.5;
const vec4 InColor = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 OutColor = vec4(0.0, 0.0, 1.0, 1.0);


void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 mousest = u_mouse / u_resolution;

    float d = distance(st, mousest);
    
    vec4 Color = OutColor;

    if (d <= Circle_Value)
    {
        Color = InColor;
    }

    gl_FragColor = Color;
}
