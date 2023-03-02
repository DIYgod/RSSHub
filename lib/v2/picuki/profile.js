const got = require('@/utils/got');
const cheerio = require('cheerio');
const chrono = require('chrono-node');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const { puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await require('@/utils/puppeteer')();

    const id = ctx.params.id;
    const displayVideo = ctx.params.functionalFlag !== '0';
    const includeStories = ctx.params.functionalFlag === '10';

    const profileUrl = `https://www.picuki.com/profile/${id}`;

    const data = await ctx.cache.tryGet(
        profileUrl,
        async () => {
            const _r = await puppeteerGet(profileUrl, browser);
            return _r;
        },
        config.cache.routeExpire,
        false
    );
    const $ = cheerio.load(data);

    const profileName = $('.profile-name-bottom').text();
    const profileImg = $('.profile-avatar > img').attr('src');
    const profileDescription = $('.profile-description').text();

    const list = $('ul.box-photos [data-s="media"]').get();

    async function getMedia(url) {
        const getPost = async () => {
            const response = await puppeteerGet(url, browser);
            return response;
        };
        let data = await ctx.cache.tryGet(url, getPost);
        if (Object.prototype.toString.call(data) === '[object Object]') {
            // oops, it's a json, maybe it's an old cache from the old version of this route!
            data = await getPost();
            // re-cache it
            await ctx.cache.set(url, data);
        }
        const $ = cheerio.load(data);
        // Instagram 允许最多 10 条图片/视频任意混合于一条 post，picuki 在所有情况下都会将它（们）置于 .single-photo 内
        let html = '';
        $('.single-photo img').each((_, item) => {
            html += $(item).toString();
        });
        $('.single-photo video').each((_, item) => {
            item = $(item);
            let videoSrc = item.attr('src');
            if (videoSrc === undefined) {
                videoSrc = item.children().attr('src');
            }
            const videoPoster = item.attr('poster');
            html += art(path.join(__dirname, 'templates/video.art'), {
                videoSrc,
                videoPoster,
            });
        });
        return html;
    }

    function deVideo(media) {
        const $ = cheerio.load(media);
        let media_deVideo = '';
        $('img,video').each((_, medium) => {
            const tag = medium.name;
            medium = $(medium);
            const poster = medium.attr('poster');
            // 如果有 poster 属性，表明它是视频，将它替换为它的 poster；如果不是，就原样返回
            media_deVideo += poster ? `<img src='${poster}' alt='video poster'>` : tag === 'img' ? medium.toString() : '';
        });
        return media_deVideo;
    }

    let items = await Promise.all(
        list.map(async (post) => {
            post = $(post);

            const postLink = post.find('.photo > a').attr('href');
            const postTime = post.find('.time');
            const pubDate = postTime ? chrono.parseDate(postTime.text()) : new Date();
            const media_displayVideo = await getMedia(postLink);
            const postText = post
                .find('.photo-description')
                .text()
                .trim()
                .replace(/[^\S\n]+/g, ' ')
                .replace(/((?<=\n|^)[^\S\n])|([^\S\n](?=\n|$))/g, '');
            const title = postText.replace(/\n/g, ' ') || 'Untitled';
            const description = art(path.join(__dirname, 'templates/post.art'), {
                media: displayVideo ? media_displayVideo : deVideo(media_displayVideo),
                desc: postText,
                locationLink: post.find('.photo-location .icon-globe-alt a'),
            });

            return {
                title,
                author: `@${id}`,
                description,
                link: postLink,
                pubDate,
            };
        })
    );

    const getStories = async (queryId) => {
        const apiUrl = `https://www.picuki.com/app/controllers/ajax.php`;
        const key = `${apiUrl}?query=${queryId}&type=story`;
        const data = await ctx.cache.tryGet(key, async () => {
            const response = await got.post(apiUrl, {
                form: {
                    query: queryId,
                    type: 'story',
                },
                headers: {
                    Referer: profileUrl,
                    Origin: 'https://www.picuki.com',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            return response.data;
        });
        if (data && data.stories_container) {
            const $ = cheerio.load(data.stories_container);
            const storyItems = $('.item')
                .get()
                .map((item) => {
                    const $item = $(item);
                    const postTime = $item.find('.stories_count');
                    const pubDate = postTime.length ? chrono.parseDate(postTime.text()) : new Date();
                    const postBox = $item.find('.launchLightbox');
                    const poster = postBox.attr('data-video-poster');
                    const href = postBox.attr('href');
                    const type = postBox.attr('data-post-type'); // video / image
                    const storiesBackground = $item.find('.stories_background');
                    const storiesBackgroundUrl = storiesBackground && storiesBackground.css('background-image').match(/url\('?(.*)'?\)/);
                    const storiesBackgroundUrlSrc = storiesBackgroundUrl && storiesBackgroundUrl[1];
                    let description;
                    if (type === 'video') {
                        description = `<video controls src="${href}" poster="${poster || storiesBackgroundUrlSrc || ''}">`;
                    } else if (type === 'image') {
                        description = `<img src="${href || poster || storiesBackgroundUrlSrc || ''}" alt="Instagram Story">`;
                    }

                    return {
                        title: 'Instagram Story',
                        author: `@${id}`,
                        description,
                        link: href,
                        pubDate,
                    };
                });
            if (storyItems.length) {
                items = items.concat(storyItems);
            }
        }
    };

    if (includeStories) {
        let profileQueryId;
        $('script:not([src])').each((_, script) => {
            const queryMatch = $(script)
                .html()
                .match(/let query ?= ?['"](\d+)['"]/);
            if (queryMatch) {
                profileQueryId = queryMatch[1];
            }
        });
        if (profileQueryId) {
            await getStories(profileQueryId);
        }
    }

    await browser.close();

    ctx.state.data = {
        title: `${profileName} (@${id}) - Picuki`,
        link: profileUrl,
        image: profileImg,
        description: profileDescription,
        item: items,
    };
};
