#define PI 3.1415926538

//// Comparison functions
float gt(float v1, float v2)
{
    return step(v2,v1);
}

float lt(float v1, float v2)
{
    return step(v1, v2);
}

float between(float val, float start, float end)
{
    return gt(val,start)*lt(val,end);
}

float eq(float v1, float v2, float e)
{
    return between(v1, v2-e, v2+e);
}

float s_gt(float v1, float v2, float e)
{
    return smoothstep(v2-e, v2+e, v1);
}

float s_lt(float v1, float v2, float e)
{
    return smoothstep(v1-e, v1+e, v2);
}

float s_between(float val, float start, float end, float epsilon)
{
    return s_gt(val,start,epsilon)*s_lt(val,end,epsilon);
}

float s_eq(float v1, float v2, float e, float s_e)
{
    return s_between(v1, v2-e, v2+e, s_e);
}


uniform float u_time;
uniform float size;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  float viewPortCenter = 0.5;
    
  vec2 xy = uv - vec2(viewPortCenter);

  xy*=50.;
    
  float x = xy.x;
  float y = xy.y;
  
  float r = sqrt(x*x + y*y);
  float a = atan(y,x);

  vec4 col = vec4(0);
  float val = s_eq(cos(r-a+u_time), sin(a-r/2.+u_time*2.), 0.5, 0.2);
  col.ra += val;
  col.rga += val;
  
  col.rga *= 1.-length(xy)/10.;

  gl_FragColor = col;
}