import { NextFunction, Request, Response } from 'express';
import z from 'zod';

// Utilizando SDK Firebase do browser para fazer a autenticação por email e senha
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, signInWithEmailAndPassword, inMemoryPersistence } from 'firebase/auth';

import hashPassword from '@/helpers/hashPassword';

const firebaseClient = initializeApp({
  apiKey: process.env.FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN
});

const inputSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string()
})

const checkUserWithEmail = async (req: Request, res: Response, next: NextFunction) => {


    console.log('req.body ', req.body)

    let firebase = res.locals.firebase
    try {
        // Validação das informações
        let payload = inputSchema.parse(req.body)

        // Criptografia da senha
        const passwordCrypt = hashPassword(payload.password)

        // Instância Firebase Auth
        const firebaseAuth = getAuth(firebaseClient)
        setPersistence(firebaseAuth, inMemoryPersistence)
        let userCredential = await signInWithEmailAndPassword(firebaseAuth, payload.email, passwordCrypt)
        res.locals.user = userCredential.user.toJSON()

        return next()

    } catch (err) {
        next(err)
    }
}

export default checkUserWithEmail
