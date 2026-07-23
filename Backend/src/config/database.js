import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const isProduction = process.env.NODE_ENV === "production";

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false, // Requerido para Supabase en Render
            },
          }
        : {},
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        define: {
          timestamps: true,
          underscored: true,
        },
      }
    );

export default sequelize;

