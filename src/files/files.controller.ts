import express, { Router } from "express";
import { HttpError } from "../utils/Error";
import FileService from './files.service';
import https from "https"



class FileController {
  private path = '/storage';
  public router = Router();
  private fileService: FileService;
 
  constructor() {
    this.fileService = new FileService();
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    // get file link 
    // this.router.get(`${this.path}/:id`, async (req, res) => {
    //   try {
    //     const id = req.params.id as string;
      
    //     const link = await this.fileService.getLink(id);
     
    //   return res.send(link);
    //   } catch (e) {
    //     console.log(e)
    //   }
      
    // });

    // download file (not work when we have get router with params before)
    this.router.get(`${this.path}/download`, async (req, res) => {
      try {
        const id = req.query.id as string;
        console.log('id', id)
        if (!id) throw new HttpError('file id not passed', 400);
        //const user = req.user.id
        // const file = await this.fileService.getFile(id);
        const file = await this.fileService.getFile(id);
        const name = file.name;
        
        https.get(file.link!, function (file) {
          res.set('Content-disposition', 'attachment; filename=' + encodeURI(name));
          // res.set('Content-Type', 'application/jpg');
          file.pipe(res);
        })
        // return res.download(link!, 'myfile.jpg')
      } catch (e) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status});
      }
    });
    
    // get all files + sort
    this.router.get(this.path, async (req, res) => {
      try {
        const sortBy = req?.query?.sort as string;
        // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/55718334#55718334
        // ADD USER
        const user = req?.user?.id;
        const parent = req?.query?.parent as string;
        console.log(sortBy)
        console.log('parent', parent)
      
        // if (!user) throw new HttpError('user not found', 404) // redirect to registration
        const files = await this.fileService.getAll(sortBy, user!, parent);
        return res.send(files);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status});
      } 
    });

    // create directory
    this.router.post(this.path, async (req, res) => {
      try {
        const name = req?.fields?.name as string;
        const type = req?.fields?.type as string;
        const parent = req?.fields?.parent as string;
        
        if (!(name && type) ) return res.status(400).send({message: 'name or type not passed', status: 400});
        
        const file = await this.fileService.createDirectory(name, type, parent); 
        return res.send(file);
      } catch(e: unknown) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status})
      }     
    })

    // save new file
    this.router.post(`${this.path}/create`, async (req, res) => {
      try {
        const reqFile: any = req?.files?.file;
        const parent = req?.fields?.parent as string;
    
        if (!reqFile) return res.status(400).send({message: 'file not passed', status: 400});

        const file = await this.fileService.create(reqFile, parent);

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
        const id = req?.params?.id;
       
        if (!id) throw new HttpError('file id not passed', 400);

        const file = await this.fileService.delete(id);

        return res.status(204);
      } catch (e) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status})
      }
    });
  }
}

export default FileController;