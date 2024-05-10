import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

export default app;
