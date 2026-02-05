import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import { solveWafChallenge } from '@/routes/juejin/utils';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const rootUrl = 'https://www.36kr.com';

export const ProcessItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const detailResponse = await ofetch(item.link);

        const cipherTextList = detailResponse.match(/{"state":"(.*)","isEncrypt":true}/) ?? [];

        if (cipherTextList.length === 0) {
            const $ = load(detailResponse);
            item.description = $('div.articleDetailContent').html();
        } else {
            const key = CryptoJS.enc.Utf8.parse('efabccee-b754-4c');
            const content = JSON.parse(
                CryptoJS.AES.decrypt(cipherTextList[1], key, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7,
                })
                    .toString(CryptoJS.enc.Utf8)
                    .toString()
            ).articleDetail.articleDetailData.data;
            item.description = content.widgetContent;
        }

        return item;
    });

export const getWafTokenId = () =>
    cache.tryGet(
        '36kr:_waftokenid',
        async () => {
            const captchaResponse = await ofetch(rootUrl);

            const $ = load(captchaResponse);
            const payload = $('script')
                .text()
                .match(/atob\('(.*?)'\)\),/)?.[1];
            const response = solveWafChallenge(payload);

            const tokenIdResponse = await ofetch.raw(rootUrl, {
                headers: {
                    Cookie: `_wafchallengeid=${response};`,
                },
                redirect: 'manual',
            });

            const _wafTokenId = tokenIdResponse.headers
                .getSetCookie()
                .find((cookie) => cookie.startsWith('_waftokenid='))
                ?.split(';')[0]
                .split('=')[1];

            return _wafTokenId as string;
        },
        300, // server-provided value
        false
    );
