import fetch from 'node-fetch';
import RSS from 'rss';

async function fetchPodcastData() {
    const res = await fetch('https://www.xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6');
    const html = await res.text();
    // 提取每期节目内容
    const episodeBlocks = html.match(/<ul class="jsx-[^"]* tab">([\s\S]*?)<\/ul>/);
    let episodes = [];
    if (episodeBlocks && episodeBlocks[1]) {
        // 匹配每期<a class="jsx-... card" ...>...</a>
        const aRegex = /<a class="jsx-[^"]* card" href="([^"]+)">([\s\S]*?)<\/a>/g;
        let aMatch;
        while ((aMatch = aRegex.exec(episodeBlocks[1])) !== null) {
            const url = 'https://www.xiaoyuzhoufm.com' + aMatch[1];
            const aContent = aMatch[2];
            // 封面图
            const imgMatch = aContent.match(/<img [^>]*src="([^"]+)"[^>]*alt="([^"]*)"/);
            // 标题
            const titleMatch = aContent.match(/<div class="[^"]* title">([\s\S]*?)<\/div>/);
            // 简介
            const descMatch = aContent.match(/<div class="[^"]* description">[\s\S]*?<p [^>]*>([\s\S]*?)<\/p>/);
            // 时长
            const durationMatch = aContent.match(/(\d+分钟)/);
            // 发布时间（datetime属性）
            const timeMatch = aContent.match(/<time [^>]*datetime="([^"]+)"[^>]*>([\s\S]*?)<\/time>/);
            // 播放数
            const playCountMatch = aContent.match(/<img [^>]*playback[^>]*>\s*(\d+)/);
            // 评论数
            const commentCountMatch = aContent.match(/<img [^>]*comments[^>]*>\s*(\d+)/);
            episodes.push({
                title: titleMatch ? titleMatch[1].trim() : (imgMatch ? imgMatch[2].trim() : ''),
                description: descMatch ? descMatch[1].replace(/<br\s*\/?>/g, '\n').trim() : '',
                duration: durationMatch ? durationMatch[1] : '',
                pubDate: timeMatch ? timeMatch[1] : '',
                url,
                cover: imgMatch ? imgMatch[1] : '',
                playCount: playCountMatch ? playCountMatch[1] : '',
                commentCount: commentCountMatch ? commentCountMatch[1] : ''
            });
        }
    }
    const titleMatch = html.match(/已订阅 ([^!<]+)/);
    const hostMatch = html.match(/momoko是一一、被占名字的咚咚/);
    const descMatch = html.match(/一档体型、性格、职业大反差的情侣觉察生活、分享共鸣的节目。([^<]+)/);
    return {
        title: titleMatch ? titleMatch[1].trim() : '半天空档',
        host: hostMatch ? 'momoko是一一、被占名字的咚咚' : '',
        description: descMatch ? descMatch[0].trim() : '',
        episodes
    };
}

async function main() {
    const data = await fetchPodcastData();
    const feed = new RSS({
        title: data.title,
        description: data.description,
        feed_url: 'https://www.xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6',
        site_url: 'https://www.xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6',
    });
    data.episodes.forEach(ep => {
        feed.item({
            title: ep.title,
            description: ep.description,
            url: ep.url,
            author: data.host,
            date: ep.pubDate ? new Date(ep.pubDate).toUTCString() : '',
            custom_elements: [
                { duration: ep.duration },
                { cover: ep.cover },
                { playCount: ep.playCount },
                { commentCount: ep.commentCount }
            ]
        });
    });
    console.log(feed.xml({ indent: true }));
}

main();

// 导出 fetchPodcastData 以便 route handler 调用
export default fetchPodcastData;
