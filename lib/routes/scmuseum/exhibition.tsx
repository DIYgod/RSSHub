import crypto from 'node:crypto';

import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

// Generate a dynamic token using AES-256-ECB with a static key and timestamp
function getToken() {
    const key = 'TYYY3OT3-TOCBW7OW-T33QMVJ3-2IUUVC22'.replaceAll('-', ''); // this key is used for AES-256-ECB encryption, and it is hardcoded in the original code in https://www.scmuseum.cn/js/index.2af39792.chunk.js
    const t = (Math.random() + '').slice(-6) + Date.now();
    const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key, 'utf8'), null);
    cipher.setAutoPadding(true);
    let token = cipher.update(t, 'utf8', 'base64');
    token += cipher.final('base64');
    return token;
}

export const route: Route = {
    path: '/exhibition/:type?',
    categories: ['travel'],
    example: '/scmuseum/exhibition/temp',
    parameters: { type: 'Exhibition type, supported values: base (常设展览) or temp (临时展览), default is all exhibitions.' },
    name: 'Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.scmuseum.cn/Visit/Exhibition'],
            target: '/exhibition',
        },
    ],
    handler: async (ctx) => {
        const typeParam = ctx.req.param('type');

        const apiConfig = {
            base: { endpoint: 'queryExhibitionBaseList', name: '常设展览', isBase: true },
            temp: { endpoint: 'queryExhibitionTempList', name: '临时展览', isBase: false },
        };

        const fetchTypes = typeParam ? [typeParam] : ['base', 'temp'];
        const museumName = namespace.zh?.name || namespace.name;
        const titleTag = fetchTypes.length === 2 ? '' : apiConfig[fetchTypes[0] as keyof typeof apiConfig].name;

        const responses = await Promise.all(
            fetchTypes.map(async (t) => {
                const config = apiConfig[t as keyof typeof apiConfig];
                const apiUrl = `https://www.scmuseum.cn/japi/sw-cms-cloud/api/${config.endpoint}`;

                const response = await got({
                    method: 'post',
                    url: apiUrl,
                    headers: {
                        Appid: '75d98ea426f4412eab623c9076365802', // fixed appid
                        Token: getToken(),
                    },
                    json: {
                        entity: {
                            languageType: 'CN',
                        },
                        param: {
                            pageNum: 1,
                            pageSize: 6,
                        },
                    },
                });

                const list = response.data?.data?.records || [];

                return list.map((item: any) => {
                    const isBase = config.isBase;
                    const title = isBase ? item.baseName : item.tempName;
                    const linkId = isBase ? item.exhibitionBaseId : item.exhibitionTempId;
                    const itemLink = isBase ? `https://www.scmuseum.cn/Visit/Exhibition/BaseExhibition/${linkId}` : `https://www.scmuseum.cn/Visit/Exhibition/ExhibitiomReview/${linkId}`;

                    const pubDate = item.startTime ? timezone(parseDate(item.startTime), 8) : undefined;
                    const startDate = item.startTime ? item.startTime.split(' ', 1)[0] : '';
                    const endDate = item.endTime ? item.endTime.split(' ', 1)[0] : '';
                    const location = isBase ? item.basePlace : item.tempPlace;
                    const imgUrl = `https://www.scmuseum.cn/file/${item.thumb}`;

                    const description = renderToString(
                        <div>
                            <img src={imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location || '参考详情'}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate || '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate || '未定/常设'}
                            </p>
                        </div>
                    );

                    return {
                        title,
                        link: itemLink,
                        pubDate,
                        description,
                        // for further .ics process
                        _extra: {
                            museumName,
                            location,
                            startDate, // format: YYYY-MM-DD or '未定/常设'
                            endDate, // format: YYYY-MM-DD or '未定/常设'
                        },
                    };
                });
            })
        );

        const items = responses.flat();

        return {
            title: `${museumName} - 展览${titleTag ? ` - ${titleTag}` : ''}`,
            link: 'https://www.scmuseum.cn/Visit/Exhibition',
            language: 'zh-CN',
            item: items,
        };
    },
};
