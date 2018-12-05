const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const qs = require('querystring');

module.exports = async (ctx) => {
    const { params } = ctx.params;
    const query = qs.parse(params);
    const { data: html } = await axios.get(`https://store.steampowered.com/search/results`, {
        params: query,
    });
    const $ = cheerio.load(html);

    ctx.state.data = {
        title: 'Steam search result',
        description: `Query: ${qs.stringify(query)}`,
        link: /g_strUnfilteredURL\s=\s'(.*)'/.exec(html)[1],
        item: $('#search_result_container a')
            .toArray()
            .map((a) => {
                const $el = $(a);
                const isBundle = !!$el.attr('data-ds-bundle-data');
                const isDiscounted = $el.find('.search_price.discounted').length > 0;
                const hasReview = $el.find('.search_review_summary').length > 0;
                let desc = '';
                if (isBundle) {
                    const bundle = JSON.parse($el.attr('data-ds-bundle-data'));
                    desc += 'Bundle\n';
                    if (bundle.m_bRestrictGifting) {
                        desc += 'Restrict gifting\n';
                    }
                    desc += `Items count: ${bundle.m_rgItems.length}\n`;
                }
                if (isDiscounted) {
                    desc += `Discount: ${$el
                        .find('.search_discount span')
                        .text()
                        .trim()}\n`;
                    desc += `Original price: ${$el
                        .find('.search_price strike')
                        .text()
                        .trim()}\n`;
                    desc += `Discounted price: ${$el
                        .find('.search_price')
                        .contents()
                        .filter((i, e) => e.nodeType === 3)
                        .text()
                        .trim()}\n`;
                } else {
                    desc += `Price: ${$el
                        .find('.search_price')
                        .text()
                        .trim()}\n`;
                }
                if (hasReview) {
                    desc += $el.find('.search_review_summary').attr('data-tooltip-html');
                }
                return {
                    title: $el.find('span.title').text(),
                    link: $el.attr('href'),
                    description: desc.replace(/\n/g, '<br>'),
                };
            })
            .filter((it) => it.title),
    };
};
