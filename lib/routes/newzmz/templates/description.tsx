import { renderToString } from 'hono/jsx/dom/server';

type LinkItem = {
    title?: string;
    link?: string;
};

type DescriptionData = {
    image?: string;
    nameZh?: string;
    nameEn?: string;
    alias?: string[];
    update?: string;
    links?: LinkItem[];
    categories?: string[];
    downLinks?: LinkItem[];
};

export const renderDescription = ({ image, nameZh, nameEn, alias, update, links, categories, downLinks }: DescriptionData) => {
    const alt = `${nameZh ?? ''}${nameEn ? ` - ${nameEn}` : ''}`;

    return renderToString(
        <>
            {image ? (
                <figure>
                    <img src={image} alt={alt} />
                </figure>
            ) : null}
            <table>
                <tbody>
                    {nameZh ? (
                        <tr>
                            <th>中文名</th>
                            <td>{nameZh}</td>
                        </tr>
                    ) : null}
                    {nameEn ? (
                        <tr>
                            <th>英文名</th>
                            <td>{nameEn}</td>
                        </tr>
                    ) : null}
                    {alias?.length ? (
                        <tr>
                            <th>又名</th>
                            <td>{alias.join(' / ')}</td>
                        </tr>
                    ) : null}
                    {update ? (
                        <tr>
                            <th>更新频率</th>
                            <td>{update}</td>
                        </tr>
                    ) : null}
                    {links?.length
                        ? links.map((link) => (
                              <tr>
                                  <th>{link.title}</th>
                                  <td>
                                      <a href={link.link}>{link.link}</a>
                                  </td>
                              </tr>
                          ))
                        : null}
                    {categories?.length ? (
                        <tr>
                            <th>标签</th>
                            <td>{categories.join(' / ')}</td>
                        </tr>
                    ) : null}
                    {downLinks?.length
                        ? downLinks.map((link) => (
                              <tr>
                                  <th>{link.title}</th>
                                  <td>
                                      <a href={link.link}>{link.link}</a>
                                  </td>
                              </tr>
                          ))
                        : null}
                </tbody>
            </table>
        </>
    );
};
