const chaveFavoritos = "loja-virtual-favoritos";
const chaveCarrinho = "loja-virtual-carrinho";
const listaFavoritosElement = document.getElementById("lista-favoritos");
const favoritosVaziosElement = document.getElementById("favoritos-vazios");
const anoAtualElement = document.getElementById("ano-atual");
const formatterMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

let favoritos = carregarFavoritos();

function carregarFavoritos() {
  try {
    const favoritosSalvos = JSON.parse(localStorage.getItem(chaveFavoritos) || "[]");
    return Array.isArray(favoritosSalvos)
      ? favoritosSalvos.filter((id) => Number.isInteger(id) && obterProduto(id))
      : [];
  } catch (erro) {
    console.error("Não foi possível carregar os favoritos.", erro);
    return [];
  }
}

function salvarFavoritos() {
  localStorage.setItem(chaveFavoritos, JSON.stringify(favoritos));
}

function obterProduto(id) {
  return window.produtos.find((produto) => produto.id === id);
}

function carregarCarrinho() {
  try {
    const carrinhoSalvo = JSON.parse(localStorage.getItem(chaveCarrinho) || "[]");
    return Array.isArray(carrinhoSalvo) ? carrinhoSalvo : [];
  } catch (erro) {
    console.error("Não foi possível carregar o carrinho.", erro);
    return [];
  }
}

function adicionarAoCarrinho(id) {
  const produto = obterProduto(id);
  if (!produto || produto.estoque <= 0) {
    return;
  }

  const carrinho = carregarCarrinho();
  const item = carrinho.find((itemCarrinho) => itemCarrinho.id === id);

  if (item) {
    item.quantidade = Math.min(produto.estoque, item.quantidade + 1);
  } else {
    carrinho.push({ id, quantidade: 1 });
  }

  localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
}

function criarCardFavorito(produto) {
  const card = document.createElement("article");
  card.className = "produto-card";
  card.innerHTML = `
    <a href="produto.html?id=${produto.id}" class="produto-link" aria-label="Ver detalhes de ${produto.nome}">
      <div class="produto-imagem produto-emoji" role="img" aria-label="Imagem do produto ${produto.nome}">${produto.imagem}</div>
      <div class="produto-info">
        <span class="produto-categoria">${produto.categoria}</span>
        <h3 class="produto-nome">${produto.nome}</h3>
        <p class="produto-descricao">${produto.descricao}</p>
        <p class="produto-preco">${formatterMoeda.format(produto.preco)}</p>
        <p class="produto-meta">Estoque: ${produto.estoque} unidades</p>
      </div>
    </a>
    <div class="produto-acoes">
      <button class="botao-favorito favoritado" type="button" data-acao="remover-favorito" data-produto-id="${produto.id}" aria-label="Remover ${produto.nome} dos favoritos">♥</button>
      <button class="botao-adicionar" type="button" data-acao="adicionar-carrinho" data-produto-id="${produto.id}" ${produto.estoque === 0 ? "disabled" : ""}>
        ${produto.estoque === 0 ? "Produto indisponível" : "Adicionar ao carrinho"}
      </button>
    </div>
  `;
  return card;
}

function renderizarFavoritos() {
  listaFavoritosElement.innerHTML = "";
  const produtosFavoritos = favoritos.map(obterProduto).filter(Boolean);
  favoritosVaziosElement.hidden = produtosFavoritos.length > 0;
  produtosFavoritos.forEach((produto) => {
    listaFavoritosElement.appendChild(criarCardFavorito(produto));
  });
}

listaFavoritosElement.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) {
    return;
  }

  const id = Number(botao.dataset.produtoId);
  if (botao.dataset.acao === "remover-favorito") {
    favoritos = favoritos.filter((favoritoId) => favoritoId !== id);
    salvarFavoritos();
    renderizarFavoritos();
  } else if (botao.dataset.acao === "adicionar-carrinho") {
    adicionarAoCarrinho(id);
  }
});

anoAtualElement.textContent = new Date().getFullYear();
renderizarFavoritos();
