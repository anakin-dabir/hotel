import app from "./services/express.js";
import http from "http";
import connectDb from "./services/db.js";
import roomRouter from "./routes/v1/room.js";
import packageRouter from "./routes/v1/package.js";
import hotelRouter from "./routes/v1/hotel.js";
import config from "./config/config.js";

async function init() {
  const server = http.createServer(app);
  app.get("/", (req, res) => res.send("SERVER LISTENING ..."));
  app.use("/room", roomRouter);
  app.use("/package", packageRouter);
  app.use("/hotel", hotelRouter);

  // console.log(dayjs("2024-03-30").format("DD-MM-YYYY"));
  connectDb(config.MONGO || "mongodb://127.0.0.1:27017/Hotel");
  server.listen(process.env.PORT || config.PORT, () =>
    console.log(`Example app listening on PORT:${process.env.PORT} ...`)
  );
}

init();
