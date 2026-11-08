/* Shared by the static-page builder and the browser. No runtime dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SFDirectory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const labels = {
    en: {
      title: 'Find food. Find shelter.', intro: 'Free local resources in San Francisco, with the details you need before you go.',
      tagline: 'A community resource guide', skip: 'Skip to resources', language: 'Language',
      all: 'All resources', food: 'Free meals', shelter: 'Shelter', groceries: 'Groceries',
      search: 'Search by name, street or neighborhood', searchHint: 'Try “Bayview”, “Polk” or “GLIDE”',
      locate: 'Nearest to me', locating: 'Finding your location…', clearLocation: 'Clear location',
      locationHint: 'Optional. Your location stays in this page and is not saved.',
      locationReady: 'Sorted by approximate straight-line distance, not walking distance.',
      locationDenied: 'Location was not shared. You can still search by street or neighborhood.',
      locationUnavailable: 'Location is unavailable. Try again outdoors, or search by neighborhood.',
      locationTimeout: 'Location took too long. Try again, or use the search box.',
      locationInsecure: 'Location needs a secure connection. Search by street or neighborhood instead.',
      locationOutside: 'You appear to be outside San Francisco. These resources are all in SF.',
      locationApproximate: 'Your location is approximate. Distance order may be inaccurate.',
      results: 'resources', result: 'resource', resultsTitle: 'Places to start',
      emptyTitle: 'No matching resources', emptyText: 'Try a neighborhood or street, or clear your filters to see every resource.', reset: 'Clear filters',
      notice: 'Hours may change. Call before traveling; shelter beds are not guaranteed.',
      checked: 'Sources checked', stale: 'This directory is over 30 days old. Check the provider’s current details before going.',
      walkin: 'Walk-in meals', intake: 'Basic intake required', walkup: 'Walk-up shelter', waitlist: 'Waitlist required', finder: 'Find a pantry',
      hours: 'When to go', know: 'Before you go', call: 'Call', directions: 'Walking directions', onMap: 'Show on map',
      sources: 'Sources & details', official: 'Provider / city source', cityRegistration: 'City shelter registration',
      citywide: 'Multiple distribution sites', approx: 'mi away · straight line',
      mapTitle: 'See where to go', mapIntro: 'Load the map when you need it. The list works without it.', loadMap: 'Load map', hideMap: 'Hide map',
      mapLoading: 'Loading the map…', mapError: 'The map could not load. Try again, or use Walking directions on any place.',
      tileError: 'Some map tiles could not load. Pins may appear on a blank map. Use Walking directions or retry.',
      mapFile: 'The map is unavailable in this file view. Walking directions still opens an online map.', retry: 'Try again',
      mapHint: 'Pins show approximate locations. Check the street address and entrance.', mapNoPins: 'No places to pin for this filter. Use the Food Bank’s locator for grocery pickup.',
      mapPrivacy: 'Loading the map connects to OpenStreetMap. Directions opens Google Maps.', mapLabel: 'Map of resource locations',
      helpTitle: 'Need a shelter bed?', helpText: 'For adult shelter access and the city waitlist, call the SF outreach team.',
      helpMore: 'Families and young people have different access routes. Ask the city team for the right service.',
      beforeTitle: 'A few things to know', beforeText: 'All times are San Francisco local time. Listings describe published services, not live availability.',
      moreHelp: 'More food options: call 211', emergency: 'In an emergency, call 911.',
      save: 'Save list', saved: 'Your text list is ready to save.', saveFailed: 'The list could not be saved. You can use your browser’s Print option instead.',
      print: 'Print', footer: 'An independent community project. No account, ads or location tracking.',
      footerNote: 'A starting point, not a complete directory. Confirm details with the service provider.',
      offline: 'You’re offline. Saved details are still here; maps and external pages need a connection.',
      translation: 'Names and addresses stay in English for navigation. Translated summaries are provided for convenience.',
      about: 'About this guide', privacy: 'We do not send your location to a server. If you load the map, the map provider receives normal network requests; external services have their own privacy policies.'
    },
    es: {
      title: 'Encuentra comida y refugio.', intro: 'Recursos gratuitos en San Francisco, con información útil antes de salir.',
      tagline: 'Una guía de recursos comunitarios', skip: 'Ir a los recursos', language: 'Idioma',
      all: 'Todos', food: 'Comidas gratis', shelter: 'Refugios', groceries: 'Alimentos',
      search: 'Buscar por nombre, calle o barrio', searchHint: 'Prueba “Bayview”, “Polk” o “GLIDE”',
      locate: 'Más cercanos', locating: 'Buscando tu ubicación…', clearLocation: 'Borrar ubicación',
      locationHint: 'Opcional. Tu ubicación queda en esta página y no se guarda.',
      locationReady: 'Ordenado por distancia aproximada en línea recta, no a pie.',
      locationDenied: 'No se compartió la ubicación. Puedes buscar por calle o barrio.',
      locationUnavailable: 'Ubicación no disponible. Inténtalo de nuevo o busca por barrio.',
      locationTimeout: 'La ubicación tardó demasiado. Reintenta o usa la búsqueda.',
      locationInsecure: 'La ubicación necesita una conexión segura. Busca por calle o barrio.',
      locationOutside: 'Parece que estás fuera de San Francisco. Todos estos recursos están en SF.',
      locationApproximate: 'Tu ubicación es aproximada. El orden de distancia puede ser impreciso.',
      results: 'recursos', result: 'recurso', resultsTitle: 'Por dónde empezar',
      emptyTitle: 'No hay coincidencias', emptyText: 'Prueba con un barrio o calle, o borra los filtros para ver todos los recursos.', reset: 'Borrar filtros',
      notice: 'Los horarios pueden cambiar. Llama antes de ir; no se garantiza una cama.',
      checked: 'Fuentes consultadas', stale: 'Esta guía tiene más de 30 días. Confirma la información actual antes de ir.',
      walkin: 'Comidas sin cita', intake: 'Formulario básico', walkup: 'Refugio sin cita', waitlist: 'Lista de espera', finder: 'Buscar despensa',
      hours: 'Cuándo ir', know: 'Antes de ir', call: 'Llamar', directions: 'Ruta a pie', onMap: 'Ver en el mapa',
      sources: 'Fuentes y detalles', official: 'Fuente del proveedor / ciudad', cityRegistration: 'Registro municipal de refugios',
      citywide: 'Varios puntos de distribución', approx: 'mi · línea recta',
      mapTitle: 'Encuentra el lugar', mapIntro: 'Carga el mapa cuando lo necesites. La lista funciona sin él.', loadMap: 'Cargar mapa', hideMap: 'Ocultar mapa',
      mapLoading: 'Cargando el mapa…', mapError: 'No se pudo cargar el mapa. Reintenta o usa Ruta a pie en cualquier lugar.',
      tileError: 'Parte del mapa no cargó. Los puntos pueden aparecer sin mapa. Usa Ruta a pie o reintenta.',
      mapFile: 'El mapa no está disponible en esta vista de archivo. Ruta a pie abre un mapa en línea.', retry: 'Reintentar',
      mapHint: 'Las ubicaciones son aproximadas. Confirma la dirección y la entrada.', mapNoPins: 'Este filtro no tiene puntos. Usa el localizador del Food Bank para recoger alimentos.',
      mapPrivacy: 'El mapa se conecta a OpenStreetMap. Las rutas abren Google Maps.', mapLabel: 'Mapa de recursos',
      helpTitle: '¿Necesitas una cama?', helpText: 'Para acceso a refugios de adultos y la lista de espera, llama al equipo municipal.',
      helpMore: 'Familias y jóvenes tienen otras vías de acceso. Pregunta al equipo municipal.',
      beforeTitle: 'Ten en cuenta', beforeText: 'Todos los horarios son de San Francisco. No se muestra disponibilidad en tiempo real.',
      moreHelp: 'Más opciones de comida: llama al 211', emergency: 'En una emergencia, llama al 911.',
      save: 'Guardar lista', saved: 'Tu lista de texto está lista para guardar.', saveFailed: 'No se pudo guardar. Puedes usar la opción Imprimir de tu navegador.',
      print: 'Imprimir', footer: 'Un proyecto comunitario independiente. Sin cuenta, anuncios ni seguimiento de ubicación.',
      footerNote: 'Un punto de partida, no un directorio completo. Confirma los detalles con el proveedor.',
      offline: 'Sin conexión. Los datos guardados siguen aquí; los mapas y enlaces necesitan internet.',
      translation: 'Los nombres y direcciones se mantienen en inglés para facilitar la navegación. Resúmenes traducidos como ayuda.',
      about: 'Sobre esta guía', privacy: 'No enviamos tu ubicación a un servidor. Al cargar el mapa, el proveedor recibe solicitudes de red normales; los servicios externos tienen sus propias políticas de privacidad.'
    },
    zh: {
      title: '寻找食物，寻找落脚处。', intro: '旧金山免费社区资源，把出发前需要知道的信息放在一起。',
      tagline: '社区互助资源指南', skip: '跳转至资源列表', language: '语言',
      all: '全部资源', food: '免费餐食', shelter: '临时住所', groceries: '食品领取',
      search: '搜索名称、街道或街区', searchHint: '试试 “Bayview”、“Polk” 或 “GLIDE”',
      locate: '按距离排序', locating: '正在获取位置…', clearLocation: '清除位置',
      locationHint: '可选功能。位置只在本页面使用，不会保存。',
      locationReady: '已按大致直线距离排序，并非实际步行距离。',
      locationDenied: '未共享位置。仍可按街道或街区搜索。',
      locationUnavailable: '暂时无法定位。可稍后重试，或直接搜索街区。',
      locationTimeout: '定位超时。请重试，或使用搜索框。',
      locationInsecure: '定位需要安全连接。请先按街道或街区搜索。',
      locationOutside: '你似乎不在旧金山。这里列出的资源均位于旧金山。',
      locationApproximate: '定位精度较低，距离排序可能不准确。',
      results: '项资源', result: '项资源', resultsTitle: '从这里开始',
      emptyTitle: '没有找到匹配的资源', emptyText: '请试试街区或街道名称，或清除筛选查看全部资源。', reset: '清除筛选',
      notice: '服务时间可能变化。出发前请致电确认；收容床位不保证有空缺。',
      checked: '资料核查于', stale: '本目录已超过 30 天未核查，请在出发前向机构确认最新信息。',
      walkin: '可直接前往用餐', intake: '需基本登记', walkup: '可现场排队', waitlist: '需预约候补', finder: '查询领取点',
      hours: '服务时间', know: '出发前须知', call: '拨打电话', directions: '步行路线', onMap: '在地图上查看',
      sources: '来源与详情', official: '机构 / 市政府资料', cityRegistration: '市政府收容登记入口',
      citywide: '多个食品领取点', approx: '英里 · 直线距离',
      mapTitle: '查看地点位置', mapIntro: '需要时再加载地图。不打开地图也能使用列表。', loadMap: '加载地图', hideMap: '收起地图',
      mapLoading: '正在加载地图…', mapError: '地图未能加载。可重试，或使用各地点的“步行路线”。',
      tileError: '部分地图图块未能加载，标记可能出现在空白底图上。请使用“步行路线”或重试。',
      mapFile: '直接打开文件时无法显示地图。“步行路线”仍可打开在线地图。', retry: '重试',
      mapHint: '标记为大致位置，请核对街道地址及入口。', mapNoPins: '当前筛选没有可标注地点。食品领取请使用 Food Bank 官方查询工具。',
      mapPrivacy: '加载地图会连接 OpenStreetMap；路线按钮打开 Google Maps。', mapLabel: '资源地点地图',
      helpTitle: '需要一个收容床位？', helpText: '成人收容申请及候补，请联系旧金山市外展服务团队。',
      helpMore: '家庭和青少年有不同的申请途径，可向市政府团队咨询适合的服务。',
      beforeTitle: '出发前请留意', beforeText: '所有时间均为旧金山当地时间。目录展示公布的服务信息，不代表实时可用名额。',
      moreHelp: '更多食物资源：拨打 211', emergency: '紧急情况请拨打 911。',
      save: '保存列表', saved: '文字列表已准备好，可保存到手机。', saveFailed: '未能保存列表，可使用浏览器的打印功能。',
      print: '打印', footer: '独立社区公益项目。无需账号，无广告，不追踪位置。',
      footerNote: '这里只是一份入门指南，并非全部服务目录。请向服务机构确认详情。',
      offline: '目前处于离线状态，可查看已保存的信息；地图和外部网页需要联网。',
      translation: '为便于问路，机构名称及地址保留英文。翻译摘要仅供辅助理解。',
      about: '关于本指南', privacy: '我们不会将你的位置发送到服务器。加载地图时，地图提供方会收到常规网络请求；外部服务有各自的隐私政策。'
    }
  };
  const iconPaths = {
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 3H3a1 1 0 0 0-1 1c0 10 8 18 18 18a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-8-8l2-2-2-5Z"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    food: '<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-5 2-5 10 0 10"/>',
    shelter: '<path d="m3 10 9-7 9 7v11H3Zm6 11v-8h6v8"/>',
    groceries: '<path d="M4 9h16l-2 12H6ZM8 9l4-7 4 7M9 13v4m6-4v4"/>',
    locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
    heart: '<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z"/>'
  };
  function icon(name) { return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (iconPaths[name] || iconPaths.pin) + '</svg>'; }
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function distance(a, b) {
    const rad = Math.PI / 180, p = (b.lat-a.lat)*rad, q = (b.lng-a.lng)*rad;
    const h = Math.sin(p/2)**2 + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(q/2)**2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1-h)));
  }
  function hasPoint(r) { return Number.isFinite(r.lat) && Number.isFinite(r.lng); }
  function normalize(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ''); }
  function filter(resources, type, query, location) {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    const list = resources.filter(r => (type === 'all' || r.type === type) && words.every(w => normalize([r.name,r.address,r.neighborhood,r.type,...['en','es','zh'].map(l => labels[l][r.type])].join(' ')).includes(w)));
    if (location) list.sort((a,b) => (hasPoint(a) ? distance(location,a) : Infinity) - (hasPoint(b) ? distance(location,b) : Infinity));
    return list;
  }
  function directions(r) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(r.address) + '&travelmode=walking'; }
  function formatPhone(n) { return n.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'); }
  function dateLabel(date, lang) { return new Date(date+'T12:00:00Z').toLocaleDateString({en:'en-US',es:'es-US',zh:'zh-CN'}[lang], {year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}); }
  function card(r, lang, checked, location) {
    const t = labels[lang] || labels.en, copy = r[lang] || r.en;
    const distanceText = location && hasPoint(r) ? '<span class="distance">'+distance(location,r).toFixed(1)+' '+escape(t.approx)+'</span>' : '';
    return '<li class="resource" id="resource-'+escape(r.id)+'" data-resource-id="'+escape(r.id)+'">'+
      '<div class="resource-top"><span class="category category-'+r.type+'">'+icon(r.type)+escape(t[r.type])+'</span><span class="neighborhood">'+escape(r.neighborhood)+'</span>'+distanceText+'</div>'+
      '<h3>'+escape(r.name)+'</h3><p class="address">'+escape(r.address || t.citywide)+'</p>'+
      '<p class="access access-'+r.access+'">'+escape(t[r.access])+'</p>'+
      '<p class="hours"><span class="sr-only">'+escape(t.hours)+': </span>'+escape(copy.hours)+'</p>'+
      '<p class="resource-note">'+escape(copy.note)+'</p>'+
      '<div class="resource-actions"><a class="button button-primary" href="'+escape(r.url || directions(r))+'" target="_blank" rel="noopener noreferrer">'+icon(r.url ? 'arrow' : 'pin')+escape(r.url ? t.finder : t.directions)+'<span class="sr-only"> · '+escape(r.name)+'</span></a>'+
      '<a class="button button-secondary" href="tel:+1'+r.phone+'" aria-label="'+escape(t.call+' '+formatPhone(r.phone)+' · '+copy.phoneLabel)+'">'+icon('phone')+escape(t.call)+' <span class="phone-number">'+formatPhone(r.phone)+'</span></a></div>'+
      '<div class="resource-bottom"><details><summary>'+escape(t.sources)+'</summary><div class="source-details"><p>'+escape(t.checked)+': '+escape(dateLabel(checked,lang))+'</p><p>'+escape(copy.phoneLabel)+': '+formatPhone(r.phone)+'</p>'+r.sources.map(s => '<a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">'+escape(s.name)+'</a>').join('')+(r.access==='waitlist'?'<a href="https://www.sf.gov/sign-adult-shelter-san-francisco" target="_blank" rel="noopener noreferrer">'+escape(t.cityRegistration)+'</a>':'')+'</div></details>'+
      (hasPoint(r)?'<button type="button" class="text-button js-only" data-map-id="'+escape(r.id)+'">'+escape(t.onMap)+'</button>':'')+'</div></li>';
  }
  return {labels, icon, escape, distance, hasPoint, filter, directions, formatPhone, dateLabel, card};
});
