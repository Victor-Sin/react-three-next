import { Layout } from '@/components/dom/Layout'
import '@/global.css'
import { ReduxProvider } from '@/providers/ReduxProvider'
import { TextureProvider } from '@/contexts/Texturecontext'
import { Chelsea_Market, Roboto_Mono } from 'next/font/google'

// Configure Chelsea Market font
const chelseaMarket = Chelsea_Market({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-chelsea-market',
})

// Keep a monospace font for code blocks
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export const metadata = {
  title: 'Next.js + Three.js',
  description: 'A minimal starter for Nextjs + React-three-fiber and Threejs.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`antialiased ${chelseaMarket.variable} ${robotoMono.variable}`}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className={chelseaMarket.className}>
        <TextureProvider>
          <ReduxProvider>
            {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
            <Layout>{children}</Layout>
          </ReduxProvider>
        </TextureProvider>
      </body>
    </html>
  )
}
