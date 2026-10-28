const chaveCarrinho = "loja-virtual-carrinho";
const chavePedido = "loja-virtual-ultimo-pedido";
const chavePedidos = "loja-virtual-pedidos";
const formatterMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const listaResumoProdutosElement = document.getElementById("lista-resumo-produtos");
const subtotalCheckoutElement = document.getElementById("subtotal-checkout");
const freteCheckoutElement = document.getElementById("frete-checkout");
const descontoCheckoutElement = document.getElementById("desconto-checkout");
const totalCheckoutElement = document.getElementById("total-checkout");
const formularioCheckoutElement = document.getElementById("form-checkout");

function carregarCarrinho() {
  const carrinhoSalvo = localStorage.getItem(chaveCarrinho);

  if (!carrinhoSalvo) {
    return [];
  }

  try {
    const itens = JSON.parse(carrinhoSalvo);
    return Array.isArray(itens) ? itens : [];
  } catch (erro) {
    console.error("Erro ao carregar o carrinho no checkout.", erro);
    return [];
  }
}

function obterProdutoPorId(id) {
  return window.produtos.find((produto) => produto.id === id);
}

function obterItensCheckout() {
  const carrinho = carregarCarrinho();

  return carrinho
    .map((item) => {
      const produto = obterProdutoPorId(item.id);

      if (!produto) {
        return null;
      }

      return {
        ...produto,
        quantidade: item.quantidade,
        subtotal: produto.preco * item.quantidade,
      };
    })
    .filter(Boolean);
}

function calcularResumo() {
  const itens = obterItensCheckout();

  const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
  const frete = subtotal > 0 ? 29.9 : 0;
  const desconto = subtotal >= 500 ? 59.9 : 0;
  const total = subtotal + frete - desconto;

  return { itens, subtotal, frete, desconto, total };
}

function renderizarResumo() {
  const { itens, subtotal, frete, desconto, total } = calcularResumo();

  listaResumoProdutosElement.innerHTML = "";

  if (itens.length === 0) {
    listaResumoProdutosElement.innerHTML = `
      <p class="checkout-vazio">Seu carrinho está vazio.</p>
    `;
    subtotalCheckoutElement.textContent = formatterMoeda.format(0);
    freteCheckoutElement.textContent = formatterMoeda.format(0);
    descontoCheckoutElement.textContent = `- ${formatterMoeda.format(0)}`;
    totalCheckoutElement.textContent = formatterMoeda.format(0);
    return;
  }

  itens.forEach((item) => {
    const linha = document.createElement("article");
    linha.className = "item-resumo-checkout";
    linha.innerHTML = `
      <div class="item-resumo-emoji" aria-hidden="true">${item.imagem}</div>
      <div class="item-resumo-detalhes">
        <h3>${item.nome}</h3>
        <p>${item.quantidade} x ${formatterMoeda.format(item.preco)}</p>
        <strong>${formatterMoeda.format(item.subtotal)}</strong>
      </div>
    `;
    listaResumoProdutosElement.appendChild(linha);
  });

  subtotalCheckoutElement.textContent = formatterMoeda.format(subtotal);
  freteCheckoutElement.textContent = formatterMoeda.format(frete);
  descontoCheckoutElement.textContent = `- ${formatterMoeda.format(desconto)}`;
  totalCheckoutElement.textContent = formatterMoeda.format(total);
}

function limparErro(input) {
  const campo = input.closest(".campo");
  const erro = campo ? campo.querySelector(".mensagem-erro") : null;

  if (erro) {
    erro.textContent = "";
    erro.style.display = "none";
  }

  input.setAttribute("aria-invalid", "false");
  input.classList.remove("input-erro");
}

function mostrarErro(input, mensagem) {
  const campo = input.closest(".campo");
  const erro = campo ? campo.querySelector(".mensagem-erro") : null;

  if (erro) {
    erro.textContent = mensagem;
    erro.style.display = "block";
  }

  input.setAttribute("aria-invalid", "true");
  input.classList.add("input-erro");
}

function validarCampo(input) {
  const valor = input.value.trim();
  const nomeCampo = input.name;

  limparErro(input);

  if (input.required && !valor) {
    mostrarErro(input, "Campo obrigatório.");
    return false;
  }

  if (nomeCampo === "nome" && valor.length < 3) {
    mostrarErro(input, "Informe um nome com pelo menos 3 caracteres.");
    return false;
  }

  if (nomeCampo === "email") {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    if (!emailValido) {
      mostrarErro(input, "Informe um e-mail válido.");
      return false;
    }
  }

  if (nomeCampo === "cpf") {
    const cpfLimpo = valor.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      mostrarErro(input, "CPF deve conter 11 números.");
      return false;
    }
  }

  if (nomeCampo === "telefone") {
    const telefoneLimpo = valor.replace(/\D/g, "");
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      mostrarErro(input, "Telefone inválido.");
      return false;
    }
  }

  if (nomeCampo === "cep") {
    const cepLimpo = valor.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      mostrarErro(input, "CEP deve conter 8 números.");
      return false;
    }
  }

  if (nomeCampo === "cidade" && valor.length < 2) {
    mostrarErro(input, "Informe a cidade.");
    return false;
  }

  if (nomeCampo === "rua" && valor.length < 3) {
    mostrarErro(input, "Informe o nome da rua.");
    return false;
  }

  if (nomeCampo === "numero" && !/^[0-9A-Za-z]+$/.test(valor)) {
    mostrarErro(input, "Número inválido.");
    return false;
  }

  if (nomeCampo === "estado" && !valor) {
    mostrarErro(input, "Selecione um estado.");
    return false;
  }

  return true;
}

function validarPagamento() {
  const pagamento = document.querySelector('input[name="pagamento"]:checked');
  const erro = document.querySelector(".mensagem-erro-pagamento");

  if (!pagamento) {
    erro.textContent = "Selecione uma forma de pagamento.";
    erro.style.display = "block";
    return false;
  }

  erro.textContent = "";
  erro.style.display = "none";
  return true;
}

function validarFormulario() {
  const campos = [
    document.getElementById("nome"),
    document.getElementById("email"),
    document.getElementById("cpf"),
    document.getElementById("telefone"),
    document.getElementById("cep"),
    document.getElementById("cidade"),
    document.getElementById("rua"),
    document.getElementById("numero"),
    document.getElementById("estado"),
  ];

  let valido = true;

  campos.forEach((campo) => {
    if (!validarCampo(campo)) {
      valido = false;
    }
  });

  if (!validarPagamento()) {
    valido = false;
  }

  return valido;
}

function gerarNumeroPedido() {
  const data = new Date();
  const pedidos = carregarPedidos();
  let numeroPedido;

  do {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 900) + 100;
    numeroPedido = `LV-${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, "0")}${String(data.getDate()).padStart(2, "0")}-${timestamp}-${random}`;
  } while (pedidos.some((pedido) => pedido.numeroPedido === numeroPedido));

  return numeroPedido;
}

function carregarPedidos() {
  try {
    const pedidosSalvos = JSON.parse(localStorage.getItem(chavePedidos) || "[]");
    return Array.isArray(pedidosSalvos) ? pedidosSalvos : [];
  } catch (erro) {
    console.error("Não foi possível carregar o histórico de pedidos.", erro);
    return [];
  }
}

function salvarPedido(pedido) {
  const pedidos = carregarPedidos();
  pedidos.unshift(pedido);
  localStorage.setItem(chavePedidos, JSON.stringify(pedidos));
}

function finalizarPedido(evento) {
  evento.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  const resumo = calcularResumo();

  if (resumo.total <= 0) {
    alert("Seu carrinho está vazio. Adicione produtos antes de finalizar.");
    return;
  }

  const numeroPedido = gerarNumeroPedido();
  const pedido = {
    numeroPedido,
    data: new Date().toISOString(),
    produtos: resumo.itens.map((item) => ({
      id: item.id,
      nome: item.nome,
      imagem: item.imagem,
      preco: item.preco,
      quantidade: item.quantidade,
      subtotal: item.subtotal,
    })),
    subtotal: resumo.subtotal,
    frete: resumo.frete,
    desconto: resumo.desconto,
    total: resumo.total,
    status: "Recebido",
  };

  salvarPedido(pedido);
  localStorage.setItem(chavePedido, JSON.stringify(pedido));
  localStorage.removeItem(chaveCarrinho);

  alert(`Pedido finalizado com sucesso!\nNúmero do pedido: ${numeroPedido}`);
  window.location.href = "index.html";
}

function configurarValidacao() {
  const campos = [
    document.getElementById("nome"),
    document.getElementById("email"),
    document.getElementById("cpf"),
    document.getElementById("telefone"),
    document.getElementById("cep"),
    document.getElementById("cidade"),
    document.getElementById("rua"),
    document.getElementById("numero"),
    document.getElementById("estado"),
  ];

  campos.forEach((campo) => {
    if (!campo) {
      return;
    }

    campo.addEventListener("blur", () => validarCampo(campo));
    campo.addEventListener("input", () => {
      if (campo.value.trim() !== "") {
        validarCampo(campo);
      } else {
        limparErro(campo);
      }
    });
  });

  document.querySelectorAll('input[name="pagamento"]').forEach((radio) => {
    radio.addEventListener("change", validarPagamento);
  });
}

function aplicarMascaras() {
  const cpfInput = document.getElementById("cpf");
  const cepInput = document.getElementById("cep");
  const telefoneInput = document.getElementById("telefone");

  cpfInput.addEventListener("input", (evento) => {
    const valor = evento.target.value.replace(/\D/g, "").slice(0, 11);
    evento.target.value = valor
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  });

  cepInput.addEventListener("input", (evento) => {
    const valor = evento.target.value.replace(/\D/g, "").slice(0, 8);
    evento.target.value = valor.length > 5
      ? `${valor.slice(0, 5)}-${valor.slice(5)}`
      : valor;
  });

  telefoneInput.addEventListener("input", (evento) => {
    const valor = evento.target.value.replace(/\D/g, "").slice(0, 11);
    if (valor.length <= 10) {
      evento.target.value = valor
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      evento.target.value = valor
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  });
}

function inicializarCheckout() {
  renderizarResumo();
  aplicarMascaras();
  configurarValidacao();
  formularioCheckoutElement.addEventListener("submit", finalizarPedido);
}

if (formularioCheckoutElement) {
  inicializarCheckout();
}
