import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updateMyPassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (type === "imageRendering") return res;

    if (res.data.status === "success") showAlert("success", "資訊成功更新");

    return res;
  } catch (err) {
    showAlert("error", "更新出現錯誤");
  }
};
