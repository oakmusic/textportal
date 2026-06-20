export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Layout
    app_title: "TextPortal",
    app_subtitle: "Ephemeral texts and files.",
    
    // Home
    home_send: "SEND",
    home_receive: "RECEIVE",

    // Send
    send_title: "SEND",
    send_placeholder: "Paste your text or URLs here...",
    send_button: "SEND",
    send_file_button: "SEND FILE",
    send_error: "Failed to send. Please try again.",

    // Receive
    receive_title: "RECEIVE",
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
    dreceive_loading: "RECEIVING...",
    dreceive_error_title: "Error",
    dreceive_error_message: "Code invalid, expired, or blocked.",
    dreceive_error_button: "TRY ANOTHER CODE",
    dreceive_title: "RECEIVED TEXT",
    dreceive_file_title: "FILE RECEIVED",
    dreceive_copy_error: "Copy failed. Please copy manually.",
    dreceive_copied: "COPIED",
    dreceive_copy_text: "COPY TEXT",
    dreceive_open_link: "OPEN LINK",
    dreceive_download: "DOWNLOAD",

    // FileUploader
    uploader_drag: "Click to select or drag and drop",
    uploader_images: "Images up to 10 MB",
    uploader_files: "Files up to 50 MB",
    uploader_error_size: "File exceeds the limit of",
    uploader_error_type: "Dangerous file types are not allowed."
  },
  es: {
    // Layout
    app_title: "TextPortal",
    app_subtitle: "Textos y archivos efímeros.",
    
    // Home
    home_send: "ENVIAR",
    home_receive: "RECIBIR",

    // Send
    send_title: "ENVIAR",
    send_placeholder: "Pega tu texto o URLs aquí...",
    send_button: "ENVIAR",
    send_file_button: "ENVIAR ARCHIVO",
    send_error: "Error al enviar. Por favor, inténtalo de nuevo.",

    // Receive
    receive_title: "RECIBIR",
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
    dreceive_loading: "RECIBIENDO...",
    dreceive_error_title: "Error",
    dreceive_error_message: "Código inválido, caducado o bloqueado.",
    dreceive_error_button: "PROBAR OTRO CÓDIGO",
    dreceive_title: "TEXTO RECIBIDO",
    dreceive_file_title: "ARCHIVO RECIBIDO",
    dreceive_copy_error: "Error al copiar. Por favor, cópialo manualmente.",
    dreceive_copied: "COPIADO",
    dreceive_copy_text: "COPIAR TEXTO",
    dreceive_open_link: "ABRIR ENLACE",
    dreceive_download: "DESCARGAR",

    // FileUploader
    uploader_drag: "Haz clic para seleccionar o arrastra y suelta",
    uploader_images: "Imágenes de hasta 10 MB",
    uploader_files: "Archivos de hasta 50 MB",
    uploader_error_size: "El archivo supera el límite de",
    uploader_error_type: "No se permiten tipos de archivo peligrosos."
  }
};

export type TranslationKey = keyof typeof translations.en;
