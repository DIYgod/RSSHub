const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const feature = ctx.params.feature || 0;
    const token = await ctx.cache.get('weibotimelineuid' + uid, false);

    if (token) {
        const response = await got.get(`https://api.weibo.com/2/statuses/home_timeline.json?access_token=${token}&count=100&feature=${feature}`);
        // 检查token失效
        if (response.data.error !== undefined) {
            const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0' } = config.weibo;

            ctx.status = 302;
            ctx.set({
                'Cache-Control': 'no-cache',
            });
            ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}`);
        }
        // 获取所有表情
        const weiboEmotion = await ctx.cache.tryGet('weiboEmotion', async () => {
            const tmpEmotionList = {};
            await Promise.all(
                ['face', 'ani', 'cartoon'].map(async (type) => {
                    try {
                        const rep = await got.get(`https://api.weibo.com/2/emotions.json?access_token=${token}&type=${type}`);
                        rep.data.forEach((item) => {
                            tmpEmotionList[item.phrase] = item.url;
                        });
                        return Promise.resolve(rep);
                    } catch (err) {
                        // pass
                    }
                })
            );
            return tmpEmotionList;
        });

        const data = await Promise.all(
            response.data.statuses.map(async (item) => {
                const realContent = await ctx.cache.tryGet('weibotimelineurl' + item.user.id + item.id, async () => {
                    const res = [];
                    const videoList = [];
                    let picUrlList = [];
                    picUrlList = picUrlList.concat(item.pic_urls);
                    try {
                        const rep = await got.get(`https://m.weibo.cn/${item.user.id}/${item.id}`);
                        rep.body.replace(/"text": "([\s\S]*?)",/g, (s, value) => {
                            res.push(value.replace(/\\"/g, "'"));
                        });
                        rep.body.replace(/"mp4_720p_mp4": "([\s\S]*?)",/, (s, value) => {
                            videoList.push(value);
                        });
                        if (res.length > 1) {
                            const sub_rep = await got.get(`https://m.weibo.cn/${item.retweeted_status.user.id}/${item.retweeted_status.id}`);
                            sub_rep.body.replace(/"text": "([\s\S]*?)",/g, (s, value) => {
                                res[1] = value.replace(/\\"/g, "'");
                            });
                            sub_rep.body.replace(/"mp4_720p_mp4": "([\s\S]*?)",/, (s, value) => {
                                videoList.push(value);
                            });
                            picUrlList = picUrlList.concat(item.retweeted_status.pic_urls);
                        }
                    } catch (err) {
                        res.push(item.text);
                        if (item.retweeted_status) {
                            res.push(item.retweeted_status.text);
                            picUrlList = picUrlList.concat(item.retweeted_status.pic_urls);
                        }
                        // 非全文获取的微博内容需要替换表情
                        res.forEach((content, index) => {
                            const emotion = [];
                            content.replace(/(\[.*?\])/g, (s, value) => {
                                emotion.push(`${value}`);
                            });

                            if (content.length > 0) {
                                emotion.forEach((item) => {
                                    res[index] = content.replace(new RegExp(`\\${item}`, 'g'), `<img alt="${item}" src="${weiboEmotion[item]}" style="width:1em; height:1em;" referrerpolicy="no-referrer">`);
                                });
                            }
                        });
                    }
                    let content = '';
                    try {
                        if (res.length >= 2) {
                            content = `${res[0]}<br><br><hr style="height:5px;border:none;border-top:5px ridge green;" /><span style="background-color:#71adec">${item.retweeted_status.user.screen_name}:<hr style="height:1px;border:none;border-top:1px solid #555555;" /><br>${res[1]}</span>`;
                        } else if (res.length === 1) {
                            content = res[0];
                        }

                        // 手机端reeder查看内容时，表情会导致换行-此处做转换
                        content.replace(/<span class='url-icon'>([\s\S]*?)<\/span>/g, (s, value) => {
                            content = content.replace(s, value);
                        });
                    } catch (error) {
                        // pass
                    }

                    let title = '';
                    if (res.length >= 2) {
                        title = `${item.user.name}--转发微博`;
                    } else if (item.pic_urls.length > 0) {
                        title = `${item.user.name}--原创图文微博`;
                    } else {
                        title = `${item.user.name}--原创微博`;
                    }
                    return {
                        title,
                        content,
                        author: item.user.name,
                        date: item.created_at,
                        link: `https://m.weibo.cn/detail/${item.id}`,
                        pic_urls: picUrlList,
                        videoList: Array.from(new Set(videoList)),
                    };
                });
                return Promise.resolve(realContent);
            })
        );

        ctx.state.data = {
            title: '个人微博时间线',
            link: 'https://weibo.com',
            item: data.map((item) => {
                let description = '';
                if (item.content !== null) {
                    description = item.content;
                }

                item.pic_urls.forEach((pic) => {
                    description += `<img alt="配图" style="margin: 0 auto" src="${pic.thumbnail_pic.replace('thumbnail', 'large')}"><br>`;
                });
                if (item.videoList.length !== 0) {
                    item.videoList.forEach((url) => {
                        description += `<iframe height=720 width=1080 src='${url}' frameborder=0 'allowfullscreen'></iframe>`;
                    });
                }
                return {
                    description: `${description
                        .replace(/\b(url|href|src)\b=(['|"])http:/g, '$1=$2https:')
                        .replace('http://t.cn/', 'https://t.cn/')
                        .replace('http://m.weibo.', 'https://m.weibo.')}`,
                    link: item.link,
                    pubDate: item.date,
                    title: item.title,
                    author: item.author,
                };
            }),
        };
    } else if (uid === '0' || ctx.querystring) {
        const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0', app_secret = '' } = config.weibo;

        const code = Object.values(ctx.query)[0];
        if (code) {
            const rep = await got.post(`https://api.weibo.com/oauth2/access_token?client_id=${app_key}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
            const token = rep.data.access_token;
            const uid = rep.data.uid;
            const expires_in = rep.data.expires_in;
            await ctx.cache.set('weibotimelineuid' + uid, token, expires_in, false);

            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
                'Cache-Control': 'no-cache',
            });
            ctx.body = `<script>window.location = '/weibo/timeline/${uid}'</script>`;
        }
    } else {
        const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0' } = config.weibo;

        ctx.status = 302;
        ctx.set({
            'Cache-Control': 'no-cache',
        });
        ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}`);
    }
};
