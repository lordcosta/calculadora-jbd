// Versão atualizada com IDs padronizados, botão corrigido e integração com formulário de adesão

// Função para formatar valor em reais
function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para carregar os dados do município selecionado
async function carregarMunicipio(municipio) {
    try {
        const response = await fetch(`data/${municipio}.json`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao carregar o JSON do município:", error);
        alert("Tabela de valores para este município ainda não está disponível.");
        return null;
    }
}

// Função para atualizar as opções de forma de pagamento
function atualizarFormasPagamento(dados, tipo, metragem) {
    const selectForma = document.getElementById('forma_pagamento');
    selectForma.innerHTML = '';

    if (!metragem || metragem <= 0 || !tipo || !dados) return;

    const tipoBase = tipo.toLowerCase();
    const tipoFaixa = metragem <= 400 ? tipoBase : tipoBase + '_acima';
    const faixa = dados.faixas.find(f => f.tipo === tipoFaixa);
    if (!faixa) return;

    let nomesFormas = [];

    if (metragem <= 400 && faixa.formas_pagamento) {
        // ✅ Mostra apenas formas que realmente estão disponíveis para metragem <= 400
        nomesFormas = faixa.formas_pagamento
            .filter(f => ['À vista', '3x', '6x', '10x', 'Final'].includes(f.nome))
            .map(f => f.nome);
    } else if (metragem > 400 && faixa.tabela_excedente) {
        nomesFormas = Object.keys(faixa.tabela_excedente[0].valores);
    }

    nomesFormas.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
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
        let formaBase = base.formas_pagamento.find(f => f.nome === formaNome);

        // Se não encontrou a forma no base, cria um valor fictício com valorBase = 0 e parcelas compatíveis
        if (!formaBase) {
            // tenta inferir número de parcelas com base no nome (ex: "12x" => 12)
            const match = formaNome.match(/^(\d+)x$/i);
            const parcelasInferidas = match ? parseInt(match[1]) : 1;

            formaBase = {
                valor_total: 0,
                parcelas: parcelasInferidas
            };
        }

        valorBase = formaBase.valor_total;
        parcelas = formaBase.parcelas;

        const faixaExcedente = faixa.tabela_excedente.find(fx => metragem >= fx.faixa[0] && metragem <= fx.faixa[1]);
        if (!faixaExcedente) return null;

        const valor_m2 = faixaExcedente.valores[formaNome];
        if (!valor_m2) return null;

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

// Carregar lista de municípios ao iniciar
fetch("data/municipios.json")
    .then(res => res.json())
    .then(lista => {
        const select = document.getElementById("municipio");
        select.innerHTML = '<option value="">Selecione</option>';
        lista.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.valor;
            opt.textContent = m.label;
            select.appendChild(opt);
        });
    })
    .catch(erro => {
        console.error("Erro ao carregar municípios:", erro);
        const select = document.getElementById("municipio");
        select.innerHTML = '<option value="">Erro ao carregar municípios</option>';
    });

// Eventos principais
const selectMunicipio = document.getElementById('municipio');
const selectTipo = document.getElementById('tipo');
const inputMetragem = document.getElementById('metragem');
const selectForma = document.getElementById('forma_pagamento');
const btnCalcular = document.getElementById('calcular');
const btnLimpar = document.getElementById('limpar');
const btnAdesao = document.getElementById('botaoAdesao');

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

btnCalcular.addEventListener('click', () => {
    const tipo = selectTipo.value;
    const metragem = parseInt(inputMetragem.value);
    const forma = selectForma.value;

    if (!dadosAtuais || !tipo || !metragem || !forma) return;

    const resultado = calcularValor(dadosAtuais, tipo, metragem, forma);
    if (resultado) {
        atualizarResultado(tipo, metragem, forma, resultado);
        btnAdesao.disabled = false; // Habilita botão após cálculo
    }
});

btnLimpar.addEventListener('click', () => {
    selectMunicipio.selectedIndex = 0;
    selectTipo.selectedIndex = 0;
    inputMetragem.value = '';
    selectForma.innerHTML = '';
    document.getElementById('resultado').innerHTML = '';
    dadosAtuais = null;
    btnAdesao.disabled = true; // Desabilita botão após limpar
});

// Botão que abre a página de adesão com os dados preenchidos via URL
if (btnAdesao) {
    btnAdesao.addEventListener('click', () => {
        const tipo = selectTipo.value;
        const metragem = parseInt(inputMetragem.value);
        const forma = selectForma.value;

        if (!dadosAtuais || !tipo || !metragem || !forma) return;

        const resultado = calcularValor(dadosAtuais, tipo, metragem, forma);
        if (!resultado) return;

        const url = new URL('https://adesao-jbd.vercel.app/');
        url.searchParams.set('forma_pagamento', forma);
        url.searchParams.set('qtd_parcelas', resultado.parcelas);
        url.searchParams.set('valor_parcela', resultado.valorParcela.toFixed(2));
        url.searchParams.set('valor_total', resultado.valorTotal.toFixed(2));
        url.searchParams.set('tipo_imovel', tipo);
        url.searchParams.set('metragem', metragem);

        window.open(url.toString(), '_blank');
    });
}
