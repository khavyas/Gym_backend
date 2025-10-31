// src/types/AuthRequest.ts
import { Request } from "express";
import { User } from "../models/User";

export interface AuthRequest<T = any> extends Request {
    body: T;
    user?: User
}
