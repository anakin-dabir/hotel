import express from "express";
import {
  get,
  getRoomsByHotelID,
  login,
  create,
  getDataByHotelId,
  getBulkData,
} from "../../controllers/hotel.js";
import verifyToken from "../../middleware/verifyToken.js";

const hotelRouter = express.Router();

hotelRouter.get("/:hotelId", get);
hotelRouter.get("/rooms/:hotelId", verifyToken, getRoomsByHotelID);

// authentication
hotelRouter.post("/login", login);
hotelRouter.post("/create", create);
hotelRouter.get("/getDataByHotelId/:hotelId", getDataByHotelId);

// homePage
hotelRouter.get("/getBulkData/:hotelId", getBulkData);

export default hotelRouter;
