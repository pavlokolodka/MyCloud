import { Router } from "express";
import StorageService from './storage.service';



class StorageController {
  private path = '/storage';
  private router = Router();
  private storageService: StorageService;
  // private posts: Post[] = [
  //   {
  //     author: 'Marcin',
  //     content: 'Dolor sit amet',
  //     title: 'Lorem Ipsum',
  //   }
  // ];
 
  constructor() {
    this.storageService = new StorageService();
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, async (req, res) => {
      // const files = await this.storageService.getAll();
    });

    this.router.get(`${this.path}/:id`, async (req, res) => {
      const id = req.params.id;
      
      const link = await this.storageService.getLink(`${id}`);
     
      return res.send(link);
    });

    this.router.post(`${this.path}/create`, async (req, res) => {
      const file = await this.storageService.create(req);
      return res.send(file);
    });

    this.router.put(`${this.path}/:id/update`, async (req, res) => {
      // const file = await this.storageService.update(req);
      
    });

    this.router.delete(`${this.path}/:id/delete`, async (req, res) => {
      // const file = await this.storageService.delete(req);
      
    });
  }
 
  // getAllPosts = (request: express.Request, response: express.Response) => {
  //   response.send(this.posts);
  // }
 
  // createAPost = (request: express.Request, response: express.Response) => {
  //   const post: Post = request.body;
  //   this.posts.push(post);
  //   response.send(post);
  // }
}


export default StorageController;