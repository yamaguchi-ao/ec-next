import { users } from "@prisma/client";

export type UserType = {
    id?: number,
    username?: string,
    admin?: boolean
}