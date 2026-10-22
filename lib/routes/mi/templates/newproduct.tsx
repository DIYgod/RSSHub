import { renderToString } from 'hono/jsx/dom/server';
import { z } from 'zod';

const GoodsSchema = z.object({
    /** Product image */
    image: z.string(),
    /** Product name */
    name: z.string(),
    /** Original price */
    marketPrice: z.string(),
    /** Current price */
    price: z.string(),
});

const NewProductSchema = z.object({
    /** Product image */
    image: z.string(),
    /** Sell point list */
    sellPointList: z.array(z.string()).nonempty(),
    /** Product list */
    goodsList: z.array(GoodsSchema).nonempty(),
});

export type NewProduct = z.infer<typeof NewProductSchema>;

const NewProductDescription = ({ newProduct }: { newProduct: NewProduct }) => (
    <>
        <img src={newProduct.image} />
        <br />
        <ol>
            {newProduct.sellPointList.map((point) => (
                <li>{point}</li>
            ))}
        </ol>
        <br />
        <table>
            <thead>
                <tr>
                    <th>图片</th>
                    <th>规格</th>
                    <th>原价</th>
                    <th>现价</th>
                </tr>
            </thead>
            <tbody>
                {newProduct.goodsList.map((goods) => (
                    <tr>
                        <td>
                            <img src={goods.image} width={48} height={48} />
                        </td>
                        <td>{goods.name}</td>
                        <td>{goods.marketPrice} 元</td>
                        <td>{goods.price} 元</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

/**
 * Render the new product item description.
 *
 * @param {NewProduct} newProduct - New product data.
 * @returns {string} Rendered description HTML.
 */
export const renderNewProduct = (newProduct: NewProduct): string => renderToString(<NewProductDescription newProduct={NewProductSchema.parse(newProduct)} />);
