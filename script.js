
let dadosMunicipio = {};

document.getElementById('municipio').addEventListener('change', function () {
    const municipio = this.value;
    if (!municipio) return;

    fetch(`data/${municipio}.json`)
        .then(res => res.json())
        .then(data => {
            dadosMunicipio = data;
            const formas = new Set();
            data.faixas.forEach(faixa => {
                if (faixa.formas_pagamento) {
                    faixa.formas_pagamento.forEach(fp => formas.add(fp.nome));
                } else if (faixa.tabela_excedente) {
                    Object.keys(faixa.tabela_excedente[0].valores).forEach(nome => formas.add(nome));
                }
            });
            const selectForma = document.getElementById('forma_pagamento');
            selectForma.innerHTML = '';
            formas.forEach(nome => {
                const opt = document.createElement('option');
                opt.value = nome;
                opt.textContent = nome;
                selectForma.appendChild(opt);
            });
        });
});

function calcular() {
    const tipoBase = document.getElementById('tipo').value;
    const metragem = parseFloat(document.getElementById('metragem').value);
    const formaNome = document.getElementById('forma_pagamento').value;

    if (!dadosMunicipio || !tipoBase || !formaNome || isNaN(metragem)) return;

    let valorBase = 0, excedente = 0, valorTotal = 0, parcelas = 1;

    const tipo = metragem <= 400 ? tipoBase : tipoBase + "_acima";

    const faixa = dadosMunicipio.faixas.find(f => f.tipo === tipo);

    if (!faixa) return;

    if (tipo.endsWith("_acima")) {
        // Valor fixo até 400m²
        const faixaBase = dadosMunicipio.faixas.find(f => f.tipo === tipoBase);
        if (!faixaBase) return;
        const pagamentoBase = faixaBase.formas_pagamento.find(fp => fp.nome === formaNome);
        if (!pagamentoBase) return;

        valorBase = pagamentoBase.valor_total;

        const faixaExcedente = faixa.tabela_excedente.find(fx =>
            metragem >= fx.faixa[0] && metragem <= fx.faixa[1]
        );
        if (!faixaExcedente) return;

        const valor_m2 = faixaExcedente.valores[formaNome];
        const metrosExcedentes = metragem - 400;
        excedente = metrosExcedentes * valor_m2;
        valorTotal = valorBase + excedente;
        parcelas = pagamentoBase.parcelas;
    } else {
        const pagamento = faixa.formas_pagamento.find(fp => fp.nome === formaNome);
        if (!pagamento) return;
        valorBase = pagamento.valor_total;
        valorTotal = valorBase;
        parcelas = pagamento.parcelas;
    }

    const valorParcela = valorTotal / parcelas;

    document.getElementById('resultado').innerHTML = `
        <strong>Tipo:</strong> ${tipoBase.charAt(0).toUpperCase() + tipoBase.slice(1)}<br>
        <strong>Metragem:</strong> ${metragem} m²<br>
        <strong>Forma de Pagamento:</strong> ${formaNome}<br>
        <strong>Valor Base:</strong> R$ ${valorBase.toFixed(2)}<br>
        <strong>Excedente:</strong> R$ ${excedente.toFixed(2)}<br>
        <strong>Total:</strong> R$ ${valorTotal.toFixed(2)}<br>
        <strong>Parcelas:</strong> ${parcelas} x R$ ${valorParcela.toFixed(2)}
    `;
}

function limpar() {
    document.getElementById('tipo').value = 'residencial';
    document.getElementById('metragem').value = '';
    document.getElementById('forma_pagamento').innerHTML = '';
    document.getElementById('resultado').innerHTML = '';
}
