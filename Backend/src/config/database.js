import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
  process.env.DB_NAME || "lexis_db",
  process.env.DB_USER || "lexis",
  process.env.DB_PASSWORD || "lexis_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5433,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export default sequelize;
