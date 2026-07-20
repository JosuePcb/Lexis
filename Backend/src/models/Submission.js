import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Submission = sequelize.define("Submission", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    assignmentId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "submitted",
    },
    submissionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    teacherComment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
});

export default Submission;
