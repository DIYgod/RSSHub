import { config } from '@/config';

export const getHeaders = () => ({
    accept: 'application/json, text/javascript, */*; q=0.01',
    cookie: config.smzdm.cookie,
    'x-requested-with': 'XMLHttpRequest',
});
