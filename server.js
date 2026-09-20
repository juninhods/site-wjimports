const http=require("http"),fs=require("fs"),path=require("path");
const PORT=Number(process.env.PORT||10000),HOST="0.0.0.0";
const BASE=(process.env.SUPERFRETE_BASE_URL||"https://api.superfrete.com").replace(/\/$/,"");
const TOKEN=process.env.SUPERFRETE_TOKEN||"";
const ORIGIN=String(process.env.SUPERFRETE_ORIGIN_CEP||"").replace(/\D/g,"");
const ROOT=__dirname;
const MIME={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon"};
function send(res,status,data,type="application/json; charset=utf-8"){res.writeHead(status,{"Content-Type":type,"Cache-Control":"no-store"});res.end(type.startsWith("application/json")?JSON.stringify(data):data)}
function readBody(req){return new Promise((resolve,reject)=>{let b="";req.on("data",c=>{b+=c;if(b.length>100000)reject(new Error("Payload muito grande."))});req.on("end",()=>{try{resolve(JSON.parse(b||"{}"))}catch{reject(new Error("JSON inválido."))}});req.on("error",reject)})}
function normalize(r){const price=Number(r?.price??r?.total_price??r?.amount??r?.cost??r?.value??0);return{id:r?.id??r?.service_id??r?.serviceCode??null,name:r?.name??r?.service??r?.service_name??r?.description??"Envio",price:Number.isFinite(price)?price:0,deliveryTime:r?.delivery_time??r?.deliveryTime??r?.deadline??r?.delivery_days??r?.deliveryDays??r?.days??null}}
async function calculate(body){
  if(!TOKEN)throw new Error("SUPERFRETE_TOKEN não configurado no servidor.");
  if(ORIGIN.length!==8)throw new Error("SUPERFRETE_ORIGIN_CEP não configurado corretamente no servidor.");
  const cep=String(body.cep||"").replace(/\D/g,"");if(cep.length!==8)throw new Error("CEP de destino inválido.");
  const quantity=Math.max(1,Math.min(20,Number(body.quantity||1)));
  const weight=Math.max(.1,Number(body.weight||.3));
  const payload={from:{postal_code:ORIGIN},to:{postal_code:cep},package:{weight:weight*quantity,height:Math.max(1,Number(body.height||10)),width:Math.max(1,Number(body.width||15)),length:Math.max(1,Number(body.length||20))}};
  const r=await fetch(`${BASE}/api/v0/calculator`,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json","User-Agent":"WJ-Imports/1.0","Authorization":`Bearer ${TOKEN}`},body:JSON.stringify(payload)});
  const t=await r.text();let d;try{d=JSON.parse(t)}catch{d={raw:t}}
  if(!r.ok)throw new Error(d?.message||d?.error||d?.errors?.[0]?.message||`SuperFrete retornou HTTP ${r.status}.`);
  const raw=Array.isArray(d)?d:Array.isArray(d?.services)?d.services:Array.isArray(d?.rates)?d.rates:Array.isArray(d?.data)?d.data:[];
  return{rates:raw.map(normalize).filter(x=>x.price>0).sort((a,b)=>a.price-b.price)}
}
function staticFile(req,res){let p=decodeURIComponent(new URL(req.url,`http://${req.headers.host||"localhost"}`).pathname);if(p==="/")p="/index.html";const f=path.resolve(ROOT,"."+p);if(!f.startsWith(ROOT))return send(res,403,{error:"Acesso negado."});fs.readFile(f,(e,d)=>{if(e)return send(res,404,{error:"Arquivo não encontrado."});const ext=path.extname(f).toLowerCase();res.writeHead(200,{"Content-Type":MIME[ext]||"application/octet-stream","Cache-Control":/\.(html|js|css)$/.test(ext)?"no-cache":"public,max-age=86400"});res.end(d)})}
http.createServer(async(req,res)=>{try{if(req.method==="POST"&&req.url==="/api/frete")return send(res,200,await calculate(await readBody(req)));if(req.method==="GET"&&req.url==="/api/health")return send(res,200,{ok:true,superfreteConfigured:Boolean(TOKEN&&ORIGIN.length===8)});if(req.method!=="GET")return send(res,405,{error:"Método não permitido."});staticFile(req,res)}catch(e){console.error(e);send(res,500,{error:e.message||"Erro interno."})}}).listen(PORT,HOST,()=>console.log(`WJ Imports: ${HOST}:${PORT} | SuperFrete: ${TOKEN?"configurado":"ausente"} | Origem: ${ORIGIN||"ausente"}`));
