import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin"
import { google } from "@ai-sdk/google";
import { createDataStream, generateObject } from "ai";
import { string } from "zod";

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

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;
    try {
        // go over the entire transcript 
        // format it with a bette format
        const formattedTranscript = transcript
            .map((sentence: { role: string; content: string; }) => (
                `- ${sentence.role}: ${sentence.content}\n`
            )).join('');

        const { object: {totalScore, categoryScores, strengths, areasForImprovement, finalAssessment} } = await generateObject({
            model: google('gemini-2.0-flash-001', {
                structuredOutputs: false,
            }),
            schema: feedbackSchema,
            prompt: `Ill give you the transcript and you asses the candidate
            Transcript: 
            ${formattedTranscript}

Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
            system: 'You are a professional Interviewer.',  // to set the AI in a certain role
        })

        const feedback = await db.collection('feedback').add({
            interviewId, 
            userId, 
            totalScore, 
            categoryScores, 
            strengths, 
            areasForImprovement, 
            finalAssessment, 
            craetedAt: new Date().toISOString()
        })

        return {
            success: true, 
            feedbackId: feedback.id 
        }
    } catch (error) {
        console.error('Error saving Feedback');

        return {success: false}
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback> {
        const { interviewId, userId } = params;
        const feedback = await db
            .collection('feedback')
            .where('interviewId', '==', interviewId)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (feedback.empty) {
            return null; 
        }

        const feedbackDoc = feedback.docs[0]; 
        return {
            id: feedbackDoc.id, 
            ...feedbackDoc.data()
        } as Feedback; 
}