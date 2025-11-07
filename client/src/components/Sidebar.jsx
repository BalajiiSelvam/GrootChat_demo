import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from 'react-hot-toast'

const Sidebar = ({isMenuOpen, setIsMenuOpen}) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUserChats, setToken, token } = useAppContext()
  const [search, setSearch] = useState('')

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Successfully Logged Out')
  }

  const deleteChat = async (e, chatId) => {
    try{
      e.stopPropagation()
      const confirm = window.confirm('Are you sure you want to delete this chat?')
      if(!confirm) return
      const { data } = await axios.post('/api/chat/delete', {chatId}, {
        headers: {Authorization: token} })
        if(data.success){
          setChats(prev => prev.filter(chat => chat._id !== chatId))
          await fetchUserChats()
          toast.success(data.message)
        }
    }catch(error){
        toast.success(error.message)
    }
  }

  return (
    <div
      className={`flex flex-col h-screen min-w-[18rem] p-5
      dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30
      border-r border-gray-300 dark:border-[#80609F]/20
      backdrop-blur-3xl transition-all duration-500
      max-md:absolute max-md:top-0 max-md:left-0 max-md:z-10 ${!isMenuOpen && 'max-md:-translate-x-full'}`}
    >
      {/* Logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className='w-full max-w-[12rem] flex-shrink-0'
      />

        
      {/* New Chat Button */}
      <button
        onClick={createNewChat}
        className='flex justify-center items-center w-full py-2 mt-10 text-white
        bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer
        hover:opacity-90 transition duration-200 flex-shrink-0'
      >
        <span className='mr-2 text-xl'>+</span> New Chat
      </button>

      {/* Search Conversations */}
      <div
        className='flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20
        rounded-md'
      >
        <img
          src={assets.search_icon}
          alt="Search"
          className={`w-4 ${theme === 'light' ? 'invert' : ''}`}
        />
        <input
          type='text'
          placeholder='Search Conversations'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='text-xs placeholder:text-gray-400 outline-none bg-transparent flex-1'
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className='mt-4 text-gray-800 dark:text-[#B1A6C0]'>Recent Chats</p>}

      <div className='flex-1 overflow-y-auto mt-3 text-sm space-y-3'>
        {chats
          .filter((chat) => {
            const message = chat.messages[0]?.content || chat.name
            return message.toLowerCase().includes(search.toLowerCase())
          })
          .map((chat) => (
            <div
              key={chat._id || chat.name}
              onClick={() => {navigate('/'); setSelectedChat(chat); setIsMenuOpen(false)}}
              className='p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300
              dark:border-[#80609F]/20 rounded-md cursor-pointer flex justify-between items-start
              group hover:bg-gray-100 dark:hover:bg-[#57317C]/20 transition'
            >
              <div className='flex-1'>
                <p className='truncate w-full'>
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>
                  {moment(chat.updatedAt || new Date()).fromNow()}
                </p>
              </div>
              <img
                onClick={e=> toast.promise(deleteChat(e, chat._id), {loading: 'deleting...'})}
                src={assets.bin_icon}
                alt="Delete"
                className={`hidden group-hover:block w-4 mt-2 cursor-pointer ${theme === 'light' ? 'invert' : ''}`}
              />
            </div>
          ))}
      </div>

      {/* Toggle theme */}
      <div className='flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md'>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className={`w-4 ${theme === 'light' ? 'invert' : ''}`} alt="" />
          <p>Dark Mode</p>
        </div>
        <label className='relative inline-flex cursor-pointer'>
          <input
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            type="checkbox"
            className='sr-only peer'
            checked={theme === 'dark'}
          />
          <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all'></div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
        </label>
      </div>

      {/* User Account */}
      <div 
      className='flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md 
      cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#57317C]/20 transition-all'>
        <img src={assets.user_icon} className={`w-5 rounded-full`} alt="" />
          <p className='flex-1 text-sm dark:text-primary truncate'>{user ? user.name : 'Login your account'}</p>
          {user && <img onClick={logout} src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block'/>}
      </div>

      <img onClick={() => setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert' alt="" />
    </div>
  )
}

export default Sidebar
