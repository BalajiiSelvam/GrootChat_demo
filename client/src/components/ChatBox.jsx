import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const texts = [
  "Ask me anything ✨",
  "Get instant answers 🪄",
  "Chat smarter 💫",
  "Learn faster 🚀"
]

const ChatBox = () => {

  const containerRef = useRef(null)
  const { selectedChat, theme, user,  axios, token, setUser} = useAppContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPromtpt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async (e) => {
    try{
          e.preventDefault()
          if(!user) return toast('Login to send message')
            setLoading(true)
          const promptCopy = prompt
          setPromtpt('')
          setMessages(prev => [...prev, {role: 'user', content: prompt, timestamp: Date.now(), isImage: false}])
          const {data} = await axios.post(`/api/message/${mode}`, {chatId: selectedChat._id, prompt, isPublished}, {headers: {Authorization: token}})

          if(data.success){
            setMessages(prev => [...prev, data.reply])
            //Decrease credits
            if(mode === 'image'){
              setUser(prev => ({...prev, credits: prev.credits - 2}))
            }
            else{
              setUser(prev => ({...prev, credits: prev.credits - 1}))
            }
          }else{
            toast.error(data.message)
            setPromtpt(promptCopy)
          }
    }catch(error){
            toast.error(error.message)
    }finally{
      setPromtpt('')
      setLoading(false)
    }
  }

  const [displayText, setDisplayText] = useState("")
  const [index, setIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  // Typing Effect
  useEffect(() => {
    const currentText = texts[index % texts.length]
    const speed = isDeleting ? 60 : 40

    const timer = setTimeout(() => {
      setDisplayText(prev =>
        isDeleting
          ? currentText.substring(0, prev.length - 1)
          : currentText.substring(0, prev.length + 1)
      )

      if (!isDeleting && displayText === currentText) {
        setTimeout(() => setIsDeleting(true), 1000)
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false)
        setIndex(prev => prev + 1)
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, index])

  useEffect (() =>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior : "smooth",
      })
    }
  },[messages])
  
  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30
    max-md:mt-14 2xl:pr-40'>
      {/* Chat Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className='w-full max-w-56 sm:max-w-68'
            />
            <p className='mt-5 text-3xl sm:text-4xl text-center text-gray-400 dark:text-white font-semibold'>
              {displayText}
              <span className='border-r-2 border-gray-400 animate-pulse ml-1'></span>
            </p>
          </div>
        )}
        {messages.map((message, index) => <Message key={index} message={message} />)}

        {/* Three dot loading animation */}
        {
          loading && <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        }
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
        </label>
      )}

      {/* Prompt Input Box */}
    <form
      onSubmit={onSubmit}
      className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30
      rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
    >
      <select
        onChange={(e) => setMode(e.target.value)}
        value={mode}
        className="text-sm pl-3 pr-2 outline-none"
      >
        <option className="dark:bg-purple-900" value="text">Text</option>
        <option className="dark:bg-purple-900" value="image">Image</option>
      </select>

      <input
        onChange={(e) => setPromtpt(e.target.value)}
        value={prompt}
        type="text"
        placeholder="Type your prompt here ..."
        className="flex-1 w-full text-sm outline-none"
        required
      />

      {/* File Upload Icon */}
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*,.txt,.pdf"
          className="hidden"
          onChange={(e) => console.log(e.target.files[0])}
        />
        <img
          src={assets.upload_icon || assets.attach_icon} 
          alt="Upload"
              className="w-6 h-6 opacity-80 hover:opacity-100 transition
               dark:invert"  
        />
      </label>

      <button disabled={loading}>
        <img
          src={loading ? assets.stop_icon : assets.send_icon}
          className="w-8 cursor-pointer"
          alt=""
        />
      </button>
    </form>

    </div>
  )
}

export default ChatBox
