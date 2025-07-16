import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { imageRouter } from "./routers/images_router.js";
import { commentRouter } from "./routers/comments_router.js";
import { userRouter } from "./routers/users_router.js";
import { galleryRouter } from "./routers/galleries_router.js";
import path from "path";
import { fileURLToPath } from "url";

export const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/static", express.static("static"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.use((req, res, next) => {
  console.log("HTTP", req.method, req.url, req.body);
  next();
});

app.use("/api/images", imageRouter);
app.use("/api", commentRouter);
app.use("/api/users", userRouter);
app.use("/api/galleries", galleryRouter);

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server running at http://localhost:" + PORT);
});
