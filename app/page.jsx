'use client'

import dynamic from 'next/dynamic'
import { useEffect, Suspense, useState } from 'react'
import { useFrame } from '@react-three/fiber'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const Central = dynamic(() => import('@/components/canvas/center/central').then((mod) => mod.Central), { ssr: false })
const LeftPanel = dynamic(() => import('@/components/canvas/left/leftPanel').then((mod) => mod.LeftPanel), { ssr: false })
const RightPanel = dynamic(() => import('@/components/canvas/right/rightPanel').then((mod) => mod.RightPanel), { ssr: false })
const WebSocketStream = dynamic(() => import('@/components/canvas/WebSocketStream').then((mod) => mod.WebSocketStream), { ssr: false })

export default function Page() {
  return (
    <>
      <div className='flex h-screen w-screen items-center justify-center bg-orange-100'>
        <div className='mx-auto flex w-full max-w-6xl gap-2'>
          {/* left */}
          <div className='left-panel relative aspect-[73/140] w-1/5 ' id="left-panel" data-panel="left">
            <View className='absolute inset-0 size-full' panelId="left">
              <Suspense fallback={null}>
                <LeftPanel />
                <WebSocketStream panelId="left" fps={10} />
                <Common />
              </Suspense>
            </View>
          </div>

          {/* central */}
          <div className='center-panel relative aspect-[3/2] w-3/5 ' id="center-panel" data-panel="center">
            <View className='absolute inset-0 size-full' panelId="center">
              <Suspense fallback={null}>
                <Central />
                <WebSocketStream panelId="center" fps={15} />
                <Common />
              </Suspense>
            </View>
          </div>

          {/* right */}
          <div className='right-panel relative aspect-[73/140] w-1/5 ' id="right-panel" data-panel="right">
            <View className='absolute inset-0 size-full' panelId="right">
              <Suspense fallback={null}>
                <RightPanel />
                <WebSocketStream panelId="right" fps={10} />
                <Common />
              </Suspense>
            </View>
          </div>
        </div>
      </div >
    </>
  )
}
