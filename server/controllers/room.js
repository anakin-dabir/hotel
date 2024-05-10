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
import AutoIncrement from "../models/AutoIncrement.js";
import _googleError from "../utils/_googleError.js";

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

  const maxCapacity = Number(adultCapacity) + Number(childCapacity);
  const autoIncrement = await AutoIncrement.findById("increment");
  const _googleRoomId = autoIncrement.roomId + 1;
  const _googlePackageId = autoIncrement.packageId + 1;
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
    packageData: {
      parking: config.DEFAULT_PACKAGE_DETAILS.PARKING_AVAILABLE,
      refundable: config.DEFAULT_PACKAGE_DETAILS.REFUNDABLE_AVAILABLE,
      internet: config.DEFAULT_PACKAGE_DETAILS.INTERNET_AVAILABLE,
      description: config.DEFAULT_PACKAGE_DETAILS.DESCRIPTION,
      name: config.DEFAULT_PACKAGE_DETAILS.NAME,
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
      room: _googleRoomId,
      name: config.DEFAULT_PACKAGE_DETAILS.NAME,
      description: config.DEFAULT_PACKAGE_DETAILS.DESCRIPTION,
      features: {
        internet: config.DEFAULT_PACKAGE_DETAILS.INTERNET_AVAILABLE,
      },
      parking: {
        available: config.DEFAULT_PACKAGE_DETAILS.PARKING_AVAILABLE,
      },
      refundable: {
        available: config.DEFAULT_PACKAGE_DETAILS.REFUNDABLE_AVAILABLE,
      },
    });
    room.packages.push(_package);
    await room.save();
    hotel.rooms.push(room);
    await hotel.save();
    return res.status(200).json({ message: "Room creation successfull", data: { room } });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: _googleError(error) });
  }
}

async function updateRoom(req, res) {
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
    roomId,
  } = req.body;

  const maxCapacity = Number(adultCapacity) + Number(childCapacity);
  const _googleRoomId = Number(roomId);
  const _googleBeds = expandBeds(beds);

  const _googleRoom = updateRoom({
    hotelId: _googleId,
    roomId: _googleRoomId,
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
    const room = await Room.findById(Number(roomId), { inventoryData: 0 }).populate({
      path: "packages",
      select: { packageData: 0 },
    });

    Object.assign(room, {
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

    await room.save();
    return res.status(200).json({ message: "Room Updated Successfuly", data: room });
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
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

async function deleteAllRooms(req, res) {
  const { hotelId, roomId } = req.body;
  try {
  } catch (error) {}
}

export { create, get, getPackageByRoomID, updateRoom, deleteAllRooms };
