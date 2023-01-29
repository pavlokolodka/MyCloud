import express, { Router } from "express";
import { HttpError } from "../utils/Error";
import FileService from './files.service';
import https from "https"
import { uploadMiddlware } from "../middleware/uploadMiddleware";
import { ICreateDirectoryDto } from "./dto/create-directory.dto";
import { IGetFilesDto } from "./dto/get-files.dto";

class FileController {
  private path = '/storage';
  public router = Router();
  private fileService: FileService;
 
  constructor() {
    this.fileService = new FileService();
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    // download file 
    this.router.get(`${this.path}/download`, async (req, res) => {
      try {
        const id = req.query.id as string;
        const token = req.headers['authorization']
       
        if (!token) throw new HttpError('Invalid JWT token', 401);

        if (!id) throw new HttpError('file id not passed', 400);
     
        const file = await this.fileService.getFile(id, token);
        const name = file.name;
      
        https.get(file.link!, function (file) {
          res.set('Content-disposition', 'attachment; filename=' + encodeURI(name));
        
          file.pipe(res);
        })
      } catch (e) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status});
      }
    });
    
    // get all files + sort
    this.router.get(this.path, async (req, res) => {
      try {
        // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/55718334#55718334
        const token = req.headers['authorization']
       
        if (!token) throw new HttpError('Invalid JWT token', 401)
       
        const {sortBy, parent}: IGetFilesDto = req.query as unknown as IGetFilesDto;
        const files = await this.fileService.getAll(sortBy, token, parent);

        return res.send(files);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status});
      } 
    });

    // create directory
    this.router.post(this.path, async (req, res) => {
      try {
        const {name, type, parent}: ICreateDirectoryDto = req.body;
        const token = req.headers['authorization']
      
        if (!token) throw new HttpError('Invalid JWT token', 401)
       
        
        if (!(name && type) ) return res.status(400).send({message: 'name or type not passed', status: 400});
        
        const file = await this.fileService.createDirectory(name, type, token, parent); 
        return res.send(file);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status})
      }     
    })

    // save new file
    this.router.post(`${this.path}/create`, uploadMiddlware, async (req, res) => {
      try {
        const token = req.headers['authorization']
       
        if (!token) throw new HttpError('Invalid JWT token', 401)
        
        const reqFile: any = req.files?.file;
        const parent = req.fields?.parent as string;
    
        if (!reqFile) return res.status(400).send({message: 'file not passed', status: 400});

        const file = await this.fileService.create(reqFile, token, parent);

        return res.send(file);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status})
      }   
    });

    

    // this.router.put(`${this.path}/:id/update`, async (req, res) => {
    //   // const file = await this.fileService.update(req);
      
    // });

    this.router.delete(`${this.path}/:id/delete`, async (req, res) => {
      try { 
        const token = req.headers['authorization'];
       
        if (!token) throw new HttpError('Invalid JWT token', 401);

        const id = req.params?.id;
       
        if (!id) throw new HttpError('file id not passed', 400);
        
        const file = await this.fileService.delete(id, token);
       
        return res.status(204).send('');
      } catch (e) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status})
      }
    });
  }
}

export default FileController;