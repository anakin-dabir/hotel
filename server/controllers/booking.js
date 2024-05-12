import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Razorpay from "razorpay";

async function validateHotelAvailability(req, res) {
  try {
    let { hotelId, packageId, roomId, room, dateRange } = req.params;
    dateRange = JSON.parse(dateRange);

    const data = await Room.aggregate([
      {
        $lookup: {
          from: "InventoryData",
          let: { roomId: Number(roomId), dateRange: dateRange },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $map: {
                        input: "$$dateRange",
                        as: "date",
                        in: { $concat: [{ $toString: "$$roomId" }, "_", "$$date"] },
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                date: 1,
                inventory: 1,
              },
            },
          ],
          as: "inventoryData",
        },
      },
      {
        $addFields: {
          inventoryCheck: {
            $not: [
              {
                $anyElementTrue: {
                  $map: {
                    input: "$inventoryData",
                    as: "item",
                    in: { $lt: ["$$item.inventory", Number(room)] },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          inventoryCheck: 1,
        },
      },
    ]);

    const payment = await Hotel.findById(hotelId, "payment_key");

    return res.status(200).json({ message: "", data: { payment, data } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    const { hotelId, totalPrice } = req.body;
    console.log({hotelId, totalPrice})
    const payment = await Hotel.findById(hotelId, "payment_key payment_secret");
    const instance = new Razorpay({
      key_id: payment.payment_key.keyId,
      key_secret: payment.payment_secret.keySecret,
    });

    const order = await instance.orders.create({
      amount: Number(totalPrice * 100),
      currency: "INR",
    });

    console.log(order);
    return res.status(200).json({ message: "", data: order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export { validateHotelAvailability, create };
