import dayjs from 'dayjs';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Author = {
    name?: string;
    link?: string;
};

type LinkItem = {
    text?: string;
    link?: string;
};

type DescriptionData = {
    detail: any;
    images?: string[];
    authors?: Author[];
    discountRate?: string;
    discountEndDate?: Date;
    updatedDate?: Date;
    pubDate?: Date;
    workCategories?: LinkItem[];
    searchTags?: LinkItem[];
    description?: string;
};

const formatDate = (date?: Date) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '');

export const renderDescription = ({ detail, images, authors, discountRate, discountEndDate, updatedDate, pubDate, workCategories, searchTags, description }: DescriptionData) => {
    const localePrices = detail.locale_price_str ?? {};
    const localeOfficialPrices = detail.locale_official_price_str ?? {};
    const hasOfficialPrice = Boolean(detail.official_price_str);
    const hasLocaleOfficialPrices = Boolean(detail.locale_official_price_str);
    const price = detail.price_str;

    return renderToString(
        <>
            <table>
                <tbody>
                    {discountRate ? (
                        <tr>
                            <th>割引</th>
                            <td>{discountRate}%</td>
                        </tr>
                    ) : null}
                    {discountEndDate ? (
                        <tr>
                            <th>割引終了時間</th>
                            <td>{formatDate(discountEndDate)}</td>
                        </tr>
                    ) : null}
                    {price ? (
                        <tr>
                            <th>価格&nbsp;(JPY)</th>
                            <td>
                                {raw(price)}
                                <i>&nbsp;円</i>&nbsp;&nbsp;
                                {hasOfficialPrice ? (
                                    <del>
                                        <small>
                                            {raw(detail.official_price_str)}
                                            <i>&nbsp;円</i>
                                        </small>
                                    </del>
                                ) : null}
                            </td>
                        </tr>
                    ) : null}
                    {localePrices.en_US ? (
                        <tr>
                            <th>価格&nbsp;(USD)</th>
                            <td>
                                {raw(localePrices.en_US)}
                                {hasLocaleOfficialPrices ? (
                                    <del>
                                        <small>{raw(localeOfficialPrices.en_US)}</small>
                                    </del>
                                ) : null}
                            </td>
                        </tr>
                    ) : null}
                    {localePrices.ko_KR ? (
                        <tr>
                            <th>価格&nbsp;(KRW)</th>
                            <td>
                                {raw(localePrices.ko_KR)}
                                {hasLocaleOfficialPrices ? (
                                    <del>
                                        <small>{raw(localeOfficialPrices.ko_KR)}</small>
                                    </del>
                                ) : null}
                            </td>
                        </tr>
                    ) : null}
                    {localePrices.zh_CN ? (
                        <tr>
                            <th>価格&nbsp;(RMB)</th>
                            <td>
                                {raw(localePrices.zh_CN)}
                                {hasLocaleOfficialPrices ? (
                                    <del>
                                        <small>{raw(localeOfficialPrices.zh_CN)}</small>
                                    </del>
                                ) : null}
                            </td>
                        </tr>
                    ) : null}
                    {localePrices.zh_TW ? (
                        <tr>
                            <th>価格&nbsp;(TWD)</th>
                            <td>
                                {raw(localePrices.zh_TW)}
                                {hasLocaleOfficialPrices ? (
                                    <del>
                                        <small>{raw(localeOfficialPrices.zh_TW)}</small>
                                    </del>
                                ) : null}
                            </td>
                        </tr>
                    ) : null}
                    {detail.default_point_str ? (
                        <tr>
                            <th>ポイント</th>
                            <td>{detail.default_point_str}&nbsp;pt</td>
                        </tr>
                    ) : null}
                    {authors?.length ? (
                        <tr>
                            <th>作者</th>
                            <td>
                                {authors.map((author) => (
                                    <a href={author.link}>{author.name}</a>
                                ))}
                            </td>
                        </tr>
                    ) : null}
                    {updatedDate ? (
                        <tr>
                            <th>発売日</th>
                            <td>{formatDate(updatedDate)}</td>
                        </tr>
                    ) : null}
                    {pubDate ? (
                        <tr>
                            <th>販売日</th>
                            <td>{formatDate(pubDate)}</td>
                        </tr>
                    ) : null}
                    {workCategories?.length ? (
                        <tr>
                            <th>作品形式</th>
                            <td>
                                {workCategories.map((category) => (
                                    <>
                                        <a href={category.link}>{category.text}</a>,&nbsp;
                                    </>
                                ))}
                            </td>
                        </tr>
                    ) : null}
                    {searchTags?.length ? (
                        <tr>
                            <th>ジャンル</th>
                            <td>
                                {searchTags.map((tag) => (
                                    <>
                                        <a href={tag.link}>{tag.text}</a>,&nbsp;
                                    </>
                                ))}
                            </td>
                        </tr>
                    ) : null}
                    {description ? (
                        <tr>
                            <th>概要</th>
                            <td>{description}</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
            {images?.length ? images.map((image) => <img src={image} />) : null}
        </>
    );
};
