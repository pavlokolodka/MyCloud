import express, { Router } from "express";
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
      const file = await this.fileService.createDirectory(req, res);

      return res.send(file);
    })

    this.router.post(`${this.path}/create`, async (req, res) => {
      const file = await this.fileService.create(req, res);

      return res.send(file);
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