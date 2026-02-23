import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/magazine/:id',
    categories: ['anime'],
    example: '/comic-fuz/magazine/27860',
    parameters: { id: 'ComicFuz中对应的杂志id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['comic-fuz.com/magazine/:id'],
            target: '/magazine/:id',
        },
    ],
    name: '杂志详情',
    maintainers: ['xiaobailoves'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const baseUrl = 'https://comic-fuz.com';
        const openUrl = `${baseUrl}/magazine/${id}`;
        const imgUrl = `https://img.comic-fuz.com`;

        const response = await ofetch(openUrl, {
            headers: {
                Referer: 'https://comic-fuz.com/',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            },
        });

        const $ = load(response);
        const nextDataText = $('#__NEXT_DATA__').text();

        if (!nextDataText) {
            throw new Error('无法解析页面数据，请检查杂志 ID 是否正确或页面结构是否变动');
        }

        const nextData = JSON.parse(nextDataText);
        const pageProps = nextData.props?.pageProps;

        if (!pageProps) {
            throw new Error('无法解析页面 Props 数据');
        }

        const magazineTitle = pageProps.magazineName || '';

        const magazineDescription = pageProps.pickupMagazineIssue?.longDescription || '';

        const issues = pageProps.magazineIssues || [];

        const items = issues.map((item: any) => {
            const amount = item.paidPoint || 0;
            const statusText = amount > 0 ? '付费' : '无料';

            let thumb = item.thumbnailUrl;
            if (thumb && thumb.startsWith('/')) {
                thumb = `${imgUrl}${thumb}`;
            }

            const rawDate = item.updatedDate ? item.updatedDate.replace(/\s*発売/, '').trim() : '';

            return {
                title: `${magazineTitle} - ${item.magazineIssueName}`,
                link: `${baseUrl}/magazine/viewer/${item.magazineIssueId}`,
                description: `
                ${thumb ? `<img src="${thumb}" style="max-width: 100%;"><br>` : ''}
                <p>价格: ${amount} 金币/银币</p>
                <p>发售日期: ${item.updatedDate}</p>
                <p>截止日期: ${item.endDate || '无'}</p>
                ${item.longDescription ? `<p>${item.longDescription}</p>` : ''}
                `,
                pubDate: rawDate ? parseDate(rawDate, 'YYYY/MM/DD') : undefined,
                guid: `comicfuz-magazine-id-${item.magazineIssueId}`,
                category: [statusText],
            };
        });

        return {
            title: `COMIC FUZ - ${magazineTitle}`,
            link: openUrl,
            description: magazineDescription,
            item: items,
            language: 'ja',
        };
    },
};
