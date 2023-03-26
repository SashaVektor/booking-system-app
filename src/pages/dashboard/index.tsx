import { type FC } from 'react'
import Link from "next/link"

const Dashboard: FC = () => {
    return <div className='flex flex-col h-screen  w-full items-center justify-center font-medium dashboard-bg'>
        <div className='flex flex-col items-center justify-center gap-5'>
            <h2 className='text-3xl uppercase font-bold tracking-wider text-black'>
                Welcome back, Admin
            </h2>
            <p className='text-slate-900'>
                Select one of the options that you want to change
            </p>
            <Link
                className='p-2 bg-gray-100 rounded-md block'
                href="/dashboard/opening">
                Opening hours
            </Link>
            <Link
                className='p-2 bg-gray-100 rounded-md block'
                href="/dashboard/menu">
                Menu
            </Link>
            <Link href="/" className='mt-2 block p-2 bg-red-400 text-white rounded-lg w-[120px]'>
                {"<-- Go Back"}
            </Link>
        </div>
    </div>
}

export default Dashboard