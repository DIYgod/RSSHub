// 处理和转换 feed 项目数据
const ProcessFeed = async (items, cache) => {
    if (!items || items.length === 0) {
        return [];
    }

    return items.map(item => {
        // 构建详细的描述信息
        let description = '';

        // 添加缩略图
        if (item.preview) {
            description += `<img src="${item.preview}" style="max-width: 100%; height: auto;" /><br>`;
        }

        // 添加视频信息
        description += `<strong>描述:</strong> ${item.description}<br>`;

        if (item.duration) {
            description += `<strong>时长:</strong> ${item.duration}<br>`;
        }

        if (item.views) {
            description += `<strong>观看次数:</strong> ${item.views}<br>`;
        }

        if (item.rating) {
            description += `<strong>评分:</strong> ${item.rating}<br>`;
        }

        // 添加质量和声音信息
        const qualityInfo = [];
        if (item.isHD) {
            qualityInfo.push('HD');
        }
        if (item.hasSound) {
            qualityInfo.push('有声');
        }
        if (qualityInfo.length > 0) {
            description += `<strong>质量:</strong> ${qualityInfo.join(', ')}<br>`;
        }

        // 尝试解析发布时间
        let pubDate = new Date();
        if (item.added) {
            // 简单的相对时间解析 (例如: "1 hour ago", "2 days ago")
            const timeMatch = item.added.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
            if (timeMatch) {
                const value = parseInt(timeMatch[1]);
                const unit = timeMatch[2].toLowerCase();

                const now = new Date();
                switch (unit) {
                    case 'second':
                        pubDate = new Date(now.getTime() - value * 1000);
                        break;
                    case 'minute':
                        pubDate = new Date(now.getTime() - value * 60 * 1000);
                        break;
                    case 'hour':
                        pubDate = new Date(now.getTime() - value * 60 * 60 * 1000);
                        break;
                    case 'day':
                        pubDate = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
                        break;
                    case 'week':
                        pubDate = new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        pubDate = new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'year':
                        pubDate = new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
                        break;
                }
            }
        }

        return {
            title: item.title,
            link: item.link,
            description: description,
            pubDate: pubDate.toISOString(),
            guid: item.videoId ? `rule34video:${item.videoId}` : item.link,
            category: item.isHD ? ['HD'] : [],
        };
    });
};

module.exports = {
    ProcessFeed,
};
