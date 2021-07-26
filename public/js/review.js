import axios from "axios";
import { showAlert } from "./alerts";

export const submitReview = async (
  rating,
  review,
  productId,
  orderId,
  createdAt
) => {
  try {
    // const selector = location.href.split("=")[1];

    const res = await axios({
      method: "POST",
      url: "/api/v1/reviews",
      data: {
        review,
        rating,
        product: productId,
        order: orderId,
        createdAt,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "評論已上傳");

      setTimeout(() => {
        location.assign(`/orders`);
      }, 3000);
    }

    // return res;
  } catch (err) {
    showAlert("error", err);
  }
};

export const updateReview = async (reviewId, rating, review, updatedAt) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/reviews/${reviewId}`,
      data: {
        rating,
        review,
        updatedAt,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "評論已更新");

      setTimeout(() => {
        location.assign(`/orders`);
      }, 3000);
    }
  } catch (err) {
    showAlert("error", err);
  }
};

const renderHtmlAfterDeletion = (res) => {
  let html = "";

  if (!res.data.data.length) {
    document.querySelector(".customer-reviews-title").textContent =
      "目前未有任何評論";

    return (document.querySelector(".all-reviews-con").innerHTML = html);
  }

  res.data.data.forEach((review) => {
    html += `
    <div class="review-container my-reviews-container">
  <p class="my-reviews-product-name">${review.product.name}</p>
  <i
    class="fas fa-trash"
    data-review-id="${review._id}"
    data-order-id="${review.order}"
  >
  </i>
  <div class="product-review-con">
    <div class="user-info-con">
      <div class="img-box">
        <img
          src="/img/products/${review.product.imageCover}"
          alt="${review.product.name}'s photo"
        />
      </div>
    </div>

    <div class="review-info-con">
      <div class="star-date-con">
        <div class="stars-date-con">
          <div class="stars">
            <i class="fas fa-star ${review.rating >= 1 ? "" : "inactive"}"></i>
            <i class="fas fa-star ${review.rating >= 2 ? "" : "inactive"}"></i>
            <i class="fas fa-star ${review.rating >= 3 ? "" : "inactive"}"></i>
            <i class="fas fa-star ${review.rating >= 4 ? "" : "inactive"}"></i>
            <i class="fas fa-star ${review.rating >= 5 ? "" : "inactive"}"></i>
            
          </div>
        </div>
        <p class="post-date">Posted on ${review.createdAt}</p>
      </div>
      <p class="review-text">${review.review}</p>
    </div>
  </div>
</div>
    `;
  });

  document.querySelector(".all-reviews-con").innerHTML = html;

  document.querySelector(
    "#customer-reviews-title"
  ).textContent = `目前有 ${res.data.data.length} 則評論`;

  // add event listener
  const deleteMyReviewBtn = document.querySelectorAll(
    ".my-reviews-container .fa-trash"
  );

  deleteMyReviewBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { reviewId, orderId } = e.target.dataset;

      deleteMyReview(reviewId, orderId);
    });
  });
};

export const deleteMyReview = async (reviewId, orderId) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/reviews/${reviewId}?order=${orderId}`,
    });

    // render my reviews again after deletion

    if (res.data.status === "success") {
      showAlert("success", "評論已移除");
      renderHtmlAfterDeletion(res);
    }
  } catch (err) {
    showAlert("error", "無法移除評論，請稍後再試");
  }
};

export const updateUserReview_admin = async (reviewId, data) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/reviews/${reviewId}`,
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "評論已更新");

      setTimeout(() => {
        location.assign("/manage-reviews");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", "無法移除評論，請稍後再試");
  }
};

export const deleteReview_admin = async (reviewId, orderId) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/reviews/${reviewId}?order=${orderId}`,
    });

    if (res.status === 200) {
      showAlert("success", "評論已移除");

      setTimeout(() => {
        location.assign("/manage-reviews");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", "無法移除評論，請稍後再試");
  }
};
