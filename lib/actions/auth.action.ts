"use server";  // as we're on a actions file
import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        // check if the user already exists
        const userRecord = await db.collection('users').doc(uid).get();

        if (userRecord.exists) {
            return {
                success: false,
                message: "User Already Exists, Please sign in instead"
            }
        }
        // if not exists creating new user
        await db.collection('users').doc(uid).set({
            name,
            email
        })

        return {
            success: true,
            message: "Account Created Successfully, Please Sign In"
        }
    } catch (error: any) {
        console.error("Error creating user", error)
        if (error.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: "This email is already in use"
            }
        }

        return {
            success: false,
            message: "Failed to create an Account"
        }
    }
}


export async function signIn(params: SignInParams) {
    const { email, idToken } = params

    try {
        const userRecord = await auth.getUserByEmail(email)

        if (!userRecord) {
            return {
                success: false,
                message: "User doesn't exist. Create an Account!"
            }
        }
        await setSessionCookie(idToken);
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: "Failed to Log in"
        }
    }
}
// generate cookie 
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000 // expires in one week
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    })
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
        return null
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

        const userRecord = await db.collection('users').doc(decodedClaims.uid).get()

        if (!userRecord) {
            return null;
        }

        return {
            ...userRecord.data(),
            id: userRecord.id
        } as User
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;  // true -> boolean (truthy/falsy value to boolean)
    // { name: 'gourav'} -> !{} -> false -> !false -> true 
    // If user is truthy (e.g., an object, a non-empty string, a non-zero number), !!user will return true.

    // If user is falsy (null, undefined, 0, "", false, NaN), !!user will return false.
}

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