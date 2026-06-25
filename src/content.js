// Escuchar el mensaje desde el menú contextual dinámico (Recibe el texto y el idioma elegido)
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "iniciarEscaneo") {
    ejecutarLaserT(request.texto, request.idiomaDestino);
  }
});

function ejecutarLaserT(textoSeleccionado, idiomaDestino) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect(); 
  if (rect.width === 0 || rect.height === 0) return;


  const contenedorTexto = range.commonAncestorContainer.nodeType === 1 
    ? range.commonAncestorContainer 
    : range.commonAncestorContainer.parentNode;


  const posicionOriginalContenedor = window.getComputedStyle(contenedorTexto).position;
  if (posicionOriginalContenedor === 'static') {
    contenedorTexto.style.position = 'relative';
  }


  const contenedorRect = contenedorTexto.getBoundingClientRect();
  const top = rect.top - contenedorRect.top;
  const left = rect.left - contenedorRect.left;
  const width = rect.width;
  const height = rect.height;

  browser.storage.sync.get(['laserColor']).then((data) => {
    const colorElegido = data.laserColor || '#00ff00';

    // ID único para poder asociar y borrar ambos elementos a la vez
    const idUnico = 'laserT-' + Date.now();

    // 1. Crear el contenedor del LÁSER
    const laserWrapper = document.createElement('div');
    laserWrapper.classList.add('laserT-wrapper', idUnico);
    laserWrapper.style.top = `${top}px`;
    laserWrapper.style.left = `${left}px`;
    laserWrapper.style.width = `${width}px`;
    laserWrapper.style.height = `${height}px`;

    const laserLine = document.createElement('div');
    laserLine.classList.add('laserT-line');
    laserLine.style.backgroundColor = colorElegido;
    laserLine.style.boxShadow = `0 0 12px ${colorElegido}`;
    laserWrapper.appendChild(laserLine);

    // 2. Crear la CAJA DE TRADUCCIÓN
    const translationBox = document.createElement('div');
    translationBox.classList.add('laserT-translation-box', idUnico);
    
    // La posicionamos justo debajo del texto seleccionado relativa al contenedor local
    translationBox.style.top = `${top + height + 8}px`;
    translationBox.style.left = `${left}px`;

    // Contenedor interno para el texto
    const textContainer = document.createElement('span');
    textContainer.innerText = "Traduciendo con LáserT...";
    translationBox.appendChild(textContainer);

    // Botón de cierre (X)
    const closeButton = document.createElement('button');
    closeButton.classList.add('laserT-close-btn');
    closeButton.innerHTML = '&times;';
    
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const elementos = document.querySelectorAll(`.${idUnico}`);
      elementos.forEach(el => el.classList.add('laserT-fade-out'));
      
      setTimeout(() => {
        elementos.forEach(el => el.remove());
      }, 400);
    });

    translationBox.appendChild(closeButton);
    

    contenedorTexto.appendChild(laserWrapper);
    contenedorTexto.appendChild(translationBox);

    const textoCodificado = encodeURIComponent(textoSeleccionado);
    const urlApi = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${idiomaDestino}&dt=t&q=${textoCodificado}`;

    fetch(urlApi)
      .then(response => {
        if (!response.ok) throw new Error(`Error de servidor: ${response.status}`);
        return response.json();
      })
      .then(datos => {
        const textoFinal = procesarArregloGoogle(datos);
        textContainer.innerText = textoFinal;
      })
      .catch(error => {
        console.error("Error en LáserT:", error);
        textContainer.innerText = `Ocurrió un problema: ${error.message}`;
      });

    function procesarArregloGoogle(datos) {
      if (datos && datos[0]) {
        let resultado = "";
        datos[0].forEach(linea => {
          if (linea[0]) resultado += linea[0];
        });
        return resultado;
      }
      return "Formato de traducción inesperado.";
    }
  });
}
