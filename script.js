/* WJ IMPORTS — catálogo + carrinho + SuperFrete */
const products = [


  {
    id: 1,
    name: "SmartWatch",
    cat: "Dia a Dia/Esportes",
    price: 200.90,
    image: [
      "imgs/relogio1.jpg",
      "imgs/relogio2.jpg",
      "imgs/relogio3.jpg"
    ]
  },

  {
    id: 2,
    name: "SmartWatch preto",
    cat: "Dia a Dia/Lazer",
    price: 200.90,
    image: [
      "imgs/preto1.jpg",
      "imgs/preto2.jpg",
      "imgs/preto3.jpg"
    ]
  },

  {
    id: 3,
    name: "SMARTWATCH PARA CORRIDAS",
    cat: "ESPORTES/LAZER",
    price: 500.00,
    image: [
      "imgs/redondo1.jpg",
      "imgs/redondo2.jpg",
      "imgs/redondo3.jpg"
    ]
  },

  {
    id: 4,
    name: "Câmera IP",
    cat: "Câmeras e Segurança",
    price: 799.90,
    image: [
      "imgs/cam-ip1.jpg",
      "imgs/cam-ip2.jpg",
      "imgs/cam-ip3.jpg"
    ]
  },



  {
    id: 13,
    name: "Perfume Importado 100ml",
    cat: "Perfumes Importados",
    price: 299.90,
    image: [
      "imgs/asad1.jpg",
      "imgs/asad2.jpg",
      "imgs/asad3.jpg"
    ]
  },

  {
    id: 14,
    name: "Perfume Lataffa Yara 200ml",
    cat: "Perfumes Importados",
    price: 349.90,
    image: [
      "imgs/yara1.jpg",
      "imgs/yara2.jpg",
      "imgs/yara3.jpg"
    ]
  },

  {
    id: 15,
    name: "Perfume Lataffa Eclaire 100ml",
    cat: "Perfumes Importados",
    price: 369.90,
    image: [
      "imgs/eclaire1.jpg",
      "imgs/eclaire2.jpg",
      "imgs/eclaire3.jpg"
    ]
  },

  {
    id: 16,
    name: "Kit Casal Asad Elixir + Asad Yara",
    cat: "Perfumes Importados",
    price: 319.90,
    image: [
      "imgs/asad1.jpg",
      "imgs/yara1.jpg",
    ]
  },

  {
    id: 17,
    name: "Caixa de Som JBL",
    cat: "Eletroeletrônicos",
    price: 99.99,
    image: [
      "imgs/jbl1.jpg",
      "imgs/jbl2.jpg",
      "imgs/jbl3.jpg"
    ]
  },

  {
    id: 18,
    name: "Power Bank 22000mha",
    cat: "Eletroeletrônicos",
    price: 299.99,
    image: [
      "imgs/bank1.jpg",
      "imgs/bank2.jpg",
      "imgs/bank3.jpg"
    ]
  },

  {
    id: 19,
    name: "Fone de Ouvido",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/fone1.jpg",
      "imgs/fone2.jpg"
    ]
  } ,
  {
    id: 20,
    name: "Carregador USB-C (Iphone)",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/usbc.jpg",
      "imgs/usbc2.jpg"
    ]
  } ,
   {
    id: 21,
    name: "Controle PS4",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/ps4.jpg",
      "imgs/ps42.jpg",
      "imgs/ps43.jpg"
    ]
  } ,
   {
    id: 22,
    name: "TV Box UNI TV",
    cat: "Eletroeletrônicos",
    price: 300.00,
    image: [
      "imgs/unitv.jpg",
    ]
  } ,
  {
    id: 23,
    name: "Tablet Redmi Pad 2 Wi-Fi 256GB",
    cat: "Eletroeletrônicos",
    price: 3000.00,
    image: [
      "imgs/tabletxiaomi1.jpg",
      "imgs/tabletxiaomi2.jpg",
      "imgs/tabletxiaomi3.jpg",
    ]
  } ,


  

  

];

const SHIPPING_CONFIG = {
  apiUrl: "https://site-wjimports.onrender.com",
  height: 10,
  width: 15,
  length: 20,
  defaultWeight: 0.30
};

let currentShippingRates = [];
let selectedShipping = null;

const cats = [...new Set(products.map(p => p.cat))];
const categoryGrid = document.getElementById("categoryGrid");
const categoryFilter = document.getElementById("categoryFilter");

categoryGrid.innerHTML = cats.map((cat, index) => `
  <button class="category" type="button" onclick="setCategory(${JSON.stringify(cat)})">
    <span class="category-number">${String(index + 1).padStart(2, "0")}</span>
    <div><h3>${escapeHtml(cat)}</h3><p>${products.filter(p => p.cat === cat).length} produto(s)</p></div>
    <span class="category-arrow">→</span>
  </button>
`).join("");

categoryFilter.innerHTML += cats.map(cat =>
  `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
).join("");

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
}
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function setCategory(category) {
  categoryFilter.value = category;
  document.getElementById("produtos").scrollIntoView({behavior:"smooth"});
  renderProducts();
}
function changeImage(productId, direction) {
  const product = products.find(item => item.id === productId);
  if (!product || !product.image?.length) return;
  product.currentImage = product.currentImage ?? 0;
  product.currentImage += direction;
  if (product.currentImage < 0) product.currentImage = product.image.length - 1;
  if (product.currentImage >= product.image.length) product.currentImage = 0;
  const image = document.getElementById(`product-image-${productId}`);
  const counter = document.getElementById(`image-counter-${productId}`);
  if (image) image.src = product.image[product.currentImage];
  if (counter) counter.textContent = `${product.currentImage + 1}/${product.image.length}`;
}
function openImage(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  modalProductId = productId;
  modalImageIndex = product.currentImage || 0;
  updateModalImage();
  document.getElementById("imageModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function updateModalImage() {
  const product = products.find(item => item.id === modalProductId);
  if (!product) return;
  document.getElementById("modalImage").src = product.image[modalImageIndex];
  document.getElementById("modalImage").alt = product.name;
  document.getElementById("modalImageCounter").textContent = `${modalImageIndex + 1}/${product.image.length}`;
}
function changeModalImage(direction, event) {
  event?.stopPropagation();
  const product = products.find(item => item.id === modalProductId);
  if (!product) return;
  modalImageIndex += direction;
  if (modalImageIndex < 0) modalImageIndex = product.image.length - 1;
  if (modalImageIndex >= product.image.length) modalImageIndex = 0;
  product.currentImage = modalImageIndex;
  updateModalImage();
  const image = document.getElementById(`product-image-${product.id}`);
  const counter = document.getElementById(`image-counter-${product.id}`);
  if (image) image.src = product.image[modalImageIndex];
  if (counter) counter.textContent = `${modalImageIndex + 1}/${product.image.length}`;
}
function closeImage(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains("close-image")) return;
  document.getElementById("imageModal").style.display = "none";
  document.body.style.overflow = "";
  modalProductId = null;
  modalImageIndex = 0;
}
document.addEventListener("keydown", event => {
  const modal = document.getElementById("imageModal");
  if (modal.style.display !== "flex") return;
  if (event.key === "Escape") closeImage();
  if (event.key === "ArrowLeft") changeModalImage(-1);
  if (event.key === "ArrowRight") changeModalImage(1);
});

function renderProducts() {
  const search = document.getElementById("search").value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = document.getElementById("sort").value;
  let list = products.filter(product =>
    (category === "Todos" || product.cat === category) &&
    product.name.toLowerCase().includes(search)
  );
  if (sort === "low") list.sort((a,b) => a.price - b.price);
  if (sort === "high") list.sort((a,b) => b.price - a.price);
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name,"pt-BR"));
  document.getElementById("resultText").textContent = `${list.length} produto(s) encontrado(s).`;

  document.getElementById("productGrid").innerHTML = list.map(product => {
    product.currentImage = product.currentImage ?? 0;
    const hasMultiple = product.image.length > 1;
    return `
      <article class="product">
        <div class="product-img">
          <span class="product-badge">${escapeHtml(product.cat)}</span>
          <img id="product-image-${product.id}" src="${product.image[product.currentImage]}" alt="${escapeHtml(product.name)}" loading="lazy" onclick="openImage(${product.id})">
          ${hasMultiple ? `
            <button class="image-arrow image-arrow-left" type="button" onclick="changeImage(${product.id},-1)" aria-label="Imagem anterior">‹</button>
            <button class="image-arrow image-arrow-right" type="button" onclick="changeImage(${product.id},1)" aria-label="Próxima imagem">›</button>
            <div class="image-counter" id="image-counter-${product.id}">${product.currentImage + 1}/${product.image.length}</div>
          ` : ""}
        </div>
        <div class="product-body">
          <h3>${escapeHtml(product.name)}</h3>
          <div class="price">${money(product.price)}</div>
          <div class="stock"><span></span> Disponível</div>
          <button type="button" onclick="addToCart(${product.id})">Adicionar ao carrinho</button>
        </div>
      </article>
    `;
  }).join("") || `<div class="empty-products"><h3>Nenhum produto encontrado.</h3><p>Tente outro termo ou categoria.</p></div>`;
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  cart.push({id:product.id, name:product.name, price:product.price});
  saveCart();
  toast("Produto adicionado ao carrinho!");
}
function saveCart() {
  localStorage.setItem("wjCart", JSON.stringify(cart));
  document.getElementById("cartCount").textContent = cart.length;
}
function openCart() { document.getElementById("cartModal").style.display = "block"; renderCart(); }
function closeCart() { document.getElementById("cartModal").style.display = "none"; }
function renderCart() {
  const box = document.getElementById("cartItems");
  if (!cart.length) {
    box.innerHTML = `<div class="cart-empty"><strong>Seu carrinho está vazio.</strong><p>Adicione um produto para continuar.</p></div>`;
    document.getElementById("cartTotal").textContent = money(0);
    return;
  }
  box.innerHTML = cart.map((product,index) => `
    <div class="cart-item"><div><strong>${escapeHtml(product.name)}</strong><small>${money(product.price)}</small></div><button type="button" onclick="removeItem(${index})">Remover</button></div>
  `).join("");
  document.getElementById("cartTotal").textContent = money(cart.reduce((sum,p) => sum + Number(p.price || 0),0));
}
function removeItem(index) { cart.splice(index,1); saveCart(); renderCart(); }
function checkout() {
  if (!cart.length) {
    return toast("Seu carrinho está vazio.");
  }

  if (!selectedShipping) {
    return toast("Selecione uma opção de entrega.");
  }

  const total = cart.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  let shippingText = "";

  if (selectedShipping.type === "combine") {
    shippingText = "Combinar entrega — consultar disponibilidade";
  } else {
    shippingText =
      `${selectedShipping.name} — ${money(selectedShipping.price)}` +
      (selectedShipping.deliveryTime
        ? ` — ${selectedShipping.deliveryTime} dia(s) útil(eis)`
        : "");
  }

  const text = [
    "Olá, WJ Imports! Quero fazer um pedido:",
    "",
    ...cart.map(
      p => `• ${p.name} — ${money(p.price)}`
    ),
    "",
    `Total dos produtos: ${money(total)}`,
    "",
    `Forma de entrega: ${shippingText}`
  ].join("\n");

  window.open(
    "https://wa.me/5513996905523?text=" +
    encodeURIComponent(text),
    "_blank"
  );
}

async function calculateShipping(event) {
  event.preventDefault();

  const input = document.getElementById("cep");
  const result = document.getElementById("shippingResult");
  const button = document.getElementById("shippingButton");

  const cep = input.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    return toast("Digite um CEP válido.");
  }

  const qty = Math.max(
    1,
    Number(
      document.getElementById("shippingQty").value || 1
    )
  );

  const weight = Math.max(
    0.1,
    Number(
      document.getElementById("shippingWeight").value ||
      SHIPPING_CONFIG.defaultWeight
    )
  );

  button.disabled = true;
  button.textContent = "Calculando...";

  selectedShipping = null;
  currentShippingRates = [];

  result.innerHTML = `
    <div class="shipping-loading">
      <span></span>
      <p>Consultando opções de envio...</p>
    </div>
  `;

  try {
    const response = await fetch(
      `${SHIPPING_CONFIG.apiUrl}/api/frete`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          cep,
          quantity: qty,
          weight,
          height: SHIPPING_CONFIG.height,
          width: SHIPPING_CONFIG.width,
          length: SHIPPING_CONFIG.length
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Não foi possível calcular o frete."
      );
    }

    const rates = Array.isArray(data.rates)
      ? data.rates
      : [];

    currentShippingRates = rates;

    /*
      Identifica o nome da transportadora/serviço.
      A SuperFrete pode retornar nomes diferentes
      dependendo da cotação.
    */
    function getCarrierName(rate) {
      const text = String(
        rate.name ||
        rate.service ||
        ""
      ).toLowerCase();

      if (
        text.includes("sedex")
      ) {
        return "SEDEX";
      }

      if (
        text.includes("pac")
      ) {
        return "PAC";
      }

      if (
        text.includes("jadlog")
      ) {
        return "Jadlog";
      }

      if (
        text.includes("j&t") ||
        text.includes("j&t express") ||
        text.includes("jet")
      ) {
        return "J&T Express";
      }

      if (
        text.includes("loggi")
      ) {
        return "Loggi";
      }

      return rate.name || "Envio";
    }

    if (!rates.length) {
      result.innerHTML = `
        <div class="shipping-empty">
          <strong>Nenhuma opção calculada.</strong>
          <p>
            Não encontramos uma cotação automática
            para este CEP.
          </p>

          <label class="shipping-option shipping-combine">
            <input
              type="radio"
              name="shippingOption"
              onchange="selectCombineDelivery()"
            >

            <div>
              <strong>Combinar entrega</strong>
              <span>
                Consulte as opções disponíveis pelo WhatsApp.
              </span>
            </div>

            <strong class="shipping-price">
              Consultar
            </strong>
          </label>
        </div>
      `;

      return;
    }

    result.innerHTML = `
      <div class="shipping-results-head">
        <div>
          <span class="eyebrow">
            OPÇÕES DE ENVIO
          </span>

          <h3>
            Para ${formatCep(cep)}
          </h3>
        </div>

        <small>
          Cotação real
        </small>
      </div>

      <div class="shipping-options">

        ${rates.map((rate, index) => {

          const carrier = getCarrierName(rate);

          return `
            <label class="shipping-option">
              
              <input
                type="radio"
                name="shippingOption"
                onchange="selectShippingOption(${index})"
              >

              <div>
                <strong>
                  ${escapeHtml(carrier)}
                </strong>

                <span>
                  ${formatDelivery(rate)}
                </span>
              </div>

              <strong class="shipping-price">
                ${money(rate.price)}
              </strong>

            </label>
          `;

        }).join("")}

        <label class="shipping-option shipping-combine">

          <input
            type="radio"
            name="shippingOption"
            onchange="selectCombineDelivery()"
          >

          <div>
            <strong>
              Combinar entrega
            </strong>

            <span>
              Consulte outras opções pelo WhatsApp.
            </span>
          </div>

          <strong class="shipping-price">
            Consultar
          </strong>

        </label>

      </div>

      <div class="shipping-selected" id="shippingSelected">
        Selecione uma opção de entrega acima.
      </div>
    `;

  } catch (error) {

    console.error(error);

    result.innerHTML = `
      <div class="shipping-error">

        <strong>
          Não foi possível calcular agora.
        </strong>

        <p>
          ${escapeHtml(error.message)}
        </p>

        <small>
          Tente novamente em alguns instantes.
        </small>

      </div>
    `;

  } finally {

    button.disabled = false;
    button.textContent = "Calcular frete";

  }
}

function selectShippingOption(index) {
  const rate = currentShippingRates[index];

  if (!rate) return;

  const name = rate.name || "Envio";

  selectedShipping = {
    type: "shipping",
    name,
    price: Number(rate.price || 0),
    deliveryTime:
      rate.deliveryTime ??
      rate.delivery_time ??
      rate.deadline ??
      rate.deliveryDays ??
      null
  };

  const selected = document.getElementById(
    "shippingSelected"
  );

  if (selected) {
    selected.innerHTML = `
      <strong>
        Entrega selecionada:
      </strong>

      ${escapeHtml(name)}
      — ${money(selectedShipping.price)}
    `;
  }
}


function selectCombineDelivery() {

  selectedShipping = {
    type: "combine",
    name: "Combinar entrega",
    price: 0,
    deliveryTime: null
  };

  const selected = document.getElementById(
    "shippingSelected"
  );

  if (selected) {
    selected.innerHTML = `
      <strong>
        Entrega selecionada:
      </strong>

      Combinar entrega
      — consulte pelo WhatsApp
    `;
  }
}
function formatDelivery(rate) {
  const days = rate.deliveryTime ?? rate.delivery_time ?? rate.deadline ?? rate.deliveryDays;
  return days === undefined || days === null || days === "" ? "Prazo informado pela transportadora" : `${days} dia(s) útil(eis)`;
}
function formatCep(cep) { return `${cep.slice(0,5)}-${cep.slice(5)}`; }
function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => element.style.display = "none",2200);
}
document.getElementById("cep").addEventListener("input", event => {
  const value = event.target.value.replace(/\D/g,"").slice(0,8);
  event.target.value = value.length > 5 ? value.slice(0,5) + "-" + value.slice(5) : value;
});
document.getElementById("shippingQty").addEventListener("change", event => {
  event.target.value = Math.max(1,Math.min(20,Number(event.target.value || 1)));
});
renderProducts();
saveCart();
