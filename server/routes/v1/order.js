import express from "express";
import verifyToken from "../../middleware/verifyToken.js";
import Razorpay from "razorpay";

const orderRouter = express.Router();

orderRouter.post("/create", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Number(50 * 100),
      currency: "INR",
      //   method: "upi",
    });

    console.log(order);
    return res.status(200).json({ message: "", data: order });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "" });
  }
});

export default orderRouter;
