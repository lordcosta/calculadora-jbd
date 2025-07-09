// Função para formatar valor em reais
function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para carregar os dados do município selecionado
async function carregarMunicipio(municipio) {
    const response = await fetch(`dados/${municipio}.json`);
    return await response.json();
}

// Função para atualizar as opções de forma de pagamento
function atualizarFormasPagamento(dados, tipo, metragem) {
    const selectForma = document.getElementById('formaPagamento');
    selectForma.innerHTML = '';

    let opcoes = [];
    if (metragem <= 400) {
        opcoes = dados[tipo.toLowerCase()].fixo;
    } else {
        opcoes = dados[tipo.toLowerCase()].excedente;
    }

    opcoes.forEach(forma => {
        const option = document.createElement('option');
        option.value = forma.nome;
        option.text = forma.nome;
        selectForma.appendChild(option);
    });
}

// Função para calcular valor
function calcularValor(dados, tipo, metragem, formaNome) {
    const categoria = dados[tipo.toLowerCase()];
    let valorBase = 0;
    let excedente = 0;
    let valorTotal = 0;
    let parcelas = 1;

    if (metragem <= 400) {
        const forma = categoria.fixo.find(f => f.nome === formaNome);
        valorTotal = forma.total;
        parcelas = forma.parcelas;
    } else {
        const forma = categoria.excedente.find(f => f.nome === formaNome);
        parcelas = forma.parcelas;

        const faixa = categoria.faixas.find(f => metragem >= f.de && metragem <= f.ate);
        excedente = (metragem - 400) * faixa.valores[formaNome];
        valorBase = faixa.valor_fixo;
        valorTotal = valorBase + excedente;
    }

    return {
        valorBase,
        excedente,
        valorTotal,
        parcelas,
        valorParcela: valorTotal / parcelas
    };
}

// Função para atualizar o resultado na tela
function atualizarResultado(tipo, metragem, forma, resultado) {
    document.getElementById('resultado').innerHTML = `
        <strong>Tipo:</strong> ${tipo}<br>
        <strong>Metragem:</strong> ${metragem} m²<br>
        <strong>Forma de Pagamento:</strong> ${forma}<br>
        <strong>Valor Base:</strong> ${formatarValor(resultado.valorBase)}<br>
        <strong>Excedente:</strong> ${formatarValor(resultado.excedente)}<br>
        <strong>Total:</strong> ${formatarValor(resultado.valorTotal)}<br>
        <strong>Parcelas:</strong> ${resultado.parcelas} x ${formatarValor(resultado.valorParcela)}
    `;
}

// Eventos principais
const selectMunicipio = document.getElementById('municipio');
const selectTipo = document.getElementById('tipoImovel');
const inputMetragem = document.getElementById('metragem');
const selectForma = document.getElementById('formaPagamento');
let dadosAtuais = null;

selectMunicipio.addEventListener('change', async () => {
    const municipio = selectMunicipio.value;
    if (!municipio) return;
    dadosAtuais = await carregarMunicipio(municipio);
    atualizarFormasPagamento(dadosAtuais, selectTipo.value, parseInt(inputMetragem.value || 0));
});

selectTipo.addEventListener('change', () => {
    if (!dadosAtuais) return;
    atualizarFormasPagamento(dadosAtuais, selectTipo.value, parseInt(inputMetragem.value || 0));
});

inputMetragem.addEventListener('input', () => {
    if (!dadosAtuais) return;
    atualizarFormasPagamento(dadosAtuais, selectTipo.value, parseInt(inputMetragem.value || 0));
});

document.getElementById('calcular').addEventListener('click', () => {
    const tipo = selectTipo.value;
    const metragem = parseInt(inputMetragem.value);
    const forma = selectForma.value;

    if (!dadosAtuais || !tipo || !metragem || !forma) return;

    const resultado = calcularValor(dadosAtuais, tipo, metragem, forma);
    atualizarResultado(tipo, metragem, forma, resultado);
});

document.getElementById('limpar').addEventListener('click', () => {
    selectMunicipio.selectedIndex = 0;
    selectTipo.selectedIndex = 0;
    inputMetragem.value = '';
    selectForma.innerHTML = '';
    document.getElementById('resultado').innerHTML = '';
    dadosAtuais = null;
});
