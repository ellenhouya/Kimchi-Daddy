import axios from "axios";
import { showAlert } from "./alerts";

export const addToFavoriteList = async (productId, productName) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/addToMyFavorite",
      data: {
        productId,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", `<${productName}> 已加入清單`);
    }
  } catch (err) {
    showAlert("error", "無法加入清單，請稍後再試。");
  }
};

export const deleteFavoriteProduct = async (productId, productName) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/users/deleteFavoriteProduct/${productId}`,
    });

    if (res.data.status === "success") {
      showAlert("success", `<${productName}> 已從清單中移除`);

      // Render html after deletion
      let html = "";

      res.data.data.favoriteProducts.forEach((product) => {
        html += `
        <div class='product-con'>
          <a href=/product/${product.eng}>
            <img class=product-img ${product.eng} src=img/products/${product.imageCover} class= ${product.eng} data-overview-img= ${product.imageCover}>
          </a>
          <p class='name'>${product.name}</p>
          <p class='price'>${product.price}元 / 個</p>
          <div class=add-to-cart ${product.id} data-logged-in='true'>
            加入購物車
          </div>
          <div class=delete-favorite-product>
            <i class='fas fa-backspace'></i>
          </div>
        </div>
        `;
      });

      document.querySelector(".all-products-con-favorite").innerHTML = html;
    }
  } catch (err) {
    showAlert("error", err);
  }
};
