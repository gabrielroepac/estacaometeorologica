const CHANNEL_ID = '3321343';

// Se o canal for PRIVADO, coloque a chave entre as aspas. Se for PÚBLICO, deixe vazio.
const READ_API_KEY = ''; 

// Monta a URL dinâmica da API do ThingSpeak
let url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1`;
if (READ_API_KEY !== '') {
    url += `&api_key=${READ_API_KEY}`;
}

async function buscarDados() {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Erro ao se conectar com a API.');
        }

        const data = await response.json();
        const ultimoFeed = data.feeds[0]; 

        if (ultimoFeed) {
            // Extrai os valores do campo 1 e campo 2
            const valorField1 = ultimoFeed.field1;
            const valorField2 = ultimoFeed.field2;
            
            // Trata o horário UTC para o fuso horário local do navegador
            const horarioUtc = new Date(ultimoFeed.created_at);
            const horarioLocal = horarioUtc.toLocaleString('pt-BR');

            // Injeta os valores coletados no HTML
            document.getElementById('valor-field1').innerText = valorField1 !== null ? valorField1 : 'S/ Dado';
            document.getElementById('valor-field2').innerText = valorField2 !== null ? valorField2 : 'S/ Dado';
            
            document.getElementById('tempo-atualizacao').innerText = horarioLocal;
            document.getElementById('status-conexao').innerText = 'Online';
            document.getElementById('status-conexao').style.color = '#28a745';
        } else {
            document.getElementById('status-conexao').innerText = 'Nenhum dado recente encontrado.';
            document.getElementById('status-conexao').style.color = '#ffc107';
        }

    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('status-conexao').innerText = 'Erro ao ler dados (verifique a API Key).';
        document.getElementById('status-conexao').style.color = '#dc3545';
    }
}

// Executa imediatamente ao abrir a página
buscarDados();

// Atualiza a cada 15 segundos automaticamente
setInterval(buscarDados, 15000);
