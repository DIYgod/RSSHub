import { renderToString } from 'hono/jsx/dom/server';

type CrowdfundingGoods = {
    gid?: number;
    name?: string;
    summary?: string;
    short_summary?: string;
    market_price?: number;
    price_min?: number;
    pic_url?: string;
    img_square?: string;
    imgs?: { img800?: string };
    jump_url?: string;
    start?: number;
    end?: number;
    target_count?: number;
    saled_count?: number;
    progress?: number;
};

const formatPrice = (cent: number | undefined): string => (cent === undefined || cent === null ? '-' : (cent / 100).toFixed(2));
const formatDate = (ts: number | undefined): string => (ts === undefined || ts === null ? '-' : new Date(ts * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));

const CrowdfundingCard = (goods: CrowdfundingGoods) => {
    const imageUrl = goods.pic_url || goods.imgs?.img800 || goods.img_square;
    const salePrice = formatPrice(goods.price_min);
    const marketPrice = formatPrice(goods.market_price);
    const progress = goods.progress ?? 0;
    const discount = goods.market_price && goods.price_min && goods.market_price !== goods.price_min ? Math.round((1 - goods.price_min / goods.market_price) * 100) : 0;

    return (
        <div>
            <figure>
                <img src={imageUrl} alt={goods.name} loading="lazy" style="display:block; width:100%; border-radius:8px;" />
            </figure>
            <div style="padding: 8px 0;">
                <h3 style="margin:4px 0;">{goods.name}</h3>
                <p style="color:#666; margin:4px 0;">{goods.summary ?? goods.short_summary ?? ''}</p>
                <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:8px;">
                    <tr>
                        <td style="padding:4px 8px; border:1px solid #eee; width:100px;">
                            <strong>众筹价</strong>
                        </td>
                        <td style="padding:4px 8px; border:1px solid #eee; color:#ff6700; font-weight:bold; font-size:16px;">¥{salePrice}</td>
                    </tr>
                    {discount > 0 ? (
                        <tr>
                            <td style="padding:4px 8px; border:1px solid #eee;">
                                <strong>市场价</strong>
                            </td>
                            <td style="padding:4px 8px; border:1px solid #eee;">
                                <span style="text-decoration:line-through; color:#999;">¥{marketPrice}</span>
                                <span style="color:#ff6700; margin-left:8px; font-size:12px;">省{discount}%</span>
                            </td>
                        </tr>
                    ) : null}
                    <tr>
                        <td style="padding:4px 8px; border:1px solid #eee;">
                            <strong>众筹进度</strong>
                        </td>
                        <td style="padding:4px 8px; border:1px solid #eee;">
                            <div style="background:#f0f0f0; border-radius:4px; overflow:hidden; height:22px; position:relative;">
                                <div
                                    style={`width:${Math.min(progress, 100)}%; background:linear-gradient(90deg,#ff6700,#ff9800); height:100%; line-height:22px; text-align:center; color:white; font-size:12px; font-weight:bold;`}
                                >
                                    {progress}%
                                </div>
                            </div>
                        </td>
                    </tr>
                    {goods.saled_count !== undefined && goods.saled_count !== null ? (
                        <tr>
                            <td style="padding:4px 8px; border:1px solid #eee;">
                                <strong>支持人数</strong>
                            </td>
                            <td style="padding:4px 8px; border:1px solid #eee;">{goods.saled_count} 人</td>
                        </tr>
                    ) : null}
                    {goods.target_count !== undefined && goods.target_count !== null ? (
                        <tr>
                            <td style="padding:4px 8px; border:1px solid #eee;">
                                <strong>目标人数</strong>
                            </td>
                            <td style="padding:4px 8px; border:1px solid #eee;">{goods.target_count} 人</td>
                        </tr>
                    ) : null}
                    <tr>
                        <td style="padding:4px 8px; border:1px solid #eee;">
                            <strong>起止时间</strong>
                        </td>
                        <td style="padding:4px 8px; border:1px solid #eee; font-size:12px;">
                            {formatDate(goods.start)} ~ {formatDate(goods.end)}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    );
};

export const renderCrowdfunding = (goods: CrowdfundingGoods): string => renderToString(<CrowdfundingCard {...goods} />);
