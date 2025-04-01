
import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import { getCurrentUser, getInterviewByUserId, getLatestInterviews } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = async () => {
  const user = await getCurrentUser(); 

  // Promise.all() allows us to fetch them in parallel
  // parallel request: current user generated interviews and other users generated interviews both request at the same time
  // doubling the speed of fetching both of the interviews 
  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }) 
  ])



  const hasPastInterviews = userInterviews?.length > 0; 
  const hasUpcomingInterviews = latestInterviews?.length > 0; 
  return (
    <>
      <section className='card-cta'> 
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview Ready with AI powered Practice & Feedback!</h2>

          <p className='text-lg'>Practice on real Interview Scenario & get Feedback</p>

          <Button asChild className='btn-primary max-sm:w-full'>
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt='robo-dude' width={400} height={400} className='max-sm:hidden'/>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>

        <div className='interviews-section'>
          {
            hasPastInterviews ? (
              userInterviews?.map((interview) => (
                <InterviewCard {...interview} key={interview.id} /> 
            ))) : ( <p>You haven&apos;t taken any Interviews yet</p> )
          }
          
          
        </div>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Take an Interview</h2>
        <div className='interviews-section'>
          {/* <p>There are no Interviews Available</p> */}
          {
            hasUpcomingInterviews ? (
              latestInterviews?.map((interview) => (
                <InterviewCard {...interview} key={interview.id} /> 
            ))) : ( <p>There are no Interviews Available</p> )
          }
          
          
        </div>
      </section>
    </>
  )
}

export default page
