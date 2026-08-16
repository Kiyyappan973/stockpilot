import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei'
import { useState, useRef } from 'react'

const categoryColors = {
  General: '#94a3b8',
  Electronics: '#3b82f6',
  Clothing: '#8b5cf6',
  Food: '#f59e0b',
  Tools: '#10b981',
  Furniture: '#ef4444'
}

const SLOTS_PER_SHELF = 4
const SHELVES_PER_RACK = 3
const SHELF_HEIGHT = 1.2
const SLOT_SPACING = 1.1
const RACK_WIDTH = SLOTS_PER_SHELF * SLOT_SPACING

// One product box, sitting on a specific shelf level
function ProductBox({ product, position, index }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()

  // Box height reflects stock, but capped so it never overflows into the shelf above
  const height = Math.min(0.3 + product.quantity * 0.03, 0.9)
  const color = categoryColors[product.category] || categoryColors.General

  useFrame((state) => {
    if (meshRef.current) {
      const offset = index * 0.5
      meshRef.current.position.y =
        position[1] + height / 2 + Math.sin(state.clock.elapsedTime * 1.5 + offset) * 0.03
    }
  })

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position[0], position[1] + height / 2, position[2]]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.15 : 1}
        castShadow
      >
        <boxGeometry args={[0.7, height, 0.7]} />
        <meshStandardMaterial
          color={hovered ? '#facc15' : color}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {hovered && (
        <Html position={[position[0], position[1] + height + 0.5, position[2]]} center>
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            {product.name} (Qty: {product.quantity})
          </div>
        </Html>
      )}
    </group>
  )
}

// One shelf rack: vertical posts + horizontal shelf boards
function ShelfRack({ xOffset }) {
  const postPositions = [
    [-RACK_WIDTH / 2, 0, -0.5],
    [RACK_WIDTH / 2, 0, -0.5],
    [-RACK_WIDTH / 2, 0, 0.5],
    [RACK_WIDTH / 2, 0, 0.5]
  ]
  const rackTopHeight = SHELVES_PER_RACK * SHELF_HEIGHT + 0.3

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Vertical posts */}
      {postPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], rackTopHeight / 2, pos[2]]} castShadow>
          <boxGeometry args={[0.08, rackTopHeight, 0.08]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* Horizontal shelf boards, one per level */}
      {Array.from({ length: SHELVES_PER_RACK }).map((_, level) => (
        <mesh
          key={level}
          position={[0, level * SHELF_HEIGHT + 0.05, 0]}
          receiveShadow
        >
          <boxGeometry args={[RACK_WIDTH + 0.2, 0.06, 1.1]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Warehouse() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.9} />
      </mesh>
      <gridHelper args={[40, 40, '#9ca3af', '#e5e7eb']} />
    </>
  )
}

function WarehouseScene({ products, onBoxClick }) {
  const slotsPerRack = SLOTS_PER_SHELF * SHELVES_PER_RACK
  const rackCount = Math.max(1, Math.ceil(products.length / slotsPerRack))
  const rackSpacing = RACK_WIDTH + 1.5

  return (
    <Canvas shadows camera={{ position: [10, 8, 10], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Environment preset="warehouse" />

      <Warehouse />

      {Array.from({ length: rackCount }).map((_, rackIndex) => {
        const xOffset = (rackIndex - (rackCount - 1) / 2) * rackSpacing
        return <ShelfRack key={rackIndex} xOffset={xOffset} />
      })}

      {products.map((product, index) => {
        const rackIndex = Math.floor(index / slotsPerRack)
        const indexInRack = index % slotsPerRack
        const level = Math.floor(indexInRack / SLOTS_PER_SHELF)
        const slot = indexInRack % SLOTS_PER_SHELF

        const xOffset = (rackIndex - (rackCount - 1) / 2) * rackSpacing
        const x = xOffset + (slot - (SLOTS_PER_SHELF - 1) / 2) * SLOT_SPACING
        const y = level * SHELF_HEIGHT + 0.08
        const z = 0

        return (
          <ProductBox
            key={product.id}
            product={product}
            position={[x, y, z]}
            index={index}
            onBoxClick={onBoxClick}
          />
        )
      })}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={40} blur={2} far={10} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        autoRotate={true}
        autoRotateSpeed={0.8}
      />
    </Canvas>
  )
}

export default WarehouseScene