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

            // Apply validated data back to the request safely.
            // In Express 5, `req.query` and `req.params` are getter-only. Do not reassign them, mutate instead.
            if (source === 'body') {
                req.body = validated as any;
            } else {
                const target = req[source]; // req.query or req.params

                // Assign validated keys
                if (validated && typeof validated === 'object') {
                    for (const [key, value] of Object.entries(validated as Record<string, unknown>)) {
                        delete target[key]; // Ensure old value is removed
                        target[key] = value as any;
                    }
                }
            }

            next();
        } catch (error) {
            console.log(error);
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
