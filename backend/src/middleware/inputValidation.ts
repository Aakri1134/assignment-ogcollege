import type { NextFunction, Request, Response } from "express";
import { validator } from "../utils/validator.js";

const inputValidation = (req : Request, res : Response, next : NextFunction) => {
    if(req.body.email && !validator(req.body.email, "email")){
        return res.status(403).json({
            success : false,
            error : "Invalid Input"
        })
    }
    if(req.body.email && !validator(req.body.email, "password")){
        return res.status(403).json({
            success : false,
            error : "Invalid Input"
        })
    }
    if(req.body.email && !validator(req.body.email, "username")){
        return res.status(403).json({
            success : false,
            error : "Invalid Input"
        })
    }
    next()
}

export default inputValidation