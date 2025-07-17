import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { ofetch } from 'ofetch';

const getHlcg = async (category) => {
    const baseUrl = 'https://18hlw.com';
    const link = `${baseUrl}/${category}/`;

    const response = await ofetch(link);
    const $ = load(response);
    const list = $('div.video-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text().trim(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        })
        .filter((item) => item.link.includes('archives') && item.title !== '热');
    const results = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                logger.http(`Requesting ${item.link}`);
                const response = await ofetch(item.link);
                const $ = load(response);
                const publishedTime = $('meta[property="article:published_time"]').attr('content');
                const content = $('.client-only-placeholder').first();
                const videos = content.find('video');
                content.find('blockquote').remove();
                content.find('div').remove();
                content.find('img').each((_, img) => {
                    const imgElement = $(img);
                    const src = imgElement.attr('onload').match(/loadImg\(this,'(.*?)'\)/)[1];
                    imgElement.attr('alt', src);
                    imgElement.removeAttr('onload');
                });
                let description = content.html();

                for (const video of videos.toArray()) {
                    const videoElement = $(video);
                    const m3u8Url = videoElement.attr('poster');
                    if (m3u8Url) {
                        // console.log(`Found m3u8 URL: ${m3u8Url}`);
                        const videoStr = renderDPlayer(m3u8Url);
                        // console.log(`Rendering DPlayer for m3u8 URL: ${videoStr}`);
                        // replace the video element with a DPlayer player
                        description += videoStr;
                    }
                }
                item.description = description;
                item.pubDate = parseDate(publishedTime);
                return item;
            })
        )
    );

    return {
        title: '最新黑料',
        link,
        item: results,
    };
};
function renderDPlayer(m3u8Url) {
    return `
    <iframe title="视频播放器" width="800" height="450"
    src="https://video-player-vert-two.vercel.app/player.html?url=${m3u8Url}"></iframe>
  <script>
    `;
}
export default getHlcg;
