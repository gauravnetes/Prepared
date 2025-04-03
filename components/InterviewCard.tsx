import React from 'react'
import dayjs from 'dayjs'
import { getRandomInterviewCover } from '@/lib/utils';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechicons from './DisplayTechicons';
const InterviewCard = ({ id, userId, role, type, techstack, craetedAt }: InterviewCardProps) => {
    const feedback = null as Feedback | null
    // technical
    // mix of technical and behavioral
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate = dayjs(feedback?.craetedAt || craetedAt || Date.now()).format('MMM D, YYYY');

    return (
        <div className='card-border w-[360px] max-sm:w-full min-h-96'>
            <div className='card-interview'>
                <div>
                    <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
                        <p className='badge-text'>{normalizedType}</p>
                    </div>

                    <Image src={getRandomInterviewCover()} alt="cover image" width={90} height={90} className='rounded-full object-fit size-[90px]' />

                    <h3 className='mt-5 capitalize'>
                        {role} Interview
                    </h3>

                    <div className='flex flex-row gap-5 mt-3 '>
                        <div className='flex flex-row gap-2'>
                            <Image src="/calendar.svg" alt='calendar' width={22} height={22} />
                            <p>{formattedDate}</p>
                        </div>

                        <div className='flex flex-row gap-2 items-center'>
                            <Image src="/star.svg" alt='star' width={22} height={22} />

                            <p>{feedback?.totalScore || '---'}/100</p>
                        </div>
                    </div>

                    <p className='line-clamp-2 mt-5'>
                        {feedback?.finalAssessment || "You haven't taken the Interview Yet. Take to Improve your chances of   getting hired!"}
                    </p>
                </div>

                <div className='flex flex-row  justify-between'>
                    <DisplayTechicons techStack={techstack} />

                    {feedback ? (
                        <Link href={`/interview/${id}/feedback`} className="w-full">
                            <Button className='btn-primary w-full'>Check Feedback</Button>
                        </Link>
                    ) : (
                        <Link href={`/interview/${id}`} className="w-full">
                            <Button className='btn-primary w-full'>View Interview</Button>
                        </Link>
                    )}
                </div>


            </div>
        </div>
    )
}

export default InterviewCard
