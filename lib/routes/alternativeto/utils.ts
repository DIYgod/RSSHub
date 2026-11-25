import ofetch from '@/utils/ofetch';

export const baseURL = 'https://alternativeto.net';

export const get = (url: string) => ofetch<string>(url, { minVersion: 'TLSv1.3' });
