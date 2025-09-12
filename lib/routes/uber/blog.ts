import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://www.uber.com';

export const route: Route = {
    // `compat` is a never used parameter
    // just for backward compatibility with the deprecated `:maxPage` parameter
    path: '/blog/:compat?',
    categories: ['blog'],
    example: '/uber/blog',
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
            source: ['www.uber.com/:language/blog/engineering'],
            target: '/blog',
        },
    ],
    name: 'Engineering',
    maintainers: ['hulb'],
    handler,
    url: 'www.uber.com/en-HK/blog/engineering',
    description:
        "The English blog on any of Uber's regional sites (e.g., www.uber.com/en-JP/blog) is the same engineering blog provided by this route, so language selection is not supported. This route is not for the public news blog on specific regional sites (e.g., www.uber.com/ja-JP/blog).",
    zh: {
        description: 'uber的任何区域站点的英文blog（例如www.uber.com/en-JP/blog）都是相同的内容，正是本路由提供的engineering blog，因此本路由不提供语言选择；本路由不是uber在特定区域站点的公开新闻blog（例如www.uber.com/ja-JP/blog)',
    },
};

async function handler() {
    const response = await ofetch(`${rootURL}/en-HK/blog/engineering/rss/`, {
        // The source site is misconfigured or intentionally blocking requests without a specific accept header
        // Without this header, it will return an HTTP 406 error
        // Note that the accept type must be 'text/html'; 'application/xml' or similar will get HTTP 404 error
        headers: {
            accept: 'text/html',
        },
        // Without this, ofetch will parse the response as a blob instead of text, which cannot be loaded by cheerio
        parseResponse: (txt) => txt,
    });
    const $ = load(response, { xmlMode: true });

    const result = await Promise.all(
        $('item')
            .toArray()
            .map((el) =>
                cache.tryGet($(el).find('link').text(), async () => {
                    const detailResponse = await ofetch($(el).find('link').text(), {
                        headers: {
                            accept: 'text/html',
                        },
                    });
                    const detail = load(detailResponse);

                    const scriptText = detail('script#__REDUX_STATE__').text().trim();
                    // The json in the script element is over-encoded
                    // It needs to be decoded this way before it can be parsed by JSON.parse
                    const jsonText = decodeURIComponent(JSON.parse(`"${scriptText}"`));
                    // Traverse the JSON to find the content node, which is more robust against format changes.
                    const contentHtml = findNode(JSON.parse(jsonText), { idKey: 'id', idValue: 'BlogArticleContent', siblingKey: 'props', childKey: 'content' }).replaceAll(String.raw`\n`, '');

                    return {
                        link: $(el).find('link').text(),
                        title: $(el).find('title').text(),
                        description: contentHtml,
                        pubDate: parseDate($(el).find('pubDate').text()),
                        category: $(el)
                            .find('category')
                            .toArray()
                            .map((item) => $(item).text()),
                    };
                })
            )
    );

    return {
        title: `Uber Engineering Blog`,
        link: rootURL + '/blog/engineering',
        description: 'The technology behind Uber Engineering',
        item: result,
    };
}

function findNode(
    json: any,
    options: {
        idKey?: string;
        idValue: string;
        siblingKey: string;
        childKey: string;
    }
): any {
    const { idKey = 'id', idValue, siblingKey, childKey } = options;

    if (Array.isArray(json)) {
        for (const item of json) {
            const result = findNode(item, options);
            if (result !== undefined) {
                return result;
            }
        }
    } else if (json && typeof json === 'object') {
        if (json[idKey] === idValue) {
            return json[siblingKey]?.[childKey];
        }

        for (const key in json) {
            const result = findNode(json[key], options);
            if (result !== undefined) {
                return result;
            }
        }
    }

    return undefined;
}
