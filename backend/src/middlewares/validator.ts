import { Request, Response, NextFunction } from 'express';
const { validationResult } = require("express-validator");



// middleware
export const validatorErrorChecker  = (req: Request, res: Response, next:NextFunction )=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}