import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateId from "../utils/generateId.js";
import dayjs from "dayjs";

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
        select: "name images description capacity",
        populate: { path: "packages", select: "name" },
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
  const {
    email,
    name,
    tagLine,
    description,
    location,
    state,
    city,
    country,
    longitude,
    latitude,
    postalCode,
    phone,
    website,
    checkinTime,
    checkoutTime,
    amenities,
  } = req.body;
  try {
    const hotel = await Hotel.create({
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
        latitude,
        longitude,
        postalCode,
      },
      amenities,
      time: {
        checkinTime: dayjs(checkinTime).format("hh:mm A"),
        checkoutTime: dayjs(checkoutTime).format("hh:mm A"),
      },
    });
    const user = await User.create({
      email: `${name.replace(/\s/g, "").toLowerCase()}@hotel.com`,
      password: generateId(),
    });
    hotel.user = user;
    await hotel.save();
    return res.status(200).json({ message: "Hotel created successfully", data: { hotel } });
  } catch (error) {
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
  const { hotelId } = req.params;
  try {
    const hotel = await Hotel.findOne({ id: hotelId }, "_id");
    const rooms = await Room.find({ hotel: hotel._id }).populate({
      path: "packages",
    });

    return res.status(200).json({ message: "", data: rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { get, getRoomsByHotelID, login, create, getDataByHotelId, getBulkData };
