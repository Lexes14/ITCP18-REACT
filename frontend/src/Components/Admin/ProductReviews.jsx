import { useEffect, useState } from "react";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";

const api = import.meta.env.VITE_API_URL;
const config = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const ProductReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const { data } = await axios.get(`${api}/admin/reviews`, config());
      setReviews(data.reviews || []);
    } catch (error) {
      errMsg(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`${api}/reviews`, {
        ...config(),
        data: { productId: review.productId, id: review._id },
      });
      setReviews((current) =>
        current.filter((item) => item._id !== review._id),
      );
      successMsg("Review deleted");
    } catch (error) {
      errMsg(error);
    }
  };
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <div className="eyebrow">Customer feedback</div>
          <h2>Reviews</h2>
        </div>
        <span className="muted">{reviews.length} reviews</span>
      </div>
      {loading ? (
        <p className="muted">Loading reviews...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={`${review.productId}-${review._id}`}>
                  <td>
                    <strong>{review.productName}</strong>
                  </td>
                  <td>{review.name}</td>
                  <td>
                    {"★".repeat(
                      Math.max(0, Math.min(5, Number(review.rating))),
                    )}
                  </td>
                  <td>{review.comment}</td>
                  <td>
                    <button
                      className="table-button danger"
                      onClick={() => remove(review)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reviews.length && <p className="admin-empty">No reviews found.</p>}
        </div>
      )}
    </section>
  );
};
export default ProductReviews;
