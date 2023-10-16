import { NextFunction, Request, Response } from 'express'
import dayjs from 'dayjs'
import JWT from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

/**
 * Determina o tempo de duração do token Kyte
 */
const EXPIRE_HOURS = 12

const generateKyteToken = async (req: Request, res: Response, next: NextFunction) => {

    const authDB = res.locals.authDB
    const user = res.locals.user
    const uid = user.uid

    try {
        let now = dayjs().toDate()
        let expireAt = dayjs(now).add(EXPIRE_HOURS, 'hours').toDate()

        // Sincroniza o usuário com o ambiente Kyte
        // TODO: Pode ser interessante que todo trabalho de inclusão do usuário seja feito por este serviço
        // Enviar para Kyte { ...user }
        
        // Geração de token de acesso
        let token = JWT.sign(
            { uid, hash: uuidv4() },
            process.env.AUTH_JWT_PRIVATE_KEY as string,
            { expiresIn: `${EXPIRE_HOURS}h` }
        )

        // Upsert controle de acesso
        let auth = await authDB.collection('auths').findOneAndUpdate(
            { uid },
            {
                $set: {
                    createdAt: now,
                    expireAt,
                    token
                }
            },
            { upsert: true }
        )

        return res.json({ uid, token, expireAt })

    } catch (err) {
        next(err)
    }
}

export default generateKyteToken
