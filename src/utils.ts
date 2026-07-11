import type { WikiResult, WikiImage, MakeResult, ModelResult } from './types';

export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => String(CURRENT_YEAR - i));
export const SEARCH_TIMEOUT = 10000;
export const WIKI_API = 'https://commons.wikimedia.org/w/api.php';
export const searchCache = new Map<string, WikiResult>();

const LARGE_SUV_MODELS = /\b(suburban|tahoe|yukon|expedition|navigator|escalade|armada|sequoia|land.cruiser|prado|fj.cruiser|montero|pajero|wrangler.unlimited|gls|x7|q7|q8|cayenne|bentayga|cullinan|ghost|phantom|urus|levante|grecale)\b/i;
const SUV_MODELS = /\b(cr-v|rav4|escape|tucson|sportage|forester|cx-5|cx-9|cx-30|cx-50|cx-90|highlander|pilot|pathfinder|murano|rogue|x-trail|qashqai|equinox|traverse|blazer|explorer|edge|territory|endeavour|kuga|ecosport|santa.?fe|kona|venue|telluride|sorento|sportage|niro|seltos|ev6|id\.4|id\.5|enyaq|model.y|model.x|x5|x3|x1|x6|q5|q3|gle|glc|glb|gla|touareg|tiguan|taos|atlas|compass|cherokee|grand.cherokee|wrangler|renegade|fiat.500x|duster|sandero.stepway|captur|kadjar|arkana|austral|t-cross|t-roc|taigo|tracker|trailblazer|trax|encore|envision|xterra|4runner|outlander|eclipse.cross|xceed|ceed|stonic|wrx|crosstrek|forester|outback|ascent|levorg|xv|hr-v|zr-v|vezel|passport|mux|mu-x|sw4|etron|q4|q6|gt|eqb|eqc|eqe|eqs|ix|ix3|ix5|i4|i5|i7|xc40|xc60|xc90|x60|x90|q2|bmwx)\d*\b/i;
const SEDAN_MODELS = /\b(civic|corolla|sentra|altima|accord|camry|malibu|fusion|focus|fiesta|elantra|sonata|azera|avante|optima|k5|rio|forte|mazda3|mazda6|323|626|subaru.impreza|legacy|galant|lancer|mirage|versa|sunny|tiida|almera|leaf|prius|corona|carina|premio|allion|belta|vios|yaris.sedan|city|grace|brio.sedan|vento|jetta|passat|jetta|golf.sedan|fabia|rapid|octavia|superb|laguna|megane.sedan|fluence|duster.sedan|logan|symbol|clio.sedan|talisman|c-class|e-class|s-class|cla|clk|3-series|5-series|7-series|2-series|4-series|a3.sedan|a4|a5.sportback|a6|a8|s60|s90|v60|s80|ct4|ct5|ct6|ats|xts|tsx|rlx|rl|tlx|ilx|integra|legend|laurel|skyline|teana|cefiro|victoria|crown|mark.x|sail|cavalier|onix|prisma|classic|astra|vectra|insignia|monza|cobalt|cruze|malibu|impala|caprice|fusion)\b/i;
const HATCHBACK_MODELS = /\b(golf|yaris|fit|jazz|fiesta|focus|mazda2|mazda3|swift|baleno|celerio|ignis|spark|matiz|aveo|sonic|polo|ibiza|leon|clio|megane|208|308|508|c3|c4|micra|note|pulse|kwid|tiago|nano|alto|splash|agile|onix.hatch|prisma.hatch|fiesta.hatch|focus.hatch|corsa|astra|vectra.hatch|insignia.hatch|i20|i10|i30|rio.hatch|forte5|ceed|proceed|xceed|swift.sport|vitara)\b/i;
const COUPE_MODELS = /\b(mustang|camaro|charger|challenger|corvette|supra|gt86|gr86|brz|fr-s|mx-5|miata|s2000|nsx|rc-f|lc500|rc350|370z|350z|z4|m2|m4|i8|tt|r8|a5.coupe|s5.coupe|e-class.coupe|c-class.coupe|clc|4-series|6-series|8-series|porsche.911|porsche.718|cayman|boxster|458|488|f8|roma|portofino|huracan|aventador|urus|golf.gti|golf.r|civic.type.r|focus.rs|megane.rs|i30.n|veloster|elantra.coupe|ford.gt|viper|db11|vantage|dbs|continental.gt|supra)\b/i;
const WAGON_MODELS = /\b(outback|levorg|passat.variant|golf.variant|octavia.combi|superb.combi|focus.wagon|mazda6.wagon|3-series.touring|5-series.touring|e-class.wagon|c-class.wagon|volvo.v60|volvo.v90|regal.tourx|insignia.sports.tourer|cla.shooting.brake|a4.avant|a6.avant|clase.golf.familiar|ibiza.st|leon.st)\b/i;
const CONVERTIBLE_MODELS = /\b(mx-5|miata|z4|boxster|cayman|718|porsche.911|camaro.convertible|mustang.convertible|corvette.convertible|audi.tt|bmw.4-series.convertible|bmw.2-series.convertible|mazda.mx-5|fiat.124.spider|abarth.124|mercedes.slc|mercedes.slk|mercedes.e-class.convertible|mercedes.c-class.convertible|volkswagen.eos|volkswagen.golf.cabrio|mini.convertible|smart.cabrio|lotus.elise|lotus.exige|lamborghini.huracan|lamborghini.aventador|ferrari.488|ferrari.roma|mclaren.720s|mclaren.artura)\b/i;
const MOTORCYCLE_MODELS = /\b(harley|harley-davidson|street.glide|road.glide|fat.boy|iron|sportster|nightster|softail|heritage|electra.glide|road.king|low.rider|dyna|wide.glide|breakout|v-rod|vrsc|gold.wing|shadow|rebel|grom|monkey|navi|dio|activa|sh|pcx|forza|silver.wing|cbr|cb|crf|xr|xl|vfr|st|nt|yamaha|yzf|r1|r6|r3|r7|mt-09|mt-07|mt-10|fz|vmax|bolt|star|stratoliner|roadliner|venture|super.tenere|tracer|niken|tricity|suzuki|gsx-r|gsx-s|gsx|hayabusa|bandit|v-strom|dl|dr|dr-z|rm|kawasaki|ninja|z900|z650|z400|z1000|versys|vulcan|kfx|klx|kz|bmw.motorrad|r.1200|r.1250|s.1000|k.1600|f.800|f.900|g.310|ducati|monster|multistrada|panigale|streetfighter|scrambler|supersport|hypermotard|diavel|triumph|bonneville|street.twin|speed.twin|tiger|rocket|thruxton|daytona|speed.triple|street.triple|scrambler|ktm|duke|adventure|rc|exc|sx|sxf|excf|husqvarna|vitpilen|svartpilen|norden|indian|scout|chief|challenger|springfield|victory|cross.country|cross.roads|high.ball|judge|gunner|vespa|primavera|sprint|gts|gtr|aprilia|tuono|rsv4|rs660|tuareg|shiver|dorsoduro|moto.guzzi|v7|v9|v85|brough.superior|cake|zero|livewire|energica|lightning|sym|kymco|genesis|vento|bajaj|tvss)\b/i;
const TRAILER_MODELS = /\b(trailer|cargo|utility.trailer|enclosed|dump.trailer|flatbed|tilt|equipment.trailer|car.hauler|boat.trailer|jet.ski.trailer|motorcycle.trailer|livestock|horse.trailer|stock.trailer|gooseneck|fifth.wheel|toy.hauler|travel.trailer|camper|rv|motorhome|fleetwood|winnebago|airstream|jayco|forest.river|keystone|thor|heartland|grand.design|lance|northwood|nuwa|outdoors.rv|starcraft|kz|venture|pilgrim|cougar|hideout|passport|mili|work.trailer|landscaping|landscape.trailer|log.splitter|tilt.deck|car.carrier|tow.dolly|adaptador|remolque)\b/i;
const PICKUP_MODELS = /\b(f-?\d{3}|ram\s|silverado|sierra|tacoma|tundra|frontier|ranger|hilux|hi-lux|d-max|navara|np300|colt|l200|triton|strada|s10|dakota|canyon|colorado|mitsubishi.l200|toyota.hilux|nissan.navara|ford.ranger|chevrolet.s10|chevrolet.colorado|gmc.canyon|ram.1500|ram.2500|ram.3500|cybertruck|ridgeline)\b/i;
const VAN_MODELS = /\b(odyssey|sienna|carnival|pacifica|grand.caravan|town.country|transit|express|promaster|nv200|nv|kombi|multivan|caddy|berlingo|partner|kangoo|doblo|scudo|jumpy|traveller|trafic|primastar|vivaro|move|safari|astro|e-life|e-delivery)\b/i;

export function typeFromModel(make: string, model: string, makeTypes?: string[]): string | null {
  const m = `${make} ${model}`.toLowerCase();
  if (TRAILER_MODELS.test(m)) return 'Trailer';
  if (MOTORCYCLE_MODELS.test(m)) return 'Motorcycle';
  if (LARGE_SUV_MODELS.test(m)) return 'Large SUV';
  if (SUV_MODELS.test(m)) return 'SUV';
  if (PICKUP_MODELS.test(m)) return 'Pickup Truck';
  if (VAN_MODELS.test(m)) return 'Minivan';
  if (HATCHBACK_MODELS.test(m)) return 'Hatchback';
  if (COUPE_MODELS.test(m)) return 'Coupe';
  if (CONVERTIBLE_MODELS.test(m)) return 'Convertible';
  if (WAGON_MODELS.test(m)) return 'Wagon';
  if (SEDAN_MODELS.test(m)) return 'Sedan';
  if (makeTypes && makeTypes.length > 0) {
    if (makeTypes.includes('Motorcycle')) return 'Motorcycle';
    if (makeTypes.includes('Trailer')) return 'Trailer';
    if (makeTypes.includes('Off Road Vehicle')) return 'Motorcycle';
    if (makeTypes.includes('Low Speed Vehicle (LSV)')) return 'Motorcycle';
    if (makeTypes.includes('Passenger Car')) return 'Sedan';
    if (makeTypes.includes('Multipurpose Passenger Vehicle (MPV)')) return 'SUV';
    if (makeTypes.includes('Truck')) return 'Pickup Truck';
  }
  return null;
}

export function matchBodyClass(raw: string): string {
  const n = raw.toLowerCase();
  const patterns: [string, string][] = [
    ['pickup', 'Pickup Truck'], ['truck', 'Truck'],
    ['suv', 'SUV'], ['crossover', 'SUV'],
    ['sedan', 'Sedan'], ['coupe', 'Coupe'],
    ['hatchback', 'Hatchback'], ['convertible', 'Convertible'],
    ['wagon', 'Wagon'], ['minivan', 'Minivan'], ['van', 'Van'],
    ['motorcycle', 'Motorcycle'], ['trailer', 'Trailer'],
  ];
  for (const [kw, mapped] of patterns) {
    if (n.includes(kw)) return mapped;
  }
  return 'default';
}

export const TYPE_EMOJI: Record<string, string> = {
  Sedan: '\u{1F697}', SUV: '\u{1F699}',
  'Pickup Truck': '\u{1F6FB}', Truck: '\u{1F6FB}',
  Coupe: '\u{1F3CE}', Hatchback: '\u{1F697}',
  Convertible: '\u{1F698}', Wagon: '\u{1F697}',
  Minivan: '\u{1F690}', Van: '\u{1F690}',
  Motorcycle: '\u{1F3CD}', Trailer: '\u{1F69B}',
};
export const DEFAULT_EMOJI = '\u{1F697}';

export async function fetchMakes(): Promise<MakeResult[]> {
  const r = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json');
  const d = await r.json();
  const seen = new Set<number>();
  const unique = ((d.Results ?? []) as MakeResult[]).filter((m) => {
    if (seen.has(m.Make_ID)) return false;
    seen.add(m.Make_ID);
    return true;
  });
  unique.sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
  return unique;
}

export async function fetchModelsForMake(makeId: number, year: string | null): Promise<ModelResult[]> {
  const url = year
    ? `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`
    : `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${makeId}?format=json`;
  const r = await fetch(url);
  const d = await r.json();
  const seen = new Set<number>();
  const unique = ((d.Results ?? []) as ModelResult[]).filter((md) => {
    if (seen.has(md.Model_ID)) return false;
    seen.add(md.Model_ID);
    return true;
  });
  unique.sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
  return unique;
}

export async function fetchMakeTypes(makeName: string): Promise<string[]> {
  const r = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMake/${encodeURIComponent(makeName)}?format=json`);
  const d = await r.json();
  const types: string[] = (d.Results ?? []).map((r: any) => r.VehicleTypeName).filter(Boolean);
  return [...new Set(types)];
}

export async function searchWikimedia(make: string, model: string, year: string | null): Promise<WikiResult> {
  const searchTerm = year ? `"${make} ${model}" ${year}` : `"${make} ${model}"`;
  const url = `${WIKI_API}?action=query&format=json&formatversion=2&origin=*&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&iiurlwidth=400&gsrlimit=20`;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'AutoLavadoWeb/1.0' } });
    clearTimeout(id);
    if (!res.ok) return { exito: false, mensaje: `HTTP ${res.status}`, total: 0, imagenes: [] };
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return { exito: false, mensaje: `Respuesta inválida`, total: 0, imagenes: [] };
    }
    if (data?.error) return { exito: false, mensaje: `API: ${data.error.info ?? ''}`, total: 0, imagenes: [] };
    const pages: any[] = data?.query?.pages;
    if (!pages || pages.length === 0) return { exito: false, mensaje: 'Sin resultados', total: 0, imagenes: [] };
    const imagenes: WikiImage[] = pages.map((p: any) => {
      const info = p?.imageinfo?.[0] ?? {};
      const meta = info.extmetadata ?? {};
      const autor = meta.Artist?.value?.replace(/<[^>]+>/g, '').trim() || 'Autor desconocido';
      const licencia = meta.LicenseShortName?.value || 'CC BY-SA';
      return {
        id: p.pageid, titulo: p.title.replace('File:', ''),
        url: info.thumburl ?? info.url, ancho: info.thumbwidth ?? info.width ?? 0,
        alto: info.thumbheight ?? info.height ?? 0, autor, licencia,
        paginaUrl: `https://commons.wikimedia.org/wiki/${p.title}`,
        atribucion: `${p.title.replace('File:', '')} | ${autor} | ${licencia}`,
      };
    });
    return { exito: true, total: imagenes.length, imagenes };
  } catch (e: any) {
    clearTimeout(id);
    return { exito: false, mensaje: e?.name === 'AbortError' ? 'Tiempo agotado' : (e?.message ?? 'Error de red'), total: 0, imagenes: [] };
  }
}

export async function downloadAsDataUri(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'AutoLavadoWeb/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
