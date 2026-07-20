import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AssignmentAttachment = sequelize.define("AssignmentAttachment", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    assignmentId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

export default AssignmentAttachment;
