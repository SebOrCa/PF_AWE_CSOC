import { type Response } from 'express';
import mongoose from 'mongoose';

export const handleError = (res: Response, msg: string, error: unknown) => {
    if (error instanceof mongoose.Error.ValidationError) {
        const mensajes = Object.values(error.errors).map((e) => e.message);
        res.status(400).json({ ok: false, msg: mensajes.join('. ') });
        return;
    }

    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
        const campos = Object.keys(error.keyPattern ?? {}).join(', ');
        res.status(409).json({ ok: false, msg: `Ya existe un registro con ese valor de: ${campos}` });
        return;
    }

    console.log(error);
    res.status(500).json({ ok: false, msg });
};
