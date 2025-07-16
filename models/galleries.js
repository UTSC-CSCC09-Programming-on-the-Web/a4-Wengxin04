import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";

export const Gallery = sequelize.define("Gallery", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

Gallery.belongsTo(User);
User.hasOne(Gallery, {
  onDelete: "CASCADE",
});
