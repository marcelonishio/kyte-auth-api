import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import admin from 'firebase-admin';

import createLogger from '@/helpers/createLogger'
import { createMongoConn } from '@/helpers/createMongo'

import checkFirebaseToken from '@/routes/middlewares/checkFirebaseToken'
import authUserWithEmail from '@/routes/middlewares/authUserWithEmail'
import createUserWithEmail from '@/routes/middlewares/createUserWithEmail'
import generateKyteToken from '@/routes/generateKyteToken'
import status from '@/routes/status'


async function bootstrap() {


    /**
     * Instancia do serviço para log
     */
    const logger = await createLogger({
        key: process.env.LOG_DNA_KEY as string,
        appName: process.env.APP_NAME as string,
        localOutput: !(process.env.NODE_ENV === 'production')
    })

    /**
     * Database
     */
    const authDB = await createMongoConn({
        database: process.env.MONGO_AUTH_DATABASE as string,
        uri: process.env.MONGO_AUTH_URI as string
    })
    const authDBReadOnly = await createMongoConn({
        database: process.env.MONGO_AUTH_DATABASE as string,
        uri: `${process.env.MONGO_AUTH_URI}&readPreference=secondaryPreferred`
    })

    /**
     * Instância Firebase utilizada para autenticação
     */
    let firebase = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\r\n')
        })
    })

    /**
     * Express
     */
    const app = express();
    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '/views'))
    app.use(cors())
    app.use(bodyParser.json())
    app.use(async (req: Request, res: Response, next: NextFunction) => {
        res.locals.logger = logger
        res.locals.authDB = authDB
        res.locals.authDBReadOnly = authDBReadOnly
        res.locals.firebase = firebase
        return next()
    })

    /**
     * Verifica a validade do token Firebase gerado no front pelo SDK Firebase
     */
    app.post('/check-firebase-token', checkFirebaseToken, generateKyteToken)

    /**
     * Faz autenticação do usuário por email e senha
     */
    app.post('/auth-user-with-email', authUserWithEmail, generateKyteToken)

    /**
     * Cadastra um novo usuário por email e senha
     */
    app.post('/create-user-with-email', createUserWithEmail, generateKyteToken)

    /**
     * Retorna status sobre o sistema
     */
    app.get('/status', status)

    /**
     * Captura de erros
     */
    app.use((err: Error & { code: string }, req: Request, res: Response, next: NextFunction) => {
        logger.error(err.message, { code: err.code, stack: err.stack })
        res.status(500).json({ message: err.message, code: err.code })
    })

    app.listen(process.env.APP_PORT, () => {
        console.log('\x1b[43m%s\x1b[0m', ` Rodando ${process.env.APP_NAME} na porta ${process.env.APP_PORT} no modo ${process.env.NODE_ENV} `)
        console.log('\x1b[43m%s\x1b[0m', ` http://localhost:${process.env.APP_PORT} `)
    })
}

bootstrap()
