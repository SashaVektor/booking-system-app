import { adminProcedure, router } from "../trpc";
import {z} from "zod"
import { formatISO } from "date-fns";

export const openingRouter = router({
    changeOpeningHours: adminProcedure.input(z.array(z.object({
        id: z.string(),
        name: z.string(),
        openTime: z.string(),
        closeTime: z.string()
    })))
    .mutation(async ({ctx, input}) => {
        const results = await Promise.all(
            input.map(async (day) => {
                const updatedDay = await ctx.prisma.day.update({
                    where: {id: day.id},
                    data: {
                        closeTime: day.closeTime,
                        openTime: day.openTime
                    }
                })

                return updatedDay
            })
        )
        return results
    }),

    closeDay: adminProcedure.input(z.object({date: z.date()})).mutation(async ({ctx, input}) => {
        await ctx.prisma.closedDay.create({
            data: {
                date: input.date
            }
        })
    }),
    openDay: adminProcedure.input(z.object({date: z.date()})).mutation(async ({ctx, input}) => {
        await ctx.prisma.closedDay.delete({
            where: {
                date: input.date
            }
        })
    }),
    getClosedDays: adminProcedure.query(async ({ctx}) => {
        const closedDays = await ctx.prisma.closedDay.findMany();

        return closedDays.map((d) => formatISO(d.date))
    })

})