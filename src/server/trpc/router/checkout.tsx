import { publicProcedure, router } from '../trpc'
import { z } from 'zod'
import _stripe from 'stripe'
import { TRPCError } from '@trpc/server'

const stripe = new _stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
})

export const checkoutRouter = router({
    checkoutSession: publicProcedure.input(z.object({
        products: z.array(z.object({
            id: z.string(),
            quantity: z.number().min(1, "Quantity must be at least 1")
        }))
    }))
        .mutation(async ({ ctx, input }) => {
            try {
                const productsInCard = (
                    await ctx.prisma.menuItem.findMany({
                        where: {
                            id: {
                                in: input.products.map((product) => product.id)
                            }
                        }
                    })
                )
                    .map((p) => ({
                        ...p,
                        quantity: input.products.find((product) => product.id === p.id)?.quantity || 0
                    }))

                if (productsInCard.length !== input.products.length) {
                    throw new TRPCError({ code: "CONFLICT", message: "Some products are not available" })
                }

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    mode: "payment",
                    line_items: productsInCard.map((product) => ({
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: product.name,
                            },
                            unit_amount: product.price * 100
                        },
                        quantity: product.quantity
                    })),
                    shipping_options: [
                        {
                            shipping_rate_data: {
                                type: 'fixed_amount',
                                fixed_amount: {
                                    amount: 0,
                                    currency: 'usd',
                                },
                                display_name: 'Pickup in store',
                            },
                        },
                    ],
                    success_url: process.env.SUCCESS_URL || "http://localhost:3000/success",
                    cancel_url: process.env.CANCEL_URL || "http://localhost:3000/menu",
                })
                return {
                    url: session.url || ""
                }
            } catch (err) {
                let msg = ""
                if(err instanceof Error) {
                    msg = err.message
                }
                throw new TRPCError({
                    message: msg || "Payment failed",
                    code: "INTERNAL_SERVER_ERROR"
                })
            }
        })
})