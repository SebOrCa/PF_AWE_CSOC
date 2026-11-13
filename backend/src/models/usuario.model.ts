import mongoose from 'mongoose';

export const ROLES = ['cliente', 'administrador'] as const;
export type RolUsuario = (typeof ROLES)[number];

export const MIN_PASSWORD_LENGTH = 6;

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son obligatorios'],
        trim: true,
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'El correo no es válido'],
    },
    contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        select: false,
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true,
    },
    rol: {
        type: String,
        required: true,
        default: 'cliente',
        enum: { values: [...ROLES], message: 'El rol debe ser cliente o administrador' },
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, { _id, __v, contrasena, ...rest }: Record<string, unknown>) => ({
            ...rest,
            id: String(_id),
            clienteDesde: rest.createdAt instanceof Date ? rest.createdAt.getFullYear() : undefined,
        }),
    },
});

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema);
