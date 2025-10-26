// src/types/AuthRequest.ts
import { Request } from "express";

export interface AuthRequest<T = any> extends Request {
    body: T;
    user?: {
        _id: string;
        age?: number;
        name?: string;
        phone?: string;
        email: string;
        role?: 'user' | 'admin' | 'consultant' | 'superadmin';
    };
}
