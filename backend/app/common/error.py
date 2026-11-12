from flask import Blueprint, jsonify
from flasgger import Swagger

error_bp = Blueprint("error", __name__)

@error_bp.app_errorhandler(400)
def error_400(error):
    return jsonify({
        "error": "solicitud incorrecta",
        "descripcion": str(error)
    }), 400

@error_bp.app_errorhandler(404)
def error_404(error):
    return jsonify({
        "error": "recurso no encontrado",
        "descripccion": str(error)
    }), 404

@error_bp.app_errorhandler(422)
def error_422(error):
    return jsonify({
        "error": "Validacion fallida",
        "descripccion": str(error)
    }), 422

@error_bp.app_errorhandler(500)
def error_500(error):
    return jsonify({
        "error": "Error interno del servidor",
        "descripccion": str(error)
    }), 500