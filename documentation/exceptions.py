# documentation/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    # Appelle l'exception handler standard
    response = exception_handler(exc, context)

    # Log personnalisé
    view = context.get('view', None)
    if view:
        logger.error(f"[{view.__class__.__name__}] Exception: {str(exc)}")

    if response is not None:
        return response

    # Fallback générique
    return Response({
        "error": "Une erreur interne est survenue.",
        "detail": str(exc)
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
