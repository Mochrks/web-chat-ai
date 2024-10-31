import { Inter } from 'next/font/google'
import Layout from '@/components/demo/Layout'
import ChatArea from '@/components/demo/ChatArea'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Layout>
      <ChatArea />
    </Layout>
  )
}