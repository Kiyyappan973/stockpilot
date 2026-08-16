import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Receives "hasLowStock" as a prop — true or false
function PackageBox({ hasLowStock }) {
  const groupRef = useRef()

  useFrame(() => {
    groupRef.current.rotation.x += 0.008
    groupRef.current.rotation.y += 0.012
  })

  // Pick colors based on stock health
  const boxColor = hasLowStock ? '#dc2626' : '#c68b59'
  const tapeColor = hasLowStock ? '#fca5a5' : '#e8d5b7'

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial color={boxColor} />
      </mesh>
      <mesh>
        <boxGeometry args={[1.65, 0.25, 1.65]} />
        <meshStandardMaterial color={tapeColor} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.25, 1.65, 1.65]} />
        <meshStandardMaterial color={tapeColor} />
      </mesh>
    </group>
  )
}

function RotatingCube({ hasLowStock }) {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <PackageBox hasLowStock={hasLowStock} />
    </Canvas>
  )
}

export default RotatingCube