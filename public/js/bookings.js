import axios from "axios";
import { showAlert } from "./alerts";

export const deleteBooking_admin = async (orderId) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/bookings/${orderId}`,
    });

    if (res.status === 204) {
      showAlert("success", "已刪除該筆訂單");

      setTimeout(() => {
        location.assign("/manage-bookings");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", err);
  }
};

export const updateOrder_admin = async (
  orderId,
  dateTime,
  paid,
  quantities
) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/bookings/${orderId}`,
      data: {
        updatedAt: dateTime,
        paid,
        quantities,
      },
    });

    showAlert("success", "已更新該筆訂單");

    setTimeout(() => {
      location.assign("/manage-bookings");
    }, 2000);
  } catch (err) {
    showAlert("error", err);
  }
};
