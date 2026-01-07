import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

// Keeps auth state accessible (check user logged in || null)
const AuthContext = createContext({
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null);
  const [isOrganizerVerified, setIsOrganizerVerified] = useState(false);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true)
      setUser(currentUser)

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
            if (userData.role === 'organizer' || userData.organizer) {
              setIsOrganizerVerified(userData.organizer.verified === 'Accepted');
            } else {
              setIsOrganizerVerified(false);
            }
          } else {
            setRole(null);
            setIsOrganizerVerified(false);
          }
        } catch (error) {
          console.error('Failed to fetch user role', error)
          setRole(null)
        }
      } else {
        setRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, isOrganizerVerified }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

