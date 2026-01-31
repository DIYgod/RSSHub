import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const apiBaseUrl = 'https://apiv1.oschina.net';
export const baseUrl = 'https://www.oschina.net';
export const blogBaseUrl = 'https://my.oschina.net';

export const getBlog = (detailId: number) =>
    ofetch(`${apiBaseUrl}/oschinapi/blog/detail`, {
        query: {
            id: detailId,
        },
    });

export const getBlogListCategory = () =>
    cache.tryGet('oschina:blogListByCategory', async () => {
        const response = await ofetch(`${baseUrl}/ApiHomeNew/blogListByCategory`);
        const data = [
            ...response.result.map((item) => {
                const description = JSON.parse(item.catalog_params).description;
                return {
                    id: item.id,
                    name: item.name,
                    description,
                    logo: item.logo_url,
                    apiPath: '/homeListByBlogTime',
                };
            }),
            {
                id: 0,
                name: '全部',
                apiPath: '/homeListByCategoryTime',
            },
            {
                id: 9998,
                name: '开源资讯',
                apiPath: '/homeListByNewType',
            },
            {
                id: 9999,
                name: '软件资讯',
                apiPath: '/homeListByNewType',
            },
        ];
        return data;
    });

export const getNews = (detailId: number) =>
    ofetch(`${apiBaseUrl}/oschinapi/new/detail`, {
        query: {
            id: detailId,
        },
    });
