import express, { response } from "express";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import generateId from "../utils/generateId.js";
import { addInventory, addRate, toggleAvailability } from "../seed/xmlSeed.js";
import dayjs from "dayjs";
import axios from "axios";
import { AVAILABILITY, INVENTORY, RATE } from "../seed/googleEndpoints.js";

const router = express.Router();

router.get("/hotel/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    return res.json({ hotel });
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({});
    return res.json({ rooms });
  } catch (error) {
    return res.json({ error });
  }
});

const fetchOptions = {
  headers: {
    "Content-Type": "application/xml",
  },
};
router.post("/update", async (req, res) => {
  const { data } = req.body;
  try {
    const room = await Room.findById("65f76347ce6302dc2cfa8a79");
    const nestedObj = room.data.get("2024").get("3").get(data.date);
    nestedObj.price = data.item.price;
    nestedObj.availability = data.item.availability;
    nestedObj.inventory = data.item.inventory;
    room.markModified(`data.2024.3.${data.date}`);
    await room.save();

    const date = dayjs(`2024-03-${data.date}`).format("DD-MM-YYYY");
    const price = addRate({
      roomId: "65f76347ce6302dc2cfa8a79",
      startDate: date,
      endDate: date,
      packageId: "65f791097cc4234907d396bc",
      amountBeforeTax: data.item.price,
    });

    const availability = toggleAvailability({
      roomId: "65f76347ce6302dc2cfa8a79",
      startDate: date,
      endDate: date,
      packageId: "65f791097cc4234907d396bc",
      available: data.item.availability,
    });

    const inventory = addInventory({
      roomId: "65f76347ce6302dc2cfa8a79",
      startDate: date,
      endDate: date,
      inventory: data.item.inventory,
    });
    const priceReq = axios.post(RATE, price, fetchOptions);
    const inventoryReq = axios.post(INVENTORY, inventory, fetchOptions);
    const availabilityReq = axios.post(AVAILABILITY, availability, fetchOptions);

    Promise.all([priceReq, inventoryReq, availabilityReq])
      .then(([response1, response2, response3]) => {
        if (response1.data.includes("Error")) {
          throw new Error("Server Error");
        }
        if (response2.data.includes("Error")) {
          throw new Error("Server Error");
        }
        if (response3.data.includes("Error")) {
          throw new Error("Server Error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return res.status(200).json({ msg: "Done", room });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
