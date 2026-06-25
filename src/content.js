// Escuchar el mensaje desde el menú contextual
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "iniciarEscaneo") {
    ejecutarLaserT(request.texto);
  }
});

function ejecutarLaserT(textoSeleccionado) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect(); 
  if (rect.width === 0 || rect.height === 0) return;

  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;
  const width = rect.width;
  const height = rect.height;

  browser.storage.sync.get(['laserColor']).then((data) => {
    const colorElegido = data.laserColor || '#00ff00';

    // Crear contenedor principal
    const laserWrapper = document.createElement('div');
    laserWrapper.classList.add('laserT-wrapper');
    laserWrapper.style.top = `${top}px`;
    laserWrapper.style.left = `${left}px`;
    laserWrapper.style.width = `${width}px`;
    laserWrapper.style.height = `${height}px`;

    // Crear línea láser
    const laserLine = document.createElement('div');
    laserLine.classList.add('laserT-line');
    laserLine.style.backgroundColor = colorElegido;
    laserLine.style.boxShadow = `0 0 12px ${colorElegido}`;
    laserWrapper.appendChild(laserLine);

    // Crear recuadro de traducción
    const translationBox = document.createElement('div');
    translationBox.classList.add('laserT-translation-box');
    translationBox.innerText = "Traduciendo con Google..."; 
    laserWrapper.appendChild(translationBox);

    document.body.appendChild(laserWrapper);

    // ==========================================
    // NUEVA API OFICIAL DE GOOGLE (SIN LLAVE)
    // ==========================================
    const textoCodificado = encodeURIComponent(textoSeleccionado);
    // Usamos el cliente 'gtx' de Google, que es libre y ultra rápido
    const urlApi = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${textoCodificado}`;

    fetch(urlApi)
      .then(response => {
        if (!response.ok) throw new Error(`Error de servidor: ${response.status}`);
        return response.json();
      })
      .then(datos => {
        // Google devuelve un array complejo de arrays. 
        // Recorremos el resultado para reconstruir el párrafo completo perfectamente.
        if (datos && datos[0]) {
          let textoTraducido = "";
          datos[0].forEach(linea => {
            if (linea[0]) textoTraducido += linea[0];
          });
          translationBox.innerText = textoTraducido;
        } else {
          translationBox.innerText = "Formato de traducción inesperado.";
        }
      })
      .catch(error => {
        console.error("Error en LáserT:", error);
        // Si hay un error, lo pintamos en el recuadro para saber qué pasa
        translationBox.innerText = `Ocurrió un problema: ${error.message}`;
      });
    // ==========================================

    // Tiempo de lectura dinámico según el largo del texto
    const tiempoLectura = textoSeleccionado.length > 300 ? 12000 : 6000;

    setTimeout(() => {
      laserWrapper.classList.add('laserT-fade-out');
      setTimeout(() => laserWrapper.remove(), 500);
    }, tiempoLectura);
  });
}
