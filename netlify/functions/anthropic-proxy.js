const https = require('https');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'},body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405,body:'Method not allowed'};
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return {statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:'No API key'})};
  try {
    const b = JSON.parse(event.body);
    const rb = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: b.max_tokens || 2000,
      messages: b.messages,
    });
    const result = await new Promise((resolve,reject) => {
      const req = https.request({hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',headers:{'Content-Type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01','Content-Length':Buffer.byteLength(rb)}},(res) => {
        let d=''; res.on('data',(c)=>{d+=c;}); res.on('end',()=>{resolve({statusCode:res.statusCode,body:d});});
      });
      req.on('error',reject); req.write(rb); req.end();
    });
    return {statusCode:result.statusCode,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},body:result.body};
  } catch(e) {
    return {statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:e.message})};
  }
};
