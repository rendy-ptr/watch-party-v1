'use client'

import { useState, useRef, useEffect } from 'react'
import { Users, ChevronDown, Crown, User } from 'lucide-react'
import Image from 'next/image'
import { formatToWIB } from '@/lib/date'
import { useYoutubeRoomStore } from '@/store/youtubeRoomStore'

const OnlineUsers = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { onlineUsers, onlineUsersList } = useYoutubeRoomStore()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Separate users by role
  const owners = onlineUsersList.filter((user) => user.role === 'owner')
  const guests = onlineUsersList.filter((user) => user.role === 'guest')

  return (
    <div className="relative">
      {/* Online Users Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
      >
        <Users className="h-5 w-5 text-white" />
        <span className="text-white font-medium">{onlineUsers}</span>
        <ChevronDown
          className={`h-4 w-4 text-white transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop overlay for mobile */}
          <div
            className="fixed z-40 lg:hidden"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown content */}
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Online Users</h3>
                <span className="px-2 py-1 font-bold text-white">
                  {onlineUsers} online
                </span>
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-80 overflow-y-auto">
              {onlineUsersList.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-white">No users online</p>
                </div>
              ) : (
                <div className="p-2">
                  {/* Owners Section */}
                  {owners.length > 0 && (
                    <div className="mb-3">
                      <div className="px-2 py-1 text-xs font-bold text-white uppercase tracking-wide border-b border-gray-200/50 mb-2">
                        Room Owners ({owners.length})
                      </div>
                      {owners.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {/* User Avatar */}
                          <div className="relative flex-shrink-0">
                            {user.photoURL ? (
                              <Image
                                src={user.photoURL}
                                width={32}
                                height={32}
                                alt={user.name || 'owner'}
                                className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-yellow-400">
                                <Crown className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate">
                                {user.name}
                              </span>
                              <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                Owner
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {formatToWIB(user.joinedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Guests Section */}
                  {guests.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide border-b border-gray-200/50 mb-2">
                        Guests ({guests.length})
                      </div>
                      {guests.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {/* User Avatar */}
                          <div className="relative flex-shrink-0">
                            {user.photoURL ? (
                              <Image
                                src={user.photoURL}
                                width={32}
                                height={32}
                                alt={user.name || 'guest'}
                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center border-2 border-gray-300">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-white  truncate block">
                              {user.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                Guest
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {formatToWIB(user.joinedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {onlineUsersList.length > 0 && (
              <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <p className="text-sm text-white text-center">
                  {owners.length} owner{owners.length !== 1 ? 's' : ''} •{' '}
                  {guests.length} guest{guests.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default OnlineUsers
