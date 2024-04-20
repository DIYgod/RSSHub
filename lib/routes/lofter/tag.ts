import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { JSDOM } from 'jsdom';

export const route: Route = {
    path: '/tag/:name?/:type?',
    categories: ['social-media'],
    example: '/lofter/tag/cosplay/date',
    parameters: { name: 'tag name, such as `名侦探柯南`, `摄影` by default', type: 'ranking type, see below, new by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tag',
    maintainers: ['hoilc', 'nczitzk', 'LucunJi'],
    handler,
    description: `| new  | date | week | month | total |
  | ---- | ---- | ---- | ----- | ----- |
  | 最新 | 日榜 | 周榜 | 月榜  | 总榜  |`,
};

async function handler(ctx) {
    const name = ctx.req.param('name') ?? '摄影';
    const type = ctx.req.param('type') ?? 'new';
    const pageSize = 20;
    const startingIndex = 0;

    const rootUrl = 'https://www.lofter.com';
    const linkUrl = `${rootUrl}/tag/${name}/${type}`;
    const apiUrl = `${rootUrl}/dwr/call/plaincall/TagBean.getCommonTagExcellentAuthors.dwr`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        body: new URLSearchParams({
            callCount: 1,
            scriptSessionId: '${scriptSessionId}187',
            httpSessionId: '',
            'c0-scriptName': 'TagBean',
            'c0-methodName': 'search',
            'c0-id': '0',
            'c0-param0': `string:${encodeURI(name)}`,
            'c0-param1': 'number:0',
            'c0-param2': 'string:',
            'c0-param3': `string:${type}`,
            'c0-param4': 'boolean:false',
            'c0-param5': 'number:0',
            'c0-param6': `number:${pageSize}`,
            'c0-param7': `number:${startingIndex}`,
            'c0-param8': 'number:0',
            batchId: 493053,
        }),
    });

    const dom = new JSDOM(
        `<script>if (dwr == null) var dwr = {};
        if (dwr.engine == null) dwr.engine = {};
        dwr.engine._remoteHandleCallback = function () {
            this.data = arguments;
        };
        ${response.data}</script>`,
        {
            runScripts: 'dangerously',
        }
    );
    const data = dom.window.dwr.engine.data[2];

    const title =
        {
            new: '最新',
            date: '日榜',
            week: '周榜',
            month: '月榜',
            total: '最热',
        }[type] ?? '';

    const items = data.map((entry) => {
        const post = entry.post;

        let videos = '';
        if (post.embed) {
            const embed = JSON.parse(post.embed);
            if (embed.h256Url || embed.video_down_url) {
                videos = `<video src="${embed.h256Url ?? embed.video_down_url}" poster="${embed.video_img_url ?? ''}" controls="controls"></video>`;
            }
        }

        const images = post.photoLinks
            ? JSON.parse(post.photoLinks).reduce((accumulator, currentValue) => accumulator + `<img src="${currentValue.orign}"/>`, '') // small | middle | orign
            : '';

        const digest = load(post.digest);
        const description = digest.text();

        return {
            author: post.blogInfo.blogNickName,
            link: post.blogPageUrl,
            title: post.title || `${post.blogInfo.blogNickName}${description ? `：${description}` : ''}`,
            pubDate: parseDate(post.publishTime),
            description: videos + images + digest.html(),
            category: post.tagList,
        };
    });

    return {
        title: `${name} - ${title} | LOFTER`,
        link: linkUrl,
        item: items,
    };
}
