import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type SecurityReleasesData = {
    headers?: string[];
    infos?: string[];
    description?: string;
};

const SecurityReleasesDescription = ({ headers, infos, description }: SecurityReleasesData) => (
    <>
        {headers && infos ? (
            <table>
                <tbody>
                    {headers.length > 0 ? (
                        <tr>
                            {headers.map((header) => (
                                <th>{header}</th>
                            ))}
                        </tr>
                    ) : null}
                    {infos.length > 0 ? (
                        <tr>
                            {infos.map((info) => (
                                <td>{info ? raw(info) : null}</td>
                            ))}
                        </tr>
                    ) : null}
                </tbody>
            </table>
        ) : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: SecurityReleasesData) => renderToString(<SecurityReleasesDescription {...data} />);
