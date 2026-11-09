/* Shared by the static-page builder and the browser. No runtime dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SFDirectory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CATEGORIES = ['foodbank', 'meals', 'shelter', 'hygiene', 'restroom', 'health', 'access', 'phone'];
  const FOOD_HOTLINE = '4158243663';
  const labels = {
    en: {
      title: 'Find help in San Francisco', intro: 'Free food, shelter, showers and care. Tap what you need.',
      tagline: 'A community resource guide', skip: 'Skip to main content', language: 'Language', back: 'All help',
      foodbank: 'Food Bank', meals: 'Free meals', shelter: 'Shelter', hygiene: 'Showers & day centers', restroom: 'Restrooms', health: 'Health care', access: 'Housing help', phone: 'Phone help',
      foodbankSub: 'Free groceries', mealsSub: 'Eat today', shelterSub: 'A place to sleep', hygieneSub: 'Wash, laundry, clothes', restroomSub: 'Public toilets', healthSub: 'Clinics and walk-in care', accessSub: 'Start here for housing', phoneSub: 'Call or text for help',
      tip_foodbank: 'Weekly pantries usually ask for a photo ID, and one piece of mail from the last 3 months if your ID has an old address. No income proof; immigration status is not checked. Need food today or have no address? Call 415-824-3663, or see Emergency food and Free meals.',
      tip_meals: 'Places marked “All welcome” list no eligibility rules. Call ahead on holidays.',
      tip_shelter: 'Dolores Shelter is the only walk-up adult shelter. Other adult shelters use the city waitlist: 628-652-8000, Mon–Fri 9–5.',
      tip_hygiene: 'Hours change and spaces fill up. Call before a long trip.',
      tip_restroom: 'City Pit Stops have running water, soap, towels and staff. Hours are published by SF Public Works.',
      tip_health: 'For a medical emergency call 911. For minor illness or injury, Maria X Martinez takes walk-ins.',
      tip_access: 'Access Points are the city’s front door to housing. They also help with a California ID and Social Security card. An Access Point can help you get a free Muni pass.',
      tip_phone: 'Calls are free from most phones. 911, 988, 311 and 211 work without an area code.',
      waitlistJoin: 'Join the city waitlist', waitlistCheck: 'Check my waitlist position',
      search: 'Name, street or ZIP', locate: 'Nearest to me', locating: 'Finding you…', clearLocation: 'Clear',
      locationDenied: 'Location was not shared. You can still search by street or ZIP.', locationUnavailable: 'Location is unavailable. Try outdoors, or search by street.',
      locationTimeout: 'Location took too long. Try again, or use search.', locationInsecure: 'Location needs a secure (https) connection.',
      locationOutside: 'You seem to be outside San Francisco.', locationApproximate: 'Your location is approximate.', locationReady: 'Sorted by distance from you.',
      viewList: 'List', viewMap: 'Map', chipOpen: 'Open now', chipEnrolling: 'Taking new people', chipAnyZip: 'All SF ZIPs', chipEmergency: 'Emergency food',
      places: 'places', place: 'place', more: 'Show more', noResults: 'Nothing matches', noResultsText: 'Try another street or ZIP, or clear the search.', reset: 'Clear search',
      go: 'Go here', call: 'Call', text: 'Text', onMap: 'Map', details: 'Details', sources: 'Sources', checked: 'Checked', moreNumbers: 'Other numbers', noPhone: 'No direct number published. Call 211',
      privateAddress: 'Address kept private for safety. Please call.', phoneOnly: 'By phone', hoursVary: 'Hours vary. Call first.', pinApprox: 'Pins show approximate locations.',
      openNow: 'Open now', until: 'until', open24: 'Open 24 hours', opensAt: 'Opens', laterToday: 'today', closedNow: 'Closed now', startsOn: 'Starts', hoursNotLive: 'Times are published hours, not live status.',
      next: 'Next', every: 'Every', multipleDays: 'Multiple days. Contact the site.', timeUnknown: 'Time not listed', signUp: 'Sign-up', zipsServed: 'Serves ZIP', allSf: 'All of San Francisco', seniorOnly: 'Age 60+ or disability', wheelchair: 'Wheelchair access', lowCook: 'Little or no cooking needed', languagesSpoken: 'Languages', daily: 'Daily', floor: 'Floor',
      m_breakfast: 'breakfast', m_lunch: 'lunch', m_dinner: 'dinner', m_togo: 'to-go meal', m_overnight: 'overnight', m_showers: 'showers & laundry',
      b_allwelcome: 'All welcome', b_intake: 'Short intake form', b_limited: 'Limits apply', b_referral: 'Referral only', b_walkup: 'Walk-up · first come', b_waitlist: 'City waitlist', b_appointment: 'Appointment', b_dropin: 'Drop-in', b_call: 'Call first', b_seasonal: 'Winter shelter', b_signup: 'Sign up early', b_women: 'For women', b_public: 'Public', b_accessAdult: 'Adults', b_accessVeteran: 'Veterans', b_accessFamily: 'Families', b_accessYouth: 'Ages 18–24', b_accessSurvivor: 'Survivors of violence', b_line: 'Phone line', b_line24: '24 hours', b_enrolling: 'Taking new people', b_pantryWait: 'Waitlist only', b_pantryOpen: 'Ask at site', b_emergency: 'Emergency food',
      p_office: 'Office', p_shelterLine: 'City shelter line', p_hotline24: '24-hour line', p_crisisLine: 'Crisis line', p_teenLine: 'Teen crisis line', p_afterHours: 'After hours', p_navLine: 'Navigation line', p_outsideSF: 'From outside SF', p_hotline: 'Food Bank hotline', p_main: 'Phone',
      n_pitStop: 'Staffed public toilet with running water and soap.',
      n_accessAdult: 'For adults 18+ without minor children. Housing help, California ID and Social Security card help. Street Outreach can meet you if you can’t get here.',
      n_accessVeteran: 'For veterans 18+ without minor children. Housing help, California ID and Social Security card help.',
      n_accessFamily: 'For families with minor children, homeless or at risk. Family shelter, housing, ID help.',
      n_accessFamilyTraining: 'For families with minor children, homeless or at risk. Family shelter, housing, ID help. 1st and 3rd Thursdays closed 11:30 am–3:30 pm.',
      n_accessYouth: 'For ages 18–24, and 25–27 who have used SF homeless services before. Youth shelter, housing, ID help.',
      n_accessSurvivor: 'For survivors of violence, with a focus on privacy and safety. Housing and ID help.',
      n_accessSurvivorCall: 'For survivors of violence. Call during open hours or leave a voicemail. Housing and ID help.',
      n_line911: 'Medical emergency, fire, or immediate danger. Includes a mental health or overdose emergency.',
      n_line988: 'Call or text any time if you are in crisis or thinking about suicide.',
      n_line311: 'City services. Ask for the Street Team for outreach, medical and shelter help on the street.',
      n_line211: 'Find food and other services from any organization.',
      n_lineShelter: 'Sign up or make changes to the adult shelter waitlist. Mon–Fri 9 am–5 pm.',
      n_lineFood: 'Find a pantry, ask about enrollment, or get help finding food today.',
      n_lineHsh: 'SF Department of Homelessness and Supportive Housing. Mon–Fri 8 am–5 pm.',
      n_lineWoman: '24/7 support line for domestic violence survivors.',
      n_lineTrafficking: 'Help for people experiencing human trafficking.',
      goTitle: 'How do you want to get there?', goInApp: 'Walk with this site’s map', goInAppHint: 'Free and simple, walking only', goGoogle: 'Open Google Maps', goGoogleHint: 'Turn-by-turn, if you have the app', goTransit: 'Bus or Muni route in Google Maps', cancel: 'Cancel',
      goPrivacy: 'Walking directions here send your location and destination to the free OpenStreetMap routing service. Nothing is saved by this site. Google Maps has its own privacy policy.',
      navLocating: 'Finding your location…', navRouting: 'Finding a walking route…', navNoGps: 'We could not get your location. Tap the map where you are, or use Google Maps.', navTapStart: 'Tap the map where you are now.', navFailed: 'The free route service is not responding.', navOffRoute: 'You left the route. Finding a new one…', navLong: 'This is a long walk. Google Maps can show bus and Muni options.', navArrived: 'You have arrived', end: 'End', steps: 'Steps', remaining: 'left', minutes: 'min', walk: 'walk', retry: 'Try again', recenter: 'Center on me', navOffline: 'No connection. The steps below still work.', stepsTitle: 'Walking steps',
      d_north: 'north', d_northeast: 'northeast', d_east: 'east', d_southeast: 'southeast', d_south: 'south', d_southwest: 'southwest', d_west: 'west', d_northwest: 'northwest',
      s_start: 'Head {dir}', s_startOn: 'Head {dir} on {street}', s_left: 'Turn left', s_leftOn: 'Turn left onto {street}', s_right: 'Turn right', s_rightOn: 'Turn right onto {street}', s_bearLeft: 'Bear left', s_bearLeftOn: 'Bear left onto {street}', s_bearRight: 'Bear right', s_bearRightOn: 'Bear right onto {street}', s_straight: 'Continue straight', s_straightOn: 'Continue on {street}', s_uturn: 'Turn around', s_arrive: 'Arrive at your destination', s_arriveLeft: 'Your destination is on the left', s_arriveRight: 'Your destination is on the right', in: 'in',
      mi: 'mi', ft: 'ft', mapLoading: 'Loading the map…', mapError: 'The map could not load. The list, Call and Google Maps still work.', tileError: 'Some map images did not load.', mapFile: 'The map needs a web address. Open this site through its link.', mapOffline: 'The map needs a connection. The list still works offline.',
      liveData: 'Live from the SF-Marin Food Bank locator · exported', savedData: 'Saved copy of the Food Bank list · exported', cityListed: 'Listed by SF Human Services',
      offline: 'You are offline. Saved details are still here. Maps and directions need a connection.', stale: 'This list has not been re-checked for over 30 days. Confirm details before going.',
      save: 'Save this list', saved: 'Your text list is ready to save.', saveFailed: 'The list could not be saved.', textVersion: 'Text-only version', emergency: 'Emergency: 911', crisis: 'Crisis: call or text 988',
      checkedLine: 'Sources checked', footer: 'An independent community project. No account, ads or tracking.', footerNote: 'Listings show published information, not live bed or food availability. Please confirm with the provider.', about: 'About this guide', translation: 'Names and addresses stay in English so you can match street signs. Translated summaries are provided for convenience.', privacy: 'Your location is used only on your phone to sort the list. It is sent out only if you start walking directions here (OpenStreetMap routing) or open Google Maps. The map loads images from OpenStreetMap when you open it.', contact: 'Contact', fixMap: 'Report a map problem',
      enroll1: 'At every distribution', enroll2: 'Mon–Fri', enroll3: 'First distribution of the month', enroll4: 'Ask at the site', enroll5: 'Mon, Wed, Fri', enroll6: 'Tuesday', enroll7: 'No sign-up needed', enroll8: 'Contact the site', enroll9: 'Monday'
    },
    es: {
      title: 'Encuentra ayuda en San Francisco', intro: 'Comida, refugio, duchas y atención gratis. Toca lo que necesitas.',
      tagline: 'Guía de recursos comunitarios', skip: 'Ir al contenido', language: 'Idioma', back: 'Toda la ayuda',
      foodbank: 'Banco de alimentos', meals: 'Comidas gratis', shelter: 'Refugios', hygiene: 'Duchas y centros de día', restroom: 'Baños', health: 'Salud', access: 'Ayuda de vivienda', phone: 'Teléfonos de ayuda',
      foodbankSub: 'Despensas gratis', mealsSub: 'Comer hoy', shelterSub: 'Un lugar para dormir', hygieneSub: 'Ducha, lavandería, ropa', restroomSub: 'Baños públicos', healthSub: 'Clínicas y atención sin cita', accessSub: 'Empieza aquí para vivienda', phoneSub: 'Llama o envía un mensaje',
      tip_foodbank: 'Las despensas semanales suelen pedir una identificación con foto y, si tiene una dirección antigua, una carta de los últimos 3 meses. No piden prueba de ingresos ni revisan el estatus migratorio. ¿Necesita comida hoy o no tiene dirección? Llame al 415-824-3663 o vea Comida de emergencia y Comidas gratis.',
      tip_meals: 'Los lugares marcados “Todos bienvenidos” no indican requisitos. En festivos, llame antes.',
      tip_shelter: 'Dolores Shelter es el único refugio para adultos sin cita. Los demás usan la lista de espera municipal: 628-652-8000, lun–vie 9–5.',
      tip_hygiene: 'Los horarios cambian y los cupos se llenan. Llame antes de un viaje largo.',
      tip_restroom: 'Los Pit Stops de la ciudad tienen agua, jabón, toallas y personal. Horarios publicados por SF Public Works.',
      tip_health: 'En una emergencia médica llame al 911. Para enfermedades o heridas leves, Maria X Martinez atiende sin cita.',
      tip_access: 'Los Puntos de Acceso son la entrada de la ciudad a la vivienda. También ayudan con la identificación de California y la tarjeta del Seguro Social. Un Punto de Acceso puede ayudarle a obtener un pase gratis de Muni.',
      tip_phone: 'Las llamadas son gratis en la mayoría de los teléfonos. 911, 988, 311 y 211 funcionan sin código de área.',
      waitlistJoin: 'Inscribirse en la lista municipal', waitlistCheck: 'Ver mi lugar en la lista',
      search: 'Nombre, calle o código postal', locate: 'Más cercanos', locating: 'Buscando…', clearLocation: 'Borrar',
      locationDenied: 'No se compartió la ubicación. Puede buscar por calle o código postal.', locationUnavailable: 'Ubicación no disponible. Pruebe al aire libre o busque por calle.',
      locationTimeout: 'La ubicación tardó demasiado. Reintente o use la búsqueda.', locationInsecure: 'La ubicación necesita una conexión segura (https).',
      locationOutside: 'Parece que está fuera de San Francisco.', locationApproximate: 'Su ubicación es aproximada.', locationReady: 'Ordenado por distancia.',
      viewList: 'Lista', viewMap: 'Mapa', chipOpen: 'Abierto ahora', chipEnrolling: 'Aceptan personas', chipAnyZip: 'Todo SF', chipEmergency: 'Comida de emergencia',
      places: 'lugares', place: 'lugar', more: 'Ver más', noResults: 'Sin resultados', noResultsText: 'Pruebe otra calle o código postal, o borre la búsqueda.', reset: 'Borrar búsqueda',
      go: 'Ir aquí', call: 'Llamar', text: 'Mensaje', onMap: 'Mapa', details: 'Detalles', sources: 'Fuentes', checked: 'Revisado', moreNumbers: 'Otros números', noPhone: 'Sin número directo publicado. Llame al 211',
      privateAddress: 'Dirección privada por seguridad. Llame, por favor.', phoneOnly: 'Por teléfono', hoursVary: 'Horarios variables. Llame antes.', pinApprox: 'Los puntos son aproximados.',
      openNow: 'Abierto ahora', until: 'hasta', open24: 'Abierto 24 horas', opensAt: 'Abre', laterToday: 'hoy', closedNow: 'Cerrado ahora', startsOn: 'Empieza', hoursNotLive: 'Son horarios publicados, no estado en vivo.',
      next: 'Próxima', every: 'Cada', multipleDays: 'Varios días. Contacte al sitio.', timeUnknown: 'Hora no indicada', signUp: 'Inscripción', zipsServed: 'Atiende códigos', allSf: 'Todo San Francisco', seniorOnly: '60+ o discapacidad', wheelchair: 'Acceso para silla de ruedas', lowCook: 'Requiere poca o ninguna cocina', languagesSpoken: 'Idiomas', daily: 'Diario', floor: 'Piso',
      m_breakfast: 'desayuno', m_lunch: 'almuerzo', m_dinner: 'cena', m_togo: 'comida para llevar', m_overnight: 'por la noche', m_showers: 'duchas y lavandería',
      b_allwelcome: 'Todos bienvenidos', b_intake: 'Formulario breve', b_limited: 'Con requisitos', b_referral: 'Solo con referencia', b_walkup: 'Sin cita · por llegada', b_waitlist: 'Lista municipal', b_appointment: 'Con cita', b_dropin: 'Sin cita', b_call: 'Llame antes', b_seasonal: 'Refugio de invierno', b_signup: 'Inscríbase temprano', b_women: 'Para mujeres', b_public: 'Público', b_accessAdult: 'Adultos', b_accessVeteran: 'Veteranos', b_accessFamily: 'Familias', b_accessYouth: '18–24 años', b_accessSurvivor: 'Sobrevivientes de violencia', b_line: 'Línea telefónica', b_line24: '24 horas', b_enrolling: 'Aceptan personas', b_pantryWait: 'Solo lista de espera', b_pantryOpen: 'Pregunte en el sitio', b_emergency: 'Comida de emergencia',
      p_office: 'Oficina', p_shelterLine: 'Línea de refugios', p_hotline24: 'Línea 24 horas', p_crisisLine: 'Línea de crisis', p_teenLine: 'Línea para adolescentes', p_afterHours: 'Fuera de horario', p_navLine: 'Línea de navegación', p_outsideSF: 'Fuera de SF', p_hotline: 'Línea del Food Bank', p_main: 'Teléfono',
      n_pitStop: 'Baño público con personal, agua corriente y jabón.',
      n_accessAdult: 'Para adultos 18+ sin hijos menores. Ayuda de vivienda, identificación de California y tarjeta del Seguro Social. Street Outreach puede ir a donde esté si no puede llegar.',
      n_accessVeteran: 'Para veteranos 18+ sin hijos menores. Ayuda de vivienda, identificación de California y tarjeta del Seguro Social.',
      n_accessFamily: 'Para familias con hijos menores, sin hogar o en riesgo. Refugio familiar, vivienda e identificación.',
      n_accessFamilyTraining: 'Para familias con hijos menores, sin hogar o en riesgo. Refugio familiar, vivienda e identificación. Jueves 1.º y 3.º cierra de 11:30 am a 3:30 pm.',
      n_accessYouth: 'Para 18–24 años, y 25–27 que ya usaron servicios para personas sin hogar en SF. Refugio juvenil, vivienda e identificación.',
      n_accessSurvivor: 'Para sobrevivientes de violencia, con énfasis en privacidad y seguridad. Ayuda de vivienda e identificación.',
      n_accessSurvivorCall: 'Para sobrevivientes de violencia. Llame en horario o deje un mensaje. Ayuda de vivienda e identificación.',
      n_line911: 'Emergencia médica, incendio o peligro inmediato. Incluye emergencias de salud mental o sobredosis.',
      n_line988: 'Llame o envíe un mensaje a cualquier hora si está en crisis o piensa en el suicidio.',
      n_line311: 'Servicios de la ciudad. Pida el Street Team para ayuda médica y de refugio en la calle.',
      n_line211: 'Encuentre comida y otros servicios de cualquier organización.',
      n_lineShelter: 'Inscríbase o haga cambios en la lista de refugios para adultos. Lun–vie 9 am–5 pm.',
      n_lineFood: 'Encuentre una despensa, pregunte por inscripción u obtenga ayuda para conseguir comida hoy.',
      n_lineHsh: 'Departamento de Personas sin Hogar y Vivienda de SF. Lun–vie 8 am–5 pm.',
      n_lineWoman: 'Línea de apoyo 24/7 para sobrevivientes de violencia doméstica.',
      n_lineTrafficking: 'Ayuda para personas víctimas de trata.',
      goTitle: '¿Cómo quiere llegar?', goInApp: 'Caminar con el mapa de este sitio', goInAppHint: 'Gratis y sencillo, solo a pie', goGoogle: 'Abrir Google Maps', goGoogleHint: 'Paso a paso, si tiene la app', goTransit: 'Ruta en autobús o Muni en Google Maps', cancel: 'Cancelar',
      goPrivacy: 'La ruta a pie envía su ubicación y destino al servicio gratuito de rutas de OpenStreetMap. Este sitio no guarda nada. Google Maps tiene su propia política de privacidad.',
      navLocating: 'Buscando su ubicación…', navRouting: 'Buscando una ruta a pie…', navNoGps: 'No se pudo obtener su ubicación. Toque el mapa donde está o use Google Maps.', navTapStart: 'Toque el mapa donde está ahora.', navFailed: 'El servicio gratuito de rutas no responde.', navOffRoute: 'Salió de la ruta. Buscando otra…', navLong: 'Es una caminata larga. Google Maps puede mostrar autobús y Muni.', navArrived: 'Ha llegado', end: 'Terminar', steps: 'Pasos', remaining: 'restante', minutes: 'min', walk: 'a pie', retry: 'Reintentar', recenter: 'Centrar en mí', navOffline: 'Sin conexión. Los pasos siguen disponibles.', stepsTitle: 'Pasos a pie',
      d_north: 'norte', d_northeast: 'noreste', d_east: 'este', d_southeast: 'sureste', d_south: 'sur', d_southwest: 'suroeste', d_west: 'oeste', d_northwest: 'noroeste',
      s_start: 'Camine hacia el {dir}', s_startOn: 'Camine hacia el {dir} por {street}', s_left: 'Gire a la izquierda', s_leftOn: 'Gire a la izquierda en {street}', s_right: 'Gire a la derecha', s_rightOn: 'Gire a la derecha en {street}', s_bearLeft: 'Manténgase a la izquierda', s_bearLeftOn: 'Manténgase a la izquierda hacia {street}', s_bearRight: 'Manténgase a la derecha', s_bearRightOn: 'Manténgase a la derecha hacia {street}', s_straight: 'Siga recto', s_straightOn: 'Siga por {street}', s_uturn: 'Dé la vuelta', s_arrive: 'Llegue a su destino', s_arriveLeft: 'Su destino está a la izquierda', s_arriveRight: 'Su destino está a la derecha', in: 'en',
      mi: 'mi', ft: 'pies', mapLoading: 'Cargando el mapa…', mapError: 'El mapa no cargó. La lista, Llamar y Google Maps siguen funcionando.', tileError: 'Parte del mapa no cargó.', mapFile: 'El mapa necesita una dirección web. Abra este sitio por su enlace.', mapOffline: 'El mapa necesita conexión. La lista funciona sin internet.',
      liveData: 'En vivo del localizador del SF-Marin Food Bank · exportado', savedData: 'Copia guardada de la lista del Food Bank · exportada', cityListed: 'Listado por SF Human Services',
      offline: 'Sin conexión. Los datos guardados siguen aquí. Mapas y rutas necesitan internet.', stale: 'Esta lista lleva más de 30 días sin revisarse. Confirme antes de ir.',
      save: 'Guardar esta lista', saved: 'Su lista de texto está lista para guardar.', saveFailed: 'No se pudo guardar la lista.', textVersion: 'Versión solo texto', emergency: 'Emergencia: 911', crisis: 'Crisis: llame o escriba al 988',
      checkedLine: 'Fuentes revisadas', footer: 'Un proyecto comunitario independiente. Sin cuenta, anuncios ni rastreo.', footerNote: 'Se muestra información publicada, no disponibilidad de camas o comida en vivo. Confirme con el proveedor.', about: 'Sobre esta guía', translation: 'Los nombres y direcciones siguen en inglés para coincidir con los letreros. Resúmenes traducidos como ayuda.', privacy: 'Su ubicación se usa solo en su teléfono para ordenar la lista. Solo se envía si inicia una ruta a pie aquí (rutas de OpenStreetMap) o abre Google Maps. El mapa carga imágenes de OpenStreetMap al abrirlo.', contact: 'Contacto', fixMap: 'Informar un problema del mapa',
      enroll1: 'En cada distribución', enroll2: 'Lun–vie', enroll3: 'Primera distribución del mes', enroll4: 'Pregunte en el sitio', enroll5: 'Lun, mié, vie', enroll6: 'Martes', enroll7: 'No requiere inscripción', enroll8: 'Contacte al sitio', enroll9: 'Lunes'
    },
    zh: {
      title: '在旧金山寻求帮助', intro: '免费食物、住宿、淋浴和医疗。点选你需要的服务。',
      tagline: '社区互助资源指南', skip: '跳到主要内容', language: '语言', back: '全部服务',
      foodbank: 'Food Bank 食物银行', meals: '免费餐食', shelter: '收容所', hygiene: '淋浴和日间中心', restroom: '公共厕所', health: '看病', access: '住房援助', phone: '求助电话',
      foodbankSub: '免费领取食品', mealsSub: '今天吃饭', shelterSub: '找地方过夜', hygieneSub: '洗澡、洗衣、衣物', restroomSub: '有水可洗手', healthSub: '诊所和免预约门诊', accessSub: '申请住房从这里开始', phoneSub: '打电话或发短信求助',
      tip_foodbank: '每周领取点通常要出示带照片的身份证件；如果证件上是旧地址，还要带一封最近 3 个月内的信件。无需收入证明，也不会查移民身份。今天就需要食物，或没有地址？请拨打 415-824-3663，或查看“应急食物”和“免费餐食”。',
      tip_meals: '标注“所有人可来”的地点未列出资格限制。节假日请先致电。',
      tip_shelter: 'Dolores Shelter 是唯一可现场排队的成人收容所。其他成人收容所需加入市政府候补名单：628-652-8000，周一至周五 9:00–17:00。',
      tip_hygiene: '时间可能变化，名额也可能用完。路程较远时请先致电。',
      tip_restroom: '市政 Pit Stop 有自来水、肥皂、擦手纸和工作人员。时间由 SF Public Works 公布。',
      tip_health: '医疗紧急情况请拨打 911。轻症或小伤可直接去 Maria X Martinez。',
      tip_access: 'Access Point 是市政府住房服务的入口，也协助办理加州身份证和社安卡。Access Point 还可以协助你申请免费 Muni 通行证。',
      tip_phone: '大多数手机拨打这些电话不收费。911、988、311 和 211 无需区号。',
      waitlistJoin: '加入市政府候补名单', waitlistCheck: '查询我的候补位置',
      search: '名称、街道或邮编', locate: '离我最近', locating: '正在定位…', clearLocation: '清除',
      locationDenied: '未共享位置。仍可按街道或邮编搜索。', locationUnavailable: '暂时无法定位。请到室外重试，或按街道搜索。',
      locationTimeout: '定位超时。请重试，或使用搜索。', locationInsecure: '定位需要安全连接（https）。',
      locationOutside: '你似乎不在旧金山。', locationApproximate: '定位精度较低。', locationReady: '已按距离排序。',
      viewList: '列表', viewMap: '地图', chipOpen: '现在开放', chipEnrolling: '接收新人', chipAnyZip: '不限邮编', chipEmergency: '应急食物',
      places: '个地点', place: '个地点', more: '显示更多', noResults: '没有找到', noResultsText: '换一条街道或邮编试试，或清除搜索。', reset: '清除搜索',
      go: '到这里去', call: '打电话', text: '发短信', onMap: '地图', details: '详情', sources: '资料来源', checked: '核查于', moreNumbers: '其他号码', noPhone: '未公布直线电话，请拨打 211',
      privateAddress: '为保障安全，地址不公开，请致电。', phoneOnly: '电话服务', hoursVary: '时间不固定，请先致电。', pinApprox: '标记为大致位置。',
      openNow: '现在开放', until: '至', open24: '24 小时开放', opensAt: '开放时间', laterToday: '今天', closedNow: '现在未开放', startsOn: '开始于', hoursNotLive: '显示的是公布时间，并非实时状态。',
      next: '下次', every: '每', multipleDays: '多个日期，请联系该地点。', timeUnknown: '未列出时间', signUp: '登记', zipsServed: '服务邮编', allSf: '全旧金山', seniorOnly: '60 岁以上或残障', wheelchair: '轮椅可通行', lowCook: '基本无需烹饪', languagesSpoken: '语言', daily: '每天', floor: '楼层',
      m_breakfast: '早餐', m_lunch: '午餐', m_dinner: '晚餐', m_togo: '外带餐', m_overnight: '夜间', m_showers: '淋浴和洗衣',
      b_allwelcome: '所有人可来', b_intake: '需填简短登记表', b_limited: '有资格限制', b_referral: '仅限转介', b_walkup: '现场排队·先到先得', b_waitlist: '市政府候补', b_appointment: '需预约', b_dropin: '免预约', b_call: '请先致电', b_seasonal: '冬季收容', b_signup: '需提早登记', b_women: '面向女性', b_public: '公共', b_accessAdult: '成人', b_accessVeteran: '退伍军人', b_accessFamily: '家庭', b_accessYouth: '18–24 岁', b_accessSurvivor: '暴力幸存者', b_line: '电话专线', b_line24: '24 小时', b_enrolling: '接收新人', b_pantryWait: '仅可候补', b_pantryOpen: '请到现场询问', b_emergency: '应急食物',
      p_office: '办公室', p_shelterLine: '市政府收容专线', p_hotline24: '24 小时热线', p_crisisLine: '危机热线', p_teenLine: '青少年危机热线', p_afterHours: '下班后', p_navLine: '导航专线', p_outsideSF: '旧金山以外拨打', p_hotline: 'Food Bank 热线', p_main: '电话',
      n_pitStop: '有工作人员值守的公共厕所，有自来水和肥皂。',
      n_accessAdult: '面向无未成年子女同行的 18 岁以上成人。提供住房、加州身份证和社安卡协助。无法前往时，Street Outreach 可到你所在地点。',
      n_accessVeteran: '面向无未成年子女同行的 18 岁以上退伍军人。提供住房、加州身份证和社安卡协助。',
      n_accessFamily: '面向有未成年子女、无家可归或有风险的家庭。提供家庭收容、住房和证件协助。',
      n_accessFamilyTraining: '面向有未成年子女、无家可归或有风险的家庭。提供家庭收容、住房和证件协助。每月第 1、3 个周四 11:30–15:30 关闭。',
      n_accessYouth: '面向 18–24 岁，以及曾使用旧金山无家可归服务的 25–27 岁人士。提供青年收容、住房和证件协助。',
      n_accessSurvivor: '面向暴力幸存者，重视隐私和安全。提供住房和证件协助。',
      n_accessSurvivorCall: '面向暴力幸存者。请在开放时间致电或留言。提供住房和证件协助。',
      n_line911: '医疗急症、火灾或紧迫危险，包括精神健康危机和药物过量。',
      n_line988: '处于危机或有自杀念头时，随时可以拨打或发短信。',
      n_line311: '市政服务。可要求 Street Team 提供街头外展、医疗和收容协助。',
      n_line211: '查找各机构提供的食物和其他服务。',
      n_lineShelter: '登记或修改成人收容候补。周一至周五 9:00–17:00。',
      n_lineFood: '查询领取点、询问登记，或获得今天找食物的帮助。',
      n_lineHsh: '旧金山无家可归及住房支持部门。周一至周五 8:00–17:00。',
      n_lineWoman: '家庭暴力幸存者 24 小时支持热线。',
      n_lineTrafficking: '为人口贩运受害者提供帮助。',
      goTitle: '你想怎么去？', goInApp: '用本站地图步行导航', goInAppHint: '免费、简单，仅限步行', goGoogle: '打开 Google 地图', goGoogleHint: '逐步导航，需安装应用效果最好', goTransit: '在 Google 地图查看公交/Muni 路线', cancel: '取消',
      goPrivacy: '站内步行导航会把你的位置和目的地发送给免费的 OpenStreetMap 路线服务，本站不保存。Google 地图有自己的隐私政策。',
      navLocating: '正在获取位置…', navRouting: '正在规划步行路线…', navNoGps: '无法获取位置。请在地图上点选你现在的位置，或使用 Google 地图。', navTapStart: '请在地图上点选你现在的位置。', navFailed: '免费路线服务暂时没有响应。', navOffRoute: '你已偏离路线，正在重新规划…', navLong: '这段路走路较远。Google 地图可以查看公交和 Muni。', navArrived: '你已到达', end: '结束', steps: '步骤', remaining: '剩余', minutes: '分钟', walk: '步行', retry: '重试', recenter: '回到我的位置', navOffline: '没有网络，下面的步骤仍可查看。', stepsTitle: '步行步骤',
      d_north: '北', d_northeast: '东北', d_east: '东', d_southeast: '东南', d_south: '南', d_southwest: '西南', d_west: '西', d_northwest: '西北',
      s_start: '向{dir}走', s_startOn: '沿 {street} 向{dir}走', s_left: '左转', s_leftOn: '左转进入 {street}', s_right: '右转', s_rightOn: '右转进入 {street}', s_bearLeft: '靠左走', s_bearLeftOn: '靠左进入 {street}', s_bearRight: '靠右走', s_bearRightOn: '靠右进入 {street}', s_straight: '继续直行', s_straightOn: '沿 {street} 继续走', s_uturn: '掉头', s_arrive: '到达目的地', s_arriveLeft: '目的地在左侧', s_arriveRight: '目的地在右侧', in: '',
      mi: '英里', ft: '英尺', mapLoading: '正在加载地图…', mapError: '地图未能加载。列表、电话和 Google 地图仍可使用。', tileError: '部分地图图片未能加载。', mapFile: '地图需要网址访问，请通过网站链接打开。', mapOffline: '地图需要联网，列表可离线查看。',
      liveData: '实时取自 SF-Marin Food Bank 官方查询系统 · 导出于', savedData: 'Food Bank 列表的保存副本 · 导出于', cityListed: '旧金山人类服务局列出',
      offline: '目前离线。已保存的信息仍可查看，地图和路线需要联网。', stale: '本列表已超过 30 天未核查，请在出发前确认。',
      save: '保存此列表', saved: '文字列表已准备好保存。', saveFailed: '未能保存列表。', textVersion: '纯文字版', emergency: '紧急情况：911', crisis: '心理危机：拨打或短信 988',
      checkedLine: '资料核查于', footer: '独立社区公益项目。无需账号，无广告，不追踪。', footerNote: '这里显示的是公布信息，不代表实时床位或食物余量。请向机构确认。', about: '关于本指南', translation: '机构名称和地址保留英文，方便对照路牌。翻译摘要仅供参考。', privacy: '你的位置只在手机上用于排序。只有开始站内步行导航（OpenStreetMap 路线服务）或打开 Google 地图时才会发送出去。打开地图时会从 OpenStreetMap 加载地图图片。', contact: '联系方式', fixMap: '报告地图问题',
      enroll1: '每次发放时', enroll2: '周一至周五', enroll3: '每月第一次发放', enroll4: '请到现场询问', enroll5: '周一、三、五', enroll6: '周二', enroll7: '无需登记', enroll8: '请联系该地点', enroll9: '周一'
    }
  };
  const DAYS = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] };
  const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const TIER = { emergency: 0, allwelcome: 0, walkup: 0, public: 0, dropin: 0, line24: 0, seasonal: 1, line: 1, enrolling: 1, pantryOpen: 1, intake: 1, signup: 1, women: 1, accessAdult: 1, accessVeteran: 1, accessFamily: 1, accessYouth: 1, accessSurvivor: 1, waitlist: 2, call: 2, appointment: 2, limited: 3, pantryWait: 3, referral: 4 };
  const iconPaths = {
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 3H3a1 1 0 0 0-1 1c0 10 8 18 18 18a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-8-8l2-2-2-5Z"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', back: '<path d="M19 12H5m6 6-6-6 6-6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    foodbank: '<path d="M4 9h16l-2 12H6ZM8 9l4-7 4 7M9 13v4m6-4v4"/>', meals: '<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-5 2-5 10 0 10"/>',
    shelter: '<path d="m3 10 9-7 9 7v11H3Zm6 11v-8h6v8"/>', hygiene: '<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z"/>',
    restroom: '<circle cx="7.5" cy="5" r="2"/><circle cx="16.5" cy="5" r="2"/><path d="M7.5 9v12M4.5 11h6M16.5 9l-3 8h6l-3-8Zm-1.5 8v4m3-4v4"/>',
    health: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/>', access: '<path d="M14 11a4 4 0 1 0-3.5-2L3 16.500V21h4.500v-2.500H10V16h2.500Z"/>',
    locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3.500 6h.01M3.500 12h.01M3.500 18h.01"/>',
    heart: '<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z"/>', walk: '<circle cx="13" cy="4" r="2"/><path d="m9 22 3-7-3-3 1-5 4 3 3 1M9 12l-3 2M12 15l3 7"/>'
  };
  iconPaths.foodBank = iconPaths.foodbank;
  function icon(name) { return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (iconPaths[name] || iconPaths.pin) + '</svg>'; }
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function distance(a, b) {
    const rad = Math.PI / 180, p = (b.lat - a.lat) * rad, q = (b.lng - a.lng) * rad;
    const h = Math.pow(Math.sin(p / 2), 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.pow(Math.sin(q / 2), 2);
    return 3958.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  }
  function hasPoint(r) { return Number.isFinite(r.lat) && Number.isFinite(r.lng); }
  function normalize(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ''); }
  function digits(phone) { const d = String(phone || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? d : null; }
  function formatPhone(n) { return String(n).replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3'); }
  function telHref(n, ext) { const d = String(n); return 'tel:' + (d.length === 10 ? '+1' + d : d) + (ext ? ',' + ext : ''); }

  /* Time in San Francisco, whatever the phone's own time zone is. Returns null if the browser cannot tell. */
  function sfNow(date) {
    try {
      const parts = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit' }).formatToParts(date || new Date()).forEach(p => { parts[p.type] = p.value; });
      return { date: parts.year + '-' + parts.month + '-' + parts.day, day: DAYS.en.indexOf(parts.weekday), min: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
    } catch (_) { return null; }
  }
  function toMin(hhmm) { const p = String(hhmm).split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function addDays(date, n) { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function weekdayOf(date) { return new Date(date + 'T12:00:00Z').getUTCDay(); }
  function dayOn(win, day, date) {
    if (win[0].indexOf(String(day)) < 0) return false;
    if (win[4] === 'alt') return false;
    if (Array.isArray(win[4])) return win[4].indexOf(Math.ceil(Number(date.slice(8)) / 7)) >= 0;
    return true;
  }
  function isActive(r, today) {
    if (!r.active) return true;
    return !!today && today <= r.active[1] && today >= addDays(r.active[0], -21);
  }
  /* Published hours only. Returns {s:'open',until}|{s:'later',at}|{s:'closed'} or null when hours cannot be judged. */
  function openState(r, now) {
    if (!now) return null;
    if (r.active && (now.date < r.active[0] || now.date > r.active[1])) return null;
    const wins = windowsFor(r, now);
    if (!wins || !wins.length || wins.some(w => w[4] === 'alt')) return null;
    let later = null;
    for (let i = 0; i < wins.length; i++) {
      const w = wins[i], o = toMin(w[1]), c = toMin(w[2]), overnight = c <= o;
      if (dayOn(w, now.day, now.date)) {
        if (o === 0 && c === 1440) return { s: 'open', all: true };
        if (overnight ? now.min >= o : (now.min >= o && now.min < c)) return { s: 'open', until: c };
        if (o > now.min && (later === null || o < later)) later = o;
      }
      if (overnight && dayOn(w, (now.day + 6) % 7, addDays(now.date, -1)) && now.min < c) return { s: 'open', until: c };
    }
    return later === null ? { s: 'closed' } : { s: 'later', at: later };
  }
  function windowsFor(r, now) {
    if (!r.pantry) return r.hours || null;
    const d = DAY_CODES.indexOf(r.day);
    if (d < 0 || !validTime(r)) return null;
    if (now && r.next && r.next.length && r.next.indexOf(now.date) < 0 && weekdayOf(now.date) === d) return [];
    return [[String(d), r.start, r.end]];
  }
  function validTime(r) { return !!r.start && !!r.end && toMin(r.start) >= 300; }
  function minText(min, lang) {
    const m = min % 1440, h = Math.floor(m / 60), mm = m % 60;
    if (lang === 'zh') return h + ':' + String(mm).padStart(2, '0');
    const h12 = h % 12 || 12;
    return h12 + (mm ? ':' + String(mm).padStart(2, '0') : '') + ' ' + (h < 12 ? 'am' : 'pm');
  }
  function rangeText(o, c, lang) {
    const a = toMin(o), b = toMin(c);
    if (a === 0 && b === 1440) return labels[lang].open24;
    if (lang !== 'zh' && (a < 720) === (b % 1440 < 720) && b % 1440 > a) return minText(a, lang).replace(/ (am|pm)$/, '') + '–' + minText(b, lang);
    return minText(a, lang) + '–' + minText(b, lang);
  }
  function daysText(days, lang) {
    const t = labels[lang], order = [1, 2, 3, 4, 5, 6, 0].filter(d => days.indexOf(String(d)) >= 0), names = DAYS[lang];
    if (order.length === 7) return t.daily;
    const first = [1, 2, 3, 4, 5, 6, 0].indexOf(order[0]);
    const contiguous = order.every((d, i) => [1, 2, 3, 4, 5, 6, 0][first + i] === d);
    if (order.length >= 3 && contiguous) return names[order[0]] + (lang === 'zh' ? '至' : '–') + names[order[order.length - 1]];
    if (days === '06') return names[6] + (lang === 'zh' ? '、' : '–') + names[0];
    return order.map(d => names[d]).join(lang === 'zh' ? '、' : ', ');
  }
  function hoursText(r, lang) {
    const t = labels[lang] || labels.en;
    if (r.pantry) {
      if (r.day === 'MUL') return t.multipleDays;
      if (!r.day) return validTime(r) ? rangeText(r.start, r.end, lang) : t.hoursVary;
      const d = DAY_CODES.indexOf(r.day), name = d >= 0 ? DAYS[lang][d] : r.day;
      return validTime(r) ? name + ' ' + rangeText(r.start, r.end, lang) : name + ' · ' + t.timeUnknown;
    }
    if (!r.hours || !r.hours.length) return '';
    const groups = [];
    r.hours.forEach(w => { let g = groups.filter(x => x.days === w[0])[0]; if (!g) { g = { days: w[0], parts: [] }; groups.push(g); } g.parts.push((w[3] ? t['m_' + w[3]] + ' ' : '') + rangeText(w[1], w[2], lang)); });
    return groups.map(g => daysText(g.days, lang) + (lang === 'zh' ? '：' : ': ') + g.parts.join(' · ')).join('; ');
  }
  function shortDate(date, lang) { return new Date(date + 'T12:00:00Z').toLocaleDateString({ en: 'en-US', es: 'es-US', zh: 'zh-CN' }[lang], { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function dateLabel(date, lang) { return new Date(date + 'T12:00:00Z').toLocaleDateString({ en: 'en-US', es: 'es-US', zh: 'zh-CN' }[lang], { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function nextPantryDate(r, now) {
    /* Today only counts while today's distribution has not ended. */
    const list = (r.next || []).filter(d => !now || d > now.date || (d === now.date && (!validTime(r) || now.min < toMin(r.end))));
    return list.length ? list[0] : null;
  }
  function statusLine(r, lang, now) {
    const t = labels[lang] || labels.en;
    if (r.active && now && now.date < r.active[0]) return { cls: 'later', text: t.startsOn + ' ' + shortDate(r.active[0], lang) };
    const st = openState(r, now);
    let out = null;
    if (st) {
      if (st.s === 'open') out = { cls: 'open', text: st.all ? t.open24 : t.openNow + ' · ' + t.until + ' ' + minText(st.until, lang) };
      else if (st.s === 'later') out = { cls: 'later', text: t.opensAt + ' ' + minText(st.at, lang) + ' ' + t.laterToday };
      else if (!r.pantry) out = { cls: 'closed', text: t.closedNow };
    }
    if (r.pantry && (!out || out.cls === 'closed')) {
      const next = nextPantryDate(r, now);
      if (next) return { cls: 'later', text: t.next + ': ' + shortDate(next, lang) + (validTime(r) ? ' · ' + rangeText(r.start, r.end, lang) : '') };
      if (!out) return { cls: 'later', text: hoursText(r, lang) };
    }
    return out;
  }
  function placeNote(r, lang) { return r.noteKey ? (labels[lang] || labels.en)['n_' + r.noteKey] : ((r[lang] || r.en || {}).note || ''); }
  function badgeOf(r) { return r.access; }
  function isTaking(r) { return r.access === 'enrolling' || r.access === 'emergency' || r.access === 'pantryOpen'; }
  function searchText(r) {
    if (!r._s) r._s = normalize([r.name, r.address, r.area, r.zip, (r.zips || []).join(' '), r.type, labels.en[r.type], labels.es[r.type], labels.zh[r.type]].join(' '));
    return r._s;
  }
  function filter(resources, opts, now) {
    const o = opts || {}, words = normalize((o.query || '').trim()).split(/\s+/).filter(Boolean), chips = o.chips || {};
    const list = resources.filter(r => (!o.category || r.type === o.category) && isActive(r, now && now.date) && words.every(w => searchText(r).indexOf(w) >= 0)
      && (!chips.open || (st => st && st.s === 'open')(openState(r, now)))
      && (!chips.enrolling || isTaking(r))
      && (!chips.anyzip || r.whole === true)
      && (!chips.emergency || r.kind === 'efb'));
    const here = o.here;
    return list.map((r, i) => ({ r, i, d: here && hasPoint(r) ? distance(here, r) : Infinity, t: TIER[r.access] == null ? 2 : TIER[r.access] }))
      .sort((a, b) => a.t - b.t || a.d - b.d || a.r.name.localeCompare(b.r.name))
      .map(x => x.r);
  }
  function destination(r) { return r.address || (r.lat + ',' + r.lng); }
  function directions(r, mode, navigate) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination(r)) + '&travelmode=' + (mode || 'walking') + (navigate === false ? '' : '&dir_action=navigate');
  }
  function miles(mi, lang) {
    const t = labels[lang] || labels.en;
    if (mi < 0.095) return (Math.max(10, Math.round(mi * 5280 / 10) * 10)) + ' ' + t.ft;
    return mi.toFixed(mi < 10 ? 1 : 0) + ' ' + t.mi;
  }
  function addressLine(r, lang) {
    const t = labels[lang] || labels.en;
    if (r.confidential) return t.privateAddress;
    if (!r.address) return r.cross ? r.cross.join(' & ') + (r.area ? ', ' + r.area : '') : (r.area || t.phoneOnly);
    return r.address + (r.unit ? ' · ' + r.unit : '');
  }
  function phoneBlock(r, t) {
    if (r.phone === null) return '';
    return '<a class="button button-call" href="' + telHref(r.phone, r.ext) + '" aria-label="' + escape(t.call + ' ' + formatPhone(r.phone) + (r.ext ? ' ext ' + r.ext : '')) + '">' + icon('phone') + '<span>' + escape(formatPhone(r.phone)) + (r.ext ? ' ×' + escape(r.ext) : '') + '</span></a>';
  }
  function card(r, lang, ctx) {
    const c = ctx || {}, t = labels[lang] || labels.en, now = c.now, status = statusLine(r, lang, now), note = placeNote(r, lang), hours = hoursText(r, lang);
    const dist = c.here && hasPoint(r) ? '<span class="distance">' + escape(miles(distance(c.here, r), lang)) + '</span>' : '';
    const canGo = hasPoint(r) && !r.confidential;
    const phone = r.phone === null || r.phone === undefined ? '<a class="button button-call" href="tel:211" aria-label="' + escape(t.noPhone) + '">' + icon('phone') + '<span>211</span></a>' : phoneBlock(r, t);
    const extras = (r.phones || []).map(p => '<a href="' + telHref(p[0]) + '">' + escape((p[1] ? t['p_' + p[1]] + ': ' : '') + formatPhone(p[0])) + '</a>').join('');
    const facts = [];
    if (r.pantry) {
      facts.push('<p class="fact"><strong>' + escape(hours) + '</strong></p>');
      if (r.enroll && t['enroll' + r.enroll]) facts.push('<p class="fact">' + escape(t.signUp + ': ' + t['enroll' + r.enroll] + (r.enrollTime && validEnroll(r.enrollTime) ? ' · ' + minText(toMin(r.enrollTime), lang) : '')) + '</p>');
      facts.push('<p class="fact">' + escape(t.zipsServed + ': ' + (r.whole ? t.allSf : (r.zips || []).join(', '))) + '</p>');
      const extra = [r.senior ? t.seniorOnly : '', r.lowCook ? t.lowCook : '', r.wheelchair ? t.wheelchair : ''].filter(Boolean).join(' · ');
      if (extra) facts.push('<p class="fact">' + escape(extra) + '</p>');
      if (r.langs && r.langs.length) facts.push('<p class="fact">' + escape(t.languagesSpoken + ': ' + r.langs.join(', ')) + '</p>');
    }
    if (r.pantry && r.info && (r.info[lang] || r.info.en)) facts.push('<p class="fact">' + escape(r.info[lang] || r.info.en) + '</p>');
    if (r.phoneKey || r.pantry) facts.push('<p class="fact">' + escape(t['p_' + (r.phoneKey || (r.phoneIsHotline ? 'hotline' : 'main'))] + ': ' + formatPhone(r.phone)) + '</p>');
    if (r.url) facts.push('<a href="' + escape(r.url) + '" target="_blank" rel="noopener noreferrer">' + escape(t.waitlistJoin) + '</a>');
    if (extras) facts.push('<p class="fact">' + escape(t.moreNumbers) + ':</p>' + extras);
    if (r.sms) facts.push('<a href="sms:' + escape(r.sms) + '">' + escape(t.text + ' ' + formatPhone(r.sms)) + '</a>');
    const src = (r.sources || []).map(s => '<a href="' + escape(s.url) + '" target="_blank" rel="noopener noreferrer">' + escape(s.name) + '</a>').join('');
    const checked = r.checked || c.checked;
    return '<li class="resource" id="r-' + escape(r.id) + '" data-id="' + escape(r.id) + '">' +
      '<div class="resource-top"><span class="badge badge-' + escape(badgeOf(r)) + '">' + escape(t['b_' + badgeOf(r)] || '') + '</span>' + (r.city ? '<span class="area">' + escape(t.cityListed) + '</span>' : r.area ? '<span class="area">' + escape(r.area) + '</span>' : r.zip ? '<span class="area">' + escape(r.zip) + '</span>' : '') + dist + '</div>' +
      '<h3>' + escape(r.name) + '</h3><p class="address">' + escape(addressLine(r, lang)) + '</p>' +
      (status ? '<p class="status status-' + status.cls + '">' + escape(status.text) + '</p>' : (!hours && r.type !== 'phone' && r.type !== 'restroom' ? '<p class="status status-closed">' + escape(t.hoursVary) + '</p>' : '')) +
      (hours && !r.pantry ? '<p class="hours">' + escape(hours) + '</p>' : '') +
      (note ? '<p class="note">' + escape(note) + '</p>' : '') +
      '<div class="actions' + (canGo ? '' : ' actions-phone') + '">' + (canGo ? '<button type="button" class="button button-primary" data-go="' + escape(r.id) + '">' + icon('walk') + '<span>' + escape(t.go) + '</span></button>' : '') + phone + (canGo ? '<button type="button" class="button button-secondary" data-map="' + escape(r.id) + '" aria-label="' + escape(t.onMap + ' · ' + r.name) + '">' + icon('map') + '<span>' + escape(t.onMap) + '</span></button>' : '') + '</div>' +
      '<details><summary>' + escape(t.details) + '</summary><div class="more">' + facts.join('') + (src ? '<p class="fact">' + escape(t.sources) + (checked ? ' (' + escape(t.checked + ' ' + dateLabel(checked, lang)) + ')' : '') + ':</p>' + src : '') + '</div></details></li>';
  }
  function validEnroll(v) { return /^\d{2}:\d{2}$/.test(v) && toMin(v) >= 300; }
  /* Turns one site from the Food Bank's own export into this directory's format. */
  function pantryFromRaw(s) {
    const lat = Number(s.lat), lng = Number(s.lng), inCity = Number.isFinite(lat) && Number.isFinite(lng) && lat > 37.70 && lat < 37.85 && lng > -122.53 && lng < -122.35;
    const phone = digits(s.phone);
    return {
      id: 'fb-' + s.type + '-' + s.id, type: 'foodbank', pantry: true, kind: s.type, name: String(s.name), address: s.address + ', ' + s.city + ', CA ' + s.zip, zip: String(s.zip), lat: inCity ? lat : null, lng: inCity ? lng : null,
      phone: phone || FOOD_HOTLINE, phoneIsHotline: !phone,
      access: s.type === 'efb' ? 'emergency' : s.status === 'enrolling' ? 'enrolling' : s.status === 'waitlist' ? 'pantryWait' : 'pantryOpen',
      status: s.status, day: s.distro_day || '', start: s.distro_start || '', end: s.distro_end || '', next: Array.isArray(s.distro_next) ? s.distro_next : [], enroll: s.enroll_pattern || 0, enrollTime: s.enroll_time || '', senior: !!s.senior_only, wheelchair: !!s.wheelchair, lowCook: !!s.low_cook,
      langs: Array.isArray(s.languages) ? s.languages : [], zips: Array.isArray(s.service_zips) ? s.service_zips : [], whole: !!s.serves_whole_county, info: s.info || null,
      sources: [{ name: 'SF-Marin Food Bank · Food Locator', url: 'https://foodlocator.sfmfoodbank.org/' }]
    };
  }
  function pantriesFromExport(data) {
    if (!data || !Array.isArray(data.sites)) throw new Error('Unexpected Food Bank data');
    return data.sites.filter(s => s && s.county === 'sf' && s.address && s.city && s.zip && s.status !== 'closed').map(pantryFromRaw);
  }

  /* Walking directions -------------------------------------------------- */
  const TURN = { 1: 'start', 2: 'start', 3: 'start', 4: 'arrive', 5: 'arriveRight', 6: 'arriveLeft', 7: 'straight', 8: 'straight', 9: 'bearRight', 10: 'right', 11: 'right', 12: 'uturn', 13: 'uturn', 14: 'left', 15: 'left', 16: 'bearLeft', 22: 'straight', 23: 'bearRight', 24: 'bearLeft' };
  function streetOf(m) { const names = (m.street_names || []).filter(n => !/^(US|CA|I)[ -]?\d/i.test(n)); return names[0] || (m.street_names || [])[0] || ''; }
  /* Sidewalk data makes raw routes full of tiny unnamed jogs. Merge them into readable street-level steps. */
  function compass(shape, from) {
    if (!shape || !shape[from]) return '';
    const a = shape[from];
    let b = null;
    for (let i = from + 1; i < shape.length; i++) { b = shape[i]; if (distance({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] }) > 0.012) break; }
    if (!b) return '';
    const y = (b[1] - a[1]) * Math.cos(a[0] * Math.PI / 180), x = b[0] - a[0], deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    return ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'][Math.round(deg / 45) % 8];
  }
  function buildSteps(maneuvers, shape) {
    const steps = [];
    maneuvers.forEach(m => {
      const kind = TURN[m.type] || 'straight', street = streetOf(m), last = steps[steps.length - 1];
      if (kind === 'start') { steps.push({ kind, street, dir: m.begin_cardinal_direction || compass(shape, m.begin_shape_index), len: m.length, time: m.time, begin: m.begin_shape_index, end: m.end_shape_index }); return; }
      if (kind.indexOf('arrive') === 0) { if (last) last.end = m.begin_shape_index; steps.push({ kind, street: '', len: 0, time: 0, begin: m.begin_shape_index, end: m.begin_shape_index }); return; }
      const trivial = last && !street && m.length < 0.03;
      const sameRoad = last && kind === 'straight' && (!street || street === last.street);
      if (trivial || sameRoad) { last.len += m.length; last.time += m.time; last.end = m.end_shape_index; return; }
      steps.push({ kind, street, dir: '', len: m.length, time: m.time, begin: m.begin_shape_index, end: m.end_shape_index });
    });
    return steps;
  }
  function stepText(step, lang) {
    const t = labels[lang] || labels.en;
    const key = 's_' + step.kind + (step.street && step.kind.indexOf('arrive') !== 0 && step.kind !== 'uturn' ? 'On' : '');
    const dir = step.dir ? (t['d_' + step.dir] || step.dir) : '';
    if (step.kind === 'start' && !dir) return step.street ? t.s_straightOn.replace('{street}', step.street) : t.s_straight;
    return (t[key] || t.s_straight).replace('{dir}', dir).replace('{street}', step.street || '');
  }
  function decodePolyline6(str) {
    const pts = []; let i = 0, lat = 0, lng = 0;
    while (i < str.length) {
      let b, shift = 0, result = 0;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 31) << shift; shift += 5; } while (b >= 32);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 31) << shift; shift += 5; } while (b >= 32);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      pts.push([lat / 1e6, lng / 1e6]);
    }
    return pts;
  }
  function plainPage(places, lang, checked) {
    const t = labels[lang], now = null;
    const groups = CATEGORIES.map(cat => {
      const rows = places.filter(r => r.type === cat).sort((a, b) => a.name.localeCompare(b.name)).map(r => {
        const hours = hoursText(r, lang), note = placeNote(r, lang), phone = r.phone === null || r.phone === undefined ? null : r.phone;
        return '<li><b>' + escape(r.name) + '</b><br>' + escape(addressLine(r, lang)) + (hours ? '<br>' + escape(hours) : '') + (note ? '<br>' + escape(note) : '') + '<br>' + (phone ? '<a href="' + telHref(phone, r.ext) + '">' + escape(formatPhone(phone)) + (r.ext ? ' ext ' + escape(r.ext) : '') + '</a>' : '<a href="tel:211">211</a>') + (hasPoint(r) && !r.confidential ? ' · <a href="' + escape(directions(r)) + '">' + escape(t.goGoogle) + '</a>' : '') + (r.active ? ' · ' + escape(t.b_seasonal) : '') + '</li>';
      }).join('');
      return '<h2 id="' + cat + '">' + escape(t[cat]) + '</h2><ul>' + rows + '</ul>';
    }).join('');
    return '<!doctype html><html lang="' + (lang === 'zh' ? 'zh-CN' : lang) + '"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SF Neighbor · ' + escape(t.textVersion) + '</title><style>body{font:16px/1.5 system-ui,sans-serif;margin:0 auto;max-width:44em;padding:12px;color:#231e19;background:#fff}li{margin:0 0 14px}ul{padding-left:18px}a{color:#4b3323}</style>' +
      '<h1>SF Neighbor</h1><p>' + escape(t.intro) + '</p><p>' + escape(t.checkedLine) + ' ' + escape(dateLabel(checked, lang)) + '. ' + escape(t.footerNote) + '</p><p><a href="./">' + escape(t.back) + '</a> · <a href="plain.html">English</a> · <a href="plain-es.html">Español</a> · <a href="plain-zh.html">中文</a></p><p><a href="tel:911">' + escape(t.emergency) + '</a> · <a href="tel:988">' + escape(t.crisis) + '</a></p>' +
      '<p>' + CATEGORIES.map(c => '<a href="#' + c + '">' + escape(t[c]) + '</a>').join(' · ') + '</p>' + groups + '</html>';
  }
  return { CATEGORIES, FOOD_HOTLINE, labels, icon, escape, distance, hasPoint, filter, directions, destination, formatPhone, telHref, digits, dateLabel, shortDate, sfNow, openState, statusLine, hoursText, isActive, placeNote, addressLine, card, miles, minText, pantryFromRaw, pantriesFromExport, nextPantryDate, buildSteps, stepText, decodePolyline6, plainPage, addDays };
});
