import app from "./services/express.js";
import http from "http";
import axios from "axios";
import connectDb from "./services/db.js";
import generateId from "./utils/generateId.js";
import { AVAILABILITY, INVENTORY, RATE, TRANSACTION } from "./seed/googleEndpoints.js";
import getDate from "./utils/getTimestamp.js";
import dayjs from "dayjs";
import { addInventory, addRate, addRoom, toggleAvailability } from "./seed/xmlSeed.js";
import router from "./routes/route.js";
import roomRouter from "./routes/v1/room.js";
import packageRouter from "./routes/v1/package.js";
import hotelRouter from "./routes/v1/hotel.js";
import config from "./config/config.js";

async function init() {
  const server = http.createServer(app);
  //   const payload = `
  // <OTA_HotelInvCountNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05"
  //                           EchoToken="11122"
  //                           TimeStamp="2024-03-17T18:04:55.968Z"
  //                           Version="3.0">
  //   <Inventories HotelCode="10">
  //     <Inventory>
  //       <StatusApplicationControl Start="2024-03-18"
  //                                 End="2024-03-18"
  //                                 InvTypeCode="RoomID_2"/>
  //       <InvCounts>
  //         <InvCount Count="0" CountType="2"/>
  //       </InvCounts>
  //     </Inventory>
  //   </Inventories>
  // </OTA_HotelInvCountNotifRQ>

  // `;

  //   const fetchOptions = {
  //     headers: {
  //       "Content-Type": "application/xml",
  //     },
  //     body: payload,
  //   };

  //   app.get("/room", async (req, res) => {
  //     try {
  //       const date = dayjs().format("DD-MM-YYYY");
  //       console.log("Running ... ");
  //       const data = addRoom({
  //         roomId: "65f76347ce6302dc2cfa8a79",
  //         name: "Deluxe Room",
  //         packageId: "65f790e8de7e762a9a163b2b",
  //         packageName: "Deluxe Package",
  //         packageId2: "65f791097cc4234907d396bc",
  //         packageName2: "Simple Package",
  //       });
  //       const res = await axios.post(TRANSACTION, data, fetchOptions);
  //       return res.json({ message: "Success" });
  //     } catch (error) {
  //       return res.json({ error });
  //     }
  //   });

  app.get("/", (req, res) => res.send("SERVER LISTENING ..."));
  app.use("/v1/room", roomRouter);
  app.use("/v1/package", packageRouter);
  app.use("/v1/hotel", hotelRouter);

  // console.log(dayjs("2024-03-30").format("DD-MM-YYYY"));
  connectDb(config.MONGO || "mongodb://127.0.0.1:27017/Hotel");
  server.listen(process.env.POST || config.PORT, () => console.log("Example app listening ..."));
}

init();
