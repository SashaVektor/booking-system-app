import type { Day } from '@prisma/client'
import { formatISO } from 'date-fns'
import { type NextPage } from 'next'
import Head from 'next/head'
import { prisma } from '../server/db/client'
import dynamic from 'next/dynamic'

interface HomeProps {
  days: Day[]
  closedDays: string[] // as ISO string
}


const DynamicCalendar = dynamic(() => import('../components/Calendar'), {
  ssr: false,
})

const Home: NextPage<HomeProps> = ({ days, closedDays }) => {
  return (
    <>
      <Head>
        <title>Booking System</title>
        <meta name='description' content='by alex' />
        <link rel='icon' href='/logo.avif' />
      </Head>

      <main>
        <DynamicCalendar days={days} closedDays={closedDays} />
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const days = await prisma.day.findMany()
  const closedDays = (await prisma.closedDay.findMany()).map((d) => formatISO(d.date))
  return { props: { days, closedDays } }
}

export default Home

