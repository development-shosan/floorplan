import { Request, Response, NextFunction } from 'express';
const { validationResult } = require("express-validator");


// Validator error checker
export const validatorErrorChecker  = (req: Request, res: Response, next:NextFunction )=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return
    }
    next();
}