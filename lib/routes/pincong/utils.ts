import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://pincong.rocks';

export const get = (url: string) => cache.tryGet(url, () => ofetch<string>(url, { minVersion: 'TLSv1.3' }));
