// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { renderDescription } = require('./utils');
import { config } from '@/config';

export default async (ctx) => {
    const contentMap = {
        TopArtists: {
            contentKey: 'artists',
            viewKey: 'artistViews',
            title: 'Top artists',
        },
        TopSongs: {
            contentKey: 'trackTypes',
            viewKey: 'trackViews',
            title: 'Top songs',
        },
        TopVideos: {
            contentKey: 'videos',
            viewKey: 'videoViews',
            title: 'Top music videos',
        },
        TrendingVideos: {
            contentKey: 'videos',
            viewKey: 'videoViews',
            title: 'Trending',
        },
    };

    const { category = 'TopVideos', country } = ctx.req.param();
    const embed = !ctx.req.param('embed');

    const { content } = await cache.tryGet(
        `youtube:charts:${country ?? 'global'}`,
        async () => {
            const { data } = await got.post('https://charts.youtube.com/youtubei/v1/browse', {
                searchParams: {
                    alt: 'json',
                    key: 'AIzaSyCzEW7JUJdSql0-2V4tHUb6laYm4iAE_dM',
                },
                json: {
                    browseId: 'FEmusic_analytics_charts_home',
                    context: {
                        capabilities: {},
                        client: {
                            clientName: 'WEB_MUSIC_ANALYTICS',
                            clientVersion: '0.2',
                            experimentIds: [],
                            experimentsToken: '',
                            gl: 'US',
                            hl: 'en',
                            theme: 'MUSIC',
                        },
                        request: {
                            internalExperimentFlags: [],
                        },
                    },
                    query: `chart_params_type=WEEK&perspective=CHART&flags=viral_video_chart&selected_chart=TRACKS&chart_params_id=weekly:0:0${country ? `:${country}` : ''}`,
                },
            });
            return data.contents.sectionListRenderer.contents[0].musicAnalyticsSectionRenderer;
        },
        config.cache.routeExpire,
        false
    );

    const { entityId } = content.perspectiveMetadata;

    const items =
        category === 'TopArtists'
            ? content[contentMap[category].contentKey][0][contentMap[category].viewKey].map((item) => ({
                  title: item.name,
                  link: `https://charts.youtube.com/artist/${encodeURIComponent(item.id)}`,
                  guid: `youtube:charts:${category}:${entityId}:${item.id}`,
              }))
            : content[contentMap[category].contentKey][category === 'TrendingVideos' ? 1 : 0][contentMap[category].viewKey].map((item) => {
                  const videoId = category === 'TopSongs' ? item.encryptedVideoId : item.id;
                  const author = item.artists
                      .filter((a) => a.name)
                      .map((artist) => artist.name)
                      .join(', ');
                  return {
                      title: `${item.title ?? item.name} - ${author}`,
                      description: renderDescription(embed, videoId, item.thumbnail?.thumbnails.pop().url, ''),
                      link: `https://www.youtube.com/watch?v=${videoId}`,
                      guid: `youtube:charts:${category}:${entityId}:${item.id}`,
                      author,
                  };
              });

    ctx.set('data', {
        title: `YouTube Music Charts - ${contentMap[category].title}`,
        link: `https://charts.youtube.com/charts/${category}/${country ?? 'global'}`,
        item: items,
    });
};
