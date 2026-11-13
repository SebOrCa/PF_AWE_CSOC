/**
 * Ruta base de la API. Es relativa a propósito: en desarrollo la atiende el proxy
 * de `ng serve` (proxy.conf.json) y en Docker el proxy de nginx (nginx.conf);
 * ambos la reenvían al backend, así que el navegador siempre habla con el mismo origen.
 */
export const API_URL = '/api';
