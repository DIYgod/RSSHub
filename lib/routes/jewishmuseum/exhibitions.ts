// @ts-nocheck
import buildData from '@/utils/common-config';

export default async (ctx) => {
    const link = 'https://thejewishmuseum.org/exhibitions';

    ctx.set(
        'data',
        await buildData({
            link,
            url: link,
            title: 'Jewish Museums - Exhibitions',
            item: {
                item: '#current article.exhibition, #upcoming article, #past article.exhibition',
                title: `$('article.exhibition h3').text()`,
                link: `$('article.exhibition > a').attr('href')`,
            },
        })
    );
};
