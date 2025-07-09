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

    if (!metragem || metragem <= 0) return;

    const tipoFaixa = metragem <= 400 ? tipo.toLowerCase() : tipo.toLowerCase() + '_acima';
    const faixa = dados.faixas.find(f => f.tipo === tipoFaixa);
    if (!faixa) return;

    let formas = [];
    if (faixa.formas_pagamento) {
        formas = faixa.formas_pagamento;
    } else if (faixa.tabela_excedente) {
        formas = Object.keys(faixa.tabela_excedente[0].valores).map(nome => ({ nome }));
    }

    formas.forEach(forma => {
        const option = document.createElement('option');
        option.value = forma.nome;
        option.text = forma.nome;
        selectForma.appendChild(option);
    });
}

// Função para calcular valor
function calcularValor(dados, tipo, metragem, formaNome) {
    const tipoBase = tipo.toLowerCase();
    const tipoFaixa = metragem <= 400 ? tipoBase : tipoBase + '_acima';

    const faixa = dados.faixas.find(f => f.tipo === tipoFaixa);
    if (!faixa) return null;

    let valorBase = 0;
    let excedente = 0;
    let valorTotal = 0;
    let parcelas = 1;

    if (metragem <= 400 && faixa.formas_pagamento) {
        const forma = faixa.formas_pagamento.find(f => f.nome === formaNome);
        if (!forma) return null;
        valorTotal = forma.valor_total;
        parcelas = forma.parcelas;
    } else if (faixa.tabela_excedente) {
        const base = dados.faixas.find(f => f.tipo === tipoBase);
        const formaBase = base.formas_pagamento.find(f => f.nome === formaNome);
        if (!formaBase) return null;
        valorBase = formaBase.valor_total;
        parcelas = formaBase.parcelas;

        const faixaExcedente = faixa.tabela_excedente.find(fx => metragem >= fx.faixa[0] && metragem <= fx.faixa[1]);
        if (!faixaExcedente) return null;

        const valor_m2 = faixaExcedente.valores[formaNome];
        const metrosExcedentes = metragem - 400;
        excedente = metrosExcedentes * valor_m2;
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

console.log('Calculadora JBD - Versão JS v2.1.3');

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
    if (resultado) atualizarResultado(tipo, metragem, forma, resultado);
});

document.getElementById('limpar').addEventListener('click', () => {
    selectMunicipio.selectedIndex = 0;
    selectTipo.selectedIndex = 0;
    inputMetragem.value = '';
    selectForma.innerHTML = '';
    document.getElementById('resultado').innerHTML = '';
    dadosAtuais = null;
});
