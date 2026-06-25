// Leer el color guardado actualmente y marcar el radio button correcto
chrome.storage.sync.get(['laserColor'], (data) => {
  if (data.laserColor) {
    const radio = document.querySelector(`input[value="${data.laserColor}"]`);
    if (radio) radio.checked = true;
  }
});

// Escuchar cuando el usuario cambia de opción y guardarla
document.querySelectorAll('input[name="color"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    chrome.storage.sync.set({ laserColor: e.target.value });
  });
});
