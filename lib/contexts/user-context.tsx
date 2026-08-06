'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserProfile } from '@/lib/types'
import { fetchProfile } from '@/lib/actions'

// UUID v4 generator that works in all environments without the uuid package
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface UserContextValue {
  profile: UserProfile | null
  loading: boolean
  setProfile: (profile: UserProfile) => void
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
  setProfile: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        let deviceId = localStorage.getItem('smart_shelf_device_id')
        if (!deviceId) {
          deviceId = generateUUID()
          localStorage.setItem('smart_shelf_device_id', deviceId)
        }

        const data = await fetchProfile(deviceId)
        if (data) {
          setProfileState(data)
        }
      } catch (error) {
        console.error('Failed to load profile', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  return (
    <UserContext.Provider value={{ profile, loading, setProfile: setProfileState }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
