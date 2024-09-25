const apiUrl = "https://66f3221771c84d805877f10c.mockapi.io/produtos";

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 2000);
}

async function fetchApi() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar produtos');
    return [];
  }
}

function createProductCards(products) {
  const productList = document.getElementById('container-products');
  productList.innerHTML = ''; 

  products.forEach(product => {
    const productCard = document.createElement('article');
    productCard.classList.add('product-card');

    productCard.innerHTML = `
      <img class="product-photo" src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <div class="product-value">
        <span>R$ ${parseFloat(product.price).toFixed(2)}</span>
        <button type="button" class="delete-button" data-id="${product.id}">
          <img src="assets/trash.png" alt="Excluir produto">
        </button>
      </div>
    `;

    productList.appendChild(productCard);
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', deleteProduct);
  });
}

async function getProducts() {
  const productList = document.getElementById('container-products');
  productList.innerHTML = '<h2>Carregando produtos...</h2>';

  const products = await fetchApi();

  if (products.length === 0) {
    productList.innerHTML = '<h2>Nenhum produto cadastrado no momento.</h2>';
  } else {
    createProductCards(products);
  }
}

async function addProduct(event) {
  event.preventDefault();

  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const image = document.getElementById('product-image').value;

  if (!name || isNaN(price) || !image) {
    showNotification('Por favor, preencha todos os campos corretamente!');
    return;
  }

  try {
    const response = await fetch(apiUrl);
    const existingProducts = await response.json();

    const id = (existingProducts.length ? Math.max(...existingProducts.map(p => parseInt(p.id))) + 1 : 1).toString();

    const newProduct = { 
      id, 
      name, 
      price, 
      image 
    };

    const postResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });

    if (postResponse.ok) {
      const data = await postResponse.json();

      document.getElementById('product-name').value = '';
      document.getElementById('product-price').value = '';
      document.getElementById('product-image').value = '';

      showNotification('Produto adicionado com sucesso!');
      createProductCards([...existingProducts, data]);
    } else {
      showNotification('Erro ao adicionar produto!');
    }
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
  }
}

async function deleteProduct(event) {
  const productId = event.target.closest('button').getAttribute('data-id');

  const modalMessage = document.getElementById('modal-message');
  const confirmButton = document.getElementById('confirm-delete');
  const cancelButton = document.getElementById('cancel-delete');

  modalMessage.style.display = 'flex';

  confirmButton.onclick = async () => {
    try {
      const response = await fetch(`${apiUrl}/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Produto excluído com sucesso!');
        const products = await fetchApi();
        createProductCards(products);
      } else {
        showNotification('Erro ao excluir produto!');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    } finally {
      modalMessage.style.display = 'none';
    }
  };

  cancelButton.onclick = () => {
    modalMessage.style.display = 'none'; 
  };

  window.onclick = (event) => {
    if (event.target === modalMessage) {
      modalMessage.style.display = 'none';
    }
  };
}

document.getElementById('register-form').addEventListener('submit', addProduct);

getProducts();
