const express = require("express");
const auth = require("../middleware/auth.middleware");
const { validateBody, validateQuery } = require("../middleware/validate");
const {
  createUserSchema,
  getUsersSchema,
  changePasswordSchema,
} = require("../validators/users.validator");
const userController = require("../controllers/user.controller");

const router = express.Router();

// admin create user
router.post(
  "/create-user",
  auth(["admin"]),
  validateBody(createUserSchema),
  userController.createUser
);

// user set first password (không cần login)
router.post("/set-first-password", userController.setFirstPassword);

router.get(
  "/get-users",
  auth(["admin"]),
  validateQuery(getUsersSchema),
  userController.getUsers
);

router.delete(
  "/delete-user/:userId",
  auth(["admin"]),
  userController.deleteUser
);
router.get("/get-user/:id", auth(["admin"]), userController.getUserById);

router.put(
  "/change-password",
  auth(["admin", "teacher", "student"]),
  validateBody(changePasswordSchema),
  userController.changePassword
);
router.put("/update-user/:id", auth(["admin"]), userController.updateUser);

router.put(
  "/update-status/:id",
  auth(["admin"]),
  userController.updateUserStatus
);
router.put(
  "/profile",
  auth(["admin", "teacher", "student"]),
  userController.updateProfile
);
module.exports = router;
