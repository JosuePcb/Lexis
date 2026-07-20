import sequelize from "../config/database.js";
import User from "./User.js";
import Course from "./Course.js";
import Enrollment from "./Enrollment.js";
import Assignment from "./Assignment.js";
import AssignmentAttachment from "./AssignmentAttachment.js";
import Submission from "./Submission.js";
import SubmissionFile from "./SubmissionFile.js";
import Announcement from "./Announcement.js";
import Comment from "./Comment.js";

// Course - User (Teacher)
Course.belongsTo(User, { as: "teacher", foreignKey: "teacherId" });
User.hasMany(Course, { as: "taughtCourses", foreignKey: "teacherId" });

// Enrollment (User - Course)
User.belongsToMany(Course, { through: Enrollment, foreignKey: "userId", as: "courses" });
Course.belongsToMany(User, { through: Enrollment, foreignKey: "courseId", as: "students" });
// One-to-many to access Enrollment model directly
User.hasMany(Enrollment, { foreignKey: "userId" });
Enrollment.belongsTo(User, { foreignKey: "userId" });
Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

// Assignment - Course
Assignment.belongsTo(Course, { as: "course", foreignKey: "courseId" });
Course.hasMany(Assignment, { as: "assignments", foreignKey: "courseId" });

// AssignmentAttachment - Assignment
AssignmentAttachment.belongsTo(Assignment, { as: "assignment", foreignKey: "assignmentId" });
Assignment.hasMany(AssignmentAttachment, { as: "attachments", foreignKey: "assignmentId" });

// Submission - Assignment
Submission.belongsTo(Assignment, { as: "assignment", foreignKey: "assignmentId" });
Assignment.hasMany(Submission, { as: "submissions", foreignKey: "assignmentId" });

// Submission - User (Student)
Submission.belongsTo(User, { as: "student", foreignKey: "userId" });
User.hasMany(Submission, { as: "submissions", foreignKey: "userId" });

// SubmissionFile - Submission
SubmissionFile.belongsTo(Submission, { as: "submission", foreignKey: "submissionId" });
Submission.hasMany(SubmissionFile, { as: "files", foreignKey: "submissionId" });

// Announcement - Course
Announcement.belongsTo(Course, { as: "course", foreignKey: "courseId" });
Course.hasMany(Announcement, { as: "announcements", foreignKey: "courseId" });

// Announcement - User (Publisher)
Announcement.belongsTo(User, { as: "publisher", foreignKey: "publishedBy" });
User.hasMany(Announcement, { as: "announcements", foreignKey: "publishedBy" });

// Comment - Announcement
Comment.belongsTo(Announcement, { as: "announcement", foreignKey: "announcementId" });
Announcement.hasMany(Comment, { as: "comments", foreignKey: "announcementId" });

// Comment - User
Comment.belongsTo(User, { as: "user", foreignKey: "userId" });
User.hasMany(Comment, { as: "comments", foreignKey: "userId" });

export {
    sequelize,
    User,
    Course,
    Enrollment,
    Assignment,
    AssignmentAttachment,
    Submission,
    SubmissionFile,
    Announcement,
    Comment
};
