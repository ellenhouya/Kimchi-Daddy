import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "登入成功");

      setTimeout(() => {
        location.assign("/all-products");
      }, 3500);
    }
  } catch (err) {
    showAlert("error", "帳號或密碼不正確");
  }
};

export const logout = async () => {
  try {
    const res = await axios("/api/v1/users/logout");

    if (res.data.status === "success") location.assign("/");
  } catch (err) {
    showAlert("error", "登出發生錯誤");
  }
};

export const signup = async (data) => {
  // console.log(data);
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "申請帳戶成功");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
