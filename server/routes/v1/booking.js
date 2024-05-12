import express from "express";
import verifyToken from "../../middleware/verifyToken.js";
import { validateHotelAvailability, create } from "../../controllers/booking.js";

const bookingRouter = express.Router();

bookingRouter.get("/validateHotelAvailability/:hotelId/:roomId/:packageId/:room/:dateRange", validateHotelAvailability)

bookingRouter.post("/create", create);

export default bookingRouter;
