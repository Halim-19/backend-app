import { userService } from '../services/user.service.js';
import { AppError } from '../utils/AppError.js';

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new AppError('Invalid user id', 400);
  return id;
};

export const getUsers = async (req, res) => {
  res.json(await userService.getAll(res.locals.query));
};

export const getUser = async (req, res) => {
  res.json(await userService.getById(parseId(req.params.id)));
};



export const updateUser = async (req, res) => {
  res.json(await userService.update(parseId(req.params.id), req.body));
};

export const deleteUser = async (req, res) => {
  await userService.remove(parseId(req.params.id));
  res.status(204).send();
};