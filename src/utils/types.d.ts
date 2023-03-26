import { type categories } from "~/constants/config"

export interface DateType {
    justDate: Date | null
    dateTime: Date | null
}

export type Categories = typeof categories[number]