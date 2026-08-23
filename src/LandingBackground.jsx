import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

// One floating, slowly tumbling box
function FloatingBox({ position, size, color, speed }) {
  const meshRef = useRef()
  const rotSpeed = useMemo(() => ({
    x: (Math.random() - 0.5) * speed,
    y: (Math.random() - 0.5) * speed,
  }), [speed])

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += rotSpeed.x * 0.01
    meshRef.current.rotation.y += rotSpeed.y * 0.01
    // Gentle drifting float
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.6
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.6}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

function Scene() {
  // Generate a fixed field of boxes, scattered in 3D space
  const boxes = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => {
      const s = 0.4 + Math.random() * 1.1
      return {
        id: i,
        position: [
          (Math.random() - 0.5) * 24,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14 - 4
        ],
        size: [s, s, s],
        color: colors[i % colors.length],
        speed: 1 + Math.random() * 2
      }
    })
  }, [])

  const groupRef = useRef()
  useFrame((state) => {
    if (groupRef.current) {
      // The whole field slowly rotates, like drifting through space
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -5, -5]} intensity={0.6} color="#3b82f6" />
      {boxes.map((box) => (
        <FloatingBox key={box.id} position={box.position} size={box.size} color={box.color} speed={box.speed} />
      ))}
    </group>
  )
}

function LandingBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      gl={{ alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene />
    </Canvas>
  )
}

export default LandingBackground