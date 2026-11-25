import { escapeAttribute } from 'entities';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import type { Post, PostCategory, SearchPost } from './types';

export async function getPostItems(params: {
    feed?: string;
    search?: string;
    swimlane?: string;
    tab?: string;
    time_range?: string;
    category?: string;
    order?: string;
    author?: string;
    limit?: number;
    offset?: number;
}): Promise<DataItem[]> {
    const baseUrl = 'https://api.voronoiapp.com';
    const categories = await cache.tryGet('voronoiapp:categories', () => ofetch<PostCategory[]>(`${baseUrl}/post-category`));
    if (params.search !== undefined) {
        return getSearchItems(params.search, categories, params.limit ?? 20);
    }
    const url = new URL(`${baseUrl}/post`);
    const finalSearchParams = {
        limit: 20,
        offset: 0,
        ...params,
    };
    if (finalSearchParams.time_range !== undefined) {
        finalSearchParams.time_range = finalSearchParams.time_range.toUpperCase();
        if (TimeRangeParam.options.every((option) => option.value !== finalSearchParams.time_range)) {
            throw new Error(`Invalid time range: ${finalSearchParams.time_range}`);
        }
        // The Voronoi API doesn't support "ALL"
        if (finalSearchParams.time_range === 'ALL') {
            finalSearchParams.time_range = undefined;
        }
    }
    let categoryId: number | undefined;
    if (finalSearchParams.category) {
        const category = categories.find((entry) => entry.title.toLowerCase() === finalSearchParams.category!.toLowerCase());
        if (!category) {
            throw new Error(`Invalid category: ${finalSearchParams.category}`);
        }
        categoryId = category.id;
    }
    delete finalSearchParams.category;
    if (categoryId !== undefined) {
        url.searchParams.set('categoryIds', String(categoryId));
    }
    if (finalSearchParams.tab !== undefined && finalSearchParams.tab !== null) {
        finalSearchParams.tab = finalSearchParams.tab.toUpperCase();
        if (!Object.values(TabMap).includes(finalSearchParams.tab)) {
            throw new Error(`Invalid tab: ${finalSearchParams.tab}`);
        }
    }
    for (const key in finalSearchParams) {
        if (finalSearchParams[key] !== undefined && finalSearchParams[key] !== null) {
            url.searchParams.set(key, finalSearchParams[key]);
        }
    }
    const data = await ofetch<Post[]>(url.href);
    const items: DataItem[] = data.map((post) => {
        const category = categories.find((entry) => entry.id === post.categoryId);
        if (!category) {
            throw new Error(`No public category found for Voronoi post ${post.pid}`);
        }
        return {
            title: post.headline,
            link: `https://www.voronoiapp.com/${category.slug}/${post.link}`,
            pubDate: parseDate(post.published_at),
            description: post.webp_images.map((image) => `<img src="${escapeAttribute(cdnUrl + image)}" />`).join('\n') + '\n' + post.description,
            image: cdnUrl + post.webp_images[0],
            author: post.author.first_name + ' ' + post.author.last_name,
            updated: parseDate(post.updated_at),
            category: [category.title, ...post.tags],
            enclosure_url: `https://cdn.voronoiapp.com/public/${post.dataset}`,
            enclosure_type: 'text/csv',
            enclosure_title: post.dataset,
            upvotes: post.likes,
            comments: post.commented,
        };
    });
    return items;
}
const cdnUrl = 'https://cdn.voronoiapp.com/public/';
async function getSearchItems(keyword: string, categories: PostCategory[], limit: number): Promise<DataItem[]> {
    const posts = await ofetch<SearchPost[]>('https://api.voronoiapp.com/search', {
        query: { size: limit, page: 0, target: 'posts-data', q: keyword },
    });
    return pMap(posts, (post) => getSearchItem(post, categories), { concurrency: 3, stopOnError: false });
}
async function getSearchItem(post: SearchPost, categories: PostCategory[]): Promise<DataItem> {
    const category = categories.find((entry) => entry.id === post.category_id);
    if (!category) {
        throw new Error(`No public category found for Voronoi post ${post.pid}`);
    }
    const link = `https://www.voronoiapp.com/${category.slug}/${post.link}`;
    const detail = await cache.tryGet(`voronoiapp:post:${post.pid}`, () => ofetch<Post>('https://api.voronoiapp.com/post', { query: { pid: post.pid } }));
    return {
        title: post.headline,
        link,
        pubDate: parseDate(detail.published_at),
        updated: parseDate(detail.updated_at),
        description: `${detail.images.map((image) => `<img src="${escapeAttribute(cdnUrl + image)}" />`).join('\n')}\n${post.description}`,
        image: cdnUrl + detail.images[0],
        author: post.author.first_name + ' ' + post.author.last_name,
        category: [category.title, ...detail.tags],
        enclosure_url: detail.dataset ? cdnUrl + detail.dataset : undefined,
        enclosure_type: detail.dataset ? 'text/csv' : undefined,
        enclosure_title: detail.dataset,
        upvotes: detail.likes,
        comments: detail.commented,
    };
}
export const CategoryParam = {
    description: 'The category of the post',
    default: '',
    options: [
        {
            value: '',
            label: 'All categories',
        },
        {
            value: 'Automotive',
            label: 'Automotive Data Insights - Explore a range of automotive data visualizations showcasing trends, innovations, and market dynamics in the automotive industry.',
        },
        {
            value: 'Business',
            label: 'Business Visualization Trends - Discover business visualizations covering market analysis, corporate strategies, and economic impacts across global industries.',
        },
        {
            value: 'Climate',
            label: 'Climate Data Visualized - Delve into climate change data visualizations that detail weather patterns, environmental impacts, and sustainability efforts worldwide.',
        },
        {
            value: 'Demographics',
            label: 'Demographic Visual Insights - Explore visual demographics data showcasing population trends, societal changes, and demographic analytics across regions.',
        },
        {
            value: 'Economy',
            label: 'Economic Visualization Insights - View economic visualizations illustrating financial markets, economic policies, and global economic health.',
        },
        {
            value: 'Energy',
            label: 'Energy Industry Visual Data - Discover the dynamics of global energy consumption, renewable sources, and energy market trends through vivid visualizations.',
        },
        {
            value: 'Entertainment',
            label: 'Entertainment Industry Data - Explore data visualizations in the entertainment industry, covering everything from box office trends to streaming service analytics.',
        },
        {
            value: 'Geopolitics',
            label: 'Geopolitical Data Visualized - Understand global geopolitical shifts and international relations through comprehensive geopolitical data visualizations.',
        },
        {
            value: 'Healthcare',
            label: 'Healthcare Insights Visualized - Analyze healthcare data visualizations spanning disease trends, healthcare services, and public health policies.',
        },
        {
            value: 'Innovation',
            label: 'Innovation in Data - Dive into innovation data visualizations highlighting technology advancements, R&D investments, and patent trends.',
        },
        {
            value: 'Maps',
            label: 'Cartographic Visual Insights - Discover cartographic visualizations that map everything from socio-economic data to geographical phenomena.',
        },
        {
            value: 'Markets',
            label: 'Market Trends Visualized - Visualize market trends, financial data, and economic forecasts through comprehensive market visualizations.',
        },
        {
            value: 'Money',
            label: 'Financial Data Visualized - Dive into financial visualizations depicting currency trends, investment flows, and banking statistics.',
        },
        {
            value: 'Natural Resources',
            label: 'Natural Resources Data - Explore visualizations of natural resources, detailing extraction, consumption, and conservation data.',
        },
        {
            value: 'Politics',
            label: 'Political Visual Insights - Analyze political trends, election results, and legislative impacts through detailed political visualizations.',
        },
        {
            value: 'Public Opinion',
            label: 'Public Opinion Trends - Discover visualizations of public opinion polls, social trends, and cultural shifts across different regions.',
        },
        {
            value: 'Real Estate',
            label: 'Real Estate Market Insights - Explore real estate market trends, property values, and urban development through targeted data visualizations.',
        },
        {
            value: 'Sports',
            label: 'Sports Data Insights - Analyze sports data visualizations that showcase performance statistics, team rankings, and sports economics.',
        },
        {
            value: 'Technology',
            label: 'Technology Trends Visualized - Dive into technology visualizations highlighting industry trends, tech adoption rates, and innovation impacts.',
        },
        {
            value: 'Wealth',
            label: 'Wealth Distribution Insights - Explore wealth distribution, financial health, and economic disparities through detailed visualizations.',
        },
        {
            value: 'Travel',
            label: 'Travel Trends Visualized - Discover travel trends, tourism statistics, and destination analytics through engaging visualizations.',
        },
        {
            value: 'Nature',
            label: 'Nature and Conservation Data - Delve into visualizations of ecological data, wildlife statistics, and conservation efforts around the globe.',
        },
        {
            value: 'Space',
            label: 'Space Exploration Data - Explore the universe with space data visualizations covering planetary science, space missions, and astronomical discoveries.',
        },
        {
            value: 'Diagram',
            label: 'Diagrammatic Data Insights - Understand complex data through diagrams that simplify information across various topics and industries.',
        },
        {
            value: 'Other',
            label: "Diverse Data Visualizations - Explore a variety of data visualizations that don't neatly fit into any single category but offer unique insights.",
        },
    ],
};
export const TimeRangeParam = {
    description: 'Time range between which the posts are popular.',
    default: 'MONTH',
    options: [
        {
            value: 'WEEK',
            label: 'Last 7 days',
        },
        {
            value: 'MONTH',
            label: 'Last 30 days',
        },
        {
            value: 'YEAR',
            label: 'Last 12 months',
        },
        {
            value: 'ALL',
            label: 'All time',
        },
    ],
};
export const TabMap = {
    'most-popular': 'POPULAR',
    'most-discussed': 'DISCUSSED',
    'most-viewed': 'VIEWED',
};
export const TabParam = {
    description: 'The tab to get the popular posts from.',
    default: 'most-popular',
    options: [
        {
            value: 'most-popular',
            label: 'Most Liked',
        },
        {
            value: 'most-discussed',
            label: 'Most Discussed',
        },
        {
            value: 'most-viewed',
            label: 'Most Viewed',
        },
    ],
};
export const CommonRouteProperties: Pick<Route, 'url' | 'categories' | 'maintainers' | 'view'> = {
    url: 'voronoiapp.com',
    categories: ['picture'],
    view: ViewType.Pictures,
    maintainers: ['Cesaryuan'],
};
export const CommonDataProperties:
    | Pick<Data, 'image'>
    | {
          logo: string;
          icon: string;
      } = {
    logo: 'https://about.voronoiapp.com/wp-content/uploads/2023/07/voronoi-icon.png',
    image: 'https://about.voronoiapp.com/wp-content/uploads/2023/07/voronoi-icon.png',
    icon: 'https://about.voronoiapp.com/wp-content/uploads/2023/07/voronoi-icon.png',
};
