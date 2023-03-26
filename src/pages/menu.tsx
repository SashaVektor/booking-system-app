"use client"
import { type FC, useEffect, useState } from 'react'
import Menu from '~/components/Menu'
import Spinner from '~/components/Spinner'
import { parseISO } from 'date-fns'
import { useRouter } from "next/router"
import { now } from '~/constants/config'
import { trpc } from '~/utils/trpc'
import { toast } from "react-hot-toast"
import { BsCart } from "react-icons/bs"
import Cart from '~/components/Cart'
import Head from "next/head"
import Link from 'next/link'


const MenuSection: FC = () => {
    const router = useRouter();
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [showCart, setShowCart] = useState<boolean>(false)
    const [productsInCart, setProductsInCart] = useState<{ id: string; quantity: number }[]>([])

    const addToCart = (id: string, quantity: number) => {
        setProductsInCart((prev) => {
            const existing = prev.find((item) => item.id === id)
            if (existing) {
                return prev.map((item) => {
                    if (item.id === id) {
                        return { ...item, quantity: item.quantity + quantity }
                    }
                    return item
                })
            }
            return [...prev, { id, quantity }]
        })
    }

    const removeFromCart = (id: string) => {
        setProductsInCart((prev) => prev.filter((item) => item.id !== id))
    }

    const { isFetchedAfterMount } = trpc.menu.checkMenuStatus.useQuery(undefined, {
        onError: () => {
            toast.error("Something went wrong!")
        },
    })
    const { mutate } = trpc.checkout.checkoutSession.useMutation({
        onSuccess: ({ url }) => {
            void router.push(url)
        }
    })

    useEffect(() => {
        const selectedTime = localStorage.getItem("selectedTime")
        if (!selectedTime) {
            void router.push("/")
        } else {
            const date = parseISO(selectedTime)
            if (date < now) void router.push("/")

            setSelectedTime(selectedTime)
        }
    }, [])

    return <>
        <Head>
            <title>Booking System</title>
            <meta name='description' content='by alex' />
            <link rel='icon' href='/logo.avif' />
        </Head>
        <Cart removeFromCart={removeFromCart} open={showCart} products={productsInCart} setOpen={setShowCart} />
        {isFetchedAfterMount && selectedTime ? (
            <div className='px-auto pt-12 max-w-full sm:px-6 lg:px-8 bg-menu min-h-screen'>
                <div className='flex justify-between items-center px-2'>
                    <Link href="/"
                        className='p-2 bg-red-400 text-white rounded-lg block'>
                        {"<--- Go Back"}
                    </Link>
                    <div>
                        <button
                            type='button'
                            onClick={() => setShowCart((prev) => !prev)}
                            className='flex items-center justify-center rounded-lg bg-gray-200 p-3 text-lg font-medium text-indigo-600'>
                            <BsCart className='mr-2 text-lg' />
                            {productsInCart.reduce((acc, item) => acc + item.quantity, 0)}
                        </button>
                    </div>
                </div>
                <Menu selectedTime={selectedTime} addToCart={addToCart} />
            </div>
        ) : (
            <div className='flex h-screen items-center justify-center'>
                <Spinner />
            </div>
        )}
    </>
}

export default MenuSection