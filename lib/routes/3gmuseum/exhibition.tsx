import { load } from 'cheerio';
import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/tempexhibition',
    categories: ['travel'],
    example: '/3gmuseum/tempexhibition',
    name: 'Temporary Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.3gmuseum.cn/web/column/col5009287.html'],
            target: '/tempexhibition',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.3gmuseum.cn';
        const apiUrl = `${baseUrl}/web/column/col5009287.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        // The data is embedded in the HTML as a JSON string inside a script tag, find the 'var newsPageTotal = {...}' part
        const idx = response.data.indexOf('var newsPageTotal = ');
        const endIdx = response.data.indexOf('\n', idx);
        const str = response.data.slice(idx + 'var newsPageTotal = '.length, endIdx).trim();

        const data = JSON.parse(str);
        const list: any[] = data?.list;

        const items = list.map((item) => {
            const article = item.article;
            const itemLink = article.pcUrl;
            const $listContent = load(article.content);
            const locationText = $listContent('p:contains("地点：")').text();
            const location = locationText.replace(/.*?(?:展览|展出)?地点：/, '').trim();
            const fullDurationText = $listContent('p:contains("时间：")').text();
            const fullDuration = fullDurationText.replace(/.*?(?:展览|展出)?时间：?/, '').trim();

            let startDate;
            let endDate;

            if (fullDuration) {
                // Typical format: 2026年2月10日-5月18日 or 2026年1月27日——2027年1月17日 or 2025.6.18-2026.1.5
                const dateMatch = fullDuration.match(/(\d{4}[年.]\d{1,2}[月.]\d{1,2}日?)\s*[—\-~至]+\s*(\d{4}[年.])?(\d{1,2}[月.]\d{1,2}日?)/);
                if (dateMatch) {
                    const startStr = dateMatch[1].replaceAll(/[年月.]/g, '-').replace('日', '');
                    const endYear = dateMatch[2] ? dateMatch[2].replaceAll(/[年.]/g, '-') : startStr.slice(0, 5);
                    const endStr = endYear + dateMatch[3].replaceAll(/[月.]/g, '-').replace('日', '');

                    startDate = dayjs(startStr).format('YYYY-MM-DD');
                    endDate = dayjs(endStr).format('YYYY-MM-DD');
                }
            } else {
                // extend_field_starttime may differ from the fullDuration, usually 1 day earlier, so parse fullDuration first, then fallback to extend_field_starttime and extend_field_endtime if fullDuration is not available
                const formMap = article.formMap;
                startDate = dayjs(formMap.extend_field_starttime).format('YYYY-MM-DD');
                endDate = dayjs(formMap.extend_field_endtime).format('YYYY-MM-DD');
            }

            const pubDate = timezone(parseDate(item.pubTime), 8);
            const title = item.listTitle;
            const imgUrl = `https:${item.listImage}`;

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
                    {fullDuration && (
                        <p>
                            <small>原始展期：{fullDuration}</small>
                        </p>
                    )}
                </div>
            );

            return {
                title,
                link: itemLink,
                pubDate,
                description,
                _extra: {
                    museumName,
                    location,
                    startDate,
                    endDate,
                },
            };
        });

        return {
            title: `${museumName} - 临时展览`,
            link: apiUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
