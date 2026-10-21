import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    detail: any;
    images?: string[];
    discountRate?: string;
    discountEndDate?: Date;
    description?: string;
};

dayjs.extend(utc);

export const formatDate = (date?: Date) => (date ? dayjs(date).utcOffset(9).format('YYYY-MM-DD HH:mm') : '');

export const renderDescription = ({ detail, images, discountRate, discountEndDate, description }: DescriptionData) => {
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
