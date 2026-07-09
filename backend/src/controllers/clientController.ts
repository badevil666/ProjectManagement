import type { Request, Response } from 'express';
import { clientService } from '../container';
import { asyncHandler } from '../utils/asyncHandler';
import type {
  ClientCreateInput,
  ClientListQuery,
  ClientUpdateInput,
} from '../validators/clientValidators';

export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ClientListQuery;
  const result = await clientService.list(query);
  res.status(200).json(result);
});

export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.getById(req.params.id as string);
  res.status(200).json(client);
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.create(req.body as ClientCreateInput);
  res.status(201).json(client);
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.update(req.params.id as string, req.body as ClientUpdateInput);
  res.status(200).json(client);
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const force = req.query.force === 'true';
  await clientService.delete(req.params.id as string, force);
  res.status(204).send();
});
