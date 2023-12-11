const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

/**
 * Parses a tree array and returns an array of objects containing the key-value pairs.
 * @param {Array} tree - The tree to parse.
 * @param {Array} result - The result array to store the parsed key-value pairs. Default is an empty array.
 *
 * @returns {Array} - An array of objects containing the key-value pairs.
 */
const parseTree = (tree, result = []) => {
    tree.forEach((obj) => {
        const { key, value, children } = obj;
        result.push({ key, value });

        if (children && children.length > 0) {
            parseTree(children, result);
        }
    });

    return result;
};

module.exports = async (ctx) => {
    const { industry, label } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://www.questmobile.com.cn';
    const apiUrl = new URL('api/v2/report/article-list', rootUrl).href;
    const apiTreeUrl = new URL('api/v2/report/industry-label-tree', rootUrl).href;

    const {
        data: {
            data: { industryTree, labelTree },
        },
    } = await got(apiTreeUrl);

    const industries = parseTree(industryTree);
    const labels = parseTree(labelTree);

    const industryObj = industry ? industries.find((i) => i.key === industry || i.value === industry) : undefined;
    const labelObj = label ? labels.find((i) => i.key === label || i.value === label) : industryObj ? undefined : labels.find((i) => i.key === industry || i.value === industry);

    const industryId = industryObj?.key ?? -1;
    const labelId = labelObj?.key ?? -1;

    const currentUrl = new URL(`research/reports/${industryObj?.key ?? -1}/${labelObj?.key ?? -1}`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            version: 0,
            pageSize: limit,
            pageNo: 1,
            industryId,
            labelId,
        },
    });

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`research/report/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: {
                src: item.coverImgUrl,
                alt: item.title,
            },
            introduction: item.introduction,
            description: item.content,
        }),
        category: [...(item.industryList ?? []), ...(item.labelList ?? [])],
        guid: `questmobile-report#${item.id}`,
        pubDate: parseDate(item.publishTime),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('div.text div.daoyu').remove();

                item.title = content('div.title h1').text();
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div.text').html(),
                });
                item.author = content('div.source')
                    .text()
                    .replace(/^.*?：/, '');
                item.category = content('div.hy, div.keyword')
                    .find('span')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('div.data span').prop('datetime'));

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const author = $('meta[property="og:title"]').prop('content').split(/-/)[0];
    const categories = [industryObj?.value, labelObj?.value].filter((c) => c);
    const image = $(`img[alt="${author}"]`).prop('src');
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title: `${author}${categories.length === 0 ? '' : ` - ${categories.join(' - ')}`}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
};
