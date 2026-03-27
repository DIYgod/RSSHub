import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { renderDescription } from './utils';

export const route: Route = {
    path: '/charts/:category?/:country?/:embed?',
    categories: ['social-media'],
    example: '/youtube/charts',
    parameters: { category: 'Chart, see table below, default to `TopVideos`', country: 'Country Code, see table below, default to global', embed: 'Default to embed the video, set to any value to disable embedding' },
    name: 'Music Charts',
    maintainers: ['TonyRL'],
    handler,
    description: `Chart

| Top artists | Top songs | Top music videos | Trending       |
| ----------- | --------- | ---------------- | -------------- |
| TopArtists  | TopSongs  | TopVideos        | TrendingVideos |

  Country Code

| Argentina | Australia | Austria | Belgium | Bolivia | Brazil | Canada |
| --------- | --------- | ------- | ------- | ------- | ------ | ------ |
| ar        | au        | at      | be      | bo      | br     | ca     |

| Chile | Colombia | Costa Rica | Czechia | Denmark | Dominican Republic | Ecuador |
| ----- | -------- | ---------- | ------- | ------- | ------------------ | ------- |
| cl    | co       | cr         | cz      | dk      | do                 | ec      |

| Egypt | El Salvador | Estonia | Finland | France | Germany | Guatemala |
| ----- | ----------- | ------- | ------- | ------ | ------- | --------- |
| eg    | sv          | ee      | fi      | fr     | de      | gt        |

| Honduras | Hungary | Iceland | India | Indonesia | Ireland | Israel | Italy |
| -------- | ------- | ------- | ----- | --------- | ------- | ------ | ----- |
| hn       | hu      | is      | in    | id        | ie      | il     | it    |

| Japan | Kenya | Luxembourg | Mexico | Netherlands | New Zealand | Nicaragua |
| ----- | ----- | ---------- | ------ | ----------- | ----------- | --------- |
| jp    | ke    | lu         | mx     | nl          | nz          | ni        |

| Nigeria | Norway | Panama | Paraguay | Peru | Poland | Portugal | Romania |
| ------- | ------ | ------ | -------- | ---- | ------ | -------- | ------- |
| ng      | no     | pa     | py       | pe   | pl     | pt       | ro      |

| Russia | Saudi Arabia | Serbia | South Africa | South Korea | Spain | Sweden | Switzerland |
| ------ | ------------ | ------ | ------------ | ----------- | ----- | ------ | ----------- |
| ru     | sa           | rs     | za           | kr          | es    | se     | ch          |

| Tanzania | Turkey | Uganda | Ukraine | United Arab Emirates | United Kingdom | United States |
| -------- | ------ | ------ | ------- | -------------------- | -------------- | ------------- |
| tz       | tr     | ug     | ua      | ae                   | gb             | us            |

| Uruguay | Zimbabwe |
| ------- | -------- |
| uy      | zw       |`,
};

async function handler(ctx) {
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
            const data = await ofetch('https://charts.youtube.com/youtubei/v1/browse', {
                method: 'POST',
                query: {
                    alt: 'json',
                    key: 'AIzaSyCzEW7JUJdSql0-2V4tHUb6laYm4iAE_dM',
                },
                body: {
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

    return {
        title: `YouTube Music Charts - ${contentMap[category].title}`,
        link: `https://charts.youtube.com/charts/${category}/${country ?? 'global'}`,
        item: items,
    };
}
