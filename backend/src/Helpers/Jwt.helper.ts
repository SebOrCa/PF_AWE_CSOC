import jwt from 'jsonwebtoken';

export const generateJWT = (uid: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        const secretKey = process.env.JWT_SECRET;

        if (!secretKey) {
            reject(new Error('No se ha definido un valor para JWT_SECRET en las variables de entorno'));
            return;
        }

        jwt.sign(payload, secretKey, {
            expiresIn: '4h'
        }, (error, token) => {
            if (error) {
                console.log(error);
                reject(new Error('Error al generar el token'));
            } else {
                resolve(token as string);
            }
        });
    })
}

// Devuelve el uid guardado en el token. Lanza un error si el token es invalido o expiro.
export const verifyJWT = (token: string): string => {
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        throw new Error('No se ha definido un valor para JWT_SECRET en las variables de entorno');
    }

    const payload = jwt.verify(token, secretKey);

    if (typeof payload === 'string' || typeof payload.uid !== 'string') {
        throw new Error('Token invalido');
    }

    return payload.uid;
}
