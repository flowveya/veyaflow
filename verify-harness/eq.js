const {build}=require('./shake2.js');
const file=process.argv[2]; const crypto=require('crypto'); const h=x=>crypto.createHash('sha256').update(x).digest('hex').slice(0,12);
const api=build(file,['regDeadlinesForBrand','checkComplianceGap','regMarketApplies','renderLandedTab','seedDemoNordlys'],['localStorage','document','window','persistCritical','saveBrandState','saveSkus','buildNav','renderPage'],()=>{})({getItem:()=>null,setItem:()=>{}},{getElementById:()=>null,querySelectorAll:()=>[]},{},()=>{},()=>{},()=>{},()=>{},()=>{});
api.seedDemoNordlys(); const nord=JSON.parse(JSON.stringify(api.get.brand())); const nskus=api.get.skus();
const set=b=>{ api.set.brand(b); api.set.skus(nskus); };
set(nord); console.log('S1 NORDLYS deadlines:',api.regDeadlinesForBrand().map(r=>r.id).join(','));
const noRp=Object.assign({},nord,{euResponsible:null});
const only=m=>Object.assign({},noRp,{currentMarket:m,targetMarkets:[m],ambitionMarkets:[]});
set(only('Czechia')); console.log('S2 Czechia-only, RP cleared: hasGap',api.checkComplianceGap().hasGap);
set(only('United Kingdom')); console.log('S3 UK-only, RP cleared: hasGap',api.checkComplianceGap().hasGap);
const probe=['Sweden','Denmark','Finland','Germany','Netherlands','France','Belgium','Austria','Italy','Spain','Portugal','Ireland','Norway','Iceland','Liechtenstein','Estonia','Latvia','Lithuania','Poland','Czechia','Slovakia','Hungary','Romania','Bulgaria','Greece','Croatia','Slovenia','Luxembourg','Malta','Cyprus','United Kingdom','Switzerland','United States','Czech Republic','SE','DK','EU','',undefined];
console.log('membership via checkComplianceGap, one market each:',probe.map(m=>{ set(only(m)); return (m===undefined?'undef':m||'""')+':'+(api.checkComplianceGap().euIntent?1:0); }).join(' '));
console.log('regMarketApplies on EU rows for single-market brands:',probe.slice(0,34).map(m=>(api.regMarketApplies({market:'EU'},[m])?1:0)+(api.regMarketApplies({market:'EU/EEA'},[m])?1:0)).join(''));
const land=[]; for(const mk of ['Denmark','Norway','United Kingdom','Singapore','Germany']){ api.set.landedState&&api.set.landedState({exWorks:85,units:500,market:mk,category:'Skincare & Beauty',freightMode:'road'}); let out; try{ out=api.renderLandedTab(); }catch(e){ out='THREW '+e.message; } land.push(mk+':'+(out.startsWith('THREW')?out:h(out))); }
console.log('S4 renderLandedTab html:',land.join(' '));
