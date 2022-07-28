import express, { Router } from "express";
import { HttpError } from "../utils/Error";
import FileService from './files.service';



class FileController {
  private path = '/storage';
  public router = Router();
  private fileService: FileService;
 
  constructor() {
    this.fileService = new FileService();
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(`${this.path}/:id`, async (req, res) => {
      const id = req.params.id;
      
      const link = await this.fileService.getLink(`${id}`);
     
      return res.send(link);
    });

    // this.router.get(this.path, (req, res) => {
    //   return res.send('hi!')
    // });
    
    this.router.post(this.path, async (req, res) => {
      try {
        const name = req?.fields?.name as string;
        const type = req?.fields?.type as string;
        const parent = req?.fields?.parent as string;
        
        if (!(name && type) ) return res.status(400).send({message: 'name or type not passed', status: 400});
        
        const file = await this.fileService.createDirectory(name, type, parent); 
        return res.send(file);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) throw e;
        return res.status(e.status).send({message: e.message, status: e.status})
      }     
    })

    this.router.post(`${this.path}/create`, async (req, res) => {
      try {
        const reqFile: any = req?.files?.file;
        const parent = req?.fields?.parent as string;
    
        if (!reqFile) return res.status(400).send({message: 'file not passed', status: 400});

        const file = await this.fileService.create(reqFile, parent);

        return res.send(file);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) throw e;
        return res.status(e.status).send({message: e.message, status: e.status})
      }   
    });

    

    // this.router.put(`${this.path}/:id/update`, async (req, res) => {
    //   // const file = await this.fileService.update(req);
      
    // });

    // this.router.delete(`${this.path}/:id/delete`, async (req, res) => {
    //   // const file = await this.fileService.delete(req);
      
    // });
  }
}

export default FileController;