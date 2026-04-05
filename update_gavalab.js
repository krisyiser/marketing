const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, 'public-pages.json');
const pages = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

// Buscamos GavaLab por su ID
const gavalab = pages.find(p => p.id === "103779998699180");

if (gavalab) {
  gavalab.brandManual = `GavaLab es Empática, Confiable y de Cercanía. Tono Profesional pero Amigable. Hablamos en primera persona del plural (Nosotros). Evitamos tecnicismos fríos y usamos términos como Precisión, Certeza, Cuidado, Bienestar y Totonacapan.`;
  
  gavalab.rules = `SÍ: Inicio con gancho o pregunta, enfoque preventivo, Call to Action claro a WhatsApp, máximo 3 emojis de salud (🔬🩺🧪💉🌡️), máximo 5 hashtags (#GavaLab #Papantla #SaludVeracruz). NO: Jerga juvenil (random, lit), promesas mágicas curativas, lenguaje alarmista ni faltas de ortografía.`;
  
  gavalab.context = `Laboratorio de análisis clínicos de vanguardia en Papantla, Veracruz (Totonacapan). Destacamos por Precisión Científica, Rapidez y Trato Humano. Público: Familias locales, Adultos mayores (toma de muestra a domicilio) y personas que buscan calidad a precio justo.`;
  
  // Actualizamos también la identidad general para el sistema
  gavalab.brandIdentity = `GavaLab: Laboratorio médico empático y confiable en Papantla. Trato humano, precisión científica y rapidez.`;

  fs.writeFileSync(publicPath, JSON.stringify(pages, null, 2));
  console.log("¡Cerebro de GavaLab actualizado con éxito! ✅");
} else {
  console.log("No se encontró la página de GavaLab.");
}
