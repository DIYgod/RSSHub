import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
const baseUrl = 'https://meteor.today';

const getBoards = (tryGet) =>
    tryGet('meteor:boards', async () => {
        const { data: response } = await got.post(`${baseUrl}/board/get_boards`, {
            json: {
                isCollege: 'false',
            },
        });

        return JSON.parse(decodeURIComponent(response.result)).map((item) => ({
            title: `${item.category ? `${item.category} - ` : ''}${item.name}`,
            description: item.id,
            feedDescription: item.description,
            category: item.articleCategory,
            link: `${baseUrl}/board/${item.alias ?? item.name}`,
            alias: item.alias,
            imgUrl: item.imageUrl,
            id: item.id,
        }));
    });

const renderDesc = (desc) => {
    const youTube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-]+)&?/g;
    const matchYouTube = desc.match(youTube);
    const matchImgur = desc.match(/https:\/\/i.imgur.com\/\w*.(jpg|png|gif|jpeg)/g);
    const matchVideo = desc.match(/(https:\/\/storage\.meteor\.today\/video\/[\da-f]{24}\.)(mp4|mov|avi|flv|wmv|mpeg|mkv)/gi);
    const matchSticker = desc.match(/assets\/images\/stickers\/(duck|ep2|ep1)\/\w*.(jpg|png|gif|jpeg)/g);
    const matchEmoji = desc.match(/assets\/images\/emoji\/\w*.(jpg|png|gif|jpeg)/g);

    if (matchYouTube) {
        desc = desc.replaceAll(
            youTube,
            art(path.join(__dirname, 'templates/desc.art'), {
                youTube: '$1',
            })
        );
    }
    if (matchImgur) {
        for (const img of matchImgur) {
            desc = desc.replace(
                img,
                art(path.join(__dirname, 'templates/desc.art'), {
                    img,
                })
            );
        }
    }
    if (matchVideo) {
        for (const video of matchVideo) {
            desc = desc.replace(
                video,
                art(path.join(__dirname, 'templates/desc.art'), {
                    video,
                })
            );
        }
    }
    if (matchSticker) {
        for (const sticker of matchSticker) {
            desc = desc.replace(
                sticker,
                art(path.join(__dirname, 'templates/desc.art'), {
                    img: sticker,
                })
            );
        }
    }
    if (matchEmoji) {
        for (const emoji of matchEmoji) {
            desc = desc.replace(
                emoji,
                art(path.join(__dirname, 'templates/desc.art'), {
                    img: emoji,
                })
            );
        }
    }

    return desc.replaceAll('\n', '<br>');
};

export { baseUrl, getBoards, renderDesc };
