import { Dot } from 'lucide-react';
import { useState } from 'react'

export const DayIndicator = ({ days, onDayClick = () => { } }: { days: Date[]; onDayClick: (day: Date) => void }) => {
    const [selectedDay, setSelectedDay] = useState<Date | null>(new Date() || days[0]);

    const handleDayClick = (day: Date) => {
        setSelectedDay(day);
        onDayClick(day);
    }
    return (
        <div className='flex flex-row justify-between items-center my-5'>{days.map((day, index) =>
            <div onClick={() => handleDayClick(day)} className={`relative text-center flex flex-col items-center justify-center h-12 w-12 sm:h-22 sm:w-22 rounded-lg bg-sidebar mx-1 cursor-pointer ${selectedDay?.toDateString() === day.toDateString() ? ' border-primary border-2' : ''}`} key={index}>
                <h3 className='text-xs font-semibold'>
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                </h3>
                <h2 className='text-md sm:text-3xl font-semibold'>
                    {day.getDate()}
                </h2>
                {
                    selectedDay?.toDateString() === day.toDateString() && <Dot className='absolute -bottom-1.5 sm:bottom-1 text-accent' />
                }
            </div >)}
        </div >
    )
}
