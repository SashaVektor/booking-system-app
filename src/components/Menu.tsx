import { useState, type FC } from 'react'
import { trpc } from '~/utils/trpc'
import Select from "react-select"
import { capitalize, selectOptions } from '~/utils/helpers'
import { format, parseISO } from 'date-fns'
import toast, { Toaster } from 'react-hot-toast'


interface MenuProps {
  selectedTime: string
  addToCart: (id:string, quantity: number) => void
}

const Menu: FC<MenuProps> = ({selectedTime, addToCart}) => {
  const { data: menuItems } = trpc.menu.getMenuItems.useQuery()
  const [filter, setFilter] = useState<undefined | string>("")

  const filteredMenuItems = menuItems?.filter((menuItem) => {
    if (!filter) return true
    return menuItem.categories.includes(filter)
  })

  

  return <div>
    <div className='mx-auto max-w-2xl py-16 px-4 sm:py-24 lg:max-w-6xl'>
    <Toaster />
      <div className='px-auto flex flex-col w-full justify-between gap-2 md:flex-row'>
        <h2 className='text-2xl font-bold tracking-wider text-amber-300'>
          Please, select some products on {format(parseISO(selectedTime), 'MMM do, yyyy')}
        </h2>
        <Select
          onChange={(e) => {
            if (e?.value === 'all') setFilter(undefined)
            else setFilter(e?.value)
          }}
          className='border-none outline-none'
          placeholder='Filter by...'
          options={selectOptions}
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: "orange",
              backgroundColor: "orange",
              width: 150
            }),
          }}
        />
      </div>

      <div className='mt-6 flex items-center gap-10 flex-wrap'>
        {filteredMenuItems?.map((menuItem) => (
          <div key={menuItem.id} className='group w-[280px] h-[390px] shadow-sm rounded-xl shadow-amber-100 bg-amber-400'>
            <div className='h-[200px] w-[280px]'>
              <img src={menuItem.url} alt={menuItem.name} 
              className="rounded-xl h-[200px] w-[280px]"/>
            </div>
            <div className='mt-4 flex justify-between p-4'>
              <div>
                <h3 className='text-sm text-gray-700'>
                  <p>{menuItem.name}</p>
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {menuItem.categories.map((c) => capitalize(c)).join(', ')}
                </p>
              </div>
              <p className='text-sm font-medium text-gray-900'>${menuItem.price.toFixed(2)}</p>
            </div>
            <button className='m-4 p-3 bg-red-300 rounded-lg text-white' onClick={() => {
              addToCart(menuItem.id, 1)
              toast.success(`${menuItem.name} added to cart`)
            }} >
              Add To Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
}

export default Menu