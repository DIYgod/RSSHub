// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const dayjs = require('dayjs');

const domain = 'readhub.cn';
const rootUrl = `https://${domain}`;
const apiRootUrl = `https://api.${domain}`;
const apiTopicUrl = new URL('topic/list', apiRootUrl).href;

const formatDate = (date, format) => dayjs(date).format(format);
const toTopicUrl = (id) => new URL(`topic/${id}`, rootUrl).href;

art.defaults.imports = {
    ...art.defaults.imports,

    formatDate,
    toTopicUrl,
};

/**
 * Process items asynchronously.
 *
 * @param {Array<Object>} items - The array of items to process.
 * @param {function} tryGet - The tryGet function that handles the retrieval process.
 * @returns {Promise<Array<Object>>} Returns a Promise that resolves to an array of processed items.
 */
const processItems = async (items, tryGet) =>
    await Promise.all(
        items.map((item) =>
            tryGet(item.link, async () => {
                try {
                    if (!item.link.startsWith(rootUrl)) {
                        throw new Error(`"${item.link}" is an external URL`);
                    }

                    const { data: detailResponse } = await got(item.link);

                    const data = JSON.parse(detailResponse.match(/{\\"topic\\":(.*?)}]\\n"]\)<\/script>/)[1].replaceAll('\\"', '"'));

                    item.title = data.title;
                    item.link = data.url ?? new URL(`topic/${data.uid}`, rootUrl).href;
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        description: data.summary,
                        news: data.newsAggList,
                        timeline: data.timeline,
                    });
                    item.author = data.siteNameDisplay;
                    item.category = [...(data.entityList.map((c) => c.name) ?? []), ...(data.tagList.map((c) => c.name) ?? [])];
                    item.guid = `readhub-${data.uid}`;
                    item.pubDate = parseDate(data.publishDate.replaceAll(/\s/g, ''));
                } catch {
                    item.guid = `readhub-${item.guid}`;
                }

                return item;
            })
        )
    );

module.exports = {
    rootUrl,
    apiRootUrl,
    apiTopicUrl,
    art,
    processItems,
};
