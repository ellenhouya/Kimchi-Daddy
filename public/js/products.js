import axios from "axios";
import { showAlert } from "./alerts";

export const updateProduct = async (productId, form) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/products/${productId}`,
      data: form,
    });

    if (res.data.status === "success") {
      showAlert("success", "已更新該產品");

      setTimeout(() => {
        location.assign("/manage-products");
      }, 3500);
    }
  } catch (err) {
    showAlert("error", err);
  }
};

export const renderTempImage = async (form, productId, route) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/products/${route}/${productId}`,
      data: form,
    });

    if (res.data.status === "success") {
      // productController 150
      return res;
    }
  } catch (err) {
    showAlert("error", err);
  }
};

export const createProduct = async (form, name) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/products",
      data: form,
    });

    if (res.data.status === "success") {
      showAlert("success", `產品：<${name}> 已成功加入數據庫中`);
      // productController 150
      // return res;
      setTimeout(() => {
        location.assign("/manage-products");
      }, 3000);
    }
  } catch (err) {
    console.log(err.message);
    showAlert("error", err);
  }
};

export const deleteProduct = async (productId, name) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/products/${productId}`,
    });

    if (res.status === 204) {
      showAlert("success", `產品：<${name}> 已刪除`);

      setTimeout(() => {
        location.assign("/manage-products");
      }, 3000);
    }
  } catch (err) {
    console.log(err.message);
    showAlert("error", err);
  }
};

export const getAllProducts_api = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/products/all-products-db",
    });

    return res;
  } catch (err) {
    console.log(err.message);
    showAlert("error", err);
  }
};
