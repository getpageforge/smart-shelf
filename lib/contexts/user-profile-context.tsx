'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { getProfile } from '@/lib/actions'
import type { UserProfile } from '@/lib/actions'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PROFILE_ID_KEY = 'smart_shelf_profile_id'
const ONBOARDING_KEY = 'smart_shelf_onboarding_done'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getOrCreateProfileId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(PROFILE_ID_KEY)
  if (!id) {
    // Generate a simple UUID-like ID
    id = crypto.randomUUID()
    localStorage.setItem(PROFILE_ID_KEY, id)
  }
  return id
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface UserProfileContextValue {
  profile: UserProfile | null
  profileId: string
  loading: boolean
  onboardingDone: boolean
  markOnboardingDone: () => void
  refresh: () => Promise<void>
  setProfile: (p: UserProfile) => void
}

const UserProfileContext = createContext<UserProfileContextValue>({
  profile: null,
  profileId: '',
  loading: true,
  onboardingDone: false,
  markOnboardingDone: () => {},
  refresh: async () => {},
  setProfile: () => {},
})

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileId, setProfileId] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingDone, setOnboardingDone] = useState(false)

  // Initialise on client
  useEffect(() => {
    const id = getOrCreateProfileId()
    setProfileId(id)
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true'
    setOnboardingDone(done)
  }, [])

  const refresh = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    try {
      const data = await getProfile(profileId)
      setProfile(data)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  // Load profile whenever profileId is set
  useEffect(() => {
    if (profileId) {
      refresh()
    }
  }, [profileId, refresh])

  const markOnboardingDone = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setOnboardingDone(true)
  }, [])

  return (
    <UserProfileContext.Provider
      value={{ profile, profileId, loading, onboardingDone, markOnboardingDone, refresh, setProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useUserProfile() {
  return useContext(UserProfileContext)
}
