import * as authService from "../services/authService.js";

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    const result = await authService.login(username, password);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.message === "Invalid username or password") {
      res.status(401);
    }
    next(error);
  }
};

export const getMe = (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};
