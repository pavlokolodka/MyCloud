// import express, { Express, Request, Response } from 'express';
import 'dotenv/config'
import StorageController from './storage/storage.controller';
import Server from './configuration/server';

const port = Number(process.env.PORT) || 3000;


const app = new Server(
  [
    new StorageController()
  ],
  port
);
app.listen()
