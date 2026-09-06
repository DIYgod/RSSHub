import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type GalleryItem = {
    type?: string;
    isMain?: boolean;
    full?: string;
    img?: string;
    thumb?: string;
};

type Attributes = {
    platform?: string;
    supported_languages?: string;
    game_category?: string;
    required_space?: string;
    release_date?: string;
    supported_controllers?: string;
    publisher?: string;
    supported_play_modes?: string;
    no_of_players?: string;
    price?: string;
    currency?: string;
    disclaimer?: string;
};

type JsonData = {
    hero_banner_url?: string;
    catch_copy?: string;
    description?: string;
    notices?: Array<{ text?: string }>;
    total_rom_size?: number;
    play_styles?: Array<{ name?: string }>;
    player_number?: {
        offline_max?: string | number;
        local_max?: string | number;
        online_max?: string | number;
    };
    controllers?: Array<{ name?: string }>;
    cloud_backup_type?: string;
    platform?: { name?: string };
    publisher?: { name?: string };
    genre?: string;
    release_date_on_eshop?: string;
    languages?: Array<{ name?: string }>;
    network_feature_description?: string;
    copyright_text?: string;
    screenshots?: Array<{ images?: Array<{ url?: string }> }>;
};

type PriceData = {
    price?: {
        regular_price?: {
            formatted_value?: string;
        };
    };
};

type DescriptionParams = {
    host?: string;
    attributes?: Attributes;
    description?: string;
    gallery?: GalleryItem[];
    jsonData?: JsonData;
    priceData?: PriceData;
};

export const renderEshopHkDescription = ({ host, attributes, description, gallery, jsonData, priceData }: DescriptionParams) =>
    renderToString(
        <>
            {host === 'store.nintendo.com.hk' ? (
                <>
                    {gallery ? gallery.map((item, index) => (item.type === 'image' && item.isMain ? <img src={item.full || item.img || item.thumb} key={`${item.full ?? item.img ?? item.thumb}-${index}`} /> : null)) : null}
                    <table>
                        <tr>
                            {attributes?.platform ? (
                                <>
                                    <th>支援平台：</th>
                                    <td>{attributes.platform}</td>
                                </>
                            ) : null}
                            {attributes?.supported_languages ? (
                                <>
                                    <th>對應語言：</th>
                                    <td>{attributes.supported_languages}</td>
                                </>
                            ) : null}
                        </tr>
                        <tr>
                            {attributes?.game_category ? (
                                <>
                                    <th>遊戲類型：</th>
                                    <td>{attributes.game_category}</td>
                                </>
                            ) : null}
                            {attributes?.required_space ? (
                                <>
                                    <th>所需容量（約）：</th>
                                    <td>{attributes.required_space}</td>
                                </>
                            ) : null}
                        </tr>
                        <tr>
                            {attributes?.release_date ? (
                                <>
                                    <th>發售日：</th>
                                    <td>{attributes.release_date}</td>
                                </>
                            ) : null}
                            {attributes?.supported_controllers ? (
                                <>
                                    <th>支援的控制器：</th>
                                    <td>{attributes.supported_controllers}</td>
                                </>
                            ) : null}
                        </tr>
                        <tr>
                            {attributes?.publisher ? (
                                <>
                                    <th>發行商：</th>
                                    <td>{attributes.publisher}</td>
                                </>
                            ) : null}
                            {attributes?.supported_play_modes ? (
                                <>
                                    <th>遊玩模式：</th>
                                    <td>{attributes.supported_play_modes}</td>
                                </>
                            ) : null}
                        </tr>
                        <tr>
                            {attributes?.no_of_players ? (
                                <>
                                    <th>遊玩人數：</th>
                                    <td>{attributes.no_of_players}</td>
                                </>
                            ) : null}
                            {attributes?.price ? (
                                <>
                                    <th>售價：</th>
                                    <td>
                                        {attributes.currency} {attributes.price}
                                    </td>
                                </>
                            ) : null}
                        </tr>
                    </table>
                    {attributes?.disclaimer ? <>{attributes.disclaimer}</> : null}
                    <br />
                    <br />
                    {description ? <>{raw(description)}</> : null}
                    <br />
                    {gallery ? gallery.map((item, index) => (item.type === 'image' && !item.isMain ? <img src={item.full || item.img || item.thumb} key={`${item.full ?? item.img ?? item.thumb}-${index}`} /> : null)) : null}
                </>
            ) : host === 'ec.nintendo.com' ? (
                <>
                    {jsonData?.hero_banner_url ? <img src={jsonData.hero_banner_url} /> : null}
                    <h2>{jsonData?.catch_copy}</h2>
                    <div>{jsonData?.description ? raw(jsonData.description.replaceAll('\n', '<br>')) : null}</div>
                    {jsonData?.notices ? (
                        <>
                            <br />
                            <span>廠商通知</span>
                            <div>{jsonData.notices[0].text}</div>
                            <br />
                        </>
                    ) : null}
                    <table>
                        {priceData ? (
                            <tr>
                                <th>售價</th>
                                <td>{priceData.price?.regular_price?.formatted_value}</td>
                            </tr>
                        ) : null}
                        {jsonData?.total_rom_size ? (
                            <tr>
                                <th>需要空間</th>
                                <td>{(jsonData.total_rom_size / 1024 / 1024 / 1024).toFixed(1)} GB</td>
                            </tr>
                        ) : null}
                        {jsonData?.play_styles ? (
                            <tr>
                                <th>遊玩模式</th>
                                <td>{jsonData.play_styles.map((style) => style.name).join(', ')}</td>
                            </tr>
                        ) : null}
                        {jsonData?.player_number ? (
                            <tr>
                                <th>遊玩人數</th>
                                <td>{jsonData.player_number.offline_max}</td>
                            </tr>
                        ) : null}
                        {jsonData?.player_number ? (
                            <tr>
                                <th>鄰近主機通訊遊玩人數</th>
                                <td>{jsonData.player_number.local_max}</td>
                            </tr>
                        ) : null}
                        {jsonData?.player_number ? (
                            <tr>
                                <th>網路通訊遊玩人數</th>
                                <td>{jsonData.player_number.online_max}</td>
                            </tr>
                        ) : null}
                        {jsonData?.controllers ? (
                            <tr>
                                <th>對應控制器</th>
                                <td>{jsonData.controllers.map((controller) => controller.name).join(', ')}</td>
                            </tr>
                        ) : null}
                        {jsonData?.cloud_backup_type ? (
                            <tr>
                                <th>保管儲存資料</th>
                                <td>{jsonData.cloud_backup_type === 'supported' ? '對應' : '不對應'}</td>
                            </tr>
                        ) : null}
                        {jsonData?.platform ? (
                            <tr>
                                <th>平台</th>
                                <td>{jsonData.platform.name}</td>
                            </tr>
                        ) : null}
                        {jsonData?.publisher ? (
                            <tr>
                                <th>廠商</th>
                                <td>{jsonData.publisher.name}</td>
                            </tr>
                        ) : null}
                        {jsonData?.genre ? (
                            <tr>
                                <th>類型</th>
                                <td>{jsonData.genre}</td>
                            </tr>
                        ) : null}
                        {jsonData?.release_date_on_eshop ? (
                            <tr>
                                <th>發布日</th>
                                <td>{jsonData.release_date_on_eshop}</td>
                            </tr>
                        ) : null}
                        {jsonData?.languages ? (
                            <tr>
                                <th>對應語言</th>
                                <td>{jsonData.languages.map((language) => language.name).join(', ')}</td>
                            </tr>
                        ) : null}
                    </table>
                    {jsonData?.network_feature_description ? (
                        <>
                            {jsonData.network_feature_description}
                            <br />
                        </>
                    ) : null}
                    {jsonData?.copyright_text ? <>{jsonData.copyright_text}</> : null}
                    {jsonData?.screenshots ? jsonData.screenshots.map((screen, screenIndex) => screen.images?.map((image, imageIndex) => <img src={image.url} key={String(image.url ?? `${screenIndex}-${imageIndex}`)} />)) : null}
                </>
            ) : null}
        </>
    );
