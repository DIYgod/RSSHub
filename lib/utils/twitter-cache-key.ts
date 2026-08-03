export const getTwitterUserCacheKey = (id: string, operationName: string, params: Record<string, unknown> | undefined) => `twitter:${id}:${operationName}:${JSON.stringify(params)}`;
