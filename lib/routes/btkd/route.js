module.exports = async (ctx) => {
    const fetchPodcastData = require('./btkd').default;
    const data = await fetchPodcastData();
    ctx.state.data = {
        title: data.title,
        link: 'https://www.xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6',
        description: data.description,
        item: data.episodes.map(ep => ({
            title: ep.title,
            description: ep.description,
            link: ep.url,
            author: data.host,
            pubDate: ep.pubDate,
            enclosure_url: ep.cover,
            enclosure_type: 'image/jpeg',
            itunes_duration: ep.duration,
            custom_elements: [
                { playCount: ep.playCount },
                { commentCount: ep.commentCount }
            ]
        }))
    };
};
