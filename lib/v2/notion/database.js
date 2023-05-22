const { Client, isNotionClientError, APIErrorCode } = require('@notionhq/client');
const logger = require('@/utils/logger');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { NotionToMarkdown } = require('notion-to-md');
const cheerio = require('cheerio');
const md = require('markdown-it')({
    html: true,
    linkify: true,
});

module.exports = async (ctx) => {
    if (!config.notion.key) {
        throw 'Notion RSS is disabled due to the lack of NOTION_TOKEN(<a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>)';
    }

    const databaseId = ctx.params.databaseId;
    const notion_api_key = config.notion.key;

    const notion = new Client({
        auth: notion_api_key,
    });

    try {
        // Query database basic info
        const database = await notion.databases.retrieve({ database_id: databaseId });
        const title = database.title[0]?.plain_text;
        const description = database.description[0]?.plain_text;
        const link = database.url;
        const image = database.cover?.external.url ?? database.icon?.emoji;

        // List pages under the database
        const databaseQuery = parseCustomQuery(ctx.query.query);
        const { results } = await notion.databases.query({
            database_id: databaseId,
            ...databaseQuery,
        });
        const customProperties = parseCustomQuery(ctx.query.properties) ?? {};
        const properties = {
            author: customProperties.author ?? 'Author',
            link: customProperties.link ?? 'URL',
            pubTime: customProperties.pubTime ?? 'Created time',
        };

        // Query page content
        const n2m = new NotionToMarkdown({ notionClient: notion });
        const pageList = results.filter((item) => Object.values(item.properties).find((property) => property.id === 'title')?.title[0]?.plain_text);
        const items = await Promise.all(
            pageList.map(async (page) => {
                const titleProperty = Object.values(page.properties).find((property) => property.id === 'title');
                const pageTitle = titleProperty.title[0].plain_text;
                const pageLink = page.url;
                const pageLastEditedTime = page.last_edited_time;
                // If link property is empty, try to get url with linked title
                const articleLink = (properties.link && notionText(page.properties[properties.link])) || titleProperty.title[0].href || '';
                const pageAuthor = notionText(page.properties[properties.author]);
                const pagePubTime = notionText(page.properties[properties.pubTime]);

                // Convert Notion page blocks to markdown string
                const articleContent = await ctx.cache.tryGet(`${pageLink}-${pageLastEditedTime}`, async () => {
                    const mdblocks = await n2m.pageToMarkdown(page.id);
                    const mdString = n2m.toMarkdownString(mdblocks);
                    return mdString.parent;
                });

                let author = pageAuthor;
                let pubTime = pagePubTime || pageLastEditedTime;
                // Try to get author info
                if (articleLink && !pageAuthor) {
                    const { articleAuthor, articlePubTime } = await ctx.cache.tryGet(`${pageLink}-${articleLink}`, async () => {
                        try {
                            const response = await got({
                                method: 'get',
                                url: articleLink,
                            });
                            const $ = cheerio.load(response.body);
                            const articleAuthor = $('meta[name="author"]').attr('content');
                            const articlePubTime = $('meta[name="publish_date"], meta[name="date"]').attr('content');
                            return {
                                articleAuthor,
                                articlePubTime,
                            };
                        } catch {
                            return {};
                        }
                    });

                    if (articleAuthor) {
                        author = articleAuthor;
                    }

                    if (articlePubTime) {
                        pubTime = articlePubTime;
                    }
                }

                return {
                    title: pageTitle,
                    author,
                    pubDate: parseDate(pubTime),
                    description: md.render(articleContent ?? ''),
                    link: articleLink || pageLink,
                };
            })
        );

        ctx.state.data = {
            title: `Notion - ${title}`,
            link,
            description,
            image,
            item: items,
            allowEmpty: true,
        };
    } catch (error) {
        logger.error(error);

        if (isNotionClientError(error)) {
            if (error.statusCode === APIErrorCode.ObjectNotFound) {
                ctx.throw(404, 'The database is not exist');
            } else if (error.statusCode === APIErrorCode.Unauthorized) {
                ctx.throw(401, 'Please check the config of NOTION_TOKEN');
            } else {
                ctx.throw(error.statusCode, 'Notion API Error');
            }
        } else {
            ctx.throw(error);
        }
    }
};

function parseCustomQuery(queryString) {
    try {
        if (queryString) {
            return JSON.parse(decodeURIComponent(queryString));
        }
    } catch {
        logger.error('Query Parse Error');
    }
}

function notionText(property) {
    if (!property) {
        return '';
    }

    if (property.type === 'rich_text') {
        return property.rich_text?.map((text) => text.plain_text).join('') ?? '';
    }

    if (property.type === 'select') {
        return property.select.name;
    }

    if (property.type === 'url') {
        return property.url;
    }

    return '';
}
