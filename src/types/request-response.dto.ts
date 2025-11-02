// src/types/AuthRequest.ts
import { Request } from "express";
import { User } from "../models/User.model";

export interface AuthRequest<T = any> extends Request {
    body: T;
    user?: User
}
