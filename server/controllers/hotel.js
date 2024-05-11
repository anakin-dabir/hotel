import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateId from "../utils/generateId.js";
import dayjs from "dayjs";
import mongoose from "mongoose";

async function get(req, res) {
  const { hotelId } = req.params;
  try {
    const hotel = await Hotel.findOne({ id: hotelId });
    return res.status(200).json({ message: "", data: hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getRoomsByHotelID(req, res) {
  const { hotelId } = req.params;
  try {
    const rooms = await Room.find({ hotel: hotelId }, "name images description capacity").populate(
      "packages",
      "name"
    );

    return res.status(200).json({ message: "", data: rooms });
  } catch (error) {}
}
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid email, Try again" });
    if (!user.isMatchedPassword(password))
      return res.status(404).json({ message: "Incorrect Password, Try Again" });

    let hotel = {};
    if (user.isSuperAdmin) {
      hotel = await Hotel.find({}, "name description time images").sort({ createdAt: -1 });
    } else {
      hotel = await Hotel.findOne({ user: user._id }).populate({
        path: "rooms",
        select: { inventoryData: 0 },
        populate: { path: "packages", select: { packageData: 0 } },
      });
    }
    const token = generateToken({ user });
    return res.status(200).json({
      message: "Login success",
      data: { hotel },
      token,
      admin: user.isSuperAdmin ? true : false,
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed, Try again" });
  }
}

async function create(req, res) {
  let {
    hotelId,
    email,
    name,
    tagLine,
    description,
    location,
    state,
    city,
    country,
    iframe,
    postalCode,
    phone,
    website,
    checkinTime,
    checkoutTime,
    amenities,
    edit,
  } = req.body;

  checkinTime = dayjs(checkinTime).toISOString();
  checkoutTime = dayjs(checkoutTime).toISOString();

  console.log({ checkinTime, checkoutTime, undefined: dayjs(undefined) });
  console.log({iframe})
  try {
    // Upsert the Hotel
    const hotel = await Hotel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(hotelId) || new mongoose.Types.ObjectId() },
      {
        name,
        description,
        tagLine,
        social: {
          email,
          phone,
          website,
        },
        address: {
          location,
          state,
          country,
          city,
          iframe,
          postalCode,
        },
        amenities,
        time: {
          checkinTime,
          checkoutTime,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!edit) {
      const userEmail = `${name.replace(/\s/g, "").toLowerCase()}@hotel.com`;
      const user = await User.create({ email: userEmail, password: generateId() });
      hotel.user = user._id;
    }
    await hotel.save();
    return res.status(200).json({
      message: `Hotel ${edit ? "edited" : "created"} successfully`,
      data: { hotel, edit },
    });
  } catch (error) {
    console.error("Error upserting hotel:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getDataByHotelId(req, res) {
  const { hotelId } = req.params;
  try {
    const hotel = await Hotel.findById(hotelId).populate("user", "email password");
    return res.status(200).json({ message: "", data: hotel });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getBulkData(req, res) {
  const { hotelId, startDate, endDate } = req.params;
  const _startDate = dayjs(startDate).format("YYYY-MM-DD");
  const _endDate = dayjs(endDate).format("YYYY-MM-DD");
  try {
    const hotel = await Hotel.aggregate([
      { $match: { id: Number(hotelId) } },
      {
        $lookup: {
          from: "Room",
          let: { roomIds: "$rooms" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$roomIds"] } } },
            {
              $lookup: {
                from: "InventoryData",
                let: { roomId: "$_id", startDate: _startDate, endDate: _endDate },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $gte: [
                              "$_id",
                              {
                                $concat: [{ $toString: "$$roomId" }, "_", "$$startDate"],
                              },
                            ],
                          },
                          {
                            $lte: [
                              "$_id",
                              {
                                $concat: [{ $toString: "$$roomId" }, "_", "$$endDate"],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "inventoryData",
              },
            },
            {
              $lookup: {
                from: "Package",
                let: { packageIds: "$packages" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$packageIds"] } } },
                  {
                    $lookup: {
                      from: "PackageData",
                      let: { packageId: "$_id", startDate: _startDate, endDate: _endDate },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $gte: [
                                    "$_id",
                                    {
                                      $concat: [{ $toString: "$$packageId" }, "_", "$$startDate"],
                                    },
                                  ],
                                },
                                {
                                  $lte: [
                                    "$_id",
                                    {
                                      $concat: [{ $toString: "$$packageId" }, "_", "$$endDate"],
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        },
                      ],
                      as: "packageData",
                    },
                  },
                ],
                as: "packages",
              },
            },
          ],
          as: "rooms",
        },
      },
    ]);

    return res.status(200).json({ message: "", data: hotel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updatePassword(req, res) {
  const { _id, password } = req.body;
  try {
    const user = await User.findByIdAndUpdate(_id, { password }, { new: true });
    return res.status(200).json({ message: "Credentials updated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Error in updating password" });
  }
}

export { get, getRoomsByHotelID, login, create, getDataByHotelId, getBulkData, updatePassword };
