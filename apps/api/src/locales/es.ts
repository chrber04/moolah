import type { Messages } from "$lib/i18n/schema.js";

/**
 * Spanish locale messages.
 */
export const es: Messages = {
	global_fallback: "Operación exitosa.",
	global_exception_fallback: "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.",
	global_exception_badRequest: "Algo falta o es incorrecto. Por favor revisa e intenta de nuevo.",
	global_exception_unauthorized: "Necesitas iniciar sesión para acceder a esto.",
	global_exception_forbidden: "No tienes permiso para hacer esto.",
	global_exception_notFound: "No pudimos encontrar lo que buscabas.",
	global_exception_conflict: "Hay un conflicto. Por favor intenta de nuevo.",
	global_exception_tooManyRequests: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
	global_exception_internalServerError: "Algo salió mal de nuestro lado. Lo estamos investigando.",
	global_exception_serviceUnavailable:
		"El servicio no está disponible. Intenta de nuevo más tarde.",

};
