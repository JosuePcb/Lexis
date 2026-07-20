import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Course = sequelize.define("Course", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    section: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    timestamps: true,
});

export default Course;
