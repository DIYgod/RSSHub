import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const ALLOW_LANGUAGE = {
    en: 'en_GB',
    cn: 'zh_CN',
    tw: 'zh_TW',
};

const TITLE = {
    en: 'The Economist Global Business Review',
    cn: '经济学人 · 商论',
    tw: '經濟學人 · 商論',
};

const DESCRIPTION = {
    en: 'The Economist Global Business Review is a new bilingual digital app from the editors of The Economist Group.',
    cn: '《经济学人·商论》是《经济学人》2015年5月推出的旗下中英双语APP，萃取《经济学人》在商业、金融、科技等领域的精华文章，为中国读者呈现全球视角的深度分析，并鼓励中国的读者批判性地思考中国和全球重大议题。',
    tw: '《經濟學人·商論》是經濟學人集團官方中英雙語電子APP，萃取《經濟學人》在商業、金融、科技等領域的精華文章，為中國讀者呈現全球視角的深度分析，並鼓勵中國的讀者批判性地思考中國和全球的重大議題。',
};

const parseContent = function (item, article_id, language) {
    switch (item.type) {
        case 'paragraph':
            return parseParagraph(item.data, language);

        case 'image':
            return parseImage(item.data, article_id, language);

        case 'subtitle':
            return parseParagraph(item.data, language, 'h3');

        default:
            throw new Error(`Unknown type: ${item.type}`);
    }
};

const parseTitle = function (data, language) {
    const content = Object.assign({}, ...data.map((x) => ({ [x.lang]: x.text })));
    return language.map((item) => content[ALLOW_LANGUAGE[item]]).join('');
};

const parseParagraph = function (data, language, type = 'p') {
    const content = Object.assign({}, ...data.map((x) => ({ [x.lang]: x.text })));
    return `<div>${language.map((item) => `<${type}>${content[ALLOW_LANGUAGE[item]]}</${type}>`).join('')}</div>`;
};

const parseImage = function (data, article_id, language) {
    const content = Object.assign({}, ...data.map((x) => ({ [x.lang]: x.image_path })));
    return `<div><img src="https://businessreviewglobal-cdn.com/article_images/${article_id}/${encodeURIComponent(content[ALLOW_LANGUAGE[language[0]]])}"/></div>`;
};

const getArticleDetail = (article_id, language) => {
    const link = `https://api.hummingbird.businessreview.global/api/article/index?id=${article_id}`;
    return cache.tryGet(`${link}:${language.join('-')}`, async () => {
        const response = await got({
            method: 'get',
            url: link,
        });
        const data = response.data.body;
        let content = '';
        content += parseParagraph(data.rubric, language);
        content += data.content.map((item) => parseContent(item, article_id, language)).join('');
        return content;
    });
};

export const route: Route = {
    path: '/global-business-review/:language?',
    categories: ['traditional-media'],
    example: '/economist/global-business-review/cn-en',
    parameters: { language: 'Language, `en`, `cn`, `tw` are supported, support multiple options, default to cn-en' },
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
            source: ['businessreview.global/'],
            target: '/global-business-review',
        },
    ],
    name: 'Global Business Review',
    maintainers: ['prnake'],
    handler,
    url: 'businessreview.global/',
};

async function handler(ctx) {
    const language = (ctx.req.param('language') &&
        ctx.req
            .param('language')
            .split('-')
            .filter((item, index, arr) => ALLOW_LANGUAGE[item] && arr.indexOf(item, 0) === index)) || ['cn', 'en'];
    const main_language = language[0];

    const response = await got({
        method: 'get',
        url: 'https://api.hummingbird.businessreview.global/api/toc/get_articles',
    });

    const items = await Promise.all(
        response.data.articles.new.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10).map(async (item) => ({
            title: parseTitle(item.body.title, [main_language]),
            description: await getArticleDetail(item.article_id, language),
            category: parseTitle(item.body.fly_title, [main_language]),
            link: `https://www.businessreview.global/latest/${item.article_id}`,
            pubDate: item.publication_date,
        }))
    );

    return {
        title: TITLE[main_language],
        link: 'https://www.businessreview.global',
        description: DESCRIPTION[main_language],
        item: items,
    };
}
