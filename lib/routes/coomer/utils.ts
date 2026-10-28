export const getCoomerMediaUrl = (path: string, rootUrl: string) => new URL(`/data${path}`, rootUrl).href;
