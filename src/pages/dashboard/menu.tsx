import { useEffect, useState, type FC } from 'react'
import { selectOptions } from '~/utils/helpers'
import dynamic from "next/dynamic"
import { type MultiValue } from "react-select/dist/declarations/src"
import Image from "next/image"
import { MAX_FILE_SIZE } from '~/constants/config'
import { trpc } from '~/utils/trpc'
import { type Categories } from '~/utils/types'
import Head from "next/head"
import Link from 'next/link'


const DynamicSelect = dynamic(() => import("react-select"), { ssr: false })

type Input = {
    name: string,
    price: number,
    categories: MultiValue<{ value: string, label: string }>
    file: undefined | File
}

const initialInput = {
    name: "",
    price: 0,
    categories: [],
    file: undefined
}

const Menu: FC = ({ }) => {
    const [input, setInput] = useState<Input>(initialInput)
    const [preview, setPreview] = useState<string>("")
    const [error, setError] = useState<string>("")


    const { mutateAsync: createPresignedUrl } = trpc.admin.createPresignedUrl.useMutation()
    const { mutateAsync: addItem } = trpc.admin.addMenuItem.useMutation();
    const { data: menuItems, refetch } = trpc.menu.getMenuItems.useQuery()
    const { mutateAsync: deleteMenuItem } = trpc.admin.deleteMenuItem.useMutation();

    useEffect(() => {
        if (!input.file) return
        const objectUrl = URL.createObjectURL(input.file)
        setPreview(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [input.file])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return setError("No file selected")
        if (e.target.files[0].size > MAX_FILE_SIZE) return setError("File size is too big")
        setInput((prev) => ({ ...prev, file: e.target.files![0] }))
    }

    const handleImageUpload = async () => {
        const { file } = input
        if (!file) return

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { fields, key, url } = await createPresignedUrl({ fileType: file.type })

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = {
            ...fields,
            'Content-Type': file.type,
            file,
        }

        const formData = new FormData()

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.entries(data).forEach(([key, value]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            formData.append(key, value as any)
        })

        await fetch(url, {
            method: 'POST',
            body: formData,
        })


        return key
    }

    const addMenuItem = async () => {
        const key = await handleImageUpload()
        if (!key) throw new Error("No Key")

        await addItem({
            name: input.name,
            imageKey: key,
            categories: input.categories.map((c) => c.value as Exclude<Categories, "all">),
            price: input.price
        })

        void refetch()

        setInput(initialInput)
        setPreview("")

    }

    const handleDelete = async (imageKey: string, id: string) => {
        await deleteMenuItem({ imageKey, id })
        void refetch();
    }

    return <>
        <Head>
            <title>Menu</title>
            <meta name='description' content='by alex' />
            <link rel='icon' href='/logo.avif' />
        </Head>
        <div className='p-4 sm:p-10 bg-menu-2 min-h-screen'>
            <Link href="/dashboard" className='mt-2 block p-2 bg-red-400 text-white rounded-lg w-[120px]'>
                {"<-- Go Back"}
            </Link>
            <h3 className='text-white mb-4 text-xl text-center'>
                Create a new product
            </h3>
            <div className='mx-auto flex max-w-xl flex-col gap-2'>
                <input
                    name='name'
                    className='h-12 border-none bg-gray-200 p-2 rounded-lg outline-none'
                    type='text'
                    placeholder='name'
                    onChange={e => setInput((prev) => ({ ...prev, name: e.target.value }))}
                    value={input.name}
                />

                <input
                    name='price'
                    className='h-12 border-none bg-gray-200 p-2 rounded-lg outline-none'
                    type='number'
                    placeholder='price'
                    onChange={(e) => setInput((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    value={input.price}
                />

                <DynamicSelect
                    value={input.categories}
                    // @ts-expect-error - when using dynamic import, typescript doesn't know about the onChange prop
                    onChange={(e) => setInput((prev) => ({ ...prev, categories: e }))}
                    isMulti
                    className='h-12'
                    options={selectOptions}
                />

                <label
                    htmlFor='file'
                    className='relative h-12 cursor-pointer rounded-sm bg-gray-200 font-medium text-indigo-600 focus-within:outline-none'>
                    <span className='sr-only'>File input</span>
                    <div className='flex h-full items-center justify-center'>
                        {preview ? (
                            <div className='relative h-3/4 w-full'>
                                <Image alt='preview' style={{ objectFit: 'contain' }} fill src={preview} />
                            </div>
                        ) : (
                            <span>Select image</span>
                        )}
                    </div>
                    <input
                        name='file'
                        id='file'
                        onChange={handleFileSelect}
                        accept='image/jpeg image/png image/jpg'
                        type='file'
                        className='sr-only'
                    />
                </label>

                <button
                    className='h-12 bg-gray-200 disabled:cursor-not-allowed p-2 rounded-lg outline-none'
                    disabled={!input.file || !input.name}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={addMenuItem}>
                    Add menu item
                </button>
            </div>
            {error && <p className='text-xs text-red-600'>{error}</p>}

            <div className='mx-auto mt-12 max-w-7xl'>
                <p className='text-lg font-medium text-white'>Your menu items:</p>
                <div className='mt-6 mb-12 flex flex-wrap items-center gap-8'>
                    {menuItems?.map((menuItem) => (
                        <div key={menuItem.id} className="bg-white shadow-sm shadow-slate-200 w-[200px] h-[290px] rounded-lg">
                            <div className='relative h-[150px] w-[200px] object-contain'>
                                <Image priority fill alt='' src={menuItem.url} className="rounded-lg" />
                            </div>
                            <p className='p-1'>{menuItem.name}</p>
                            <p className='p-1'>{menuItem.price.toFixed(2)} $</p>
                            <button
                                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                onClick={() => handleDelete(menuItem.imageKey, menuItem.id)}
                                className='text-md text-white m-2 bg-red-400 p-1 rounded-lg'>
                                delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
}

export default Menu