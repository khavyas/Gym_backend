import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodType } from 'zod';

/**
 * Middleware factory for validating request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate ('body', 'query', 'params')
 */
export const validateRequest = (
    schema: ZodType<any>,
    source: 'body' | 'query' | 'params' = 'body'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate the specified part of the request
            const validated = await schema.parseAsync(req[source]);

            // Replace the request data with validated (and potentially transformed) data
            req[source] = validated;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod validation errors into a readable structure

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error,
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error during validation',
            });
        }
    };
};
