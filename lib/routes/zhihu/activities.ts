import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { header, processImage, getSignedHeader } from './utils';
import { parseDate } from '@/utils/parse-date';
import sanitizeHtml from 'sanitize-html';

export const route: Route = {
    path: '/people/activities/:id',
    categories: ['social-media', 'popular'],
    view: ViewType.Articles,
    example: '/zhihu/people/activities/diygod',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/people/:id'],
        },
    ],
    name: '用户动态',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    // second: get real data from zhihu
    const apiPath = `/api/v3/moments/${id}/activities?limit=7&desktop=true`;

    const signedHeader = await getSignedHeader(`https://www.zhihu.com/people/${id}`, apiPath);

    const response = await got(`https://www.zhihu.com${apiPath}`, {
        headers: {
            ...header,
            ...signedHeader,
            Referer: `https://www.zhihu.com/people/${id}/activities`,
            // Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });

    const data = response.data.data;

    return {
        title: `${data[0].actor.name}的知乎动态`,
        link: `https://www.zhihu.com/people/${id}/activities`,
        image: data[0].actor.avatar_url,
        description: data[0].actor.headline || data[0].actor.description,
        item: data.map((item) => {
            const detail = item.target;
            let title;
            let description;
            let url;
            const images: string[] = [];
            let text = '';
            let link = '';
            let author = '';

            switch (item.target.type) {
                case 'answer':
                    title = detail.question.title;
                    author = detail.author.name;
                    description = processImage(detail.content);
                    url = `https://www.zhihu.com/question/${detail.question.id}/answer/${detail.id}`;
                    break;
                case 'article':
                    title = detail.title;
                    author = detail.author.name;
                    description = processImage(detail.content);
                    url = `https://zhuanlan.zhihu.com/p/${detail.id}`;
                    break;
                case 'pin':
                    title = sanitizeHtml(detail.excerpt_title);
                    author = detail.author.name;
                    for (const contentItem of detail.content) {
                        switch (contentItem.type) {
                            case 'text':
                                text = `<p>${contentItem.own_text}</p>`;

                                break;

                            case 'image':
                                images.push(`<p><img src="${contentItem.url.replace('xl', 'r')}"/></p>`);

                                break;

                            case 'link':
                                link = `<p><a href="${contentItem.url}" target="_blank">${contentItem.title}</a></p>`;

                                break;

                            case 'video':
                                link = `<p><video
                                controls="controls"
                                width="${contentItem.playlist[1].width}"
                                height="${contentItem.playlist[1].height}"
                                src="${contentItem.playlist[1].url}"></video></p>`;

                                break;

                            default:
                                throw new Error(`Unknown type: ${contentItem.type}`);
                        }
                    }
                    description = `${text}${link}${images.join('')}`;
                    url = `https://www.zhihu.com/pin/${detail.id}`;
                    break;
                case 'question':
                    title = detail.title;
                    author = detail.author.name;
                    description = processImage(detail.detail);
                    url = `https://www.zhihu.com/question/${detail.id}`;
                    break;
                case 'collection':
                    title = detail.title;
                    url = `https://www.zhihu.com/collection/${detail.id}`;
                    break;
                case 'column':
                    title = detail.title;
                    description = `<p>${detail.intro}</p><p><img src="${detail.image_url}"/></p>`;
                    url = `https://zhuanlan.zhihu.com/${detail.id}`;
                    break;
                case 'topic':
                    title = detail.name;
                    description = `<p>${detail.introduction}</p><p>话题关注者人数：${detail.followers_count}</p>`;
                    url = `https://www.zhihu.com/topic/${detail.id}`;
                    break;
                case 'live':
                    title = detail.subject;
                    description = detail.description.replaceAll(/\n|\r/g, '<br>');
                    url = `https://www.zhihu.com/lives/${detail.id}`;
                    break;
                case 'roundtable':
                    title = detail.name;
                    description = detail.description;
                    url = `https://www.zhihu.com/roundtable/${detail.id}`;
                    break;
                default:
                    description = `未知类型 ${item.target.type}，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue`;
            }

            return {
                title: `${data[0].actor.name}${item.action_text}: ${title}`,
                author,
                description,
                pubDate: parseDate(item.created_time * 1000),
                link: url,
            };
        }),
    };
}
