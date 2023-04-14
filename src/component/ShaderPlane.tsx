import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Canvas, useFrame } from '@react-three/fiber'

// Define the fragment shader
let fragmentShader = `
// Defines for the ray marcher
#define MAX_STEPS 100.
#define MAX_DIS 100.
#define HIT_EPS 0.00001
#define SLOPE_EPS 0.0001

// Defines for shader settings
#define DETAIL_ITER 2 // How detailed the Menger Sponge is
#define MAIN_COL vec3(.2,.5,1.) // Main color of the shape

// From https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float rand(vec3 co) {
    return fract(sin(dot(co, vec3(12.9898, 53.18324, 78.233))) * 439758.5453);
}

struct Hit {
    float dis;
    vec3 albedo;
};

Hit uHit(Hit h1, Hit h2) {
    if (h1.dis < h2.dis) return h1; else return h2;
}

Hit iHit(Hit h1, Hit h2) {
    if (h1.dis > h2.dis) return h1; else return h2;
}

Hit dHit(Hit h1, Hit h2) {
    if (h1.dis > -h2.dis) return h1; else return Hit(-h2.dis, h2.albedo);
}

struct March {
    Hit hit;
    float disCovered;
    float minDis;
    int steps;
    bool hasHit;
};

March initMarch()
{
    Hit initHit = Hit(HIT_EPS, vec3(0));
    return March(initHit, 0., 1e20, 0, false);
}

float SDFbox(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float SDFmengerSponge(vec3 pos, float os) {
    float b = SDFbox(pos, vec3(os, os, os));
    float s = os/3.;

    float c = os/3.;
    vec3 pmod;

    for (int i = 0; i < DETAIL_ITER; i++) {
        s /= 3.;
        pmod = mod(pos + c, c * 2.) - c;
        b = max(b, -SDFbox(pmod, vec3(os, s, s)));
        b = max(b, -SDFbox(pmod, vec3(s, os, s)));
        b = max(b, -SDFbox(pmod, vec3(s, s, os)));
        c /= 3.;
    }

    s = os / 3.;
    os += 1.;

    b = max(b, -SDFbox(pos, vec3(os, s, s)));
    b = max(b, -SDFbox(pos, vec3(s, os, s)));
    b = max(b, -SDFbox(pos, vec3(s, s, os)));

    return b;
}

Hit getHit(vec3 pos) {
    return Hit(SDFmengerSponge(pos, 1.), vec3(MAIN_COL));
}

March RayMarch(vec3 pos, vec3 dir) {
    // inits
    March marched = initMarch();
    vec3 currpos = pos;
    float disCovered = 0.;
    
    // marching
    while (marched.disCovered < MAX_DIS) {
        currpos = pos + dir*disCovered;

        Hit currHit = getHit(currpos);
        
        marched.hasHit = abs(currHit.dis) < HIT_EPS;
        marched.hit = currHit;
        disCovered += currHit.dis;
        marched.disCovered += currHit.dis;
        marched.minDis = min(marched.minDis, currHit.dis);
        marched.steps++;

        if (marched.hasHit || marched.disCovered > MAX_DIS) break;
    }

    return marched;
}

// From https://iquilezles.org/articles/rmshadows/
float LightMarch(vec3 pos, vec3 dir, vec3 lpos, float k) {
    // inits
    float lf = 1.; // lit factor
    vec3 currpos = pos;
    float posTOlpos = distance(pos, lpos);
    
    float preDis;
    float currDis;
    float currDis2;
    
    // marching
    for (float disCovered = 0.; disCovered < MAX_DIS;) {
        if (disCovered > posTOlpos) break;
        
        currpos = pos + dir*disCovered;
        currDis = getHit(currpos).dis;
        if (currDis < HIT_EPS) return 0.;
        
        currDis2 = currDis*currDis;
        
        float y = currDis2/(2.0*preDis);
        float d = sqrt(currDis2-y*y);
        
        lf = min(lf, k*d/max(0.0,disCovered-y));
        //lf = min(lf, k*currDis/disCovered);
        preDis = currDis;
        disCovered += currDis;
    }
    return lf;
}

// from https://iquilezles.org/articles/normalsSDF/
vec3 getNormal(vec3 pos)
{
    vec3 n = vec3(0.0);
    for(int i=0; i<4; i++)
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*getHit(pos+e*SLOPE_EPS).dis;
    }
    return normalize(n);
}

vec4 getPixel(vec3 cpos, vec3 cdir, vec3 lpos, vec3 lcol) {
    // March
    March m = RayMarch(cpos, cdir);

    // Hit position
    vec3 hpos = cpos + cdir*m.disCovered;
        
    // Normal
    vec3 n = getNormal(hpos);
        
    //// Ambient Occlusion
    float Apower = 0.25;
    float AO = 0.;
        
    float e = 0.1;
    float weight = 0.5;
    for (int i = 1; i <= DETAIL_ITER; ++i) // https://www.shadertoy.com/view/lltBR4
    {
        float d = e * float(i);
        AO += weight * (1.0 - (d - getHit(hpos + d * n).dis));
            
        weight *= 0.5;
    }
        
    AO *= Apower;
        
    // Light dir
    vec3 l = normalize(lpos-hpos);
        
    //// Diffuse
    float Dpower = 0.5;
    float D = clamp(dot(n,l), 0., 1.)*Dpower;
        
    //// Specular
    float Spower = 0.1;
    float Shardness = 8.;
    float S = pow(clamp(dot(n,l), 0., 1.), Shardness)*Spower;
        
    // Grain
    float grainPower = 0.035;
    float grain = rand(hpos)*grainPower;

    // Soft Shadows
    float shadow = LightMarch(hpos+n*HIT_EPS*5., l, lpos, 16.);
    
    // Glow
    float glow = float(m.steps)/float(MAX_STEPS);
    vec3 glowCol = vec3(.2,0.85,1);
    vec3 glowRes = glow*glowCol;
    
    // Light final color
    vec3 lfinal = m.hit.albedo*lcol*(AO + D*shadow + S);

    if (m.hasHit) return vec4(glowRes + lfinal - grain, 1); 
    return vec4(0);
}

mat3 lookAt(vec3 eye, vec3 center, vec3 up) {
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat3(s, u, f);
}

uniform float u_time;
uniform float size;
varying vec2 vUv;

void main()
{
    vec2 uv = vUv;

    // Setting up view port
    float zoom = 1.;
    vec2 zoomCenter = vec2(0., 0.);
    float viewPortCenter = 0.5;

    // Establishing screen xy values
    vec2 xy = (uv - viewPortCenter) * zoom + zoomCenter;
    xy = vec2(xy.x, xy.y);

    xy /= max(size/1500., .75);

    // Establishing mouse xy values
    //mouse = (mouse - viewPortCenter) * zoom + zoomCenter;
    //mouse.y *= ratio;

    // Camera init
    float cdis = 6.;
    vec3 cpos;

    // if (sign(iMouse.z) == 1.)
        // cpos = vec3(sin(mouse.x*10.)*cdis, mouse.y*cdis*4., cos(mouse.x*10.)*cdis);
    // else 
        cpos = vec3(sin(u_time/5.)*cdis, 2., cos(u_time/5.)*cdis);

    vec3 cup = vec3(0,1,0);
    vec3 ctar = vec3(0,0,0);
    vec3 cdir = normalize(vec3(xy,1));
    
    vec3 cwdir = lookAt(cpos, ctar, cup)*cdir;
    
    // Light init
    vec3 lpos = vec3(10);
    vec3 lcol = vec3(1);

    // Return color
    gl_FragColor = getPixel(cpos, cwdir, lpos, lcol);
}
`;

const ShaderPlane = () => {
  const [vert, setVert] = useState("varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);}");
  const [frag, setFrag] = useState(fragmentShader);
  const [time, setTime] = useState(0);
  // const [size, setSize] = useState(15);

  const meshRef = useRef<any>(null); // Ref for the mesh component


  useEffect(() => {
    const _ = setTimeout(() => {
      setTime(prevTime => prevTime + 0.01);
    }, 10);
  });

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0.0,},
      size : { value : window.innerWidth },
    }), []
  );

  useFrame((state) => {
    const { clock } = state;
    meshRef.current.material.uniforms.u_time.value = clock.getElapsedTime();
    meshRef.current.material.uniforms.size.value = window.innerWidth;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default ShaderPlane;