import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   Texture URLs (served from /public/textures/)
   ───────────────────────────────────────────── */
const EARTH_DAY_URL = '/textures/earth_day.jpg';
const EARTH_NIGHT_URL = '/textures/earth_night.jpg';

/* ─────────────────────────────────────────────
   GLSL  —  Day / Night blended Earth shader
   ───────────────────────────────────────────── */
const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    // World-space normal & position for lighting
    vNormal  = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 day   = texture2D(dayTexture, vUv).rgb;
    vec3 night = texture2D(nightTexture, vUv).rgb;

    vec3 N = normalize(vNormal);
    vec3 L = normalize(sunDirection);

    float NdotL = dot(N, L);

    /* ── Day / Night blend ─────────────────── */
    float dayFactor = smoothstep(-0.12, 0.25, NdotL);

    // Lambertian-ish day shading
    float dayShade = clamp(NdotL, 0.0, 1.0) * 0.55 + 0.45;
    vec3 dayResult = day * dayShade;

    // Boost city-light brightness on the dark side
    vec3 nightResult = night * 2.2;

    vec3 color = mix(nightResult, dayResult, dayFactor);

    /* ── Terminator glow (warm amber band) ─── */
    float tGlow = exp(-pow(NdotL / 0.10, 2.0));
    color += vec3(1.0, 0.50, 0.12) * tGlow * 0.45;

    // Secondary softer blue-side glow
    float tGlow2 = exp(-pow((NdotL + 0.15) / 0.18, 2.0));
    color += vec3(0.15, 0.25, 0.55) * tGlow2 * 0.25;

    /* ── Shiny Atmosphere rim (fresnel) ──────────── */
    vec3 V = normalize(cameraPosition - vWorldPos);
    float fresnel = max(1.0 - max(dot(N, V), 0.0), 0.0);
    
    // A soft inner blueish glow
    color += vec3(0.2, 0.5, 1.0) * pow(fresnel, 3.0) * 0.4;
    
    // A sharp, brighter white-blue edge for that "shiny" look
    color += vec3(0.7, 0.9, 1.0) * pow(fresnel, 6.0) * 0.7;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ─────────────────────────────────────────────
   GLSL  —  Outer atmosphere glow
   ───────────────────────────────────────────── */
const atmoVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vNormal   = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmoFragmentShader = /* glsl */ `
  uniform vec3 sunDirection;

  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - max(dot(N, V), 0.0);

    // Sun-side gets a warmer tint
    float sunFactor = max(dot(N, normalize(sunDirection)), 0.0);

    vec3 coolColor = vec3(0.25, 0.50, 1.0);   // blue
    vec3 warmColor = vec3(0.6,  0.45, 0.2);   // amber
    vec3 atmoColor = mix(coolColor, warmColor, sunFactor * 0.4);

    float intensity = pow(fresnel, 3.0) * 0.55;
    gl_FragColor = vec4(atmoColor * intensity, intensity);
  }
`;

/* ═════════════════════════════════════════════
   Component: Earth sphere
   ═════════════════════════════════════════════ */
function Earth({ sunDirection }) {
  const meshRef = useRef();

  const [dayMap, nightMap] = useTexture([EARTH_DAY_URL, EARTH_NIGHT_URL]);

  // Uniforms are created once; sunDirection is updated every frame
  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      sunDirection: { value: new THREE.Vector3() },
    }),
    [dayMap, nightMap]
  );

  useFrame(() => {
    const mat = meshRef.current?.material;
    if (mat?.uniforms) {
      mat.uniforms.sunDirection.value.set(
        sunDirection[0],
        sunDirection[1],
        sunDirection[2]
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
    >
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* ═════════════════════════════════════════════
   Component: Outer atmosphere halo
   ═════════════════════════════════════════════ */
function Atmosphere({ sunDirection }) {
  const meshRef = useRef();

  const uniforms = useMemo(
    () => ({
      sunDirection: { value: new THREE.Vector3() },
    }),
    []
  );

  useFrame(() => {
    const mat = meshRef.current?.material;
    if (mat?.uniforms) {
      mat.uniforms.sunDirection.value.set(
        sunDirection[0],
        sunDirection[1],
        sunDirection[2]
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.06, 64, 64]} />
      <shaderMaterial
        vertexShader={atmoVertexShader}
        fragmentShader={atmoFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}



/* ═════════════════════════════════════════════
   Component: Draggable Earth + Atmosphere group
   Hold left-click and drag to rotate the globe
   in any direction (quaternion-based).
   ═════════════════════════════════════════════ */
function DraggableEarthGroup({ sunDirection }) {
  const groupRef = useRef();
  const dragState = useRef({ isDragging: false, prevX: 0, prevY: 0 });
  const { gl } = useThree();
  const initialized = useRef(false);

  // Set the initial rotation + position once (North America facing, shifted right)
  useEffect(() => {
    if (groupRef.current && !initialized.current) {
      groupRef.current.rotation.set(0.35, -1.6, 0.12);
      groupRef.current.position.set(0.8, 0, 0); // offset right
      initialized.current = true;
    }
  }, []);

  // Attach drag listeners to the canvas DOM element
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e) => {
      if (e.button !== 0) return; // left-click only
      dragState.current.isDragging = true;
      dragState.current.prevX = e.clientX;
      dragState.current.prevY = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!dragState.current.isDragging || !groupRef.current) return;

      const dx = (e.clientX - dragState.current.prevX) * 0.005;
      const dy = (e.clientY - dragState.current.prevY) * 0.005;
      dragState.current.prevX = e.clientX;
      dragState.current.prevY = e.clientY;

      // Build a rotation quaternion from the mouse delta and
      // premultiply so rotation feels trackball-like
      const q = new THREE.Quaternion();
      q.setFromEuler(new THREE.Euler(dy, dx, 0, 'XYZ'));
      groupRef.current.quaternion.premultiply(q);
    };

    const onPointerUp = () => {
      dragState.current.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl]);

  return (
    <group ref={groupRef}>
      <Earth sunDirection={sunDirection} />
    </group>
  );
}

/* ═════════════════════════════════════════════
   Component: Subtle camera breathing
   ═════════════════════════════════════════════ */
function CameraDrift() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    // 0.16 frequency ≈ 40 second loop (2 * PI / 0.16)
    camera.position.x = Math.sin(t * 0.16) * 0.12;
    // slightly different frequency so the motion doesn't repeat identically every loop
    camera.position.y = Math.cos(t * 0.12) * 0.08;
  });
  return null;
}

/* ═════════════════════════════════════════════
   Inner scene (inside Canvas / Suspense)
   ═════════════════════════════════════════════ */
function Scene({ sunDirection, dialOverlay }) {
  return (
    <>
      {/* Ambient fills the deep shadow side just a touch */}
      <ambientLight intensity={0.03} color="#4466aa" />

      {/* Directional light (for satellite + any standard materials) */}
      <directionalLight
        position={[
          sunDirection[0] * 10,
          sunDirection[1] * 10 + 2,
          sunDirection[2] * 10,
        ]}
        intensity={2}
        color="#fff5e0"
      />

      <DraggableEarthGroup sunDirection={sunDirection} />
      
      {/* 3D-anchored HTML overlay exactly at the globe's VISUAL position 
          (Offset from 0.8 to ~0.925 due to perspective distortion from camera at x=0) */}
      {dialOverlay && (
        <Html position={[0.925, 0, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          {dialOverlay}
        </Html>
      )}

      <Stars
        radius={120}
        depth={60}
        count={6000}
        factor={4}
        saturation={0}
        fade
        speed={0.6}
      />

      <CameraDrift />
    </>
  );
}

/* ═════════════════════════════════════════════
   Exported wrapper  — full-viewport Canvas
   ═════════════════════════════════════════════ */
export default function EarthScene({ sunDirection, dialOverlay }) {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#02040a']} />
      <Suspense fallback={null}>
        <Scene sunDirection={sunDirection} dialOverlay={dialOverlay} />
      </Suspense>
    </Canvas>
  );
}
