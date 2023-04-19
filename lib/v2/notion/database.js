const { Client, isNotionClientError, APIErrorCode } = require('@notionhq/client');
const logger = require('@/utils/logger');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const databaseId = ctx.params.databaseId;
    const notion_api_key = config.notion.key;

    const notion = new Client({
        auth: notion_api_key,
    });

    try {
        const database = await notion.databases.retrieve({ database_id: databaseId });
        const title = database.title[0]?.plain_text;
        const description = database.description[0]?.plain_text;
        const link = database.url;
        const image = database.cover?.external.url ?? database.icon?.emoji;
        const databaseQuery = parseCustomQuery(ctx.query.query);
        const { results } = await notion.databases.query({
            database_id: databaseId,
            ...databaseQuery,
        });
        const customProperties = parseCustomQuery(ctx.query.properties) ?? {};
        const properties = {
            description: customProperties.description ?? 'Description',
            author: customProperties.author ?? 'Author',
            link: customProperties.link,
        };
        const items = results
            .filter((item) => Object.values(item.properties).find((property) => property.id === 'title')?.title[0]?.plain_text)
            .map((item) => {
                const titleProperty = Object.values(item.properties).find((property) => property.id === 'title');
                return {
                    // 文章标题
                    title: titleProperty.title[0].plain_text,
                    // 文章链接
                    link: properties.link ? notionText(item.properties[properties.link]) : titleProperty.title[0].href,
                    // 文章正文
                    description: notionText(item.properties[properties.description]),
                    // 文章发布日期
                    pubDate: parseDate(item.last_edited_time),
                    // 如果有的话，文章作者
                    author: notionText(item.properties[properties.author]),
                };
            });
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
            ctx.throw(error.statusCode);
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
