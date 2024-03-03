// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { parseItem } = require('./utils');

export default async (ctx) => {
    const topic = ctx.req.param('topic');
    const limit = Number.parseInt(ctx.req.query('limit'), 10) || 30;
    const pageUrl = `https://www.scmp.com/topics/${topic}`;
    const { data: pageResponse } = await got(pageUrl);
    const $ = load(pageResponse);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const topicData = nextData.props.pageProps.payload.data.topic;
    const variables = nextData.props.pageProps.operationDescriptor.root.variables;

    const { data: apiResponse } = await got('https://apigw.scmp.com/content-delivery/v2', {
        headers: {
            apikey: 'MyYvyg8M9RTaevVlcIRhN5yRIqqVssNY',
            'content-type': 'application/json',
        },
        searchParams: {
            // got v11 does not support nested object in searchParams
            extensions: JSON.stringify({
                persistedQuery: {
                    sha256Hash: '8c951c1c2d4e94bc37d06dd94571552da4c0440c744acd00f2af84d3d8b6e2cf',
                    version: 1,
                },
            }),
            operationName: 'topicContentListPaginationQuery',
            variables: JSON.stringify({
                applicationIds: variables.applicationIds,
                count: limit,
                scmpPlusPaywallTypeIds: variables.scmpPlusPaywallTypeIds,
                id: topicData.id,
            }),
        },
    });

    const list = apiResponse.data.node.contents.edges.map(({ node }) => ({
        title: node.headline,
        summary: node.summary.text,
        link: `https://www.scmp.com${node.urlAlias}`,
        author: node.authors.map((a) => a.name).join(', '),
        pubDate: parseDate(node.publishedDate, 'x'),
        updated: parseDate(node.updatedDate, 'x'),
    }));

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    ctx.set('json', {
        nextData,
        apiResponse,
    });

    ctx.set('data', {
        title: topicData.name,
        link: pageUrl,
        description: topicData.description.text,
        item: items,
        language: 'en-hk',
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
        image: 'https://assets-v2.i-scmp.com/production/_next/static/media/default-image.d1be8967.png',
    });
};
