/**
 * Base Sanitizer
 * Common utilities and types for all sanitizers
 */

/**
 * Sensitive fields that should NEVER be sent to clients
 */
export const SENSITIVE_FIELDS = ['password', 'googleId'];

/**
 * Remove sensitive fields from any object
 */
export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  fieldsToRemove: string[] = SENSITIVE_FIELDS
): Partial<T> {
  const sanitized = { ...obj };
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  return sanitized;
}

/**
 * Sanitize array of objects using a sanitizer function
 */
export function sanitizeArray<T, R>(items: T[], sanitizer: (item: T) => R): R[] {
  return items.map(sanitizer);
}

/**
 * Pick specific fields from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific fields from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from snake_case to camelCase
 */
export function objectToCamelCase<T extends Record<string, any>>(obj: T): any {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    result[toCamelCase(key)] = obj[key];
  });
  return result;
}

