const Product = ({ product, addItemToCart }) => (
  <article>
    {product?.name}
    <button onClick={() => addItemToCart(product)}>Add</button>
  </article>
);
export default Product;
