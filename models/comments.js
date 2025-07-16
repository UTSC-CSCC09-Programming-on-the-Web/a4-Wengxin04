import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Image } from "./images.js";

export const Comment = sequelize.define("Comment", {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Comment.belongsTo(Image);
Image.hasMany(Comment, {
  onDelete: "CASCADE",
});
