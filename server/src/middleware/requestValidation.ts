import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationChain, validationResult } from 'express-validator';
import { checkSchema } from 'express-validator';
/**
 * Combines express-validator checks with error handling into a single middleware
 */
export const withValidation = (schema: Schema) => {
    const validations = checkSchema(schema);
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        next();
    };
};
