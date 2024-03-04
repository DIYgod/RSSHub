// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import { load } from 'cheerio';

export default async (ctx) => {
    const params = ctx.req.param();
    const modelId = Number.parseInt(params.modelId);

    const { data } = await got(
        `https://civitai.com/api/trpc/review.getAll,comment.getAll?batch=1&input=${encodeURIComponent(
            `{"0":{"json":{"modelId":${modelId},"limit":12,"sort":"newest","cursor":null},"meta":{"values":{"cursor":["undefined"]}}},"1":{"json":{"modelId":${modelId},"limit":12,"sort":"newest","cursor":null},"meta":{"values":{"cursor":["undefined"]}}}}`
        )}`,
        {
            headers: {
                Referer: `https://civitai.com/${modelId}`,
                cookie: config.civitai.cookie,
            },
        }
    );

    const items = [...data[0].result.data.json.reviews, ...data[1].result.data.json.comments]
        .map((item) =>
            item.images?.length || item.content
                ? {
                      title: item.content ? load(item.content).text() : 'Image',
                      link: `https://civitai.com/models/${params.modelId}`,
                      description: `${(item.images || []).map((image) => `<image src="https://imagecache.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=${image.width}/${image.id}">`).join('\n')}${item.content}`,
                      pubDate: parseDate(item.createdAt),
                      author: item.user?.username,
                      guid: item.id,
                  }
                : null
        )
        .filter(Boolean);

    ctx.set('data', {
        title: `Civitai model ${params.modelId} discussions`,
        link: `https://civitai.com/`,
        item: items,
    });
};
