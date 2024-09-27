import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import { processImage } from './utils';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/timeline',
    categories: ['social-media'],
    example: '/zhihu/timeline',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户关注时间线',
    maintainers: ['SeanChao'],
    handler,
    description: `:::warning
  用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::`,
};

async function handler(ctx) {
    const cookie = config.zhihu.cookies;
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少知乎用户登录后的 Cookie 值');
    }
    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v3/moments`,
        headers: {
            Cookie: cookie,
        },
        searchParams: {
            desktop: true,
            limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15,
        },
    });
    const feeds = response.data.data;

    const urlBase = 'https://zhihu.com';
    const buildLink = (e) => {
        if (!e || !e.target || !e.target.type) {
            return '';
        }
        const id = e.target.id;
        switch (e.target.type) {
            case 'answer': {
                const questionId = e.target.question.id;
                return `${urlBase}/question/${questionId}/answer/${id}`;
            }
            case 'pin':
            case 'article':
                return e.target.url;
            case 'question':
                return `${urlBase}/question/${id}`;
            default:
                return;
        }
        return '';
    };

    /**
     * Returns one non-undefined/null element from a list of items
     * make sure there exists at least one element that is non-undefined
     *
     * @param {Array} list a list of items to be filtered
     */
    const getOne = (list) => list.find((e) => e !== undefined && e !== null);

    const buildActors = (e) => {
        const actors = e.actors;
        if (!actors) {
            return '';
        }
        return actors.map((e) => e.name).join(', ');
    };

    const getContent = (content) => {
        if (!content || !Array.isArray(content)) {
            return content;
        }
        // content can be a string or an array of objects
        return (
            content
                .map((e) => e.content)
                .filter((e) => e instanceof String && !!e)
                // some content may not be wrapped in tag, it will cause error when parsing
                .map((e) => `<div>${e}</div>`)
                .join('')
        );
    };

    const buildItem = (e) => {
        if (!e || !e.target) {
            return {};
        }
        const link = buildLink(e);
        return {
            title: `${e.action_text_tpl.replace('{}', buildActors(e))}: ${getOne([e.target.title, e.target.question ? e.target.question.title : ''])}`,
            description: processImage(`<div>${getOne([e.target.content_html, getContent(e.target.content), e.target.detail, e.target.excerpt, ''])}</div>`),
            pubDate: parseDate(e.updated_time * 1000),
            link,
            author: e.target.author ? e.target.author.name : '',
            guid: link,
            category: [e.verb],
        };
    };

    const out = feeds
        .filter((e) => e.verb)
        .map((e) => {
            if (e && e.type && e.type === 'feed_group') {
                // A feed group contains a list of feeds whose structure is the same as a single feed
                const title = e.group_text.replace('{LIST_COUNT}', e.list.length);
                const description =
                    e.list && Array.isArray(e.list)
                        ? e.list
                              .map((e) => buildItem(e))
                              .map((e) => `<a href="${e.link}"><b>${e.title}</b></a><br><p>${e.description}</p><br>`)
                              .join('')
                        : '';
                const pubDate = e.list && Array.isArray(e.list) && e.list.length > 0 ? parseDate(e.list[0].updated_time * 1000) : new Date();
                const guid = e.link;
                return {
                    title,
                    description,
                    pubDate,
                    guid,
                    category: [e.verb],
                };
            }
            return buildItem(e);
        });

    return {
        title: `知乎关注动态`,
        link: `https://www.zhihu.com/follow`,
        item: out,
    };
}
