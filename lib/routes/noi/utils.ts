import { load } from 'cheerio';
import type { FetchResponse } from 'ofetch';

import ofetch from '@/utils/ofetch';

const posList = [7, 34, 35, 21, 0, 16, 4, 26, 11, 30, 15, 3, 32, 38, 31, 39, 5, 10, 14, 13, 2, 12, 8, 17, 18, 22, 9, 23, 33, 24, 36, 25, 20, 6, 28, 27, 1, 37, 19, 29];

const getAcwScV2 = (response: FetchResponse<string>) => {
    const arg1 = response._data!.match(/var arg1='(.*?)'/)![1];
    const acwTc = response.headers
        .getSetCookie()
        .find((cookie) => cookie.startsWith('acw_tc='))!
        .split(';', 1)[0];
    return `${acwTc}; acw_sc__v2=1234cf0d46-${posList.map((index) => arg1[index]).join('')}`;
};

export const getPage = async (url: string) => {
    const response = await ofetch.raw<string>(url);
    if (!response._data!.includes("var arg1='")) {
        return load(response._data!);
    }
    const html = await ofetch<string>(url, { headers: { cookie: getAcwScV2(response) } });
    return load(html);
};
