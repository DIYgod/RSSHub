import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { Context } from 'hono';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const baseUrl = 'https://kpmg.com';
const payload = {
    query: '',
    filters: {
        all: [{ kpmg_tab_type: ['Insights'] }, { kpmg_article_type: ['Article-General'] }, { kpmg_template_type: ['article-details-template', 'insights-flexible-template', 'editable-flex-template', 'editable-campaign-template'] }],
    },
    result_fields: {
        kpmg_description: { raw: {} },
        kpmg_banner_flag: { raw: {} },
        kpmg_primary_tag: { raw: {} },
        kpmg_article_date: { raw: {} },
        kpmg_contact_job_ttl: { raw: {} },
        kpmg_title: { raw: {} },
        kpmg_contact_city: { raw: {} },
        kpmg_event_start_time: { raw: {} },
        kpmg_article_date_time: { raw: {} },
        kpmg_tab_type: { raw: {} },
        kpmg_short_desc: { raw: {} },
        kpmg_image_alt: { raw: {} },
        kpmg_url: { raw: {} },
        kpmg_template_type: { raw: {} },
        kpmg_image: { raw: {} },
        kpmg_non_decorative_alt_text: { raw: {} },
        kpmg_article_readtime: { raw: {} },
        kpmg_contact_fn: { raw: {} },
        kpmg_contact_ln: { raw: {} },
        kpmg_event_type: { raw: {} },
        kpmg_contact_country: { raw: {} },
        kpmg_is_rendition_optimized: { raw: {} },
        kpmg_article_primary_format: { raw: {} },
        kpmg_article_type: { raw: {} },
        kpmg_event_startdate: { raw: {} },
    },
    page: { size: 20, current: 1 },
    sort: { kpmg_filter_date: 'desc' },
};
const endpoints = {
    en: {
        title: 'Insights - KPMG ',
        link: `${baseUrl}/xx/en/home/insights.html`,
        api: `${baseUrl}/esearch/xx-en`,
    },
    zh: {
        title: '洞察 - 毕马威',
        link: `${baseUrl}/cn/zh/home/insights.html`,
        api: `${baseUrl}/esearch/cn-zh`,
    },
};
const render = (data) => art(path.join(__dirname, 'templates/description.art'), data);

const handler = async (ctx: Context) => {
    const { lang = 'en' } = ctx.req.param();
    const endpoint = endpoints[lang];
    if (!endpoint) {
        throw new InvalidParameterError('Invalid language');
    }
    const link = endpoint.link;

    const response = await ofetch(endpoint.api, {
        method: 'POST',
        body: payload,
    });

    const list = response.results.map((item) => ({
        title: item.kpmg_title.raw,
        description: item.kpmg_description.raw,
        link: item.kpmg_url.raw,
        pubDate: parseDate(item.kpmg_article_date_time.raw),
        image: item.kpmg_image.raw,
        imageAlt: item.kpmg_image_alt?.raw,
    }));

    const item = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);

                const content = $('.bodytext-data')
                    .toArray()
                    .map((item) => {
                        const element = $(item);
                        element.find('.hidden-xs, .sr-only').remove();
                        return element.parent().html();
                    })
                    .join('');

                const pdfDetails = $('.pdfdetails').parent().parent().parent();
                pdfDetails.find('.hidden-xs, .sr-only').remove();

                item.description = render({
                    image: item.image,
                    alt: item.imageAlt,
                    content,
                    pdf: pdfDetails.prop('outerHTML'),
                });

                return item;
            })
        )
    );

    return {
        title: 'KPMG Insights',
        link,
        item,
    };
};

export const route: Route = {
    path: '/insights/:lang?',
    example: '/kpmg/insights',
    parameters: { lang: 'Language, either `en` or `zh`' },
    radar: [
        {
            source: ['kpmg.com/xx/en/home/insights.html'],
            target: '/insights/en',
        },
        {
            source: ['kpmg.com/cn/zh/home/insights.html'],
            target: '/insights/zh',
        },
    ],
    name: 'Insights',
    maintainers: ['LogicJake'],
    handler,
    url: 'kpmg.com/xx/en/home/insights.html',
    zh: {
        name: '洞察',
    },
};
