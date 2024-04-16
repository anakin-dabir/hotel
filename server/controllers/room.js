import Package from "../models/Package.js";
import Room from "../models/Room.js";
import config from "../config/config.js";
import Hotel from "../models/Hotel.js";
import { addRoom } from "../seed/xmlSeed.js";
import expandBeds from "../utils/expandBeds.js";
import mongoose from "mongoose";
import { TRANSACTION } from "../seed/googleEndpoints.js";
import _googleResponseError from "../utils/_googleResponseError.js";
import axios from "axios";
async function create(req, res) {
  const {
    _googleId,
    hotelId,
    name,
    description,
    minAge = 10,
    adultCapacity,
    childCapacity = 0,
    minCapacity = 1,
    smoking,
    mobilityAccessible,
    openAirBath,
    airConditioning,
    balcony,
    washroomType,
    electronicBidget,
    bathTub,
    shower,
    mobilityAccessibleW,
    beds,
  } = req.body;

  const maxCapacity = (Number(adultCapacity) + Number(childCapacity)).toString();

  const _googleRoomId = new mongoose.Types.ObjectId();
  const _googlePackageId = new mongoose.Types.ObjectId();
  const _googleBeds = expandBeds(beds);

  const _googleRoom = addRoom({
    hotelId: _googleId,
    roomId: _googleRoomId,
    packageId: _googlePackageId,
    roomData: {
      name,
      description,
      capacity: {
        minCapacity,
        childCapacity,
        adultCapacity,
        maxCapacity,
        minAge,
      },
      features: {
        smoking,
        mobilityAccessible,
        openAirBath,
        airConditioning,
        balcony,
      },
      washroom: {
        washroomType,
        electronicBidget,
        bathTub,
        shower,
        mobilityAccessible: mobilityAccessibleW,
      },
      beds: _googleBeds,
    },
  });

  try {
    const _googleResponse = await axios.post(TRANSACTION, _googleRoom, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(_googleResponse);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
    const hotel = await Hotel.findById(hotelId);
    const room = await Room.create({
      _id: _googleRoomId,
      name,
      hotel: hotelId,
      description,
      capacity: {
        minAge,
        adultCapacity,
        minCapacity,
        childCapacity,
        totalCapacity: maxCapacity,
      },
      features: {
        smoking,
        mobilityAccessible,
        openAirBath,
        airConditioning,
        balcony,
      },
      washroom: {
        relation: washroomType,
        electronicBidget,
        bathTub,
        shower,
        mobilityAccessible: mobilityAccessibleW,
      },
      beds,
    });
    const _package = await Package.create({
      _id: _googlePackageId,
      name: config.DEFAULT_PACKAGE_DETAILS.NAME,
      description: config.DEFAULT_PACKAGE_DETAILS.DESCRIPTION,
    });
    room.packages.push(_package);
    await room.save();
    hotel.rooms.push(room);
    await hotel.save();
    return res.status(200).json({ message: "Room creation successfull", data: { room } });
  } catch (error) {
    console.log(error.message);
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
