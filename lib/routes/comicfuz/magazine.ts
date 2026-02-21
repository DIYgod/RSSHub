import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/magazine/:id',
    categories: ['anime'],
    example: '/comicfuz/magazine/27860',
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
    name: 'ComicFuz杂志详情',
    maintainers: ['xiaobailoves'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const baseurl = 'https://comic-fuz.com';
        const openurl = `${baseurl}/magazine/${id}`;
        const imgurl = `https://img.comic-fuz.com`;

        const response = await ofetch(openurl, {
            headers: {
                'Referer': 'https://comic-fuz.com/',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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

        const magazineTitle = pageProps.magazineName || 'null';

        const magazineDescription = pageProps.pickupMagazineIssue?.longDescription || 'null';

        const issues = pageProps.magazineIssues || [];

        const items = issues.map((item: any) => {
            const amount = item.paidPoint || 0;
            const statusText = amount > 0 ? '付费' : '无料';

            let thumb = item.thumbnailUrl;
            if (thumb && !thumb.startsWith('http')) {
                thumb = `${imgurl}${thumb.startsWith('/') ? '' : '/'}${thumb}`;
            }

            const rawDate = item.updatedDate ? item.updatedDate.replace(/\s*発売/, '').trim() : '';

            return {
                title: `${magazineTitle} - ${item.magazineIssueName}`,
                link: `${baseurl}/magazine/viewer/${item.magazineIssueId}`,
                description: `
                ${thumb ? `<img src="${thumb}" style="max-width: 100%;"><br>` : ''}
                <p>价格: ${amount} 金币/银币</p>
                <p>发售日期: ${item.updatedDate}</p>
                <p>截止日期: ${item.endDate || '无'}</p>
                ${item.longDescription ? `<p>${item.longDescription}</p>` : ''}
                `,
                pubDate: rawDate ? parseDate(rawDate, 'YYYY/MM/DD') : new Date(),
                guid: `comicfuz-magazine-id-${item.magazineIssueId}`,
                category: [statusText],
            };
        });

        items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        return {
            title: `COMIC FUZ - ${magazineTitle}`,
            link: openurl,
            description: magazineDescription,
            item: items,
            language: 'ja',
        };
    },
};
