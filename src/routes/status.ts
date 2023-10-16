import { Request, Response } from 'express';

const status = async (req: Request, res: Response) => {
    res.json({
        checkService: 'unavailable'
    } )
}

export default status
