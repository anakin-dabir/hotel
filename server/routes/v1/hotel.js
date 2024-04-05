import express from "express";
import { get, getRoomsByHotelID } from "../../controllers/hotel.js";

const hotelRouter = express.Router();

hotelRouter.get("/:hotelId", get);
hotelRouter.get("/rooms/:hotelId", getRoomsByHotelID);

export default hotelRouter;
