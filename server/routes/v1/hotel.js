import express from "express";
import {
  get,
  getRoomsByHotelID,
  login,
  create,
  getDataByHotelId,
  getBulkData,
  updatePassword,
  createPayment
} from "../../controllers/hotel.js";
import verifyToken from "../../middleware/verifyToken.js";

const hotelRouter = express.Router();

hotelRouter.get("/:hotelId", get);
hotelRouter.get("/rooms/:hotelId", verifyToken, getRoomsByHotelID);

// authentication
hotelRouter.post("/login", login);
hotelRouter.post("/create", create);
hotelRouter.get("/getDataByHotelId/:hotelId", getDataByHotelId);

// update
hotelRouter.post("/updatePassword", updatePassword);

// homePage
hotelRouter.get("/getBulkData/:hotelId/:dateRange/:room/:adult/:children", getBulkData);

// payment
hotelRouter.post("/payment", createPayment)

export default hotelRouter;
