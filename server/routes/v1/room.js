import express from "express";
import { create, getPackageByRoomID } from "../../controllers/room.js";

const roomRouter = express.Router();

roomRouter.post("/create", create);
roomRouter.get("/packages/:roomId", getPackageByRoomID);

export default roomRouter;
