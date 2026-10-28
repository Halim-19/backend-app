import { postsService } from '../services/posts.service.js';
import { AppError } from '../utils/AppError.js';

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new AppError('Invalid id', 400);
  return id;
};

export const getPosts = async (req, res) => {
  res.json(await postsService.getAll(res.locals.query));
};

export const getPost = async (req, res) => {
  res.json(await postsService.getById(parseId(req.params.id)));
};

export const createPost = async (req, res) => {
  const post = await postsService.create(req.body, req.user.id);
  res.status(201).json(post);
};

export const updatePost = async (req, res) => {
  res.json(await postsService.update(parseId(req.params.id), req.user.id, req.body));
};

export const deletePost = async (req, res) => {
  await postsService.remove(parseId(req.params.id), req.user.id);
  res.status(204).send();
};