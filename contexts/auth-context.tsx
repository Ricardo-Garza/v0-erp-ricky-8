"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface AuthUser extends FirebaseUser {
  companyId?: string
}

interface AuthContextType {
  user: AuthUser | null
  companyId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  companyId: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("[v0] [Auth] User authenticated:", firebaseUser.uid)

        let userCompanyId: string | undefined

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            userCompanyId = userData.companyId || userData.empresaId
            console.log("[v0] [Auth] CompanyId from profile:", userCompanyId)
          }
        } catch (error) {
          console.error("[v0] [Auth] Error fetching user profile:", error)
        }

        // Fallback 1: Try custom claims
        if (!userCompanyId) {
          try {
            const tokenResult = await firebaseUser.getIdTokenResult()
            userCompanyId = tokenResult.claims.companyId as string | undefined
            console.log("[v0] [Auth] CompanyId from claims:", userCompanyId)
          } catch (error) {
            console.error("[v0] [Auth] Error getting token claims:", error)
          }
        }

        // Fallback 2: Use uid as companyId for development
        if (!userCompanyId) {
          userCompanyId = firebaseUser.uid
          console.log("[v0] [Auth] Using uid as companyId (fallback):", userCompanyId)
        }

        setUser({
          ...firebaseUser,
          companyId: userCompanyId,
        })
        setCompanyId(userCompanyId)
      } else {
        console.log("[v0] [Auth] User logged out")
        setUser(null)
        setCompanyId(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, companyId, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
