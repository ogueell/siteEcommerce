const chaveCarrinho = "loja-virtual-carrinho";
const detalheProdutoElement = document.getElementById("detalhe-produto");
const botaoVoltarElement = document.getElementById("voltar-catalogo");
const abrirCarrinhoElement = document.getElementById("abrir-carrinho");
const fecharCarrinhoElement = document.getElementById("fechar-carrinho");
const painelCarrinhoElement = document.getElementById("painel-carrinho");
const overlayCarrinhoElement = document.getElementById("carrinho-overlay");
const itensCarrinhoElement = document.getElementById("itens-carrinho");
const totalCarrinhoElement = document.getElementById("total-carrinho");
const carrinhoVazioElement = document.getElementById("carrinho-vazio");
const contadorCarrinhoElement = document.getElementById("contador-carrinho");
const anoAtualElement = document.getElementById("ano-atual");
const formatterMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

let carrinho = carregarCarrinho();

function carregarCarrinho() {
  const carrinhoSalvo = localStorage.getItem(chaveCarrinho);

  if (!carrinhoSalvo) {
    return [];
  }

  try {
    const itensSalvos = JSON.parse(carrinhoSalvo);
    return Array.isArray(itensSalvos) ? itensSalvos : [];
  } catch (erro) {
    console.error("Não foi possível carregar o carrinho salvo.", erro);
    return [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
}

function obterProdutoDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const idProduto = Number(params.get("id"));

  if (!Number.isInteger(idProduto)) {
    return null;
  }

  return window.produtos.find((produto) => produto.id === idProduto) || null;
}

function atualizarContadorCarrinho() {
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  contadorCarrinhoElement.textContent = totalItens;
}

function obterTotalCarrinho() {
  return carrinho.reduce((total, item) => {
    const produto = window.produtos.find((produtoAtual) => produtoAtual.id === item.id);
    return produto ? total + produto.preco * item.quantidade : total;
  }, 0);
}

function renderizarCarrinho() {
  itensCarrinhoElement.innerHTML = "";
  carrinhoVazioElement.hidden = carrinho.length > 0;
  totalCarrinhoElement.textContent = formatterMoeda.format(obterTotalCarrinho());
  atualizarContadorCarrinho();

  carrinho.forEach((item) => {
    const produto = window.produtos.find((produtoAtual) => produtoAtual.id === item.id);

    if (!produto) {
      return;
    }

    const subtotal = produto.preco * item.quantidade;
    const itemElement = document.createElement("article");
    itemElement.className = "item-carrinho";
    itemElement.innerHTML = `
      <div class="item-carrinho-emoji" aria-hidden="true">${produto.imagem}</div>
      <div class="item-carrinho-info">
        <h3>${produto.nome}</h3>
        <p>${formatterMoeda.format(produto.preco)} cada</p>
        <strong>Subtotal: ${formatterMoeda.format(subtotal)}</strong>
        <div class="controles-quantidade">
          <button type="button" data-acao="diminuir" data-produto-id="${produto.id}">−</button>
          <span>${item.quantidade}</span>
          <button type="button" data-acao="aumentar" data-produto-id="${produto.id}">+</button>
        </div>
        <button class="botao-remover" type="button" data-acao="remover" data-produto-id="${produto.id}">Remover</button>
      </div>
    `;
    itensCarrinhoElement.appendChild(itemElement);
  });
}

function alternarCarrinho(aberto) {
  const shouldOpen = Boolean(aberto);

  painelCarrinhoElement.hidden = !shouldOpen;
  overlayCarrinhoElement.hidden = !shouldOpen;
  painelCarrinhoElement.setAttribute("aria-hidden", String(!shouldOpen));
  document.body.classList.toggle("carrinho-aberto", shouldOpen);
}

function adicionarAoCarrinho(id) {
  const produto = window.produtos.find((produtoAtual) => produtoAtual.id === id);

  if (!produto || produto.estoque <= 0) {
    return;
  }

  const itemExistente = carrinho.find((item) => item.id === id);

  if (itemExistente) {
    if (itemExistente.quantidade < produto.estoque) {
      itemExistente.quantidade += 1;
    }
  } else {
    carrinho.push({ id, quantidade: 1 });
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function alterarQuantidade(id, variacao) {
  const item = carrinho.find((itemAtual) => itemAtual.id === id);
  const produto = window.produtos.find((produtoAtual) => produtoAtual.id === id);

  if (!item || !produto) {
    return;
  }

  item.quantidade = Math.min(
    produto.estoque,
    Math.max(1, item.quantidade + variacao),
  );

  salvarCarrinho();
  renderizarCarrinho();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter((item) => item.id !== id);
  salvarCarrinho();
  renderizarCarrinho();
}

function processarAcaoCarrinho(evento) {
  const botao = evento.target.closest("[data-acao]");

  if (!botao) {
    return;
  }

  const id = Number(botao.dataset.produtoId);
  const acao = botao.dataset.acao;

  if (acao === "adicionar") {
    adicionarAoCarrinho(id);
  } else if (acao === "aumentar") {
    alterarQuantidade(id, 1);
  } else if (acao === "diminuir") {
    alterarQuantidade(id, -1);
  } else if (acao === "remover") {
    removerDoCarrinho(id);
  }
}

function redirecionarParaCheckout() {
  const botaoFinalizar = document.querySelector(".botao-finalizar");
  if (!botaoFinalizar) {
    return;
  }

  botaoFinalizar.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
}

function configurarCarrinho() {
  abrirCarrinhoElement.addEventListener("click", () => alternarCarrinho(true));
  fecharCarrinhoElement.addEventListener("click", () => alternarCarrinho(false));
  overlayCarrinhoElement.addEventListener("click", () => alternarCarrinho(false));
  itensCarrinhoElement.addEventListener("click", processarAcaoCarrinho);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !painelCarrinhoElement.hidden) {
      alternarCarrinho(false);
    }
  });
  redirecionarParaCheckout();
}

function renderizarDetalheProduto(produto) {
  if (!produto) {
    detalheProdutoElement.innerHTML = `
      <div class="produto-nao-encontrado">
        <h2>Produto não encontrado</h2>
        <p>O item solicitado não existe ou foi removido.</p>
        <button class="botao-voltar" type="button" id="voltar-produto-nao-encontrado">Voltar ao catálogo</button>
      </div>
    `;

    const voltarNaoEncontradoButton = document.getElementById("voltar-produto-nao-encontrado");
    voltarNaoEncontradoButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    return;
  }

  const itemCarrinho = carrinho.find((item) => item.id === produto.id);
  const quantidadeInicial = itemCarrinho ? itemCarrinho.quantidade : 1;

  detalheProdutoElement.innerHTML = `
    <div class="produto-detalhe-imagem produto-emoji" role="img" aria-label="Imagem do produto ${produto.nome}">${produto.imagem}</div>
    <div class="produto-detalhe-info">
      <span class="produto-categoria">${produto.categoria}</span>
      <h2>${produto.nome}</h2>
      <p class="produto-avaliacao">⭐ ${produto.avaliacao.toFixed(1)} / 5</p>
      <p class="produto-preco-detalhe">${formatterMoeda.format(produto.preco)}</p>
      <p class="produto-estoque">${produto.estoque > 0 ? `Em estoque: ${produto.estoque} unidades` : "Produto indisponível"}</p>
      <p class="produto-descricao-completa">${produto.descricao}</p>

      <div class="detalhe-acoes">
        <label for="quantidade-produto">Quantidade</label>
        <div class="quantidade-seletor">
          <button type="button" class="botao-quantidade" data-quantidade="diminuir">−</button>
          <input id="quantidade-produto" type="number" min="1" max="${produto.estoque}" value="${quantidadeInicial}" />
          <button type="button" class="botao-quantidade" data-quantidade="aumentar">+</button>
        </div>
      </div>

      <div class="acoes-detalhe">
        <button
          class="botao-adicionar-detalhe"
          type="button"
          data-produto-id="${produto.id}"
          ${produto.estoque === 0 ? "disabled" : ""}
        >
          ${produto.estoque === 0 ? "Indisponível" : "Adicionar ao carrinho"}
        </button>
        <button class="botao-secundario" type="button" id="voltar-catalogo-detalhe">Voltar ao catálogo</button>
      </div>
    </div>
  `;

  const quantidadeInput = document.getElementById("quantidade-produto");
  const botaoAumentar = document.querySelector('.botao-quantidade[data-quantidade="aumentar"]');
  const botaoDiminuir = document.querySelector('.botao-quantidade[data-quantidade="diminuir"]');

  botaoAumentar.addEventListener("click", () => {
    const valorAtual = Number(quantidadeInput.value || 1);
    quantidadeInput.value = Math.min(produto.estoque, valorAtual + 1);
  });

  botaoDiminuir.addEventListener("click", () => {
    const valorAtual = Number(quantidadeInput.value || 1);
    quantidadeInput.value = Math.max(1, valorAtual - 1);
  });

  quantidadeInput.addEventListener("input", () => {
    const valor = Number(quantidadeInput.value || 1);
    quantidadeInput.value = Math.min(produto.estoque, Math.max(1, valor));
  });

  const botaoAdicionar = document.querySelector(".botao-adicionar-detalhe");
  botaoAdicionar.addEventListener("click", () => {
    const quantidade = Number(quantidadeInput.value || 1);
    const itemExistente = carrinho.find((item) => item.id === produto.id);
    const quantidadeFinal = itemExistente ? itemExistente.quantidade + quantidade : quantidade;

    if (quantidadeFinal > produto.estoque) {
      quantidadeInput.value = produto.estoque;
      return;
    }

    if (itemExistente) {
      itemExistente.quantidade = quantidadeFinal;
    } else {
      carrinho.push({ id: produto.id, quantidade });
    }

    salvarCarrinho();
    renderizarCarrinho();
  });

  const botaoVoltarDetalhe = document.getElementById("voltar-catalogo-detalhe");
  botaoVoltarDetalhe.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

function inicializarPaginaDetalhe() {
  painelCarrinhoElement.hidden = true;
  overlayCarrinhoElement.hidden = true;
  painelCarrinhoElement.setAttribute("aria-hidden", "true");
  document.body.classList.remove("carrinho-aberto");

  anoAtualElement.textContent = new Date().getFullYear();
  const produto = obterProdutoDaUrl();
  renderizarDetalheProduto(produto);
  alternarCarrinho(false);
  renderizarCarrinho();
  configurarCarrinho();

  botaoVoltarElement.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

inicializarPaginaDetalhe();
