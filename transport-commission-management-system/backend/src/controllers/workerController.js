import * as workerService from "../services/workerService.js";

export const getWorkers = async (req, res, next) => {
  try {
    const workers = await workerService.getAllWorkers();
    res.json(workers);
  } catch (error) {
    next(error);
  }
};

export const createWorker = async (req, res, next) => {
  try {
    const { username, name, password } = req.body;
    if (!username || !name || !password) {
      res.status(400);
      throw new Error("Username, name, and password are required.");
    }

    const newWorker = await workerService.createWorker(req.body, req.user);
    res.status(201).json(newWorker);
  } catch (error) {
    if (error.message === "Username already exists") res.status(400);
    next(error);
  }
};

export const updateWorker = async (req, res, next) => {
  try {
    await workerService.updateWorker(req.params.id, req.body, req.user);
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    if (error.message === "User not found") res.status(404);
    next(error);
  }
};

export const deleteWorker = async (req, res, next) => {
  try {
    await workerService.deleteWorker(req.params.id, req.user);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    if (error.message === "Cannot delete primary admin user") res.status(400);
    next(error);
  }
};
