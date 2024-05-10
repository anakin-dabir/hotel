import dayjs from "dayjs";
import Package from "../models/Package.js";
import config from "../config/config.js";
import { addRate, toggleAvailability } from "../seed/xmlSeed.js";
import axios from "axios";
import { AVAILABILITY, RATE } from "../seed/googleEndpoints.js";
import _googleError from "../utils/_googleError.js";
import _googleResponseError from "../utils/_googleResponseError.js";
import PackageData from "../models/PackageData.js";

async function updateRate(req, res) {
  const {
    hotelId,
    roomId,
    packageId,
    date,
    data: { rate, availability },
  } = req.body;

  const _date = dayjs(date).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    hotelId,
    roomId,
    packageId,
    startDate: _date,
    endDate: _date,
    packageId: packageId,
    amountBeforeTax: rate,
  });

  const _googleAvailability = toggleAvailability({
    hotelId,
    roomId,
    packageId,
    startDate: _date,
    endDate: _date,
    available: availability,
  });

  const _googlePriceRequest = axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
  const _googleAvailabilityRequest = axios.post(
    AVAILABILITY,
    _googleAvailability,
    config.FETCH_OPTIONS
  );

  try {
    const responses = await Promise.all([_googlePriceRequest, _googleAvailabilityRequest]);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  try {
    const _package = await PackageData.updateOne(
      { _id: `${packageId}_${_date}` },
      { $set: { price: rate, availability } },
      { upsert: true }
    );

    return res.status(200).json({ message: "Updated Successfully", data: null });
  } catch (error) {
    return res.status(500).json({
      message: _googleError(error),
    });
    // return res.status(500).json({ message: error.message });
  }
}

async function updateBulkRate(req, res) {
  const {
    hotelId,
    roomId,
    packageId,
    date: { startDate, endDate },
    data: { rate, availability },
  } = req.body;

  const _googleStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const _googleEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    roomId,
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    packageId: packageId,
    amountBeforeTax: rate,
    hotelId,
  });

  const _googleAvailability = toggleAvailability({
    roomId,
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    packageId,
    available: availability,
    hotelId,
  });

  const _googlePriceRequest = axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
  const _googleAvailabilityRequest = axios.post(
    AVAILABILITY,
    _googleAvailability,
    config.FETCH_OPTIONS
  );

  try {
    const responses = await Promise.all([_googlePriceRequest, _googleAvailabilityRequest]);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  let packageOps = [];
  for (let date = dayjs(startDate); !date.isAfter(dayjs(endDate)); date = date.add(1, "day")) {
    const dateStr = date.format("YYYY-MM-DD");
    const _id = `${packageId}_${dateStr}`;
    packageOps.push({
      updateOne: {
        filter: { _id },
        update: { $set: { availability, price: rate } },
        upsert: true,
      },
    });
  }
  try {
    await PackageData.bulkWrite(packageOps);
  } catch (error) {
    return res.status(500).json({
      message: _googleError(error),
    });
  }
}

export { updateRate, updateBulkRate };
