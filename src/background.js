// 1. Crear la opción en el menú contextual al instalar la extensión
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "laserT-translate",
    title: "Traducir con LáserT",
    contexts: ["selection"] // Solo aparecerá si hay texto seleccionado
  });
  
  // Color por defecto (Verde) al instalar
  chrome.storage.sync.set({ laserColor: "#00ff00" });
});

// 2. Escuchar cuando el usuario hace clic en la opción del menú
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "laserT-translate") {
    // Enviamos un mensaje al content.js de la pestaña actual para que actúe
    chrome.tabs.sendMessage(tab.id, { action: "iniciarEscaneo", texto: info.selectionText });
  }
});
