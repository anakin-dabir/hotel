import Room from "../models/Room.js";

async function get(req, res) {}

async function getRoomsByHotelID(req, res) {
  const { hotelId } = req.params;
  try {
    const rooms = await Room.find({ hotel: hotelId }, "name").populate("packages", "name");

    return res.status(200).json({ message: "", data: rooms });
  } catch (error) {}
}

export { get, getRoomsByHotelID };
