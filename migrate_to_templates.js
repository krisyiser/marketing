const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, 'public-pages.json');
const pages = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

// Copys Maestros Universales que redactamos para GavaLab
const templates = [
  "En GavaLab, tu salud es nuestro compromiso más importante. 🔬 Brindamos resultados precisos con la calidez humana que te hace sentir en confianza. \n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #SaludVeracruz #Totonacapan",
  "¿Tienes dudas sobre tus análisis? 📲 Estamos a un mensaje de distancia. En GavaLab te atendemos de manera personalizada para que tú solo te preocupes por estar bien.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #AtenciónCercana #Laboratorio",
  "La precisión que tu médico necesita, con el trato humano que tú mereces. 🧪🔬 En GavaLab la tecnología de vanguardia está al servicio de tu bienestar. ¡Visítanos!\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #PrecisiónCientífica #Calidad",
  "Porque lo más valioso es tu tranquilidad y la de tu familia. ❤️ En GavaLab cuidamos cada detalle de tus análisis para darte la certeza que buscas.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #FamiliaSana #CuidadoHumano",
  "Resultados rápidos y certeros cuando más los necesitas. 🕒 En GavaLab entendemos la importancia de tu tiempo y tu salud.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #ResultadosRápidos #Confianza",
  "Cuidarte hoy es asegurar tu mañana. 💉 Realiza tus estudios de rutina preventivos en el laboratorio de confianza de Papantla. ¡Te esperamos!\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #Prevención #CheckUp",
  "Llevamos la calidad de GavaLab hasta la puerta de tu hogar. 🏡 Agenda tu toma de muestra a domicilio y recibe la mejor atención sin salir de casa.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #ServicioADomicilio #SaludEnCasa",
  "Precisión científica que cuida tu bolsillo. 💰 En GavaLab ofrecemos los análisis más completos de la región con precios justos para tu economía.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #CalidadYPrecio #Bienestar",
  "Más que un laboratorio, somos tus aliados en cada paso del cuidado de tu salud. 🔬🩺 En GavaLab estamos para servirte con profesionalismo y empatía.\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #AliadosEnSalud #Totonacapan",
  "Resultados en los que puedes confiar plenamente. ✅ Nuestra prioridad es entregarte información certera con la calidez que nos distingue. ¡Pasa a vernos!\n📍 5 de mayo #212 Altos | 📍 16 de septiembre #800 \n📲 WhatsApp: 784 115 9572 \n📘 Facebook: Laboratorios GavaLab \n#GavaLab #Papantla #CompromisoGavaLab #SaludSegura"
];

// Actualizamos GavaLab
const gava = pages.find(p => p.id === "103779998699180");
if (gava) {
  gava.templates = templates;
  // Limpiamos los campos antiguos para liberar espacio de configuración
  delete gava.brandManual;
  delete gava.rules;
  delete gava.context;
  delete gava.brandIdentity;
  
  fs.writeFileSync(publicPath, JSON.stringify(pages, null, 2));
  console.log("¡Plantillas inyectadas en GavaLab! ✅");
}
