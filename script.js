const CHANNEL_ID = '3321343';
const READ_API_KEY = ''; // Deixe vazio se o canal for público

// ATENÇÃO: Mudamos para pedir os últimos 20 resultados para alimentar o gráfico histórico
let url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=20`;
if (READ_API_KEY !== '') {
    url += `&api_key=${READ_API_KEY}`;
}

// 1. INICIALIZAÇÃO DO GRÁFICO (Chart.js)
// Criamos o gráfico vazio primeiro para depois apenas injetar dados nele
const ctx = document.getElementById('meuGrafico').getContext('2d');
const meuGrafico = new Chart(ctx, {
    type: 'line', // Tipo do gráfico: Linha
    data: {
        labels: [], // Eixo X (Horários) - será preenchido pela API
        datasets: [
            {
                label: 'Campo 1',
                data: [], // Dados do Campo 1
                borderColor: '#3b82f6', // Cor da linha azul
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Sombra leve abaixo da linha
                borderWidth: 3,
                tension: 0.3, // Deixa a linha levemente curvada/suave em vez de bicos retos
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            },
            {
                label: 'Campo 2',
                data: [], // Dados do Campo 2
                borderColor: '#10b981', // Cor da linha verde
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Permite que o CSS controle a altura
        plugins: {
            legend: {
                position: 'top', // Posição da legenda das linhas
                labels: { font: { family: 'Segoe UI', size: 12 } }
            }
        },
        scales: {
            x: {
                grid: { display: false } // Remove as linhas de grade verticais do fundo para visual limpo
            },
            y: {
                grid: { color: '#f1f5f9' } // Deixa as linhas horizontais bem discretas
            }
        }
    }
});

// 2. FUNÇÃO QUE BUSCA OS DADOS E ATUALIZA O GRÁFICO
async function atualizarDashboard() {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        const feeds = data.feeds;

        if (feeds && feeds.length > 0) {
            // Processa as informações para o Gráfico
            // Mapeamos os horários transformando em formato legível de hora (Ex: 14:35)
            const listaHorarios = feeds.map(feed => {
                const dataHora = new Date(feed.created_at);
                return dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            });

            // Mapeia os dados das colunas
            const dadosCampo1 = feeds.map(feed => feed.field1);
            const dadosCampo2 = feeds.map(feed => feed.field2);

            // Atualiza os dados dentro do objeto do Chart.js
            meuGrafico.data.labels = listaHorarios;
            meuGrafico.data.datasets[0].data = dadosCampo1;
            meuGrafico.data.datasets[1].data = dadosCampo2;
            
            // Renderiza o gráfico novamente com os novos dados e animação
            meuGrafico.update();

            // Atualiza também os textos dos cards com o valor mais recente (última posição da lista)
            const ultimoRegistro = feeds[feeds.length - 1];
            
            document.getElementById('txt-field1').innerText = ultimoRegistro.field1 !== null ? ultimoRegistro.field1 : '--';
            document.getElementById('txt-field2').innerText = ultimoRegistro.field2 !== null ? ultimoRegistro.field2 : '--';

            // Atualiza o status
            const ultimaAtualizacao = new Date(ultimoRegistro.created_at).toLocaleTimeString('pt-BR');
            document.getElementById('status-conexao').innerHTML = `Online • <span style="color:#64748b">Última: ${ultimaAtualizacao}</span>`;
            document.getElementById('status-conexao').className = 'status-online';

        } else {
            document.getElementById('status-conexao').innerText = 'Sem dados disponíveis.';
        }

    } catch (error) {
        console.error('Erro ao atualizar:', error);
        document.getElementById('status-conexao').innerText = 'Erro de conexão';
        document.getElementById('status-conexao').style.color = '#ef4444';
    }
}

// Executa ao carregar a página
atualizarDashboard();

// Atualiza a cada 15 segundos
setInterval(atualizarDashboard, 15000);
