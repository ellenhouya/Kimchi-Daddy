import axios from "axios";
import { showAlert } from "./alerts";

export const updateUser = async (form, userId, name) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/${userId}`,
      data: form,
    });

    // on photo rendering, we don't pass the name arg, meaning when we change the input photo, we don't want to show the message, nor do we want to redirect the url
    if (name) {
      if (res.data.status === "success") {
        showAlert("success", `已更新使用者 <${name}>`);

        window.setTimeout(() => {
          location.assign("/manage-users");
        }, 1500);
      }
    } else {
      return res;
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const removeUser = async (userId) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/users/${userId}`,
    });

    return res;
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
