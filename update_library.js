const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, 'public-pages.json');
const pages = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

const universityTemplates = [
  "En GavaLab, entendemos que tu salud no puede esperar. 🔬 Por eso te ofrecemos rapidez y la precisión que necesitas para vivir con tranquilidad. \n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #Salud #Papantla #CuidadoPersonal",
  "¿Listo para tu chequeo de rutina? 🌡️ Ven a GavaLab y experimenta un trato humano de primer nivel con resultados en los que puedes confiar plenamente.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #Bienestar #Confianza #Papantla",
  "Tu bienestar es nuestra mayor motivación. ❤️ En cada análisis ponemos toda nuestra dedicación y precisión científica a tu servicio.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #SaludFamiliar #Papantla #ResultadosSeguros",
  "En GavaLab, nos cuidamos como vecinos. 🩺 Cercanía, profesionalismo y tecnología de punta para que siempre estés un paso adelante en tu salud.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #OrgulloPapanteco #Totonacapan #Prevención",
  "Calidad científica con un toque humano. ✨ Porque sabemos que detrás de cada muestra hay una persona que merece el mejor trato y la mayor certeza.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #LaboratorioClinico #SaludVeracruz #Confianza",
  "¿Necesitas resultados claros y rápidos? 🕒 Mándanos un mensajito por WhatsApp y agenda tu cita hoy mismo. Estamos para servirte con profesionalismo.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #AtencionPersonalizada #Rapidez #Papantla",
  "Protege lo que más quieres con la certeza que solo GavaLab te ofrece. 💉 Análisis clínicos completos para asegurar que tú y los tuyos estén siempre bien.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #FamiliaSaludable #PrevencionHoy #Papantla",
  "Innovación constante al servicio de tu comunidad. 🔬 En GavaLab trabajamos día a día para brindarte la mayor precisión en cada uno de tus estudios.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #TecnologiaMedica #SaludTotal #Papantla",
  "Vive con la tranquilidad de conocer tu estado de salud. ✅ En GavaLab te acompañamos con discreción, rapidez y un trato cálido en cada visita.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #BienestarTotal #Papantla #SaludEsVida",
  "Tu salud es una prioridad que no dejamos al azar. 🧪 Confía en los expertos de Papantla para obtener la información precisa que tu bienestar requiere.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800\n📲 WhatsApp: 784 115 9572\n📘 Facebook: Laboratorios GavaLab\n#GavaLab #ExpertosEnSalud #Papantla #CuidadoIntegral"
];

const gava = pages.find(p => p.id === "103779998699180");
if (gava) {
  gava.templates = universityTemplates;
  fs.writeFileSync(publicPath, JSON.stringify(pages, null, 2));
  console.log("¡Librería actualizada con los 10 copys universales perfeccionados! ✅");
}
