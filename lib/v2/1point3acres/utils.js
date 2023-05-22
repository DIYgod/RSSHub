const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const bbcode = require('bbcodejs');

const rootUrl = 'https://instant.1point3acres.com';
const apiRootUrl = 'https://api.1point3acres.com';

const types = {
    new: '最新帖子',
    hot: '热门帖子',
};

module.exports = {
    rootUrl,
    apiRootUrl,
    types,
    ProcessThreads: async (tryGet, apiUrl, order) => {
        const response = await got({
            method: 'get',
            url: apiUrl,
            headers: {
                referer: rootUrl,
            },
        });

        const bbcodeParser = new bbcode.Parser();

        const items = await Promise.all(
            response.data.threads.map((item) => {
                const result = {
                    guid: item.tid,
                    title: item.subject,
                    author: item.author,
                    link: `${rootUrl}/thread/${item.tid}`,
                    description: item.summary,
                    pubDate: parseDate((order === '' ? item.lastpost : item.dateline) * 1000),
                    category: [item.forum_name, ...item.tags.map((t) => t.displayname)],
                };

                return tryGet(result.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: `${apiRootUrl}/api/v3/threads/${result.guid}`,
                            headers: {
                                referer: rootUrl,
                            },
                        });

                        const data = detailResponse.data;

                        result.description = bbcodeParser.toHTML(data.thread.message_bbcode);

                        for (const a of data.thread.attachment_list) {
                            if (a.isimage === 1) {
                                result.description = result.description.replace(
                                    new RegExp(`\\[attach\\]${a.aid}\\[\\/attach\\]`, 'g'),
                                    art(path.join(__dirname, 'templates/image.art'), {
                                        url: a.url,
                                        height: a.height,
                                        width: a.width,
                                    })
                                );
                            }
                        }
                    } catch (e) {
                        // no-empty
                    }

                    return result;
                });
            })
        );

        return items;
    },
};
