import Package from "../models/Package.js";
import Room from "../models/Room.js";
import config from "../config/config.js";
async function create(req, res) {
  const { name, hotelId } = req.body;
  try {
    const room = await Room.create({
      name,
      hotel: hotelId,
    });
    const _package = await Package.create({
      name: config.DEFAULT_PACKAGE_DETAILS.NAME,
      description: config.DEFAULT_PACKAGE_DETAILS.DESCRIPTION,
    });
    room.packages.push(_package);
    await room.save();
    return res.status(200).json({ message: "Room creation successfull", data: room });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function get(req, res) {}

async function getPackageByRoomID(req, res) {
  const { roomId } = req.params;
  try {
    const _package = await Package.find({ room: roomId }, "name");

    return res.status(200).json({ message: "", data: _package });
  } catch (error) {}
}

export { create, get, getPackageByRoomID };
