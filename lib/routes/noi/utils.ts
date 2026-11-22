import { load } from 'cheerio';

import { getAcwScV2 } from '@/routes/bjx/utils';
import ofetch from '@/utils/ofetch';

export const getPage = async (url: string) => {
    const response = await ofetch.raw<string>(url);
    if (!response._data!.includes("var arg1='")) {
        return load(response._data!);
    }
    const html = await ofetch<string>(url, { headers: { cookie: getAcwScV2(response) } });
    return load(html);
};
