import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:5000",
    headers: {
        "Content-Type": "application/json",
    },
});

export const categoriasAPI = {
    listar: () => api.get("/categorias"),
    detalle: (id) => api.get(`/categorias/${id}`),
    crear: (datos) => api.post("/categorias", datos),
    actualizar: (id, datos) => api.put(`/categorias/${id}`, datos),
    eliminar: (id) => api.delete(`/categorias/${id}`),
};

export const productosAPI = {
    listar: () => api.get("/products"),
    detalle: (id) => api.get(`/products/${id}`),
    crear: (datos) => api.post("/products", datos),
    actualizar: (id, datos) => api.put(`/products/${id}`, datos),
    eliminar: (id) => api.delete(`/products/${id}`),
};

export const entradasAPI = {
    listar: () => api.get("/entradas"),
    detalle: (id) => api.get(`/entradas/${id}`),
    crear: (datos) => api.post("/entradas", datos),
    actualizar: (id, datos) => api.put(`/entradas/${id}`, datos),
    eliminar: (id) => api.delete(`/entradas/${id}`),
};

export default api;
