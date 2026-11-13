import mongoose from 'mongoose';

export const dbConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017', {
      dbName: process.env.DB_NAME || 'disfraces_express',
    });
    console.log('Base de datos conectada con exito');
  } catch (error) {
    console.log(error);
  }
};
