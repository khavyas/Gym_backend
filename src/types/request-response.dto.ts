import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { UserType } from '../models/User.model';

export interface AuthRequest<
    TBody = any,
    TQuery extends Query = Query,
    TParams extends ParamsDictionary = ParamsDictionary,
> extends Request<TParams, any, TBody, TQuery> {
    user?: UserType;
}
