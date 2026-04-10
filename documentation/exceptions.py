# documentation/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    # Appelle l'exception handler standard DRF
    response = exception_handler(exc, context)

    view = context.get('view', None)
    view_name = view.__class__.__name__ if view else "unknown"

    if response is not None:
        # Exception attendue (gérée par DRF) : warning pour 4xx, error pour 5xx
        if response.status_code < 500:
            logger.warning(f"[{view_name}] {exc.__class__.__name__}: {str(exc)}")
        else:
            logger.error(f"[{view_name}] {exc.__class__.__name__}: {str(exc)}")
        return response

    # Exception non gérée : log complet avec traceback
    logger.error(f"[{view_name}] Unhandled exception: {str(exc)}", exc_info=True)
    return Response({
        "error": "Une erreur interne est survenue.",
        "detail": str(exc)
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
