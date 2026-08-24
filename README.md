# Y&M Life HQ ✦ — V4 · Google Sheets personal

Esta es la versión corregida para usar **tu Google Sheets original `Y&M Life HQ — Database` en tu cuenta personal**.

## Cambio importante

La versión anterior tenía un Spreadsheet ID fijo.

Esta versión **NO tiene ningún Spreadsheet ID**.

`Code.gs` se crea directamente desde el Google Sheets correcto:

**Y&M Life HQ — Database → Extensiones → Apps Script**

De esta manera Apps Script usa automáticamente el documento al que está vinculado.

---

## 1. Usa tu Google Sheets original

Abre en tu cuenta personal el Google Sheets:

**Y&M Life HQ — Database**

Debe conservar estas pestañas:

- Dashboard
- Daily_Activities
- Weekly_Checkins
- Sunday_Reset
- Finances
- Yellower
- My_Fan_Box
- Memories
- Monthly_Summary

La copia que compartiste conserva correctamente esta estructura.

---

## 2. Instalar Apps Script

Dentro de ESE MISMO Google Sheets:

1. **Extensiones → Apps Script**
2. Borra el código que aparezca.
3. Copia todo el contenido de `Code.gs`.
4. Guarda el proyecto como:
   `Y&M Life HQ API`
5. **Deploy → New deployment**
6. Tipo: **Web app**
7. Execute as: **Me**
8. Who has access: **Anyone**
9. Deploy
10. Autoriza los permisos.
11. Copia la URL que termina en `/exec`.

---

## 3. Conectar GitHub

Abre `config.js`.

Reemplaza:

`PEGA_AQUI_LA_URL_DEL_WEB_APP_DE_APPS_SCRIPT`

por tu URL `/exec`.

Ejemplo:

```js
window.YMHQ_CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec"
};
```

---

## 4. GitHub Pages

Sube al repositorio:

- `index.html`
- `config.js`
- `.nojekyll`

Puedes guardar también:

- `Code.gs`
- `README.md`

como respaldo, aunque GitHub Pages no los necesita para mostrar la web.

---

## Flujo final

Yani / Matt  
↓  
GitHub Pages  
↓  
Apps Script vinculado al Sheet personal  
↓  
Y&M Life HQ — Database

Los botones de guardar agregan nuevas filas al historial sin reemplazar las anteriores.

## Nota

La web mantiene `localStorage` como borrador local.

El historial compartido oficial queda en el Google Sheets personal.

