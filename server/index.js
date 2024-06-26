import app from "./services/express.js";
import http from "http";
import connectDb from "./services/db.js";
import roomRouter from "./routes/v1/room.js";
import packageRouter from "./routes/v1/package.js";
import hotelRouter from "./routes/v1/hotel.js";
import bookingRouter from "./routes/v1/booking.js";
import config from "./config/config.js";

async function init() {
  const server = http.createServer(app);
  app.get("/", (req, res) => res.send("SERVER LISTENING ..."));
  app.use("/room", roomRouter);
  app.use("/package", packageRouter);
  app.use("/hotel", hotelRouter);
  app.use("/booking", bookingRouter);

  // console.log(dayjs("2024-03-30").isAfter("2024-03-30"));
  connectDb(config.MONGO || "mongodb://127.0.0.1:27017/Hotel");
  server.listen(process.env.PORT || config.PORT, () =>
    console.log("Example app listening ..." + process.env.PORT || config.env.PORT)
  );
}

init();
