import "@babel/polyfill";
import { showAlert } from "./alerts";

import { login, logout, signup } from "./login";
import {
  addProToShoppingCart_DB,
  listenEvents,
  clearCartItems_DB,
  renderDBDataToCart,
  deleteItem_DB,
} from "./shoppingCart";

import { updateSettings } from "./updateSettings";
import { makePayment } from "./stripe";
import { addToFavoriteList, deleteFavoriteProduct } from "./favorite";

import {
  submitReview,
  updateReview,
  deleteMyReview,
  updateUserReview_admin,
  deleteReview_admin,
} from "./review";

import {
  updateProduct,
  renderTempImage,
  createProduct,
  deleteProduct,
  getAllProducts_api,
  // sortFilterProducts,
} from "./products";

import { updateUser, renderHtml, removeUser } from "./user";

import { deleteBooking_admin, updateOrder_admin } from "./bookings";

const preloader = document.querySelector(".preloader");
const form_login = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const signupForm = document.querySelector(".signup-form");
const allPorductsCon = document.querySelector(".all-products-con");
const shoppingCart = document.querySelector(".shopping-cart");
const shoppingCart_header = document.querySelector(".shopping-cart-header");

const userDataForm = document.querySelector(".form-user-data_account");
const userPasswordForm = document.querySelector(".form-user-password");
const addBtn_productPage = document.querySelector(".add-to-cart-btn");
const clearBtn_SP = document.querySelector(".checkout-con .fa-trash");
const deleteBtn_SP = document.querySelectorAll(
  ".fa-backspace.delete-item-btn_SP"
);
const paymentBtn = document.getElementById("make-payment");
const addToFavoriteBtn = document.querySelector(".favorite");

const deleteFavoriteProductBtn = document.querySelectorAll(
  ".delete-favorite-product"
);

//Reviews
const allReviewUpdateIcons = document.querySelectorAll(".check-square-review");
const submitReviewBtn = document.querySelector(".submit-review-btn");
const allStars = document.querySelectorAll(".fa-star");

// utils
window.addEventListener("load", (e) => {
  preloader.style.display = "none";
});

const changeTextBkg = (ele, event) => {
  ele.style.cssText = "background: rgb(88, 64, 55) ; color:#fff";

  ele.textContent = event.srcElement.files[0].name;
};

if (form_login) {
  form_login.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name--signup").value;
    const email = document.getElementById("email--signup").value;
    const password = document.getElementById("password--signup").value;
    const passwordConfirm = document.getElementById(
      "passwordConfirm--signup"
    ).value;

    signup({ name, email, password, passwordConfirm });
  });
}

if (allPorductsCon) {
  allPorductsCon.addEventListener("click", async (e) => {
    if (e.target.dataset.loggedIn === "false") {
      return showAlert("error", "請先登入");
    }

    if (e.target.classList.contains("add-to-cart")) {
      const id = e.target.getAttribute("class").split(" ")[1];

      const name = e.target.previousElementSibling.previousElementSibling;

      const price =
        e.target.previousElementSibling.textContent.replace("元 / 個", "") * 1;

      const image = name.previousElementSibling.children[0].dataset.overviewImg;

      // FETCH DATA FROM DB
      const res = await addProToShoppingCart_DB({
        name: name.textContent,
        price,
        quantity: 1,
        image,
        _id: id,
      });

      // RENDER DATA ON DOM
      const cart = res.data.data.user.shoppingCart;

      renderDBDataToCart(cart);
    }
  });
}

if (shoppingCart_header) {
  shoppingCart_header.addEventListener("mouseenter", (e) => {
    shoppingCart.style.display = "block";
  });
  shoppingCart.addEventListener("mouseleave", (e) => {
    shoppingCart.style.display = "none";
  });

  // can delete item after page reload
  if (deleteBtn_SP) {
    deleteBtn_SP.forEach((ele) => {
      ele.addEventListener("click", async (e) => {
        const itemId = ele.dataset.itemId;
        const res = await deleteItem_DB(itemId);
        const cart = res.data.data.user.shoppingCart;
        renderDBDataToCart(cart);
      });
    });
  }

  // CLEAR SP
  clearBtn_SP.addEventListener("click", async (e) => {
    if (!document.querySelectorAll(".cart-item").length) return;

    const confirmation = confirm("確定要清空購物車嗎？");

    if (confirmation) {
      const res = await clearCartItems_DB();
      const cart = res.data.data.user.shoppingCart;
      renderDBDataToCart(cart);
    }
  });
}

// ACCOUNT PAGE
if (userDataForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const photo = document.getElementById("photo").files[0];

    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("photo", photo);

    const res = await updateSettings(form, "data");

    // render header photo
    document
      .querySelector(".nav__user-img")
      .setAttribute("src", `img/users/${res.data.user.photo}`);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const saveBtn = document.querySelector(".btn--save-password");

    saveBtn.textContent = "更新中...";

    const passwordCurrent = document.getElementById("password-current");
    const password = document.getElementById("password");
    const passwordConfirm = document.getElementById("password-confirm");

    await updateSettings(
      {
        passwordCurrent: passwordCurrent.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value,
      },
      "password"
    );

    saveBtn.textContent = "儲存密碼";

    passwordCurrent.value = "";
    password.value = "";
    passwordConfirm.value = "";
  });
}

if (addBtn_productPage) {
  addBtn_productPage.addEventListener("click", async (e) => {
    const id = addBtn_productPage.dataset.id;
    const name = addBtn_productPage.dataset.name;
    const price = addBtn_productPage.dataset.price;
    const image = addBtn_productPage.dataset.imagecover;
    const quantity = document.getElementById("qty-input").value * 1;

    if (quantity <= 0) return showAlert("error", "數量需大於 0");

    const res = await addProToShoppingCart_DB({
      name,
      price,
      quantity,
      image,
      _id: id,
    });

    const cart = res.data.data.user.shoppingCart;

    renderDBDataToCart(cart);
  });
}

const product_qty_SP = document.querySelectorAll(".product-qty");

product_qty_SP.forEach((ele) => {
  listenEvents(ele, "change");
  listenEvents(ele, "input");
});

const userAccountView = document.querySelector(".user-view__content");

if (userAccountView) {
  const photo = document.getElementById("photo");

  if (photo) {
    photo.addEventListener("change", async (e) => {
      e.preventDefault();

      e.target.nextElementSibling.style.cssText =
        "background: #f7f1e6 ; color:#000";

      e.target.nextElementSibling.textContent = e.srcElement.files[0].name;

      const photo = document.getElementById("photo").files[0];

      const form = new FormData();
      form.append("photo", photo);
      // req.body.photoRendering (userController 86)
      form.append("photoRendering", "photoRendering");

      // we don't save it in the db
      const res = await updateSettings(form, "imageRendering");

      // `public/img/users/user-${req.user.id}-${Date.now()}.jpeg`
      e.target.previousElementSibling.setAttribute(
        "src",
        `img/users/${res.data.data.fileName}`
      );
    });
  }
}

const imgInputs_manageProducts = document.querySelectorAll(
  ".img-label-input-group input"
);

const productUpdateForm = document.querySelectorAll(".product-con_admin");
const productDeleteBtn = document.querySelectorAll(".product-delete-btn");
// const productEditBtn = document.getElementById("fa-edit-update-product");

if (productUpdateForm) {
  productUpdateForm.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // select elements
      const productInputCon = e.target.children[1];
      const inputGroup = e.target.children[2].children[1];

      const imageCover = productInputCon.children[0].children[2].files[0];

      const image1 = productInputCon.children[1].children[2].files[0];
      const image2 = productInputCon.children[2].children[2].files[0];
      const image3 = productInputCon.children[3].children[2].files[0];
      const name = e.target.previousElementSibling.value;
      const eng = inputGroup.children[0].value;
      const ingredients = inputGroup.children[1].value;
      const price = inputGroup.children[2].value;
      const summary = inputGroup.children[3].value;
      const description = inputGroup.children[4].value;
      const vegetarian = inputGroup.children[5].value;

      // append elements to form

      const form = new FormData();
      if (imageCover) form.append("imageCover", imageCover);
      if (image1) {
        // form.append("images", image1);
        form.append("images_1", image1);
      }
      if (image2) {
        // form.append("images", image2);
        form.append("images_2", image2);
      }
      if (image3) {
        // form.append("images", image3);
        form.append("images_3", image3);
      }

      if (name) form.append("name", name);
      if (eng) form.append("eng", eng);
      if (ingredients) form.append("ingredients", ingredients);
      if (price) form.append("price", price);
      if (summary) form.append("summary", summary);
      if (description) form.append("description", description);
      if (vegetarian) form.append("vegetarian", vegetarian);

      const productId = e.target.dataset.productId;

      await updateProduct(productId, form);
    });
  });

  // delete item
  productDeleteBtn.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", (e) => {
      const { productId } =
        e.target.parentElement.nextElementSibling.nextElementSibling.dataset;

      const name = e.target.parentElement.nextElementSibling.value;

      const confirmed = confirm("確定要刪除產品嗎？");
      if (confirmed) deleteProduct(productId, name);
    });
  });
}

// change input text and color
if (imgInputs_manageProducts) {
  imgInputs_manageProducts.forEach((imgInput) => {
    imgInput.addEventListener("change", async (e) => {
      // e.target == input
      e.preventDefault();

      changeTextBkg(e.target.previousElementSibling, e);

      // change the photo synchronously
      const productId = e.target.closest("[data-product-id]").dataset.productId;

      const image = e.target.files[0];

      const form = new FormData();

      form.append(e.target.name, image);

      // productController 117
      // form.append("productImgRendering", "productImgRendering");
      let res;

      if (e.target.name === "imageCover") {
        res = await renderTempImage(form, productId, "renderTempImageCover");
      }

      if (e.target.name === "images_1") {
        res = await renderTempImage(form, productId, "renderTempImage");
      }

      if (e.target.name === "images_2") {
        res = await renderTempImage(form, productId, "renderTempImage2");
      }

      if (e.target.name === "images_3") {
        res = await renderTempImage(form, productId, "renderTempImage3");
      }

      e.target.previousElementSibling.previousElementSibling.setAttribute(
        "src",
        `img/products/${res.data.data.filename}`
      );
    });
  });
}

if (paymentBtn) {
  paymentBtn.addEventListener("click", async (e) => {
    const select = document.getElementById("pickup-time");
    e.target.textContent = "處理中...";
    // const userId = paymentBtn.dataset.userId;
    // const qty = document.querySelector(".qty-hint").textContent;
    const total = document.querySelector(".total span").textContent;

    const pickupTime =
      select.value.replace(/(\/)/g, "-") || select.option.replace(/(\/)/g, "-");

    await makePayment(total, pickupTime);
  });
}

// Favorite products

if (addToFavoriteBtn) {
  addToFavoriteBtn.addEventListener("click", (e) => {
    const productName = e.target.previousElementSibling.children[0].textContent;

    const productId = document.querySelector("[data-id]").dataset.id;
    addToFavoriteList(productId, productName);
  });
}

if (deleteFavoriteProductBtn) {
  deleteFavoriteProductBtn.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const productId = e.target.parentElement.previousElementSibling
        .getAttribute("class")
        .split(" ")[1];

      const productName =
        e.target.parentElement.previousElementSibling.previousElementSibling
          .previousElementSibling.textContent;

      await deleteFavoriteProduct(productId, productName);
    });
  });
}

// Review
const updateReviewBtn = document.querySelector(".review-update-btn");
const updateReviewConfirmBtn = document.getElementById("update-confirm-btn");

if (
  (submitReviewBtn || allReviewUpdateIcons || updateReviewConfirmBtn) &&
  (location.pathname.includes("review-form") ||
    location.pathname.includes("review-update-form") ||
    location.pathname.includes("review-update-form-admin"))
) {
  const taiwanTime = () => {
    return `${new Date().toLocaleString("en-US", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  };

  let rating;

  // change the color of the stars
  allStars.forEach((star) => {
    star.addEventListener("click", (e) => {
      const starId = e.target.dataset.starId * 1;

      for (
        let i = starId % 5 === 0 ? starId - 4 : Math.floor(starId / 5) * 5 + 1;
        i <= starId;
        i++
      ) {
        document.querySelector(`.star-${i}`).style.color = "#ffc300";

        // gray stars
        for (let j = starId + 1; j <= Math.floor(starId / 5 + 1) * 5; j++) {
          const jEle = document.querySelector(`.star-${j}`);
          if (jEle) {
            jEle.style.color = "rgb(172, 169, 169)";
          }
        }
      }

      let offset =
        Math.floor(starId % 5) === 0
          ? (starId / 5 - 1) * 5
          : Math.floor(starId / 5) * 5;
      rating = starId - offset;
    });
  });

  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", async (e) => {
      const review = document.querySelector(".review-detail").value;

      const productId = location.pathname.split("/")[2];

      const orderId = location.pathname.split("/")[3];

      if (!review || !rating) return showAlert("error", "請提供星級與評論");

      const createdAt = taiwanTime();

      await submitReview(rating, review, productId, orderId, createdAt);
    });
  }

  if (updateReviewBtn) {
    updateReviewBtn.addEventListener("click", (e) => {
      const reviewId = location.pathname.split("/")[3];
      const review = document.querySelector(".review-detail").value;
      // note: if rating was not changed, undefined will be returned, so we need to know the default rating

      const defaultRating =
        document.querySelector("[data-rating]").dataset.rating;

      if ((!review && rating === defaultRating * 1) || (!review && !rating))
        return showAlert("error", "您未輸入更新評論");

      const updatedAt = taiwanTime();

      updateReview(reviewId, rating || defaultRating * 1, review, updatedAt);
    });
  }

  if (updateReviewConfirmBtn) {
    updateReviewConfirmBtn.addEventListener("click", (e) => {
      const reviewId = e.target.dataset.reviewId;

      const review = document.querySelector(
        ".review-container-update .review-text"
      ).value;

      if (!rating && !review) return showAlert("error", "請至少更新一個欄位");

      const defaultRating =
        document.querySelector("[data-rating]").dataset.rating * 1;

      updateUserReview_admin(reviewId, {
        rating: rating || defaultRating,
        review,
      });
    });
  }
}

const deleteMyReviewBtn = document.querySelectorAll(
  ".my-reviews-container .fa-trash"
);

if (deleteMyReviewBtn) {
  deleteMyReviewBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { reviewId, orderId } = e.target.dataset;

      deleteMyReview(reviewId, orderId);
    });
  });
}

// ADD PRODUCT
const addProductForm = document.querySelector(".add-product-con_admin");
const addProductImageInputs = document.querySelectorAll(
  ".add-product-img-input"
);

if (addProductForm) {
  addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get elements
    const imageCover = document.getElementById("imageCover_add").files[0];
    const image_1 = document.getElementById("image-1_add").files[0];
    const image_2 = document.getElementById("image-2_add").files[0];
    const image_3 = document.getElementById("image-3_add").files[0];

    const name = document.querySelector(".product-name-input").value;
    const eng = document.querySelector(".eng").value;
    const ingredients = document
      .querySelector(".ingredients")
      .value.split("、");
    const price = document.querySelector(".price").value * 1;
    const summary = document.querySelector(".summary").value;
    const description = document.querySelector(".description").value;
    const vegetarian_val = document.querySelector(".vegetarian").value;
    const vegetarian = vegetarian_val === "true" ? true : false;

    if (
      !imageCover ||
      !image_1 ||
      !image_2 ||
      !image_3 ||
      !name ||
      !eng ||
      !price ||
      !summary ||
      !description ||
      vegetarian_val === ""
    )
      return showAlert("error", "請填寫所有欄位");

    // create a form
    const form = new FormData();

    form.append("imageCover", imageCover);
    form.append("images", image_1);
    form.append("images", image_2);
    form.append("images", image_3);
    form.append("name", name);
    form.append("eng", eng);
    // form.append("ingredients", ingredients);
    ingredients.forEach((ing) => {
      form.append("ingredients[]", ing);
    });
    form.append("price", price);
    form.append("summary", summary);
    form.append("description", description);
    form.append("vegetarian", vegetarian);

    createProduct(form, name);
  });

  // render temp images
  addProductImageInputs.forEach((input) => {
    input.addEventListener("change", async (e) => {
      e.preventDefault();

      changeTextBkg(e.target.previousElementSibling, e);

      // change the photo when rendering
      // the productId here will be used for filename (resizePhoto.js 25), has nothing to do with database here.
      const productId = "tempImageRendering";
      const image = e.target.files[0];
      const form = new FormData();
      form.append(e.target.name, image);
      let res;
      if (e.target.name === "imageCover") {
        res = await renderTempImage(form, productId, "renderTempImageCover");
      }

      // we reuse the routes (there are 3 routes we can use (productRoutes.js 70-89), so we can choose one of them )
      if (e.target.name === "images_1") {
        res = await renderTempImage(form, productId, "renderTempImage");
      }

      // productController.js 186
      e.target.previousElementSibling.previousElementSibling.setAttribute(
        "src",
        `img/products/${res.data.data.filename}`
      );
    });
  });
}

// update user
const userUpdateForm = document.querySelector(".user-container-update");
if (userUpdateForm) {
  const photo = document.getElementById("photo");

  userUpdateForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const userInfoCon = e.target.children[1];
    const userId = userInfoCon.children[0].textContent.replace("ID: ", "");
    const name = userInfoCon.children[1].children[1].value;
    const email = userInfoCon.children[2].children[1].value;
    const role = userInfoCon.children[3].children[1].value;

    const form = new FormData();
    if (photo.files[0]) form.append("photo", photo.files[0]);
    form.append("name", name);
    form.append("email", email);
    form.append("role", role);

    updateUser(form, userId, name);
  });

  photo.addEventListener("change", async (e) => {
    const label = e.target.previousElementSibling;
    changeTextBkg(label, event);

    const form = new FormData();

    form.append("photo", photo.files[0]);

    // userId just for rendering, has nothing to do with db, so we can use whatever we want
    const res = await updateUser(form, "userId", "");

    label.previousElementSibling.setAttribute(
      "src",
      `/img/users/${res.data.data.filename}`
    );
  });
}

// DELETE USER
const usersContainer = document.querySelector(".users-con");

if (usersContainer) {
  // RENDER HTML
  function renderHtml(userRemovalBtns) {
    userRemovalBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId =
          e.target.parentElement.previousElementSibling.children[0].textContent.replace(
            "ID: ",
            ""
          );

        const confirmed = confirm("確定要刪除該使用者嗎？");

        let res;

        if (confirmed) {
          res = await removeUser(userId);
        } else {
          return;
        }

        // RENDER HTML
        let html = "";

        res.data.data.forEach((user) => {
          html += `
                <div class='user-container'>
                  <div class='img-box'>
                    <img src=/img/users/${
                      user.photo ? user.photo : "default.jpg"
                    } alt=${user.name}'s photo>
                  </div>
                  <div class='user-info-con'>
                    <p>ID: ${user._id}</p>
                    <p>Name: ${user.name}</p>
                    <p>Email: ${user.email}</p>
                    <p>Role: ${user.role}</p>
                  </div>
                  <div class='icons-con'>
                    <a href=/user-update-form/${
                      user._id
                    }><i class='far fa-edit'></i></a>
                    <i class='far fa-trash-alt remove-icon'></i>
                  </div>
                </div>
              `;
        });

        document.querySelector(".users-con").innerHTML = html;

        const removeUserBtns_afterRendering =
          document.querySelectorAll(".remove-icon");

        renderHtml(removeUserBtns_afterRendering);
      });
    });
  }

  const removeUserBtns = document.querySelectorAll(".remove-icon");
  renderHtml(removeUserBtns);
}

// DELETE REVIEW
const deleteReviewBtn_admin = document.querySelectorAll(".remove-review_admin");

deleteReviewBtn_admin.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const reviewId = e.target.dataset.reviewId;
    const orderId = e.target.dataset.orderId;

    deleteReview_admin(reviewId, orderId);
  });
});

// DELETE BOOKING
const deleteBookingsIcon_admin =
  document.querySelectorAll(".remove-icon_admin");

if (deleteBookingsIcon_admin) {
  deleteBookingsIcon_admin.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { orderId } = e.target.dataset;

      const confirmed = confirm("確定要刪除該訂單嗎？");

      if (confirmed) deleteBooking_admin(orderId);
    });
  });
}

const updateBookingBtn_admin = document.querySelectorAll(
  ".confirm-edit-icon_admin"
);

if (updateBookingBtn_admin) {
  updateBookingBtn_admin.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { orderId } = e.target.dataset;
      const dateTime = document.querySelector(".order-date-input").value;
      const paid =
        document.querySelector(".options-menu").value === "true" ? true : false;

      const quantities = [
        ...document.querySelectorAll(".all-orders input"),
      ].map((input) => input.value * 1);

      if (!dateTime) return showAlert("error", "請選擇日期時間");

      updateOrder_admin(orderId, dateTime, paid, quantities);
    });
  });
}

// SORT & FILTER
const sortFilterBtn = document.querySelector(".sort-filter-btn");
const sortFilterCon = document.querySelector(".sort-filter-container");

if (sortFilterBtn) {
  sortFilterBtn.addEventListener("click", (e) => {
    sortFilterCon.classList.toggle("show");
  });
}

if (sortFilterCon) {
  const applyFilterSortBtn = document.querySelector(".apply-filter-sort-btn");

  applyFilterSortBtn.addEventListener("click", (e) => {
    // const checkedItems = document.querySelectorAll('[type="radio"]');

    function queryValue(parentEle) {
      return [...document.querySelectorAll(`.${parentEle} [type="radio"]`)]
        .filter((input) => input.checked)
        .map((condition) => condition.dataset.condition)[0];
    }

    const querybj = {
      price: queryValue("sort-detail-con"),
      filter_price: queryValue("price-filter-detail"),
      filter_vege: queryValue("vegetarian-filter-detail"),
    };

    applyFilterSortBtn.children[0].setAttribute(
      "href",
      `/sort-filter-products/${querybj.price}/${querybj.filter_price}/${querybj.filter_vege}`
    );
  });
}

///// SEARCH //////
const searchInput = document.querySelector(".search-input");

function debounce(fn, delay = 1000) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

async function handleMenuDisplay() {
  const inputValue = searchInput.value;

  const res = await getAllProducts_api();

  const allProducts = res.data.data.doc;

  // const response = await fetch("products.json");
  // const data = await response.json();

  // btn, dropdown menu, and results display
  // handleDisplay(inputValue);

  // find search items
  const searchedProducts = allProducts.filter((product) =>
    product.name.includes(inputValue)
  );

  // render items
  let html = "";

  const logoutBtn = document.querySelector(".nav__el--logout");

  searchedProducts.forEach((product) => {
    html += `
      <div class='product-con'>
        <a href='/product/${product.eng}'>
          <img class='product-img ${product.eng}' src='/img/products/${
      product.imageCover
    }' data-overview-img='${product.imageCover}'>
        </a>
        <p class='name'>${product.name}</p>
        <p class='price'>${product.price}元 / 個</p>
        <p class='add-to-cart ${product._id}' data-logged-in=${
      logoutBtn ? "true" : "false"
    }>加入購物車</p>
      </div>
    `;
  });
  // <p class='add-to-cart ${product._id}' data-logged-in='true'>加入購物車</p>

  document.querySelector(".all-products-con").innerHTML = html;
}

if (searchInput) {
  searchInput.addEventListener("input", debounce(handleMenuDisplay, 500));
}

const alertMessage = document.querySelector("body").dataset.alert;

if (alertMessage) showAlert("success", alertMessage, 3.5);

const hamburgerMenu = document.getElementById("hamburger-menu");
if (hamburgerMenu) {
  const optionsCon = document.querySelector(".options-con");
  hamburgerMenu.addEventListener("click", (e) => {
    optionsCon.classList.toggle("options-con-show");
  });
}
