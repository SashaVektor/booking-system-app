import { s3 } from "~/lib/s3";
import { publicProcedure, router } from "../trpc";
import {z} from "zod"

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const menuRouter = router({
    getMenuItems: publicProcedure.query(async ({ctx}) => {
        const menuItems = await ctx.prisma.menuItem.findMany();

        const withUrls = await Promise.all(
            menuItems.map(async (menuItem) => ({
                ...menuItem,
                url: await s3.getSignedUrlPromise("getObject", {
                    Bucket: "booking-software-avektor",
                    Key: menuItem.imageKey
                })
            }))
        )

        return withUrls
    }),

    checkMenuStatus: publicProcedure.query(async () => {
        await sleep(1000)

        return {success: true}
    }),

    getCartItems: publicProcedure.input(z.array(z.object({id: z.string(), quantity: z.number()})))
    .query(async ({ctx, input}) => {
        const menuItems = await ctx.prisma.menuItem.findMany({
            where: {
              id: {
                in: input.map((item) => item.id),
              },
            },
          })

        const withUrls = await Promise.all(
            menuItems.map(async (menuItem) => {
                return {
                    ...menuItem,
                    url: await s3.getSignedUrlPromise("getObject", {
                        Bucket: "booking-software-avektor",
                        Key: menuItem.imageKey
                    }),
                    quantity: input.find((item) => item.id === menuItem.id)?.quantity
                }
            })
        )

        return withUrls
    })
})