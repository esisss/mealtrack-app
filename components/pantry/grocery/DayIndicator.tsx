import { Dot } from 'lucide-react';
import { formatLocalDate, getTodayLocal, isBeforeToday } from '@/lib/date-utils';

export const DayIndicator = ({ days, selectedDay, onDayClick = () => { } }: { days: Date[]; selectedDay: Date; onDayClick: (day: Date) => void }) => {
    const todayStr = formatLocalDate(getTodayLocal());
    const selectedDayStr = formatLocalDate(selectedDay);

    return (
        <div className='flex flex-row justify-between items-center my-5'>{days.map((day, index) => {
            const currentDayStr = formatLocalDate(day);
            return (
                <div onClick={() => onDayClick(day)} className={`relative text-center flex flex-col items-center justify-center h-12 w-12 sm:h-22 sm:w-22 rounded-lg bg-sidebar mx-1 cursor-pointer ${selectedDayStr === currentDayStr ? ' border-primary border-2' : ''} ${isBeforeToday(day) ? 'opacity-50' : ''}`} key={index}>
                    <h3 className='text-xs font-semibold'>
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </h3>
                    <h2 className='text-md sm:text-3xl font-semibold'>
                        {day.getDate()}
                    </h2>
                    {
                        todayStr === currentDayStr && <Dot className='absolute -bottom-1.5 sm:bottom-1 text-accent' />
                    }
                </div >
            );
        })}
        </div >
    )
}
