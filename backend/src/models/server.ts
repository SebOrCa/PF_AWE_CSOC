import express, { type Application } from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes.ts';
import usuariosRoutes from '../routes/usuarios.routes.ts';
import { dbConnection } from '../database/config.ts';

export class Server {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8080';

    this.connectDB();
    this.middlewares();
    this.routes();
  }

  private async connectDB() {
    await dbConnection();
  }

  private middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes() {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/usuarios', usuariosRoutes);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}
