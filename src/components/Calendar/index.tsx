import { useEffect, useState, type Dispatch, type FC, type SetStateAction } from 'react'
import ReactCalendar from "react-calendar"
import { format, formatISO, isBefore, parse } from "date-fns"
import { now, OPENING_HOURS_INTERVAL } from '~/constants/config'
import { type DateType } from '~/utils/types'
import { useRouter } from 'next/router'
import { getOpeningTimes, roundToNearestMinutes } from '~/utils/helpers'
import { type Day } from "@prisma/client"
import Link from 'next/link'




interface IProps {
  date: DateType,
  setDate: Dispatch<SetStateAction<DateType>>
}

interface CalendarProps {
  days: Day[],
  closedDays: string[]
}

const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
  const router = useRouter()

  const today = days.find((d) => d.dayOfWeek === now.getDay())
  const rounded = roundToNearestMinutes(now, OPENING_HOURS_INTERVAL)
  const closing = parse(today!.closeTime, "kk:mm", now)
  const tooLate = !isBefore(rounded, closing)
  if (tooLate) closedDays.push(formatISO(new Date().setHours(0, 0, 0, 0)))

  const [date, setDate] = useState<DateType>({
    justDate: null,
    dateTime: null
  })

  useEffect(() => {
    if (date.dateTime) {
      localStorage.setItem("selectedTime", date.dateTime.toISOString())
      void router.push("/menu")
    }
  }, [date.dateTime])


  const times = date.justDate && getOpeningTimes(date.justDate, days);

  return <div className='min-h-screen flex flex-col justify-center items-center p-4 bg-rest'>
    {date.justDate
      ? (<div className='flex items-center justify-center flex-col'>
        <h2 className='text-lg font-semibold uppercase mb-6 text-center text-white'>
          Please, choose time what do you want
        </h2>
        <div className='grid grid-cols-4 gap-4 p-4 border border-slate-300 sm:grid-cols-6 rounded-md'>
          {times?.map((time, i) => (
            <div key={`time-${i}`} className="rounded-lg text-white font-semibold p-2 bg-lime-400">
              <button type='button' onClick={() => setDate((prev) => ({ ...prev, dateTime: time }))}>
                {format(time, "kk:mm")}
              </button>
            </div>
          ))}
        </div>
      </div>)
      : (
        <>
          <h1 className='text-2xl font-semibold uppercase mb-4 text-center text-orange-400'>
            Welcome to our restaurant!
          </h1>
          <div className='flex flex-col gap-2 items-center'>
            <h3 className='text-lg font-semibold text-center text-white'>
            You are an administrator?
            </h3>
            <Link href="/dashboard" 
            className='p-2 bg-red-400 text-white rounded-lg mb-4'>Click here</Link>
          </div>
          <div className='flex flex-col items-center gap-10 justify-between lg:flex-row'>
            <div className='flex gap-6 flex-wrap lg:flex-col justify-center'>
              <p className='text-lg text-white p-3 rounded-xl bg-amber-300 max-w-[300px]'>
                A restaurant is a place where enjoyment of taste impressions
                is combined with the acquisition of new emotions and experiences. Each
                restaurant has its own unique atmosphere and style, which is
                determined by the interior, music, cuisine and service.
              </p>
              <p className='text-lg text-white p-3 rounded-xl bg-red-400 max-w-[300px]'>
                Our restaurant is a place where you can enjoy exclusive dishes
                created by our talented chefs using the freshest and highest quality products.
                We offer a wide range of dishes, from traditional
                national cuisine to signature dishes that will leave you with
                pleasant memories of your visit to our restaurant.
              </p>
            </div>
            <div className='flex flex-col items-center'>
              <h2 className='text-lg font-semibold uppercase mb-6 text-center text-white'>
                Please select the date for which you want to order
              </h2>
              <ReactCalendar
                minDate={new Date()}
                className="REACT-CALENDAR p-2"
                view='month'
                onClickDay={(date) => setDate((prev) => ({ ...prev, justDate: date }))}
                tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
              />
            </div>
            <div className='flex flex-row gap-4 lg:flex-col flex-wrap items-center justify-center'>
              <div className='w-[300px] object-contain'>
                <img src="https://klike.net/uploads/posts/2019-06/1559545617_2.jpg"
                  alt="img-1" className='w-full h-full object-contain rounded-xl' />
              </div>
              <div className='w-[300px] object-contain'>
                <img src="https://agroportal.ua/storage/media/uploads/articles/4fd485e-food-blogger-croped.jpg"
                  alt="img-2" className='w-full h-full object-contain rounded-xl' />
              </div>
              <div className='w-[300px] object-contain'>
                <img src="https://report.if.ua/wp-content/uploads/2016/08/YIzha-ta-Napoyi-60-1500x1001.jpg"
                  alt="img-3" className='w-full h-full object-contain rounded-xl' />
              </div>
            </div>
          </div>
        </>
      )
    }
  </div>
}

export default Calendar