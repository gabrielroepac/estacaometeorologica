const CHANNEL_ID = '3321343';
const READ_API_KEY = ''; // Deixe vazio se for público

let url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=20`;
if (READ_API_KEY !== '') {
    url += `&api_key=${READ_API_KEY}`;
}

// 1. INICIALIZAÇÃO DO GRÁFICO COM DOIS EIXOS Y
const ctx = document.getElementById('meuGrafico').getContext('2d');
const meuGrafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], 
        datasets: [
            {
                label: 'Temperatura (°C)',
                data: [],
                borderColor: '#ff5722',
                backgroundColor: 'rgba(255, 87, 34, 0.05)',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#ff5722',
                yAxisID: 'yTemperatura' // Vincula esta linha ao eixo da esquerda
            },
            {
                label: 'Umidade (%)',
                data: [],
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0, 188, 212, 0.05)',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#00bcd4',
                yAxisID: 'yUmidade' // Vincula esta linha ao eixo da direita
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { family: 'Segoe UI', size: 12 } }
            }
        },
        scales: {
            x: {
                grid: { display: false }
            },
            // Configuração do Eixo Esquerdo (Temperatura)
            yTemperatura: {
                type: 'linear',
                position: 'left',
                min: -10,
                max: 40,
                title: {
                    display: true,
                    text: 'Temperatura (°C)',
                    color: '#ff5722',
                    font: { weight: 'bold' }
                },
                grid: { color: '#f1f5f9' }
            },
            // Configuração do Eixo Direito (Umidade)
            yUmidade: {
                type: 'linear',
                position: 'right',
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Umidade (%)',
                    color: '#00bcd4',
                    font: { weight: 'bold' }
                },
                // Oculta as linhas de grade deste eixo para não cruzar e bagunçar com as da esquerda
                grid: { drawOnChartArea: false } 
            }
        }
    }
});

// 2. BUSCA E FORMATAÇÃO DOS DADOS
async function atualizarDashboard() {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        const feeds = data.feeds;

        if (feeds && feeds.length > 0) {
            // Horários para o eixo X
            const listaHorarios = feeds.map(feed => {
                const dataHora = new Date(feed.created_at);
                return dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            });

            // Coleta os dados brutos para o gráfico
            const dadosCampo1 = feeds.map(feed => feed.field1);
            const dadosCampo2 = feeds.map(feed => feed.field2);

            // Atualiza o gráfico
            meuGrafico.data.labels = listaHorarios;
            meuGrafico.data.datasets[0].data = dadosCampo1;
            meuGrafico.data.datasets[1].data = dadosCampo2;
            meuGrafico.update();

            // Pega o último registro para os cartões superiores
            const ultimoRegistro = feeds[feeds.length - 1];
            
            // FORMATAÇÃO COM APENAS 1 CASA DECIMAL (.toFixed(1))
            if (ultimoRegistro.field1 !== null) {
                const tempFormatada = Number(ultimoRegistro.field1).toFixed(1);
                document.getElementById('txt-field1').innerText = `${tempFormatada} °C`;
            } else {
                document.getElementById('txt-field1').innerText = '--';
            }

            if (ultimoRegistro.field2 !== null) {
                const umidFormatada = Number(ultimoRegistro.field2).toFixed(1);
                document.getElementById('txt-field2').innerText = `${umidFormatada} %`;
            } else {
                document.getElementById('txt-field2').innerText = '--';
            }

            // Atualiza rodapé
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

atualizarDashboard();
setInterval(atualizarDashboard, 15000);
