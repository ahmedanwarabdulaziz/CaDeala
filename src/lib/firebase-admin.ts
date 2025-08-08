import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Category, 
  Subcategory, 
  SubSubcategory, 
  BusinessApplication, 
  Business, 
  Review,
  AdminStats 
} from '@/types/admin';

// Generic CRUD operations
export class FirebaseService {
  
  // Categories
  static async getCategories(): Promise<Category[]> {
    const q = query(collection(db, 'categories'), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Category[];
  }

  static async getCategory(id: string): Promise<Category | null> {
    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Category;
    }
    return null;
  }

  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
  }

  static async reorderCategories(categories: Category[]): Promise<void> {
    const batch = writeBatch(db);
    
    categories.forEach((category, index) => {
      const docRef = doc(db, 'categories', category.id);
      batch.update(docRef, {
        order: index + 1,
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
  }

  // Subcategories
  static async createSubcategory(subcategoryData: Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'subcategories'), {
      ...subcategoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    const q = query(
      collection(db, 'subcategories'),
      where('categoryId', '==', categoryId)
    );
    const querySnapshot = await getDocs(q);
    const subcategories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Subcategory[];
    
    // Sort by order on the client side until index is ready
    return subcategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  static async getSubcategory(id: string): Promise<Subcategory | null> {
    const docRef = doc(db, 'subcategories', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Subcategory;
    }
    return null;
  }

  static async updateSubcategory(id: string, data: Partial<Subcategory>): Promise<void> {
    const docRef = doc(db, 'subcategories', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  static async deleteSubcategory(id: string): Promise<void> {
    const docRef = doc(db, 'subcategories', id);
    await deleteDoc(docRef);
  }

  static async reorderSubcategories(subcategories: Subcategory[]): Promise<void> {
    const batch = writeBatch(db);
    
    subcategories.forEach((subcategory, index) => {
      const docRef = doc(db, 'subcategories', subcategory.id);
      batch.update(docRef, {
        order: index + 1,
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
  }

  // Sub-subcategories
  static async getSubSubcategories(subcategoryId?: string): Promise<SubSubcategory[]> {
    let q = query(collection(db, 'subSubcategories'), orderBy('order'));
    if (subcategoryId) {
      q = query(collection(db, 'subSubcategories'), where('subcategoryId', '==', subcategoryId), orderBy('order'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as SubSubcategory[];
  }

  // Business Applications
  static async getBusinessApplications(status?: 'pending' | 'approved' | 'rejected'): Promise<BusinessApplication[]> {
    let q = query(collection(db, 'businessApplications'), orderBy('appliedAt', 'desc'));
    if (status) {
      q = query(collection(db, 'businessApplications'), where('status', '==', status), orderBy('appliedAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as BusinessApplication[];
  }

  static async createBusinessApplication(application: any): Promise<string> {
    const docRef = await addDoc(collection(db, 'businessApplications'), {
      ...application,
      appliedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async updateBusinessApplication(id: string, updates: Partial<BusinessApplication>): Promise<void> {
    const docRef = doc(db, 'businessApplications', id);
    await updateDoc(docRef, {
      ...updates,
      reviewedAt: serverTimestamp()
    });
  }

  // Businesses
  static async getBusinesses(): Promise<Business[]> {
    const q = query(collection(db, 'businesses'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      verificationDate: doc.data().verificationDate?.toDate()
    })) as Business[];
  }

  static async getBusiness(id: string): Promise<Business | null> {
    const docRef = doc(db, 'businesses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        verificationDate: data.verificationDate?.toDate()
      } as Business;
    }
    return null;
  }

  // Reviews
  static async getBusinessReviews(businessId: string): Promise<Review[]> {
    const q = query(
      collection(db, 'reviews'), 
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Review[];
  }

  static async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  // Admin Stats
  static async getAdminStats(): Promise<AdminStats | null> {
    const docRef = doc(db, 'adminStats', 'overview');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        recentActivity: data.recentActivity?.map((activity: any) => ({
          ...activity,
          timestamp: activity.timestamp?.toDate()
        }))
      } as AdminStats;
    }
    return null;
  }
} 