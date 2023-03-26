import {jwtVerify} from "jose"

interface UserJwtPayload {
    jti: string
    iat: number
}

export function getJwtSecretKey(): string {
    const secret = process.env.JWS_SECRET

    if(!secret || secret.length === 0) {
        throw new Error("JWT secret key is not defined")
    }

    return secret
}

export const verifyAuth = async (token: string) => {
    try {
        const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()))
        return verified.payload as UserJwtPayload
    } catch (err) {
        throw new Error("Your token is invalid")
    }
}