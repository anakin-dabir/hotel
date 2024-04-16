import jwt from "jsonwebtoken";
import config from "../config/config.js";

export default function generateToken(data) {
  return jwt.sign(data, process.env.TOKEN || config.TOKEN);
}
