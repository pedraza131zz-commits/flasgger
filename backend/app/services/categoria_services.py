from flask import jsonify, request, abort
from app.models import Categoria, db


# LISTAR CATEGORÍAS
def categoria_list():
    categorias = db.session.execute(
        db.select(Categoria)
    ).scalars().all()

    return jsonify([c.to_dict() for c in categorias]), 200


# DETALLE CATEGORÍA
def categoria_detail(categoria_id):
    categoria = db.session.get(Categoria, categoria_id)

    if not categoria:
        abort(404, description="Categoría no encontrada")

    return jsonify(categoria.to_dict()), 200


# CREAR CATEGORÍA
def categoria_add():
    data = request.get_json()

    if not data:
        abort(400, description="No se recibió información en formato JSON")

    if "nombre" not in data:
        abort(400, description="El campo nombre es obligatorio")

    nueva_categoria = Categoria(
        categoria_nombre=data["nombre"],
        descripccion=data.get("descripcion")
    )

    db.session.add(nueva_categoria)
    db.session.commit()

    return jsonify(nueva_categoria.to_dict()), 201


# ACTUALIZAR CATEGORÍA
def categoria_update(categoria_id):
    data = request.get_json()

    if not data:
        abort(400, description="No se recibió información en formato JSON")

    categoria = db.session.get(Categoria, categoria_id)

    if not categoria:
        abort(404, description="Categoría no encontrada")

    categoria.categoria_nombre = data.get(
        "nombre",
        categoria.categoria_nombre
    )

    categoria.descripccion = data.get(
        "descripcion",
        categoria.descripccion
    )

    db.session.commit()

    return jsonify(categoria.to_dict()), 200


# ELIMINAR CATEGORÍA
def categoria_delete(categoria_id):
    categoria = db.session.get(Categoria, categoria_id)

    if not categoria:
        abort(404, description="Categoría no encontrada")

    db.session.delete(categoria)
    db.session.commit()

    return jsonify({
        "mensaje": "Categoría eliminada correctamente"
    }), 200