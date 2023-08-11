const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.dlnews.com';
const getData = async (url) => (await got.get(url).json()).content_elements;

const getList = (data) =>
    data.map((value) => {
        const { _id, headlines, description, publish_date, website_url, taxonomy, credits, promo_items } = value;
        return {
            id: _id,
            title: headlines.basic,
            link: `${baseUrl}${website_url}`,
            description: description.basic,
            author: credits.by.map((v) => v.name).join(', '),
            itunes_item_image: promo_items.basic.url,
            pubDate: parseDate(publish_date),
            category: taxonomy.sections.map((v) => v.name).join(', '),
        };
    });

module.exports = { getData, getList };
