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
    uploader_error_type: "Dangerous file types are not allowed.",

    // About Modal
    about_title: "Information",
    about_what_is: "What is TextPortal?",
    about_what_is_text: "TextPortal allows you to transfer text, images and files between devices using temporary codes, quickly and without registration.",
    about_privacy: "Privacy",
    about_privacy_1: "Text messages are stored temporarily for 5 minutes.",
    about_privacy_2: "Files are stored temporarily for 24 hours.",
    about_privacy_3: "Expired content is automatically deleted.",
    about_privacy_4: "No account is required.",
    about_privacy_5: "The service is designed to minimize data retention and automatically remove temporary content.",
    about_security: "Security",
    about_security_1: "Codes are randomly generated.",
    about_security_2: "Usage limits help prevent abuse.",
    about_security_3: "Downloads use temporary secure links.",
    about_security_4: "Content remains available only for the configured time.",
    about_opensource: "Open Source",
    about_opensource_text: "TextPortal is an open-source project.",
    about_opensource_button: "View project on GitHub",
    about_tech: "Technologies",
    about_author: "Author",
    about_author_text: "Created by Aritz Villodas as a personal and experimental project.",
    about_footer_1: "📝 Text: 5 minutes",
    about_footer_2: "📁 Files: 24 hours",
    about_footer_3: "👤 No account required",
    about_footer_4: "🔓 Open source"
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
    uploader_error_type: "No se permiten tipos de archivo peligrosos.",

    // About Modal
    about_title: "Información",
    about_what_is: "¿Qué es TextPortal?",
    about_what_is_text: "TextPortal permite transferir textos, imágenes y archivos entre dispositivos mediante códigos temporales, de forma rápida y sin necesidad de registro.",
    about_privacy: "Privacidad",
    about_privacy_1: "Los textos se almacenan temporalmente durante 5 minutos.",
    about_privacy_2: "Los archivos se almacenan temporalmente durante 24 horas.",
    about_privacy_3: "Una vez expirados, se eliminan automáticamente.",
    about_privacy_4: "No es necesario crear una cuenta.",
    about_privacy_5: "El servicio está diseñado para minimizar la retención de datos y eliminar automáticamente los contenidos temporales.",
    about_security: "Seguridad",
    about_security_1: "Los códigos se generan aleatoriamente.",
    about_security_2: "Se aplican límites de uso para evitar abusos.",
    about_security_3: "Las descargas utilizan enlaces temporales seguros.",
    about_security_4: "El contenido sólo permanece disponible durante el tiempo configurado.",
    about_opensource: "Código Abierto",
    about_opensource_text: "TextPortal es un proyecto abierto.",
    about_opensource_button: "Ver proyecto en GitHub",
    about_tech: "Tecnologías utilizadas",
    about_author: "Autor",
    about_author_text: "Creado por Aritz Villodas como proyecto personal y experimental.",
    about_footer_1: "📝 Textos: 5 minutos",
    about_footer_2: "📁 Archivos: 24 horas",
    about_footer_3: "👤 Sin registro",
    about_footer_4: "🔓 Código abierto"
  }
};

export type TranslationKey = keyof typeof translations.en;
