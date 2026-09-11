// Service worker minimo, existente apenas para o app poder ser instalado.
//
// O Chrome so oferece a instalacao nativa (o evento beforeinstallprompt, que
// o botao "Instalar app" espera) se a pagina registrar um service worker com
// handler de fetch. Sem isso, o Android oferece apenas "adicionar a tela
// inicial", que cria um atalho — era o motivo de o app nao instalar de fato.
//
// De proposito NAO existe cache aqui. O mercadinho mostra estoque e pedidos,
// e servir uma versao guardada e exatamente o que faria o saldo velho
// reaparecer, problema que ja custou caro. Toda requisicao vai para a rede.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Handler vazio de proposito: satisfaz o critério de instalabilidade sem
// interceptar nada. Sem respondWith, o navegador segue direto para a rede.
self.addEventListener('fetch', () => {})
