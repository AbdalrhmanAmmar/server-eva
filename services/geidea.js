// services/geidea.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const {
  GEIDEA_BASE_URL,
  GEIDEA_MERCHANT_ID,
  GEIDEA_API_PASSWORD,
  GEIDEA_TERMINAL_ID
} = process.env;

export const initiatePayment = async ({ amount, orderId, callbackUrl }) => {
  const payload = {
    amount,
    currency: "SAR",
    merchantId: GEIDEA_MERCHANT_ID,
    terminalId: GEIDEA_TERMINAL_ID,
    orderId,
    callbackUrl,
    paymentMethods: ["CARD"]
  };

  try {
    const response = await axios.post(
      `${GEIDEA_BASE_URL}/v1/directPayment`,
      payload,
      {
        auth: {
          username: GEIDEA_MERCHANT_ID,
          password: GEIDEA_API_PASSWORD,
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (err) {
    console.log(err)
    console.error("Payment error:", err.response?.data || err.message);
    throw new Error("Geidea payment initiation failed");
  }
};
