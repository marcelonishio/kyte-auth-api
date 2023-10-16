import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import hashPassword from '@/helpers/hashPassword';

const inputSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6),
    name: z.string().min(3).trim().optional().transform(
        (str) => (
            str
                ? str.replace(/[^ ]*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
                : undefined
        )
    ),
})

const createUserWithEmail = async (req: Request, res: Response, next: NextFunction) => {
    let firebase = res.locals.firebase

    try {
        // Validação das informações
        let payload = inputSchema.parse(req.body)

        // Criptografia da senha
        const passwordCrypt = hashPassword(payload.password)

        let user = await firebase.auth().createUser({
            email: payload.email,
            password: passwordCrypt,
            ...(payload.name ? { displayName: payload.name } : {}),
            emailVerified: false
        })

        res.locals.user = { ...user, passwordCrypt }
        return next()

    } catch (err) {
        next(err)
    }
}

export default createUserWithEmail
