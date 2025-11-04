// src/types/AuthRequest.ts
import { Request } from "express";
import { UserType } from "../models/User.model";

export interface AuthRequest<T = any> extends Request {
    body: T;
    user?: UserType
}
