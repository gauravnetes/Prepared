import { db } from "@/firebase/admin"  

// auth.action.ts
export async function getInterviewByUserId(userId: string): Promise<Interview[]> {
    try {
      const snapshot = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('craetedAt', 'desc')
        .get();
  

      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role || '',
          level: data.level || '',
          questions: data.questions || [],
          techstack: data.techstack || [],
          craetedAt: data.craetedAt, // Keep as string
          userId: data.userId,
          type: data.type || '',
          finalized: data.finalized || false
        };
      });
    } catch (error) {
      console.error("Error fetching user interviews:", error);
      return [];
    }
}
  
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[]> {
    try {
      const { userId, limit = 20 } = params;
      const snapshot = await db
        .collection('interviews')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .orderBy('craetedAt', 'desc')
        .limit(limit)
        .get();

      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure all required fields exist
        questions: doc.data().questions || [],
        techstack: doc.data().techstack || [],
        finalized: doc.data().finalized || false
      })) as Interview[];
    } catch (error) {
      console.error("Error fetching public interviews:", error);
      return [];
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
      const interview = await db
        .collection('interviews')
        .doc(id)
        .get()
  

      return interview.data() as Interview | null; 
    } catch (error) {
      console.error("Error fetching user interviews:", error);
      return null; 
    }
  }