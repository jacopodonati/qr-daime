import express, { Router } from "express";
import serverless from "serverless-http";
const app = require('../../../app');

const api = express();
const indexRouter = require('./routes/index');

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

api.use("/api/", router);
api.use("/idx/", indexRouter);

export const handler = serverless(api);
