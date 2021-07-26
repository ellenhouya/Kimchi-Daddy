import axios from "axios";
import { isLoggedIn } from "../../controllers/authController";
import { showAlert } from "./alerts";

export function listenEvents(ele, event) {
  ele.addEventListener(event, async (e) => {
    const name = e.target.dataset.cartProductName;

    if (e.target.value * 1 < 1) e.target.value = 1;

    calculateTotal();

    await addProToShoppingCart_DB(
      {
        quantity: e.target.value,
        name,
        fromInput: true,
      },
      "input"
    );
  });
}

export const deleteItem_DB = async (itemId) => {
  //  DB
  try {
    const res = await axios({
      method: "DELETE",
      url: "/api/v1/users/deleteCartItem",
      data: {
        _id: itemId,
      },
    });

    return res;
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const calculateTotal = () => {
  if (!isLoggedIn) return;

  const allProductsPrice_SP = document.querySelectorAll(
    ".shopping-cart .product-price"
  );

  const total = document.querySelector(".total").children[0];

  const quantity = document.querySelectorAll(".product-qty");

  const totalAmount = [...allProductsPrice_SP].reduce((acc, ele) => {
    const price = ele.textContent.replace("$", "") * 1;
    const qty = ele.nextElementSibling.children[1].value * 1;

    return acc + price * qty;
  }, 0);

  total.textContent = totalAmount;

  document.querySelector(".qty-hint").textContent = [...quantity].reduce(
    (acc, ele) => {
      return acc + ele.value * 1;
    },
    0
  );
};

export const addProToShoppingCart_DB = async (data, type) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/addItemToMyCart",
      data,
    });
    if (res.data.status === "success" && type !== "input") {
      showAlert("success", `${data.name}已加入購物車`);

      return res;
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const clearCartItems_DB = async () => {
  try {
    const res = await axios({
      method: "DELETE",
      url: "/api/v1/users/clearCartItems",
    });

    return res;
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const renderDBDataToCart = (cart) => {
  let html = "";

  cart.forEach((item) => {
    html += `
    <div class="cart-item">
      <i class="fas fa-backspace delete-item-btn_SP" data-item-id="${item._id}"}></i>
      </button>
          
      <img src="/img/products/${item.image}" class="cart-image" />
            <div class="product-info">
              <p class="product-name">${item.name}</p>
              <p class="product-price">$${item.price}</p>
              <div class="qty-group">
                <label class="qty-label" for="product-qty">數量: </label>
                <input type="number" class="product-qty SP_${item._id}" data-cart-product-name=${item.name} name="product-qty" value= ${item.quantity}> 
              </div>
            </div>
    </div>
    `;
  });

  let pickupDate;

  const daysAfter = (days) => {
    return new Date(
      new Date().getTime() + 24 * days * 60 * 60 * 1000
    ).toLocaleString("en-US", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const dayNight = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
  });

  if (dayNight.includes("AM")) {
    pickupDate = `
    <div class='pickup-time-con'>
    <label class='shopping-cart-label' for='pickup-time'>到店取貨時間（上午 6 點至中午 12 點）</label>
    <select id='pickup-time'>
      <option>${new Date().toLocaleString("en-US", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}</option>
      <option>${daysAfter(1)}</option>
      <option>${daysAfter(2)}</option>
    </select>
  </div>
    `;
  } else {
    pickupDate = `
    <div class='pickup-time-con'>
    <label class='shopping-cart-label' for='pickup-time'>到店取貨時間（上午 6 點至中午 12 點）</label>
    <select id='pickup-time'>
      <option>${daysAfter(1)}</option>
      <option>${daysAfter(2)}</option>
      <option>${daysAfter(3)}</option>
    </select>
  </div>
    `;
  }

  document.getElementById("main").innerHTML = html + pickupDate;

  calculateTotal();

  // ADD EVENT LISTENERS
  const product_qty_SP = document.querySelectorAll(".product-qty");

  product_qty_SP.forEach((ele) => {
    listenEvents(ele, "change");
    listenEvents(ele, "input");
  });

  // delete
  const newItem = document.querySelectorAll(".cart-item .fa-backspace");

  newItem.forEach((item) => {
    item.addEventListener("click", async (e) => {
      const itemId = e.target.dataset.itemId;

      const res = await deleteItem_DB(itemId);

      const cart = res.data.data.user.shoppingCart;

      renderDBDataToCart(cart);
    });
  });
};
