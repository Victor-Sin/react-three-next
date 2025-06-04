import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'

const basePosablesFreq = {
  5: {
    name: "thunder",
    map: {
      splash: [],
      zoom: [[8, 12], [8, 11], [9, 11], [9, 12]],
      global: [],
    },
    isIn: false
  },
  7.5: {
    name: "boat",
    map: {
      splash: [],
      zoom: [[8, 2], [7, 2], [8, 3]],
      global: [[13, 2], [12, 2]],
    },
    isIn: false
  },
  3.5: {
    name: "sun",
    map: {
      splash: [[9, 1], [9, 2]],
      zoom: [[19, 10], [20, 10]],
      global: [[17, 12], [17, 11], [18, 12], [18, 11]],
    },
    isIn: false
  },
  4.5: {
    name: "fire",
    map: {
      splash: [],
      zoom: [],
      global: [[6, 4], [7, 4]],
    },
    isIn: false
  }
}

export const Posable = ({ scale = [1, 1, 1] }) => {
  const col = 20;
  const line = 12;

  const scaleNew = [scale[0] * 1000 / 1500, scale[1] * 600 / 1000]
  const distance = [scaleNew[0] / col, scaleNew[1] / line]
  const marginGrid = [distance[0] / 2, distance[1] / 2]

  const emptyArray = new Array(col * line).fill(0)

  const positionbase = [-scale[0] / 2 + scaleNew[0] / 2, -scale[1] / 2 + scaleNew[1] / 2, 0.0001]
  const position = [positionbase[0] + scale[0] * 267 / 1487, positionbase[1] + scale[1] * 139 / 989, 0.0001]
  const gridBasePosition = [-scale[0] / 2 + scale[0] * 267 / 1487 + marginGrid[0], -scale[1] / 2 + scale[1] * 139 / 989 + marginGrid[0], 0.0001];

  function displayGrid() {
    let lineTmp = 0;
    console.log("test")
    return emptyArray.map((elt, i) => {
      console.log("i", i)
      const colTmp = i % col;
      const pos = [gridBasePosition[0] + distance[0] * colTmp, gridBasePosition[1] + distance[1] * lineTmp, 0.0001]
      if (colTmp == col - 1) {
        lineTmp++;
      }
      return (
        <mesh key={`${(colTmp + 1) * (lineTmp + 1)}_cell`} position={pos}>
          < planeGeometry args={[0.05, 0.05]} />
          <meshBasicMaterial color="red" opacity={0.5} transparent />
        </mesh>
      )
    })
  }


  return (
    <group>
      <mesh position={position}>
        < planeGeometry args={scaleNew} />
        <meshBasicMaterial color="blue" opacity={0.5} transparent />
      </mesh>
      {displayGrid()}
    </group >

  )
}
