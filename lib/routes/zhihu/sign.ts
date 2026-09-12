import md5 from '@/utils/md5';

import { encrypt } from './execlib/x-zse-96-v3';

export const getSignedHeaders = (apiPath: string, dc0: string) => ({
    'x-api-version': '3.0.91',
    'x-zse-96': '2.0_' + encrypt(md5(`101_3_3.0+${apiPath}+${dc0}`)),
    'x-app-za': 'OS=Web',
    'x-zse-93': '101_3_3.0',
});
