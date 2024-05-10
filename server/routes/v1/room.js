import express from "express";
import { create, getPackageByRoomID, updateRoom, deleteAllRooms } from "../../controllers/room.js";

const roomRouter = express.Router();

//get
roomRouter.get("/packages/:roomId", getPackageByRoomID);

// create
roomRouter.post("/create", create);

//edit
roomRouter.post("/edit", updateRoom);

//delete
roomRouter.post("/deleteAll", deleteAllRooms);

export default roomRouter;
