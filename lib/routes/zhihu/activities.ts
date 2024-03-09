import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import g_encrypt from './execlib/x-zse-96-v3';
import md5 from '@/utils/md5';

export default async (ctx) => {
    const id = ctx.req.param('id');

    // Because the API of zhihu.com has changed, we must use the value of `d_c0` (extracted from cookies) to calculate
    // `x-zse-96`. So first get `d_c0`, then get the actual data of a ZhiHu question. In this way, we don't need to
    // require users to set the cookie in environmental variables anymore.

    // fisrt: get cookie(dc_0) from zhihu.com
    const cookie_mes = await cache.tryGet('zhihu:cookies:d_c0', async () => {
        const response = await got(`https://www.zhihu.com/people/${id}`, {
            headers: {
                ...utils.header,
            },
        });

        const cookie_org = response.headers['set-cookie'];
        const cookie = cookie_org.toString();
        const match = cookie.match(/d_c0=(\S+?)(?:;|$)/);
        const cookie_mes = match && match[1];
        if (!cookie_mes) {
            throw new Error('Failed to extract `d_c0` from cookies');
        }
        return cookie_mes;
    });
    const cookie = `d_c0=${cookie_mes}`;

    // second: get real data from zhihu
    const apiPath = `/api/v3/moments/${id}/activities?limit=7&desktop=true`;

    // calculate x-zse-96, refer to https://github.com/srx-2000/spider_collection/issues/18
    const f = `101_3_3.0+${apiPath}+${cookie_mes}`;
    const xzse96 = '2.0_' + g_encrypt(md5(f));
    const _header = { cookie, 'x-zse-96': xzse96, 'x-app-za': 'OS=Web', 'x-zse-93': '101_3_3.0' };

    const response = await got(`https://www.zhihu.com${apiPath}`, {
        headers: {
            ...utils.header,
            ..._header,
            Referer: `https://www.zhihu.com/people/${id}/activities`,
            Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });

    const data = response.data.data;

    ctx.set('data', {
        title: `${data[0].actor.name}的知乎动态`,
        link: `https://www.zhihu.com/people/${id}/activities`,
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
