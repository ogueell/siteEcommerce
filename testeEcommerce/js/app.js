const produtos = [
  {
    id: 1,
    nome: "Smartphone Aurora X",
    descricao:
      "Tela AMOLED de 6.5 polegadas, 256GB de armazenamento e câmera tripla de alta definição.",
    categoria: "Eletrônicos",
    preco: 2199.9,
    imagem: "📱",
    estoque: 12,
    avaliacao: 4.8,
  },
  {
    id: 2,
    nome: "Notebook ProLite 14",
    descricao:
      "Notebook leve com processador de última geração, 16GB RAM e SSD de 512GB para produtividade.",
    categoria: "Informática",
    preco: 4599,
    imagem: "💻",
    estoque: 7,
    avaliacao: 4.7,
  },
  {
    id: 3,
    nome: "Fone Sem Fio Pulse",
    descricao:
      "Fone bluetooth com cancelamento de ruído, bateria de longa duração e áudio imersivo.",
    categoria: "Acessórios",
    preco: 349.5,
    imagem: "🎧",
    estoque: 24,
    avaliacao: 4.5,
  },
  {
    id: 4,
    nome: "Cafeteira Express Home",
    descricao:
      "Prepare cafés cremosos em segundos com cápsulas ou pó, ideal para sua rotina diária.",
    categoria: "Casa",
    preco: 599,
    imagem: "☕",
    estoque: 9,
    avaliacao: 4.6,
  },
  {
    id: 5,
    nome: "Relógio Esportivo ActiveFit",
    descricao:
      "Monitore atividades físicas, batimentos cardíacos e qualidade do sono com design resistente.",
    categoria: "Esportes",
    preco: 799.9,
    imagem: "⌚",
    estoque: 15,
    avaliacao: 4.4,
  },
  {
    id: 6,
    nome: "Mochila Urban Tech",
    descricao:
      "Mochila com compartimento para notebook, bolsos inteligentes e acabamento impermeável.",
    categoria: "Moda",
    preco: 229.9,
    imagem: "🎒",
    estoque: 30,
    avaliacao: 4.3,
  },
  {
    id: 7,
    nome: "Caixa de Som Boom Mini",
    descricao:
      "Caixa portátil com graves potentes, conexão rápida e até 12 horas de reprodução contínua.",
    categoria: "Áudio",
    preco: 289.99,
    imagem: "🔊",
    estoque: 18,
    avaliacao: 4.2,
  },
  {
    id: 8,
    nome: "Livro: Guia de JavaScript Moderno",
    descricao:
      "Aprenda JavaScript com exemplos práticos, boas práticas e exercícios para o dia a dia.",
    categoria: "Livros",
    preco: 89.9,
    imagem: "📚",
    estoque: 40,
    avaliacao: 4.9,
  },
];

const listaProdutosElement = document.getElementById("lista-produtos");
const anoAtualElement = document.getElementById("ano-atual");
const buscaElement = document.getElementById("campo-busca");
const formularioBuscaElement = document.querySelector(".busca");
const formularioFiltrosElement = document.getElementById("form-filtros");
const categoriaElement = document.getElementById("filtro-categoria");
const precoMinimoElement = document.getElementById("preco-minimo");
const precoMaximoElement = document.getElementById("preco-maximo");
const ordenacaoElement = document.getElementById("ordenacao");
const limparFiltrosElement = document.getElementById("limpar-filtros");
const mensagemVaziaElement = document.getElementById("mensagem-vazia");
const abrirCarrinhoElement = document.getElementById("abrir-carrinho");
const fecharCarrinhoElement = document.getElementById("fechar-carrinho");
const painelCarrinhoElement = document.getElementById("painel-carrinho");
const overlayCarrinhoElement = document.getElementById("carrinho-overlay");
const itensCarrinhoElement = document.getElementById("itens-carrinho");
const carrinhoVazioElement = document.getElementById("carrinho-vazio");
const totalCarrinhoElement = document.getElementById("total-carrinho");
const contadorCarrinhoElement = document.getElementById("contador-carrinho");
const chaveCarrinho = "loja-virtual-carrinho";
const chaveFavoritos = "loja-virtual-favoritos";
const formatterMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
let carrinho = carregarCarrinho();
let favoritos = carregarFavoritos();

function encurtarTexto(texto, tamanhoMaximo = 90) {
  if (texto.length <= tamanhoMaximo) {
    return texto;
  }

  return `${texto.slice(0, tamanhoMaximo).trim()}...`;
}

function criarCardProduto(produto) {
  const card = document.createElement("article");
  card.className = "produto-card";
  card.setAttribute("data-id", String(produto.id));

  card.innerHTML = `
    <a href="produto.html?id=${produto.id}" class="produto-link" aria-label="Ver detalhes de ${produto.nome}">
      <div
        class="produto-imagem produto-emoji"
        role="img"
        aria-label="Imagem do produto ${produto.nome}"
      >${produto.imagem}</div>
      <div class="produto-info">
        <span class="produto-categoria">${produto.categoria}</span>
        <h3 class="produto-nome">${produto.nome}</h3>
        <p class="produto-descricao">${encurtarTexto(produto.descricao)}</p>
        <p class="produto-preco">${formatterMoeda.format(produto.preco)}</p>
        <p class="produto-meta">Estoque: ${produto.estoque} unidades</p>
        <p class="produto-meta">Avaliação: ${produto.avaliacao.toFixed(1)} / 5</p>
      </div>
    </a>
    <div class="produto-acoes">
      <button
        class="botao-favorito ${favoritos.includes(produto.id) ? "favoritado" : ""}"
        type="button"
        data-acao="favoritar"
        data-produto-id="${produto.id}"
        aria-label="${favoritos.includes(produto.id) ? "Remover" : "Adicionar"} ${produto.nome} ${favoritos.includes(produto.id) ? "dos" : "aos"} favoritos"
        aria-pressed="${favoritos.includes(produto.id)}"
      >${favoritos.includes(produto.id) ? "♥" : "♡"}</button>
      <button
        class="botao-adicionar"
        type="button"
        data-acao="adicionar"
        data-produto-id="${produto.id}"
        ${produto.estoque === 0 ? "disabled" : ""}
      >
        ${produto.estoque === 0 ? "Produto indisponível" : "Adicionar ao carrinho"}
      </button>
    </div>
  `;

  return card;
}

function carregarFavoritos() {
  try {
    const favoritosSalvos = JSON.parse(localStorage.getItem(chaveFavoritos) || "[]");
    if (!Array.isArray(favoritosSalvos)) {
      return [];
    }

    return favoritosSalvos.filter(
      (id) => Number.isInteger(id) && produtos.some((produto) => produto.id === id),
    );
  } catch (erro) {
    console.error("Não foi possível carregar os favoritos salvos.", erro);
    return [];
  }
}

function salvarFavoritos() {
  localStorage.setItem(chaveFavoritos, JSON.stringify(favoritos));
}

function alternarFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter((favoritoId) => favoritoId !== id);
  } else {
    favoritos.push(id);
  }

  salvarFavoritos();
  atualizarCatalogo();
}

function carregarCarrinho() {
  const carrinhoSalvo = localStorage.getItem(chaveCarrinho);

  if (!carrinhoSalvo) {
    return [];
  }

  try {
    const itensSalvos = JSON.parse(carrinhoSalvo);

    if (!Array.isArray(itensSalvos)) {
      return [];
    }

    return itensSalvos
      .filter(
        (item) =>
          Number.isInteger(item.id) &&
          Number.isInteger(item.quantidade) &&
          item.quantidade > 0 &&
          produtos.some((produto) => produto.id === item.id),
      )
      .map((item) => {
        const produto = produtos.find((itemProduto) => itemProduto.id === item.id);
        return {
          id: item.id,
          quantidade: Math.min(item.quantidade, produto.estoque),
        };
      })
      .filter((item) => item.quantidade > 0);
  } catch (erro) {
    console.error("Não foi possível carregar o carrinho salvo.", erro);
    return [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
}

function obterProduto(id) {
  return produtos.find((produto) => produto.id === id);
}

function obterQuantidadeTotal() {
  return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

function obterTotalCarrinho() {
  return carrinho.reduce((total, item) => {
    const produto = obterProduto(item.id);
    return total + produto.preco * item.quantidade;
  }, 0);
}

function atualizarContadorCarrinho() {
  const quantidadeTotal = obterQuantidadeTotal();
  contadorCarrinhoElement.textContent = quantidadeTotal;
  abrirCarrinhoElement.setAttribute(
    "aria-label",
    `Abrir carrinho com ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`,
  );
}

function renderizarCarrinho() {
  itensCarrinhoElement.innerHTML = "";
  carrinhoVazioElement.hidden = carrinho.length > 0;

  carrinho.forEach((item) => {
    const produto = obterProduto(item.id);
    const subtotal = produto.preco * item.quantidade;
    const itemElement = document.createElement("article");
    itemElement.className = "item-carrinho";
    itemElement.innerHTML = `
      <div class="item-carrinho-emoji" aria-hidden="true">${produto.imagem}</div>
      <div class="item-carrinho-info">
        <h3>${produto.nome}</h3>
        <p>${formatterMoeda.format(produto.preco)} cada</p>
        <strong>Subtotal: ${formatterMoeda.format(subtotal)}</strong>
        <div class="controles-quantidade" aria-label="Quantidade de ${produto.nome}">
          <button
            type="button"
            data-acao="diminuir"
            data-produto-id="${produto.id}"
            aria-label="Diminuir quantidade de ${produto.nome}"
          >−</button>
          <span>${item.quantidade}</span>
          <button
            type="button"
            data-acao="aumentar"
            data-produto-id="${produto.id}"
            aria-label="Aumentar quantidade de ${produto.nome}"
            ${item.quantidade >= produto.estoque ? "disabled" : ""}
          >+</button>
        </div>
        <button
          class="botao-remover"
          type="button"
          data-acao="remover"
          data-produto-id="${produto.id}"
        >Remover</button>
      </div>
    `;
    itensCarrinhoElement.appendChild(itemElement);
  });

  totalCarrinhoElement.textContent = formatterMoeda.format(obterTotalCarrinho());
  atualizarContadorCarrinho();
}

function adicionarAoCarrinho(id) {
  const produto = obterProduto(id);
  const itemExistente = carrinho.find((item) => item.id === id);

  if (!produto || produto.estoque === 0) {
    return;
  }

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
  const item = carrinho.find((itemCarrinho) => itemCarrinho.id === id);
  const produto = obterProduto(id);

  if (!item || !produto) {
    return;
  }

  const novaQuantidade = item.quantidade + variacao;

  if (novaQuantidade <= 0) {
    removerDoCarrinho(id);
    return;
  }

  item.quantidade = Math.min(produto.estoque, novaQuantidade);
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
  } else if (acao === "favoritar") {
    alternarFavorito(id);
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

function alternarCarrinho(aberto) {
  const shouldOpen = Boolean(aberto);

  painelCarrinhoElement.hidden = !shouldOpen;
  overlayCarrinhoElement.hidden = !shouldOpen;
  painelCarrinhoElement.setAttribute("aria-hidden", String(!shouldOpen));
  abrirCarrinhoElement.setAttribute("aria-expanded", String(shouldOpen));
  document.body.classList.toggle("carrinho-aberto", shouldOpen);

  if (shouldOpen) {
    fecharCarrinhoElement.focus();
  } else {
    abrirCarrinhoElement.focus();
  }
}

function configurarCarrinho() {
  listaProdutosElement.addEventListener("click", processarAcaoCarrinho);
  itensCarrinhoElement.addEventListener("click", processarAcaoCarrinho);
  abrirCarrinhoElement.addEventListener("click", () => alternarCarrinho(true));
  fecharCarrinhoElement.addEventListener("click", () => alternarCarrinho(false));
  overlayCarrinhoElement.addEventListener("click", () => alternarCarrinho(false));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !painelCarrinhoElement.hidden) {
      alternarCarrinho(false);
    }
  });
  redirecionarParaCheckout();
}

function renderizarProdutos(itens) {
  listaProdutosElement.setAttribute("aria-busy", "true");
  listaProdutosElement.innerHTML = "";
  mensagemVaziaElement.hidden = itens.length > 0;

  itens.forEach((produto) => {
    const card = criarCardProduto(produto);
    listaProdutosElement.appendChild(card);
  });

  listaProdutosElement.setAttribute("aria-busy", "false");
}

function preencherCategorias() {
  const categorias = [...new Set(produtos.map((produto) => produto.categoria))].sort(
    (categoriaA, categoriaB) => categoriaA.localeCompare(categoriaB, "pt-BR"),
  );

  categorias.forEach((categoria) => {
    const opcao = document.createElement("option");
    opcao.value = categoria;
    opcao.textContent = categoria;
    categoriaElement.appendChild(opcao);
  });
}

function obterProdutosFiltrados() {
  const termoBusca = buscaElement.value.trim().toLocaleLowerCase("pt-BR");
  const categoriaSelecionada = categoriaElement.value;
  const precoMinimo = Number(precoMinimoElement.value);
  const precoMaximo = Number(precoMaximoElement.value);
  const possuiPrecoMinimo = precoMinimoElement.value !== "";
  const possuiPrecoMaximo = precoMaximoElement.value !== "";

  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeBusca =
      termoBusca === "" ||
      produto.nome.toLocaleLowerCase("pt-BR").includes(termoBusca);
    const correspondeCategoria =
      categoriaSelecionada === "" || produto.categoria === categoriaSelecionada;
    const correspondePrecoMinimo =
      !possuiPrecoMinimo || produto.preco >= precoMinimo;
    const correspondePrecoMaximo =
      !possuiPrecoMaximo || produto.preco <= precoMaximo;

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondePrecoMinimo &&
      correspondePrecoMaximo
    );
  });

  return ordenarProdutos(produtosFiltrados);
}

function ordenarProdutos(itens) {
  const itensOrdenados = [...itens];

  switch (ordenacaoElement.value) {
    case "menor-preco":
      return itensOrdenados.sort((produtoA, produtoB) => produtoA.preco - produtoB.preco);
    case "maior-preco":
      return itensOrdenados.sort((produtoA, produtoB) => produtoB.preco - produtoA.preco);
    case "nome":
      return itensOrdenados.sort((produtoA, produtoB) =>
        produtoA.nome.localeCompare(produtoB.nome, "pt-BR"),
      );
    default:
      return itensOrdenados;
  }
}

function atualizarCatalogo() {
  renderizarProdutos(obterProdutosFiltrados());
}

function limparFiltros() {
  formularioFiltrosElement.reset();
  buscaElement.value = "";
  atualizarCatalogo();
}

function configurarFiltros() {
  formularioBuscaElement.addEventListener("submit", (evento) => {
    evento.preventDefault();
    atualizarCatalogo();
  });
  buscaElement.addEventListener("input", atualizarCatalogo);
  formularioFiltrosElement.addEventListener("input", atualizarCatalogo);
  formularioFiltrosElement.addEventListener("change", atualizarCatalogo);
  limparFiltrosElement.addEventListener("click", limparFiltros);
}

function inicializarPagina() {
  painelCarrinhoElement.hidden = true;
  overlayCarrinhoElement.hidden = true;
  abrirCarrinhoElement.setAttribute("aria-expanded", "false");
  painelCarrinhoElement.setAttribute("aria-hidden", "true");
  document.body.classList.remove("carrinho-aberto");

  preencherCategorias();
  configurarFiltros();
  configurarCarrinho();
  alternarCarrinho(false);
  atualizarCatalogo();
  renderizarCarrinho();
  anoAtualElement.textContent = new Date().getFullYear();
}

inicializarPagina();
