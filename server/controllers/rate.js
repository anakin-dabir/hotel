import dayjs from "dayjs";
import Package from "../models/Package.js";
import config from "../config/config.js";
import { addRate } from "../seed/xmlSeed.js";
import axios from "axios";
import { RATE } from "../seed/googleEndpoints.js";
import _googleError from "../utils/_googleError.js";
import _googleResponseError from "../utils/_googleResponseError.js";
async function updateRate(req, res) {
  const {
    packageId,
    date,
    data: { rate },
  } = req.body;

  const _googleDate = dayjs(date).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    roomId: "660f746afd0a66fcc8c831b5",
    startDate: _googleDate,
    endDate: _googleDate,
    packageId: packageId,
    amountBeforeTax: rate,
    hotelId: 20,
  });

  try {
    const _googleResponse = await axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(_googleResponse);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
    const _package = await Package.findById(packageId);
    const data = _package.data;
    if (data.get(dayjs(date).format("YYYY/MM/DD")) == undefined) {
      data.set(dayjs(date).format("YYYY/MM/DD"), [
        rate,
        config.DEFAULT_AVAILABILITY,
        config.DEFAULT_INVENTORY,
      ]);
    } else {
      const dataArray = data.get(dayjs(date).format("YYYY/MM/DD"));
      dataArray[0] = rate;
    }
    _package.markModified("data");
    await _package.save();
    return res.status(200).json({ message: "Updated Successfully", data: _package });
  } catch (error) {
    return res.status(500).json({
      message: _googleError(error),
    });
    // return res.status(500).json({ message: error.message });
  }
}

async function updateBulkRate(req, res) {
  const {
    packageId,
    date: { startDate, endDate },
    data: { rate },
  } = req.body;

  const _googleStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const _googleEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    roomId: "660f746afd0a66fcc8c831b5",
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    packageId: packageId,
    amountBeforeTax: rate,
    hotelId: 20,
  });

  try {
    const _googleResponse = await axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(_googleResponse);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
    const _package = await Package.findById(packageId);
    const data = _package.data;
    for (
      let curDate = new Date(startDate);
      curDate <= new Date(endDate);
      curDate.setDate(curDate.getDate() + 1)
    ) {
      if (data.get(dayjs(curDate).format("YYYY/MM/DD")) == undefined) {
        data.set(dayjs(curDate).format("YYYY/MM/DD"), [
          rate,
          config.DEFAULT_AVAILABILITY,
          config.DEFAULT_INVENTORY,
        ]);
      } else {
        const dataArray = data.get(dayjs(curDate).format("YYYY/MM/DD"));
        dataArray[0] = rate;
      }
    }
    _package.markModified("data");
    await _package.save();
    return res.status(200).json({ message: "Updated successfully", data: _package });
  } catch (error) {
    return res.status(500).json({
      message: _googleError(error),
    });
  }
}

export { updateRate, updateBulkRate };
