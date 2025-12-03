import path from 'node:path';

import { load } from 'cheerio';
import dayjs from 'dayjs';

import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.dlsite.com';

const defaultFilters = {
    show_type: 1,
    show_layout: 1,
    per_page: 100,
};

const formatDate = (date, format) => dayjs(date).format(format);

const addFilters = (url, filters) => {
    const keys = Object.keys(filters);
    const filterStr = keys.map((k) => `/${k}/${filters[k]}`).join('');
    const newUrl = url.replaceAll(new RegExp(String.raw`(/${keys.join(String.raw`/\w+|/`)}/\w+)`, 'g'), '');
    return `${newUrl}${/=/.test(newUrl) ? '' : '/='}${filterStr}`;
};

const getPubDate = (raw) => {
    const dateMatches = raw.match(/(\d{4}).*(\d{2}).*(\d{2})/);
    if (dateMatches) {
        return parseDate(`${dateMatches[1]}-${dateMatches[2]}-${dateMatches[3]}`, 'YYYY-MM-DD');
    }
    return parseDate(raw.split(':').pop().trim(), 'MMM/DD/YYYY');
};

const getDetails = async (works) => {
    const apiUrl = `${rootUrl}/home-touch/product/info/ajax?product_id=${works}`;

    const detailResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    return detailResponse.data;
};

const ProcessItems = async (ctx) => {
    art.defaults.imports.formatDate = formatDate;

    const subPath = getSubPath(ctx) === '/' ? '/home/new' : getSubPath(ctx);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const currentUrl = `${rootUrl}${addFilters(subPath, defaultFilters)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const works = $('dt.work_name').slice(0, limit);
    const updatedDate = $('.work_update').length === 0 ? undefined : getPubDate($('.work_update').text());

    const details = await getDetails(
        works
            .toArray()
            .map(
                (item) =>
                    $(item)
                        .find('a')
                        .attr('href')
                        .match(/_id\/(.*?)\.html/)[1]
            )
            .join(',')
    );

    const items = works.toArray().map((item) => {
        item = $(item).parentsUntil('tbody, ul');

        const a = item.find('.work_name a');

        const title = a.text();
        const link = a.attr('href');
        const guid = link.match(/_id\/(.*?)\.html/)[1];

        const description = item.find('.work_text').text();
        const authors = item
            .find('.maker_name a')
            .toArray()
            .map((a) => ({
                name: $(a).text(),
                link: $(a).attr('href'),
            }));
        let images = item.find('div[data-samples]').length === 0 ? [] : JSON.parse(item.find('div[data-samples]').attr('data-samples').replaceAll("'", '"')).map((s) => s.thumb);

        const workCategories = item
            .find('.work_category')
            .find('a')
            .toArray()
            .map((i) => ({
                text: $(i).text(),
                link: $(i).attr('href'),
            }));

        const workGenres = item
            .find('.work_genre')
            .find('span[title]')
            .toArray()
            .map((i) => ({
                text: $(i).text(),
            }));

        const searchTags = item
            .find('.search_tag')
            .find('a')
            .toArray()
            .map((i) => ({
                text: $(i).text(),
                link: $(i).attr('href'),
            }));

        const nameTags = item
            .find('.icon_wrap')
            .find('span[title]')
            .toArray()
            .map((i) => ({
                text: $(i).text(),
            }));

        const detail = details[guid];

        const pubDate = timezone(parseDate(detail.regist_date), +9);
        const discountRate = detail.discount_rate;
        const discountEndDate = detail.discount_end_date ? timezone(parseDate(detail.discount_end_date, 'MM/DD HH:mm'), +9) : undefined;
        images = images.length === 0 ? [detail.work_image] : images;

        return {
            title: `${
                discountRate
                    ? `${discountRate}% OFF
                        ${` ${discountEndDate ? `${dayjs(discountEndDate).format('YYYY-MM-DD HH:mm')} まで` : ''}`}`
                    : ' '
            }${title}`,
            link,
            pubDate,
            author: authors.map((a) => a.name).join(' / '),
            category: [...workCategories.map((i) => i.text), ...workGenres.map((i) => i.text), ...searchTags.map((i) => i.text), ...nameTags.map((i) => i.text)],
            guid: `dlsite-${guid}`,
            description: art(path.join(__dirname, 'templates/description.art'), {
                detail,
                images,
                authors,
                discountRate,
                discountEndDate,
                updatedDate,
                pubDate,
                workCategories,
                workGenres,
                searchTags,
                description,
            }),
        };
    });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};

export { ProcessItems };
