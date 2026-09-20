// ================================
// WJ IMPORTS - SCRIPT.JS
// ================================

const API_URL = "https://site-wjimports.onrender.com";
const WHATSAPP_NUMBER = "5513996905523";

let cart = [];
let currentShippingRates = [];
let selectedShipping = null;

// ================================
// UTILITÁRIOS
// ================================

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function toast(message) {
  const existing = document.querySelector(".toast");

  if (existing) {
    existing.remove();
  }

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;

  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add("show");
  }, 10);

  setTimeout(() => {
    el.classList.remove("show");

    setTimeout(() => {
      el.remove();
    }, 300);
  }, 2500);
}

// ================================
// PRODUTOS
// ================================

const products = [
  {
    id: 1,
    name: "Perfume",
    price: 0,
    image: ""
  }
];

// ================================
// ELEMENTOS
// ================================

const cartView = document.getElementById("cartView");
const checkoutView = document.getElementById("checkoutView");

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutShipping = document.getElementById("checkoutShipping");
const checkoutTotal = document.getElementById("checkoutTotal");

const shippingResult = document.getElementById("shippingResult");

// ================================
// CARRINHO
// ================================

function getCartSubtotal() {
  return cart.reduce((total, item) => {
    return total + Number(item.price || 0);
  }, 0);
}

function addToCart(product) {
  cart.push({
    ...product
  });

  updateCart();

  toast("Produto adicionado ao carrinho!");
}

function removeFromCart(index) {
  cart.splice(index, 1);

  updateCart();
}

function clearCart() {
  cart = [];

  updateCart();
}

function updateCart() {
  if (!cartItems) {
    return;
  }

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Seu carrinho está vazio.</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-image">
          ${
            item.image
              ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`
              : ""
          }
        </div>

        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>

          ${
            item.size
              ? `<p>Tamanho: ${escapeHtml(item.size)}</p>`
              : ""
          }

          ${
            item.variant
              ? `<p>${escapeHtml(item.variant)}</p>`
              : ""
          }

          <strong>${money(item.price)}</strong>
        </div>

        <button
          type="button"
          class="remove-cart-item"
          onclick="removeFromCart(${index})"
        >
          Remover
        </button>
      </div>
    `).join("");
  }

  const subtotal = getCartSubtotal();

  if (cartTotal) {
    cartTotal.textContent = money(subtotal);
  }

  updateCheckoutTotals();
}

// ================================
// ABRIR CARRINHO
// ================================

function openCart() {
  if (checkoutView) {
    checkoutView.style.display = "none";
  }

  if (cartView) {
    cartView.style.display = "block";
    cartView.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  updateCart();
}

// ================================
// FECHAR CARRINHO
// ================================

function closeCart() {
  if (cartView) {
    cartView.style.display = "none";
  }
}

// ================================
// IR PARA ENTREGA
// ================================

function checkout() {
  if (cart.length === 0) {
    toast("Adicione pelo menos um produto ao carrinho.");
    return;
  }

  if (cartView) {
    cartView.style.display = "none";
  }

  if (checkoutView) {
    checkoutView.style.display = "block";

    checkoutView.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  resetShipping();

  updateCheckoutTotals();
}

// ================================
// VOLTAR PARA O CARRINHO
// ================================

function backToCart() {
  if (checkoutView) {
    checkoutView.style.display = "none";
  }

  if (cartView) {
    cartView.style.display = "block";

    cartView.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// ================================
// CEP / VIACEP
// ================================

async function lookupCep() {
  const cepInput = document.getElementById("cep");

  if (!cepInput) {
    return;
  }

  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    toast("Digite um CEP válido.");
    return;
  }

  try {
    toast("Buscando endereço...");

    const response = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`
    );

    if (!response.ok) {
      throw new Error("Erro ao consultar CEP.");
    }

    const data = await response.json();

    if (data.erro) {
      toast("CEP não encontrado.");
      return;
    }

    const street = document.getElementById("addressStreet");
    const neighborhood = document.getElementById("addressNeighborhood");
    const city = document.getElementById("addressCity");
    const state = document.getElementById("addressState");

    if (street) {
      street.value = data.logradouro || "";
    }

    if (neighborhood) {
      neighborhood.value = data.bairro || "";
    }

    if (city) {
      city.value = data.localidade || "";
    }

    if (state) {
      state.value = data.uf || "";
    }

    toast("Endereço encontrado!");
  } catch (error) {
    console.error(error);
    toast("Não foi possível consultar o CEP.");
  }
}

// ================================
// FORMATAR CEP
// ================================

function formatCep(input) {
  let value = input.value.replace(/\D/g, "");

  if (value.length > 8) {
    value = value.substring(0, 8);
  }

  if (value.length > 5) {
    value =
      value.substring(0, 5) +
      "-" +
      value.substring(5);
  }

  input.value = value;
}

// ================================
// QUANTIDADE DE PRODUTOS
// ================================

function getShippingQuantity() {
  return cart.length;
}

// ================================
// PESO
// ================================

function getShippingWeight() {
  let weight = 0;

  cart.forEach(item => {
    const itemWeight = Number(
      item.weight ||
      item.peso ||
      0.3
    );

    weight += itemWeight;
  });

  return Math.max(weight, 0.3);
}

// ================================
// CALCULAR FRETE
// ================================

async function calculateShipping() {
  const cepInput = document.getElementById("cep");

  if (!cepInput) {
    return;
  }

  const cep = cepInput.value.replace(/\D/g, "");

  const street = document.getElementById("addressStreet")?.value.trim();
  const number = document.getElementById("addressNumber")?.value.trim();
  const neighborhood = document.getElementById("addressNeighborhood")?.value.trim();
  const city = document.getElementById("addressCity")?.value.trim();
  const state = document.getElementById("addressState")?.value.trim();

  if (cep.length !== 8) {
    toast("Informe um CEP válido.");
    return;
  }

  if (!street) {
    toast("Informe a rua ou avenida.");
    return;
  }

  if (!number) {
    toast("Informe o número.");
    return;
  }

  if (!neighborhood) {
    toast("Informe o bairro.");
    return;
  }

  if (!city) {
    toast("Informe a cidade.");
    return;
  }

  if (!state) {
    toast("Informe o estado.");
    return;
  }

  if (cart.length === 0) {
    toast("Seu carrinho está vazio.");
    return;
  }

  const button = document.getElementById("shippingButton");

  if (button) {
    button.disabled = true;
    button.textContent = "Calculando...";
  }

  if (shippingResult) {
    shippingResult.innerHTML = `
      <div class="shipping-loading">
        Calculando opções de entrega...
      </div>
    `;
  }

  try {
    const quantity = getShippingQuantity();
    const weight = getShippingWeight();

    const response = await fetch(`${API_URL}/api/frete`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },

      body: JSON.stringify({
        cepDestino: cep,
        quantidade: quantity,
        peso: weight
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Erro ao calcular frete."
      );
    }

    const rates =
      Array.isArray(data)
        ? data
        : (
            data.services ||
            data.rates ||
            data.data ||
            []
          );

    currentShippingRates = normalizeShippingRates(rates);

    selectedShipping = null;

    renderShippingOptions();

    updateCheckoutTotals();

  } catch (error) {
    console.error("Erro no cálculo do frete:", error);

    currentShippingRates = [];
    selectedShipping = null;

    if (shippingResult) {
      shippingResult.innerHTML = `
        <div class="shipping-error">
          Não foi possível calcular o frete agora.
          <br>
          Tente novamente em alguns segundos.
        </div>
      `;
    }

    toast("Erro ao calcular o frete.");

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Calcular frete";
    }
  }
}

// ================================
// NORMALIZAR FRETES
// ================================

function normalizeShippingRates(rates) {
  if (!Array.isArray(rates)) {
    return [];
  }

  return rates
    .map(rate => {
      const rawName = String(
        rate.name ||
        rate.service_name ||
        rate.service ||
        rate.company ||
        rate.transportadora ||
        ""
      ).trim();

      const lowerName = rawName.toLowerCase();

      let friendlyName = rawName;

      if (
        lowerName.includes("pac")
      ) {
        friendlyName = "PAC";
      }

      if (
        lowerName.includes("sedex")
      ) {
        friendlyName = "SEDEX";
      }

      if (
        lowerName.includes("jadlog")
      ) {
        friendlyName = "Jadlog";
      }

      if (
        lowerName.includes("j&t") ||
        lowerName.includes("jet") ||
        lowerName.includes("j&t express")
      ) {
        friendlyName = "J&T Express";
      }

      if (
        lowerName.includes("loggi")
      ) {
        friendlyName = "Loggi";
      }

      const price = Number(
        rate.price ??
        rate.valor ??
        rate.amount ??
        rate.cost ??
        0
      );

      const deliveryTime =
        rate.deliveryTime ??
        rate.delivery_time ??
        rate.deadline ??
        rate.prazo ??
        rate.delivery_range ??
        "";

      return {
        id:
          rate.id ??
          rate.service_id ??
          `${friendlyName}-${Math.random()}`,

        name: friendlyName || "Transportadora",

        originalName: rawName,

        price: price,

        deliveryTime: deliveryTime
      };
    })
    .filter(rate => {
      return rate.price >= 0 && rate.name;
    });
}

// ================================
// MOSTRAR OPÇÕES DE FRETE
// ================================

function renderShippingOptions() {
  if (!shippingResult) {
    return;
  }

  let html = "";

  if (currentShippingRates.length === 0) {
    html += `
      <div class="shipping-empty">
        Nenhuma opção de frete foi encontrada.
      </div>
    `;
  } else {
    html += `
      <div class="shipping-options">
        <h3>Escolha a forma de entrega</h3>
    `;

    currentShippingRates.forEach((rate, index) => {
      const delivery =
        rate.deliveryTime
          ? `Prazo: ${escapeHtml(String(rate.deliveryTime))}`
          : "";

      html += `
        <label class="shipping-option">
          <input
            type="radio"
            name="shipping"
            value="${index}"
            onchange="selectShipping(${index})"
          >

          <span class="shipping-option-content">

            <span class="shipping-option-top">
              <strong>${escapeHtml(rate.name)}</strong>

              <span class="shipping-price">
                ${money(rate.price)}
              </span>
            </span>

            ${
              delivery
                ? `<small>${delivery}</small>`
                : ""
            }

          </span>
        </label>
      `;
    });

    html += `
      </div>
    `;
  }

  // ================================
  // COMBINAR ENTREGA
  // ================================

  html += `
    <div class="shipping-combine">
      <label class="shipping-option shipping-combine-option">

        <input
          type="radio"
          name="shipping"
          value="combine"
          onchange="selectCombineShipping()"
        >

        <span class="shipping-option-content">

          <span class="shipping-option-top">
            <strong>Combinar entrega</strong>

            <span class="shipping-price">
              A combinar
            </span>
          </span>

          <small>
            Entraremos em contato para combinar a melhor forma de entrega.
          </small>

        </span>

      </label>
    </div>
  `;

  shippingResult.innerHTML = html;
}

// ================================
// SELECIONAR FRETE
// ================================

function selectShipping(index) {
  const rate = currentShippingRates[index];

  if (!rate) {
    return;
  }

  selectedShipping = {
    type: "shipping",
    id: rate.id,
    name: rate.name,
    price: Number(rate.price || 0),
    deliveryTime: rate.deliveryTime || ""
  };

  updateCheckoutTotals();
}

// ================================
// COMBINAR ENTREGA
// ================================

function selectCombineShipping() {
  selectedShipping = {
    type: "combine",
    id: "combine",
    name: "Combinar entrega",
    price: 0,
    deliveryTime: ""
  };

  updateCheckoutTotals();
}

// ================================
// ATUALIZAR TOTAIS
// ================================

function updateCheckoutTotals() {
  const subtotal = getCartSubtotal();

  let shippingPrice = 0;

  if (
    selectedShipping &&
    selectedShipping.type === "shipping"
  ) {
    shippingPrice = Number(
      selectedShipping.price || 0
    );
  }

  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = money(subtotal);
  }

  if (checkoutShipping) {
    if (
      selectedShipping &&
      selectedShipping.type === "combine"
    ) {
      checkoutShipping.textContent = "A combinar";
    } else {
      checkoutShipping.textContent = money(shippingPrice);
    }
  }

  if (checkoutTotal) {
    checkoutTotal.textContent = money(
      subtotal + shippingPrice
    );
  }
}

// ================================
// FINALIZAR PEDIDO
// ================================

function finishOrder() {
  if (cart.length === 0) {
    toast("Seu carrinho está vazio.");
    return;
  }

  const cep =
    document.getElementById("cep")?.value.trim() || "";

  const street =
    document.getElementById("addressStreet")?.value.trim() || "";

  const number =
    document.getElementById("addressNumber")?.value.trim() || "";

  const complement =
    document.getElementById("addressComplement")?.value.trim() || "";

  const neighborhood =
    document.getElementById("addressNeighborhood")?.value.trim() || "";

  const city =
    document.getElementById("addressCity")?.value.trim() || "";

  const state =
    document.getElementById("addressState")?.value.trim() || "";

  // ================================
  // VALIDAR ENDEREÇO
  // ================================

  if (cep.replace(/\D/g, "").length !== 8) {
    toast("Informe um CEP válido.");
    return;
  }

  if (!street) {
    toast("Informe a rua ou avenida.");
    return;
  }

  if (!number) {
    toast("Informe o número.");
    return;
  }

  if (!neighborhood) {
    toast("Informe o bairro.");
    return;
  }

  if (!city) {
    toast("Informe a cidade.");
    return;
  }

  if (!state) {
    toast("Informe o estado.");
    return;
  }

  // ================================
  // VALIDAR FRETE
  // ================================

  if (!selectedShipping) {
    toast("Escolha uma forma de entrega.");
    return;
  }

  // ================================
  // PRODUTOS
  // ================================

  let productsText = "";

  cart.forEach((item, index) => {
    productsText +=
      `${index + 1}. ${item.name}`;

    if (item.size) {
      productsText +=
        ` | Tamanho: ${item.size}`;
    }

    if (item.variant) {
      productsText +=
        ` | ${item.variant}`;
    }

    productsText +=
      ` | ${money(item.price)}\n`;
  });

  // ================================
  // FRETE
  // ================================

  let shippingText = "";

  if (selectedShipping.type === "combine") {
    shippingText =
      "Combinar entrega — A combinar";
  } else {
    shippingText =
      `${selectedShipping.name} — ${money(selectedShipping.price)}`;

    if (selectedShipping.deliveryTime) {
      shippingText +=
        ` | Prazo: ${selectedShipping.deliveryTime}`;
    }
  }

  const subtotal = getCartSubtotal();

  const total =
    subtotal +
    (
      selectedShipping.type === "shipping"
        ? Number(selectedShipping.price || 0)
        : 0
    );

  // ================================
  // MENSAGEM WHATSAPP
  // ================================

  let message = "";

  message += "🛒 *NOVO PEDIDO - WJ IMPORTS*\n\n";

  message += "📦 *PRODUTOS*\n";
  message += productsText;

  message += "\n";

  message += "📍 *ENDEREÇO DE ENTREGA*\n";

  message += `CEP: ${cep}\n`;
  message += `Endereço: ${street}, ${number}\n`;

  if (complement) {
    message += `Complemento: ${complement}\n`;
  }

  message += `Bairro: ${neighborhood}\n`;
  message += `Cidade: ${city} - ${state}\n`;

  message += "\n";

  message += "🚚 *ENTREGA*\n";
  message += `${shippingText}\n`;

  message += "\n";

  message += "💰 *RESUMO*\n";
  message += `Subtotal: ${money(subtotal)}\n`;

  if (selectedShipping.type === "combine") {
    message += "Frete: A combinar\n";
    message += `Total dos produtos: ${money(total)}\n`;
  } else {
    message += `Frete: ${money(selectedShipping.price)}\n`;
    message += `Total: ${money(total)}\n`;
  }

  message += "\n";
  message += "Aguardo confirmação do pedido. 😊";

  // ================================
  // WHATSAPP
  // ================================

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=` +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

// ================================
// RESETAR FRETE
// ================================

function resetShipping() {
  currentShippingRates = [];
  selectedShipping = null;

  if (shippingResult) {
    shippingResult.innerHTML = "";
  }

  const checkoutShippingEl =
    document.getElementById("checkoutShipping");

  if (checkoutShippingEl) {
    checkoutShippingEl.textContent = "Aguardando";
  }

  updateCheckoutTotals();
}

// ================================
// MODAL DE IMAGEM
// ================================

function openImageModal(src, alt = "") {
  const modal =
    document.getElementById("imageModal");

  const modalImage =
    document.getElementById("modalImage");

  if (!modal || !modalImage) {
    return;
  }

  modalImage.src = src;
  modalImage.alt = alt;

  modal.style.display = "flex";
}

function closeImageModal() {
  const modal =
    document.getElementById("imageModal");

  if (modal) {
    modal.style.display = "none";
  }
}

// ================================
// FECHAR MODAIS CLICANDO FORA
// ================================

document.addEventListener("click", function(event) {
  const imageModal =
    document.getElementById("imageModal");

  if (
    imageModal &&
    event.target === imageModal
  ) {
    closeImageModal();
  }
});

// ================================
// ESC
// ================================

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeImageModal();
  }
});

// ================================
// CEP AUTOMÁTICO
// ================================

document.addEventListener("DOMContentLoaded", function() {

  const cep =
    document.getElementById("cep");

  if (cep) {
    cep.addEventListener("input", function() {
      formatCep(this);
    });

    cep.addEventListener("blur", function() {
      const value =
        this.value.replace(/\D/g, "");

      if (value.length === 8) {
        lookupCep();
      }
    });
  }

  updateCart();
});

// ================================
// EXPOR FUNÇÕES PARA HTML
// ================================

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;

window.openCart = openCart;
window.closeCart = closeCart;

window.checkout = checkout;
window.backToCart = backToCart;

window.lookupCep = lookupCep;
window.calculateShipping = calculateShipping;

window.selectShipping = selectShipping;
window.selectCombineShipping = selectCombineShipping;

window.finishOrder = finishOrder;

window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

window.updateCart = updateCart;