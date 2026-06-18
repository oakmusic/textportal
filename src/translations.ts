export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Layout
    app_title: "TextPortal",
    app_subtitle: "Ephemeral texts.",
    
    // Home
    home_send: "SEND",
    home_receive: "RECEIVE",

    // Send
    send_title: "SEND TEXT",
    send_placeholder: "Paste your text or URLs here...",
    send_button: "SEND",
    send_error: "Failed to send. Please try again.",

    // Receive
    receive_title: "RECEIVE TEXT",
    receive_subtitle: "Enter the 4-character code",
    receive_placeholder: "XXXX",
    receive_error_length: "Code must be 4 characters.",
    receive_error_check: "Failed to check code.",
    receive_button: "RECEIVE",

    // Result
    result_title: "READY TO RECEIVE",
    result_expires: "Expires in:",
    result_expired: "EXPIRED",
    result_code: "Code",
    result_copy_code: "Copy Code",
    result_copied_url: "COPIED URL",
    result_copy_url: "COPY DIRECT URL",

    // DirectReceive
    dreceive_loading: "RECEIVING MESSAGE...",
    dreceive_error_title: "Error",
    dreceive_error_message: "Code invalid, expired, or blocked.",
    dreceive_error_button: "TRY ANOTHER CODE",
    dreceive_title: "RECEIVED TEXT",
    dreceive_copy_error: "Copy failed. Please copy manually.",
    dreceive_copied: "COPIED",
    dreceive_copy_text: "COPY TEXT",
    dreceive_open_link: "OPEN LINK"
  },
  es: {
    // Layout
    app_title: "TextPortal",
    app_subtitle: "Textos efímeros.",
    
    // Home
    home_send: "ENVIAR",
    home_receive: "RECIBIR",

    // Send
    send_title: "ENVIAR TEXTO",
    send_placeholder: "Pega tu texto o URLs aquí...",
    send_button: "ENVIAR",
    send_error: "Error al enviar. Por favor, inténtalo de nuevo.",

    // Receive
    receive_title: "RECIBIR TEXTO",
    receive_subtitle: "Introduce el código de 4 caracteres",
    receive_placeholder: "XXXX",
    receive_error_length: "El código debe tener 4 caracteres.",
    receive_error_check: "Error al comprobar el código.",
    receive_button: "RECIBIR",

    // Result
    result_title: "LISTO PARA RECIBIR",
    result_expires: "Caduca en:",
    result_expired: "CADUCADO",
    result_code: "Código",
    result_copy_code: "Copiar Código",
    result_copied_url: "URL COPIADA",
    result_copy_url: "COPIAR URL DIRECTA",

    // DirectReceive
    dreceive_loading: "RECIBIENDO MENSAJE...",
    dreceive_error_title: "Error",
    dreceive_error_message: "Código inválido, caducado o bloqueado.",
    dreceive_error_button: "PROBAR OTRO CÓDIGO",
    dreceive_title: "TEXTO RECIBIDO",
    dreceive_copy_error: "Error al copiar. Por favor, cópialo manualmente.",
    dreceive_copied: "COPIADO",
    dreceive_copy_text: "COPIAR TEXTO",
    dreceive_open_link: "ABRIR ENLACE"
  }
};

export type TranslationKey = keyof typeof translations.en;
