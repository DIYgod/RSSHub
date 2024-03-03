// @ts-nocheck
import got from '@/utils/got';
const auth = require('./auth');
const utils = require('../utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const xhuCookie = await auth.getCookie(ctx);
    const hexId = ctx.req.param('hexId');
    const link = `https://www.zhihu.com/people/${hexId}`;
    const url = `https://api.zhihuvvv.workers.dev/people/${hexId}/activities?before_id=0&limit=20`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });
    const data = response.data.data;

    ctx.set('data', {
        title: `${data[0].actor.name}的知乎动态`,
        link,
        image: data[0].actor.avatar_url,
        description: data[0].actor.headline || data[0].actor.description,
        item: data.map((item) => {
            const detail = item.target;
            let title;
            let description;
            let url;
            const images = [];
            let text = '';
            let link = '';
            let author = '';

            switch (item.target.type) {
                case 'answer':
                    title = detail.question.title;
                    author = detail.author.name;
                    description = utils.ProcessImage(detail.content);
                    url = `https://www.zhihu.com/question/${detail.question.id}/answer/${detail.id}`;
                    break;
                case 'article':
                    title = detail.title;
                    author = detail.author.name;
                    description = utils.ProcessImage(detail.content);
                    url = `https://zhuanlan.zhihu.com/p/${detail.id}`;
                    break;
                case 'pin':
                    title = detail.excerpt_title;
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
                    description = utils.ProcessImage(detail.detail);
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
            }

            return {
                title: `${data[0].actor.name}${item.action_text}: ${title}`,
                author,
                description,
                pubDate: parseDate(item.created_time * 1000),
                link: url,
            };
        }),
    });
};
