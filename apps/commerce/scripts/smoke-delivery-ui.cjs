const assert = require('node:assert/strict')
const fs = require('node:fs')
const crypto = require('node:crypto')
const { chromium } = require('/tmp/vintage-browser/node_modules/playwright')
const base = 'http://localhost:9000'
function token(actor) {
  const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url')
  const now = Math.floor(Date.now()/1000)
  const data = enc({alg:'HS256',typ:'JWT'})+'.'+enc({actor_id:actor,actor_type:'user',auth_identity_id:'authid_synthetic_ci',iat:now,exp:now+600})
  return data+'.'+crypto.createHmac('sha256',process.env.JWT_SECRET).update(data).digest('base64url')
}
;(async()=>{
  if(process.env.APP_ENV!=='test' || new URL(process.env.DATABASE_URL).pathname!=='/vintage_ci') throw Error('UI smoke only in disposable CI')
  const ids=JSON.parse(fs.readFileSync('.cache/admin-identities.json','utf8'))
  const fixture=JSON.parse(fs.readFileSync('.cache/delivery-admin-report.json','utf8'))
  const browser=await chromium.launch({headless:true})
  const errors=[]
  let activePage
  try {
    async function session(role) {
      const context=await browser.newContext({viewport:{width:1440,height:1100}})
      context.setDefaultTimeout(15000)
      const response=await context.request.post(base+'/auth/session',{headers:{Authorization:'Bearer '+token(ids[role]),Origin:base}})
      assert.equal(response.status(),200,'Create native admin session')
      const me=await context.request.get(base+'/admin/users/me')
      assert.equal(me.status(),200,'Native cookie must authenticate a real seeded CI user')
      assert.equal((await me.json()).user.id,ids[role])
      const page=await context.newPage()
      activePage=page
      page.on('pageerror',e=>errors.push(e.message))
      await page.goto(base+'/app/vintage-delivery')
      await page.getByRole('heading',{name:'Regras de entrega',exact:true}).waitFor()
      await page.getByLabel('Opção de entrega',{exact:true}).selectOption(fixture.option_id)
      await page.getByTestId('active-revision').waitFor()
      return {context,page}
    }
    const {context,page}=await session('publisher')
    await page.getByLabel('Limite para benefício (R$)',{exact:true}).fill('25.00')
    await page.getByLabel('Motivo da alteração',{exact:true}).fill('QA publicação validada pelo navegador')
    await page.getByRole('button',{name:'Simular frete',exact:true}).click()
    await page.getByTestId('delivery-preview').filter({hasText:'0,00'}).waitFor()
    await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click()
    await page.getByRole('status').filter({hasText:'Rascunho salvo'}).waitFor()
    await page.getByRole('button',{name:'Publicar revisão',exact:true}).click()
    await page.getByRole('button',{name:'Confirmar publicação',exact:true}).click()
    await page.getByRole('status').filter({hasText:'Publicação confirmada'}).waitFor()
    const check=await context.request.get(base+'/admin/vintage-delivery/'+fixture.option_id)
    assert.equal((await check.json()).active_policy.threshold_minor,2500)
    await page.screenshot({path:'.cache/vintage-delivery-admin.png',fullPage:true})
    await page.setViewportSize({width:390,height:844})
    await page.screenshot({path:'.cache/vintage-delivery-admin-mobile.png',fullPage:true})
    await page.setViewportSize({width:1440,height:1100})
    await page.getByLabel('Revisão para consultar, publicar ou reverter',{exact:true}).selectOption('baseline')
    await page.getByLabel('Motivo da alteração',{exact:true}).fill('QA reversão validada pelo navegador')
    await page.getByRole('button',{name:'Reverter para revisão',exact:true}).click()
    await page.getByRole('button',{name:'Confirmar reversão',exact:true}).click()
    await page.getByRole('status').filter({hasText:'Reversão confirmada'}).waitFor()
    await context.close()
    const viewer=await session('viewer')
    assert.equal(await viewer.page.getByRole('button',{name:'Salvar rascunho',exact:true}).isDisabled(),true)
    assert.equal(await viewer.page.getByRole('button',{name:'Publicar revisão',exact:true}).count(),0)
    await viewer.context.close()
    assert.deepEqual(errors,[])
    fs.writeFileSync('.cache/delivery-ui-report.json',JSON.stringify({status:'PASS',browser:'Chromium',checks:['native_session_and_user_identity','form_preview','save_draft','confirm_publish','readback_active_policy','rollback','viewer_controls'],page_errors:errors,synthetic_only:true},null,2)+'\n')
    console.log('DELIVERY_UI_PASS: native admin session, preview, draft, publish, rollback and viewer permissions')
  } catch(error) {
    if(activePage && !activePage.isClosed()) await activePage.screenshot({path:'.cache/vintage-delivery-admin.png',fullPage:true}).catch(()=>{})
    console.log('DELIVERY_UI_FAILURE',error instanceof Error ? error.message : String(error),JSON.stringify(errors))
    throw error
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
