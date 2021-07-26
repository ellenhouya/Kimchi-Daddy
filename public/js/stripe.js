import axios from "axios";
import { showAlert } from "./alerts";

export const makePayment = async (total, pickupTime) => {
  try {
    // stripe for front end, we need to include script
    // product.pug line 8
    const stripe = Stripe(
      "pk_test_51IwTHbG9rx0EoqxNXxZdxU5cMih2fxu5BSgZAWf2pbh1evYLla0P9518tU3BLmvhTHaYdfTEFnpRInxppQ2ObZ3500A60FappB"
    ); // public key for front end ; secret key for back end
    // 1) Get checkout session from endpoint (API)
    // we use get method so we don't need to specify the method

    const session = await axios(
      `/api/v1/bookings/checkout-session/${total}/${pickupTime}`
    );

    // 2) Create checkout form + charge credit card
    // https://stripe.com/docs/js/checkout/redirect_to_checkout
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
