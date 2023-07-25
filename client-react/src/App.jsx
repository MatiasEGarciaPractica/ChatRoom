import { useState } from 'react'
import ChatRoom from './Components/ChatRoom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ChatRoom/>
    </>
  )
}

export default App
