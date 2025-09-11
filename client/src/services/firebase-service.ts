import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product, Vendor, Order, User, Category, TimeRules } from "@/types"

export class FirebaseService {
  // Generic CRUD operations
  static async create<T>(collectionName: string, data: Omit<T, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return docRef.id
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error)
      throw error
    }
  }

  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error)
      throw error
    }
  }

  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id))
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error)
      throw error
    }
  }

  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T
      }
      return null
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error)
      throw error
    }
  }

  // Paginated queries
  static async getPaginated<T>(
    collectionName: string,
    pageSize: number,
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
    filters?: any,
  ): Promise<{ data: T[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
      let q = query(collection(db, collectionName), orderBy("createdAt", "desc"), limit(pageSize))

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "") {
            q = query(q, where(key, "==", value))
          }
        })
      }

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null

      return { data, lastDoc: lastVisible }
    } catch (error) {
      console.error(`Error getting paginated ${collectionName}:`, error)
      throw error
    }
  }

  // Real-time listeners
  static subscribeToCollection<T>(collectionName: string, callback: (data: T[]) => void, filters?: any): () => void {
    let q = query(collection(db, collectionName), orderBy("createdAt", "desc"))

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          q = query(q, where(key, "==", value))
        }
      })
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]
      callback(data)
    })
  }

  // Specific service methods
  static async getProducts(filters?: any, pagination?: { page: number; pageSize: number }) {
    if (pagination) {
      return this.getPaginated<Product>("products", pagination.pageSize, undefined, filters)
    }
    return this.subscribeToCollection<Product>("products", () => {}, filters)
  }

  static async getVendors(filters?: any, pagination?: { page: number; pageSize: number }) {
    if (pagination) {
      return this.getPaginated<Vendor>("vendors", pagination.pageSize, undefined, filters)
    }
    return this.subscribeToCollection<Vendor>("vendors", () => {}, filters)
  }

  static async getOrders(filters?: any, pagination?: { page: number; pageSize: number }) {
    if (pagination) {
      return this.getPaginated<Order>("orders", pagination.pageSize, undefined, filters)
    }
    return this.subscribeToCollection<Order>("orders", () => {}, filters)
  }

  static async getUsers(filters?: any, pagination?: { page: number; pageSize: number }) {
    if (pagination) {
      return this.getPaginated<User>("users", pagination.pageSize, undefined, filters)
    }
    return this.subscribeToCollection<User>("users", () => {}, filters)
  }

  static async getCategories(filters?: any, pagination?: { page: number; pageSize: number }) {
    if (pagination) {
      return this.getPaginated<Category>("categories", pagination.pageSize, undefined, filters)
    }
    return this.subscribeToCollection<Category>("categories", () => {}, filters)
  }

  // Authentication methods
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const q = query(collection(db, "users"), where("email", "==", email), where("isActive", "==", true))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        const userData = userDoc.data() as User

        // In a real app, you'd hash and compare passwords
        // For demo purposes, we'll use a simple check
        if (password === "admin123" || password === "subadmin123") {
          // Update last login
          await this.update("users", userDoc.id, { lastLogin: new Date() })
          return { id: userDoc.id, ...userData }
        }
      }
      return null
    } catch (error) {
      console.error("Error authenticating user:", error)
      throw error
    }
  }

  static async createDefaultAdmin(): Promise<void> {
    try {
      // Check if admin already exists
      const q = query(collection(db, "users"), where("role", "==", "admin"))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Create default admin user
        await this.create("users", {
          name: "System Administrator",
          email: "admin@bolpurmart.com",
          role: "admin" as const,
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Error creating default admin:", error)
    }
  }

  // Settings
  static async getTimeRules(): Promise<TimeRules> {
    try {
      const docSnap = await getDoc(doc(db, "settings", "timeRules"))
      if (docSnap.exists()) {
        return docSnap.data() as TimeRules
      }
      return {
        morning: ["Vegetables", "Fruits", "Dairy"],
        afternoon: ["Groceries", "Medicine", "Snacks", "Personal Care", "Household"],
        evening: ["Biryani", "Snacks", "Beverages"],
      }
    } catch (error) {
      console.error("Error getting time rules:", error)
      throw error
    }
  }

  static async updateTimeRules(timeRules: TimeRules): Promise<void> {
    try {
      await setDoc(doc(db, "settings", "timeRules"), timeRules)
    } catch (error) {
      console.error("Error updating time rules:", error)
      throw error
    }
  }
}
