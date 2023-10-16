import { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';

const checkFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {

    let firebase = res.locals.firebase

    try {
        let firebaseToken = req.body?.firebaseToken
        if (!firebaseToken) throw Error('Invalid firebaseToken')

        const verifyResult = await firebase.auth().verifyIdToken(firebaseToken)
        // Regras de validação do token
        // https://firebase.google.com/docs/auth/admin/verify-id-tokens
        if (
            !verifyResult ||
            verifyResult.uid === null || verifyResult.uid === '' &&
            verifyResult.uid !== verifyResult.sub ||
            verifyResult.iss !== `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}` ||
            verifyResult.aud !== process.env.FIREBASE_PROJECT_ID ||
            dayjs.unix(verifyResult.iat).isAfter(dayjs()) ||
            dayjs.unix(verifyResult.auth_time).isAfter(dayjs()) ||
            dayjs.unix(verifyResult.exp).isBefore(dayjs())
        ) throw Error('Invalid firebaseToken')
        
        let user = await firebase.auth().getUser(verifyResult.uid)
        res.locals.user = user
        
        return next()

    } catch (err) {
        next(err)
    }
}

export default checkFirebaseToken
