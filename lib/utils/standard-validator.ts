import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ValidationTargets } from 'hono';

const RESTRICTED_DATA_FIELDS = {
    header: ['cookie'],
};

/**
 * Sanitizes validation issues by removing sensitive data fields from error messages.
 *
 * This function removes potentially sensitive information (like cookies) from validation
 * error messages before they are returned to the client. It handles different validation
 * library formats based on the vendor string.
 *
 * @param issues - Array of validation issues from Standard Schema validation
 * @param vendor - The validation library vendor identifier (e.g., 'arktype', 'valibot')
 * @param target - The validation target being processed ('header', 'json', etc.)
 * @returns Sanitized array of validation issues with sensitive data removed
 *
 * @example
 * ```ts
 * const issues = [{ message: 'Invalid header', data: { cookie: 'secret' } }]
 * const sanitized = sanitizeIssues(issues, 'arktype', 'header')
 * // Returns issues with cookie field removed from data
 * ```
 */
export function sanitizeIssues(issues: readonly StandardSchemaV1.Issue[], vendor: string, target: keyof ValidationTargets): readonly StandardSchemaV1.Issue[] {
    if (!(target in RESTRICTED_DATA_FIELDS)) {
        return issues;
    }

    const restrictedFields = RESTRICTED_DATA_FIELDS[target as keyof typeof RESTRICTED_DATA_FIELDS] || [];

    if (vendor === 'arktype') {
        return sanitizeArktypeIssues(issues, restrictedFields);
    }

    if (vendor === 'valibot') {
        return sanitizeValibotIssues(issues, restrictedFields);
    }

    return issues;
}

function sanitizeArktypeIssues(issues: readonly StandardSchemaV1.Issue[], restrictedFields: string[]): readonly StandardSchemaV1.Issue[] {
    return issues.map((issue) => {
        if (issue && typeof issue === 'object' && 'data' in issue && typeof issue.data === 'object' && issue.data !== null && !Array.isArray(issue.data)) {
            const dataCopy = { ...(issue.data as Record<string, unknown>) };
            for (const field of restrictedFields) {
                delete dataCopy[field];
            }
            // Preserve prototype chain to maintain toJSON method
            const sanitizedIssue = Object.create(Object.getPrototypeOf(issue));
            Object.assign(sanitizedIssue, issue, { data: dataCopy });
            return sanitizedIssue;
        }
        return issue;
    }) as readonly StandardSchemaV1.Issue[];
}

function sanitizeValibotIssues(issues: readonly StandardSchemaV1.Issue[], restrictedFields: string[]): readonly StandardSchemaV1.Issue[] {
    return issues.map((issue) => {
        if (issue && typeof issue === 'object' && 'path' in issue && Array.isArray(issue.path)) {
            for (const path of issue.path) {
                if (typeof path === 'object' && 'input' in path && typeof path.input === 'object' && path.input !== null && !Array.isArray(path.input)) {
                    for (const field of restrictedFields) {
                        delete path.input[field];
                    }
                }
            }
        }
        return issue;
    }) as readonly StandardSchemaV1.Issue[];
}
