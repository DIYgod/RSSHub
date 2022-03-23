const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const work_url = `https://kakuyomu.jp/works/${id}`;
    const $ = cheerio.load(await get(work_url));

    const work_title = $('#workTitle').text();
    const introduction = $('#introduction').text();

    const episode_list = $('a.widget-toc-episode-episodeTitle')
        .slice(-5)
        .map((_, episode) => {
            const $_episode = $(episode);
            return {
                title: $_episode.find('span').text(),
                link: $_episode.attr('href'),
            };
        })
        .toArray()
        .reverse();

    const item_list = await Promise.all(
        episode_list.map((episode) =>
            ctx.cache.tryGet(episode.link, async () => {
                episode.link = `https://kakuyomu.jp${episode.link}`;
                const content = cheerio.load(await get(episode.link));
                episode.description = content('.widget-episodeBody').html();
                return episode;
            })
        )
    );

    ctx.state.data = {
        title: work_title,
        link: work_url,
        description: introduction,
        language: 'ja',
        item: item_list,
    };
};

const get = async (url) => {
    const response = await got({
        method: 'get',
        url,
    });

    return response.data;
};
