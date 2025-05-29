import { config } from '@/config';

export const getHeaders = () => ({
    cookie: config.smzdm.cookie,
    'x-requested-with': 'XMLHttpRequest',
});
