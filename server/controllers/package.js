import Package from "../models/Package.js";
import Room from "../models/Room.js";
import PackageData from "../models/PackageData.js";
import InventoryData from "../models/InventoryData.js";
import Hotel from "../models/Hotel.js";
import dayjs from "dayjs";
import AutoIncrement from "../models/AutoIncrement.js";
import axios from "axios";
import { TRANSACTION } from "../seed/googleEndpoints.js";
import config from "../config/config.js";
import _googleResponseError from "../utils/_googleResponseError.js";
import { _updatePackage, createPackage } from "../seed/xmlSeed.js";
import _googleError from "../utils/_googleError.js";

async function create(req, res) {
  let {
    name,
    description,
    refundable,
    refundableUntilTime,
    internet,
    parking,
    meals,
    checkInTime,
    checkOutTime,
    roomId,
    hotelId,
  } = req.body;

  checkInTime = dayjs(checkInTime).toISOString();
  checkOutTime = dayjs(checkOutTime).toISOString();
  refundableUntilTime = dayjs(refundableUntilTime).toISOString();
  try {
    const autoIncrement = await AutoIncrement.findById("increment");
    const _googlePackageId = autoIncrement.packageId + 1;
    const room = await Room.findById(Number(roomId), "packages");

    const _googlePackage = createPackage({
      hotelId,
      roomId,
      packages: [...room.packages, _googlePackageId],
      packageId: _googlePackageId,
      packageData: {
        name,
        description,
        refundable,
        refundableUntilTime,
        internet,
        parking,
        meals,
        checkInTime,
        checkOutTime,
      },
    });

    const _googleResponse = await axios.post(TRANSACTION, _googlePackage, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(_googleResponse);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }

    const _package = await Package.create({
      name,
      description,
      time: {
        checkInTime,
        checkOutTime,
      },
      features: {
        internet: internet,
      },
      parking: {
        available: parking,
      },
      refundable: {
        available: refundable,
        refundableUntilTime,
      },
      meals,
      room: roomId,
    });

    await Room.findByIdAndUpdate(Number(roomId), {
      $push: { packages: _googlePackageId },
    });

    return res.status(200).json({ message: "Package created successfully", data: _package });
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }
}

async function updatePackage(req, res) {
  let {
    name,
    description,
    refundable,
    refundableUntilTime,
    internet,
    parking,
    meals,
    checkInTime,
    checkOutTime,
    roomId,
    hotelId,
    packageId,
  } = req.body;

  checkInTime = dayjs(checkInTime).toISOString();
  checkOutTime = dayjs(checkOutTime).toISOString();
  refundableUntilTime = dayjs(refundableUntilTime).toISOString();

  try {
    const _googlePackage = _updatePackage({
      hotelId,
      roomId,
      packageId,
      packageData: {
        name,
        description,
        refundable,
        refundableUntilTime,
        internet,
        parking,
        meals,
        checkInTime,
        checkOutTime,
      },
    });

    const _googleResponse = await axios.post(TRANSACTION, _googlePackage, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(_googleResponse);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
    const _package = await Package.findByIdAndUpdate(
      Number(packageId),
      {
        $set: {
          name,
          description,
          time: {
            checkInTime,
            checkOutTime,
          },
          features: {
            internet: internet,
          },
          parking: {
            available: parking,
          },
          refundable: {
            available: refundable,
            refundableUntilTime,
          },
          meals,
          room: roomId,
        },
      },
      { new: true }
    );

    return res.status(200).json({ message: "Package Updated successfully", data: _package });
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }
}

async function get(req, res) {
  const { packageId } = req.params;
  try {
    const _package = await Package.findById(packageId, "data");

    return res.status(200).json({ message: "", data: _package });
  } catch (error) {}
}

async function getInventoryDataByRoomId(req, res) {
  const { roomId, startDate, endDate } = req.params;
  const _startDate = dayjs(startDate).format("YYYY-MM-DD");
  const _endDate = dayjs(endDate).format("YYYY-MM-DD");
  try {
    const roomData = await Room.aggregate([
      { $match: { _id: Number(roomId) } },
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
      { $project: { inventoryData: 1 } },
    ]);

    return res.status(200).json({ message: "", data: roomData });
  } catch (error) {}
}

async function getPackageDataByRoomIdAndPackageId(req, res) {
  console.log(req.params);
  const { roomId, packageId, startDate, endDate } = req.params;
  const _startDate = dayjs(startDate).format("YYYY-MM-DD");
  const _endDate = dayjs(endDate).format("YYYY-MM-DD");
  try {
    const packageData = await Package.aggregate([
      { $match: { _id: Number(packageId) } },
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
      { $project: { packageData: 1 } },
    ]);

    return res.status(200).json({ message: "", data: packageData });
  } catch (error) {}
}

async function testing(req, res) {
  try {
    const room = await Room.findById(1, "packages");
    return res.status(200).json({ room });
  } catch (error) {
    return res.json({ error: error.message });
  }
}

async function search(req, res) {
  const { hotelId, room, adult, children } = req.params;
  let { dateRange } = req.params;
  dateRange = JSON.parse(dateRange);
  try {
    const hotel = await Hotel.aggregate([
      { $match: { id: Number(hotelId) } },
      {
        $lookup: {
          from: "Room",
          let: {
            roomIds: "$rooms",
            numAdults: Number(adult),
            numChildren: Number(children),
            requiredRooms: Number(room),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$roomIds"] }, // Ensures the room is one of the relevant rooms
                    { $gte: ["$capacity.adultCapacity", "$$numAdults"] }, // Checks adult capacity
                    { $gte: ["$capacity.childCapacity", "$$numChildren"] }, // Checks children capacity
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "InventoryData",
                let: { roomId: "$_id", dateRange: dateRange },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
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
                      let: { packageId: "$_id", dateRange: dateRange },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $in: [
                                    "$_id",
                                    {
                                      $map: {
                                        input: "$$dateRange",
                                        as: "date",
                                        in: {
                                          $concat: [{ $toString: "$$packageId" }, "_", "$$date"],
                                        },
                                      },
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
      {
        $addFields: {
          rooms: {
            $filter: {
              input: "$rooms",
              as: "room",
              cond: {
                $and: [
                  {
                    $eq: [{ $size: "$$room.inventoryData" }, dateRange.length],
                  },
                  {
                    $eq: [
                      { $size: { $arrayElemAt: ["$$room.packages.packageData", 0] } },
                      dateRange.length,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      { $project: { rooms: 1 } },
    ]);
    return res.status(200).json({ message: "", data: hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export {
  create,
  get,
  getInventoryDataByRoomId,
  testing,
  search,
  getPackageDataByRoomIdAndPackageId,
  updatePackage,
};
