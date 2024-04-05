import Package from "../models/Package.js";

async function create(req, res) {
  const { name, roomId } = req.body;
  try {
    const _package = await Package.create({
      name,
      room: roomId,
    });
    return res.status(200).json({ message: "Package created successfully", data: _package });
  } catch (error) {}
}

async function get(req, res) {
  const { packageId } = req.params;
  try {
    const _package = await Package.findById(packageId, "data");

    return res.status(200).json({ message: "", data: _package });
  } catch (error) {}
}

async function getDataByRoomIdandPackageId(req, res) {
  const { roomId, packageId } = req.params;
  console.log(packageId);
  try {
    const _package = await Package.findById(packageId, "data");

    console.log(_package);
    return res.status(200).json({ message: "", data: _package });
  } catch (error) {}
}

export { create, get, getDataByRoomIdandPackageId };
