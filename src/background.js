// Configuración de los idiomas disponibles en el menú
const IDIOMAS_SOPORTADOS = [
  { id: "es", titulo: "Traducir a Español (Auto)" },
  { id: "en", titulo: "Traducir a Inglés" },
  { id: "fr", titulo: "Traducir a Francés" },
  { id: "de", titulo: "Traducir a Alemán" },
  { id: "it", titulo: "Traducir a Italiano" }
];

// Crear los menús al instalar o actualizar la extensión
browser.runtime.onInstalled.addListener(() => {
  // 1. Crear el contenedor padre principal
  browser.contextMenus.create({
    id: "laserT-principal",
    title: "LáserT",
    contexts: ["selection"]
  });

  // 2. Crear los submenús hijos para cada idioma
  IDIOMAS_SOPORTADOS.forEach((idioma) => {
    browser.contextMenus.create({
      id: `laserT-idioma-${idioma.id}`,
      parentId: "laserT-principal",
      title: idioma.titulo,
      contexts: ["selection"]
    });
  });
});

// Escuchar los clics en los submenús
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith("laserT-idioma-")) {
    // Extraer el código del idioma del ID del menú (ej: "es", "en")
    const idiomaDestino = info.menuItemId.replace("laserT-idioma-", "");
    
    // Enviar el texto y el idioma seleccionado al content.js de la pestaña activa
    browser.tabs.sendMessage(tab.id, {
      action: "iniciarEscaneo",
      texto: info.selectionText,
      idiomaDestino: idiomaDestino
    });
  }
});
