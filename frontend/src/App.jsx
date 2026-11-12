import {useEffect, useState} from "react";
import {
    LayoutDashboard,
    Tags,
    Package,
    ClipboardList,
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    Menu,
} from "lucide-react";

import {categoriasAPI, productosAPI, entradasAPI} from "./assets/api";

import "./App.css";

const modulos = {
    categorias: {
        titulo: "Categorías",
        endpoint: categoriasAPI,
        id: "categoria_id",
        campos: [
            {nombre: "nombre", etiqueta: "Nombre", tipo: "text"},
            {nombre: "descripcion", etiqueta: "Descripción", tipo: "text"},
        ],
    },

    productos: {
        titulo: "Productos",
        endpoint: productosAPI,
        id: "producto_id",
        campos: [
            {nombre: "nombre", etiqueta: "Nombre", tipo: "text"},
            {nombre: "descripcion", etiqueta: "Descripción", tipo: "text"},
            {nombre: "precio", etiqueta: "Precio", tipo: "number"},
            {nombre: "categoria_id", etiqueta: "ID de categoría", tipo: "number"},
            {nombre: "disponible", etiqueta: "Disponible", tipo: "boolean"},
        ],
    },

    entradas: {
        titulo: "Entradas",
        endpoint: entradasAPI,
        id: "entrada_id",
        campos: [
            {nombre: "entra_producto_id", etiqueta: "ID del producto", tipo: "number"},
            {nombre: "entra_cantidad", etiqueta: "Cantidad", tipo: "number"},
            {nombre: "entra_stock_min", etiqueta: "Stock mínimo", tipo: "number"},
            {nombre: "entra_stand", etiqueta: "Stand", tipo: "text"},
            {nombre: "entra_ubicacion", etiqueta: "Ubicación", tipo: "text"},
        ],
    },
};

function extraerLista(respuesta) {
    const datos = respuesta.data;

    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.data)) return datos.data;
    if (Array.isArray(datos?.items)) return datos.items;
    if (Array.isArray(datos?.categorias)) return datos.categorias;
    if (Array.isArray(datos?.productos)) return datos.productos;
    if (Array.isArray(datos?.entradas)) return datos.entradas;

    return [];
}

function App() {
    const [modulo, setModulo] = useState("categorias");
    const [registros, setRegistros] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [formulario, setFormulario] = useState({});
    const [registroEditando, setRegistroEditando] = useState(null);
    const [modal, setModal] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [menuAbierto, setMenuAbierto] = useState(false);

    const configuracion = modulos[modulo];

    async function cargarDatos() {
        setCargando(true);
        setError("");

        try {
            const respuesta = await configuracion.endpoint.listar();
            setRegistros(extraerLista(respuesta));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar los registros. Verifica Flask.");
            setRegistros([]);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
        setBusqueda("");
        setModal(false);
    }, [modulo]);

    function cambiarModulo(nombre) {
        setModulo(nombre);
        setMenuAbierto(false);
    }

    function abrirNuevo() {
        setRegistroEditando(null);

        const valores = {};

        configuracion.campos.forEach((campo) => {
            valores[campo.nombre] = campo.tipo === "boolean" ? true : "";
        });

        setFormulario(valores);
        setModal(true);
    }

    function abrirEditar(registro) {
        setRegistroEditando(registro);

        const valores = {};

        configuracion.campos.forEach((campo) => {
            valores[campo.nombre] = registro[campo.nombre] ?? "";
        });

        setFormulario(valores);
        setModal(true);
    }

    function actualizarCampo(nombre, valor) {
        setFormulario((anterior) => ({
            ...anterior,
            [nombre]: valor,
        }));
    }

    async function guardarRegistro(e) {
        e.preventDefault();

        try {
            const datos = {};

            configuracion.campos.forEach((campo) => {
                const valor = formulario[campo.nombre];

                if (campo.tipo === "number") {
                    datos[campo.nombre] = Number(valor);
                } else {
                    datos[campo.nombre] = valor;
                }
            });

            if (registroEditando) {
                const id = registroEditando[configuracion.id] ?? registroEditando.id;

                await configuracion.endpoint.actualizar(id, datos);
                alert("Registro actualizado correctamente.");
            } else {
                await configuracion.endpoint.crear(datos);
                alert("Registro creado correctamente.");
            }

            setModal(false);
            cargarDatos();
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo guardar el registro. Revisa los datos.");
        }
    }

    async function eliminarRegistro(registro) {
        const id = registro[configuracion.id] ?? registro.id;

        if (id === undefined || id === null) {
            alert("No se encontró el identificador del registro.");
            return;
        }

        if (!window.confirm("¿Deseas eliminar este registro?")) return;

        try {
            await configuracion.endpoint.eliminar(id);
            alert("Registro eliminado correctamente.");
            cargarDatos();
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo eliminar el registro.");
        }
    }

    const registrosFiltrados = registros.filter((registro) =>
        Object.values(registro).some((valor) =>
            String(valor ?? "")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
        )
    );

    const menu = [
        {id: "categorias", nombre: "Categorías", icono: Tags},
        {id: "productos", nombre: "Productos", icono: Package},
        {id: "entradas", nombre: "Entradas", icono: ClipboardList},
    ];

    return (
        <div className="app-container">
            <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
                <div className="logo">
                    <div className="logo-icon">F</div>
                    <h2>FLAGGER</h2>
                </div>

                <p className="menu-titulo">MENÚ PRINCIPAL</p>

                <nav>
                    <button
                        className={`menu-item ${modulo === "dashboard" ? "active" : ""}`}
                        onClick={() => cambiarModulo("categorias")}
                    >
                        <LayoutDashboard size={20} />
                        Panel principal
                    </button>

                    {menu.map((item) => {
                        const Icono = item.icono;

                        return (
                            <button
                                key={item.id}
                                className={`menu-item ${modulo === item.id ? "active" : ""}`}
                                onClick={() => cambiarModulo(item.id)}
                            >
                                <Icono size={20} />
                                {item.nombre}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <span className="status-dot"></span>
                    Sistema de inventario
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <button className="mobile-menu" onClick={() => setMenuAbierto(!menuAbierto)}>
                        <Menu />
                    </button>

                    <div>
                        <span className="breadcrumb">FLAGGER / ADMINISTRACIÓN</span>
                        <h1>{configuracion.titulo}</h1>
                    </div>

                    <div className="user-profile">
                        <span>Administrador</span>
                        <div className="avatar">A</div>
                    </div>
                </header>

                <section className="content">
                    <div className="welcome">
                        <div>
                            <h2>Gestión de {configuracion.titulo}</h2>
                            <p>Administra y controla la información de tu inventario.</p>
                        </div>

                        <button className="btn-primary" onClick={abrirNuevo}>
                            <Plus size={19} />
                            Nuevo registro
                        </button>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <Package />
                            </div>
                            <div>
                                <p>Total de registros</p>
                                <h2>{registros.length}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <LayoutDashboard />
                            </div>
                            <div>
                                <p>Estado del sistema</p>
                                <h2 className="estado">Activo</h2>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-header">
                            <div>
                                <h3>Listado de {configuracion.titulo}</h3>
                                <p>Consulta y administra tus registros.</p>
                            </div>

                            <div className="search-box">
                                <Search size={19} />
                                <input
                                    type="text"
                                    placeholder="Buscar registro..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <p className="error">{error}</p>}

                        {cargando ? (
                            <p className="mensaje">Cargando información...</p>
                        ) : (
                            <div className="table-scroll">
                                <table>
                                    <thead>
                                        <tr>
                                            {configuracion.campos.map((campo) => (
                                                <th key={campo.nombre}>{campo.etiqueta}</th>
                                            ))}
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {registrosFiltrados.map((registro, index) => (
                                            <tr key={registro[configuracion.id] ?? registro.id ?? index}>
                                                {configuracion.campos.map((campo) => (
                                                    <td key={campo.nombre}>
                                                        {campo.tipo === "boolean"
                                                            ? registro[campo.nombre]
                                                                ? "Sí"
                                                                : "No"
                                                            : String(registro[campo.nombre] ?? "-")}
                                                    </td>
                                                ))}

                                                <td>
                                                    <div className="acciones">
                                                        <button
                                                            className="btn-edit"
                                                            title="Editar"
                                                            onClick={() => abrirEditar(registro)}
                                                        >
                                                            <Pencil size={17} />
                                                        </button>

                                                        <button
                                                            className="btn-delete"
                                                            title="Eliminar"
                                                            onClick={() => eliminarRegistro(registro)}
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {registrosFiltrados.length === 0 && (
                                            <tr>
                                                <td colSpan={configuracion.campos.length + 1} className="mensaje">
                                                    No hay registros para mostrar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="table-footer">
                            Mostrando {registrosFiltrados.length} registros
                            <button className="btn-refresh" onClick={cargarDatos}>
                                <RefreshCw size={16} />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {modal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h2>{registroEditando ? "Editar registro" : "Nuevo registro"}</h2>
                                <p>{configuracion.titulo}</p>
                            </div>

                            <button className="btn-close" onClick={() => setModal(false)}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={guardarRegistro}>
                            {configuracion.campos.map((campo) => (
                                <div className="form-group" key={campo.nombre}>
                                    <label>{campo.etiqueta}</label>

                                    {campo.tipo === "boolean" ? (
                                        <select
                                            value={String(formulario[campo.nombre])}
                                            onChange={(e) => actualizarCampo(campo.nombre, e.target.value === "true")}
                                        >
                                            <option value="true">Sí</option>
                                            <option value="false">No</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={campo.tipo}
                                            required
                                            min={campo.tipo === "number" ? "0" : undefined}
                                            step={campo.nombre === "precio" ? "0.01" : "1"}
                                            value={formulario[campo.nombre]}
                                            onChange={(e) => actualizarCampo(campo.nombre, e.target.value)}
                                            placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setModal(false)}>
                                    Cancelar
                                </button>

                                <button type="submit" className="btn-primary">
                                    {registroEditando ? "Guardar cambios" : "Registrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
