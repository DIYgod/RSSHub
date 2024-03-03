// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { termsMap } = require('./terms-map');

const baseUrl = 'https://thecatcity.com';

export default async (ctx) => {
    const term = ctx.req.param('term');
    const { data } = await got(`${baseUrl}/node_api/v1/articles/posts`, {
        searchParams: {
            pageId: 977_080_509_047_743,
            term,
        },
    });

    const list = data.data.posts.map((post) => ({
        title: post.title,
        description: post.description,
        link: `${baseUrl}${post.url}`,
        pubDate: parseDate(post.post_date),
        guid: post.guid,
        api: `${baseUrl}/node_api/v1/articles/${post.id}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.guid, async () => {
                const { data } = await got(item.api, {
                    searchParams: {
                        pageId: 977_080_509_047_743,
                    },
                });
                item.description = data.data.post_content;
                item.category = [...new Set([...data.data.tags.map((t) => t.name), ...data.data.categories.map((c) => c.name)])];
                item.author = data.data.author.display_name;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: termsMap[term] ? termsMap[term].title : termsMap[''].title,
        description: '提供貓咪日常照顧、新手準備、貓用品、貓咪醫療、貓飲食與行為等相關知識，以及療癒貓影片、貓趣聞、貓小物流行資訊，不論你是貓奴、還是貓控，一切所需都在貓奴日常找到',
        link: baseUrl,
        image: 'https://assets.presslogic.com/presslogic-hk-tc/static/favicon.ico',
        item: items,
    });
};
