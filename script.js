/* ==================================================
   VARIABLES
================================================== */

let products =
    JSON.parse(localStorage.getItem("nexaProducts")) || [];

let clients =
    JSON.parse(localStorage.getItem("nexaClients")) || [];

let sales =
    JSON.parse(localStorage.getItem("nexaSales")) || [];

let cart = [];

const PIN = "271026";


/* ==================================================
   LOGIN CON TECLADO
================================================== */

const pinInput =
    document.getElementById("pinInput");


pinInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


function login() {

    const enteredPin =
        pinInput.value;


    if (enteredPin === PIN) {

        document.getElementById("login")
            .style.display = "none";


        document.getElementById("app")
            .style.display = "block";


        updateDashboard();

    }

    else {

        document.getElementById("error")
            .innerText =
            "PIN incorrecto";

        pinInput.value = "";

        pinInput.focus();

    }

}


/* ==================================================
   CERRAR SESIÓN
================================================== */

function logout() {

    document.getElementById("app")
        .style.display = "none";


    document.getElementById("login")
        .style.display = "flex";


    pinInput.value = "";

    pinInput.focus();

}


/* ==================================================
   CAMBIAR DE PÁGINA
================================================== */

function showPage(page, button) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(function (item) {

        item.classList.add("hidden");

    });


    document
        .getElementById(page)
        .classList.remove("hidden");


    if (button) {

        document
            .querySelectorAll(".menu")
            .forEach(function (menu) {

                menu.classList.remove("active");

            });


        button.classList.add("active");

    }


    if (page === "productos") {

        renderProducts();

    }


    if (page === "ventas") {

        loadSaleProducts();

        renderCart();

    }


    if (page === "clientes") {

        renderClients();

    }


    if (page === "reportes") {

        updateReports();

    }


    if (page === "caja") {

        updateCash();

    }

}


/* ==================================================
   PRODUCTOS
================================================== */

function addProduct() {

    const name =
        document.getElementById("productName")
            .value.trim();


    const price =
        Number(
            document.getElementById("productPrice")
                .value
        );


    const stock =
        Number(
            document.getElementById("productStock")
                .value
        );


    if (!name || price <= 0 || stock < 0) {

        alert(
            "Completa correctamente los datos del producto."
        );

        return;

    }


    const product = {

        id: Date.now(),

        name: name,

        price: price,

        stock: stock

    };


    products.push(product);


    saveProducts();


    document.getElementById("productName")
        .value = "";

    document.getElementById("productPrice")
        .value = "";

    document.getElementById("productStock")
        .value = "";


    renderProducts();

    updateDashboard();

}


function saveProducts() {

    localStorage.setItem(
        "nexaProducts",
        JSON.stringify(products)
    );

}


function renderProducts() {

    const table =
        document.getElementById("productTable");


    table.innerHTML = "";


    products.forEach(function (product) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.name}
            </td>

            <td>
                $${formatMoney(product.price)}
            </td>

            <td>
                ${product.stock}
            </td>

            <td>

                <button
                    class="delete-button"
                    onclick="deleteProduct(${product.id})"
                >
                    Eliminar
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


function deleteProduct(id) {

    if (
        !confirm(
            "¿Quieres eliminar este producto?"
        )
    ) {

        return;

    }


    products =
        products.filter(
            function (product) {

                return product.id !== id;

            }
        );


    saveProducts();

    renderProducts();

    updateDashboard();

}


/* ==================================================
   VENTAS
================================================== */

function loadSaleProducts() {

    const select =
        document.getElementById("saleProduct");


    select.innerHTML = `

        <option value="">
            Selecciona un producto
        </option>

    `;


    products.forEach(function (product) {

        if (product.stock > 0) {

            const option =
                document.createElement("option");


            option.value =
                product.id;


            option.textContent =
                `${product.name} - $${formatMoney(product.price)} (${product.stock} disponibles)`;


            select.appendChild(option);

        }

    });

}


function addToCart() {

    const productId =
        Number(
            document.getElementById("saleProduct")
                .value
        );


    const quantity =
        Number(
            document.getElementById("saleQuantity")
                .value
        );


    if (!productId || quantity <= 0) {

        alert(
            "Selecciona un producto y una cantidad."
        );

        return;

    }


    const product =
        products.find(
            function (item) {

                return item.id === productId;

            }
        );


    if (!product) {

        return;

    }


    if (quantity > product.stock) {

        alert(
            "No hay suficiente stock."
        );

        return;

    }


    const existing =
        cart.find(
            function (item) {

                return item.productId === productId;

            }
        );


    if (existing) {

        if (
            existing.quantity + quantity >
            product.stock
        ) {

            alert(
                "No hay suficiente stock."
            );

            return;

        }


        existing.quantity += quantity;

    }

    else {

        cart.push({

            productId: product.id,

            name: product.name,

            price: product.price,

            quantity: quantity

        });

    }


    renderCart();

}


function renderCart() {

    const container =
        document.getElementById("cartItems");


    const totalElement =
        document.getElementById("cartTotal");


    container.innerHTML = "";


    if (cart.length === 0) {

        container.innerHTML =
            "<p>El carrito está vacío.</p>";

        totalElement.innerText = "$0";

        return;

    }


    let total = 0;


    cart.forEach(function (item, index) {

        const subtotal =
            item.price * item.quantity;


        total += subtotal;


        const div =
            document.createElement("div");


        div.className =
            "cart-item";


        div.innerHTML = `

            <span>

                ${item.name}

                x${item.quantity}

            </span>


            <strong>

                $${formatMoney(subtotal)}

            </strong>

        `;


        container.appendChild(div);

    });


    totalElement.innerText =
        "$" + formatMoney(total);

}


function finishSale() {

    if (cart.length === 0) {

        alert(
            "El carrito está vacío."
        );

        return;

    }


    const money =
        Number(
            document.getElementById("moneyReceived")
                .value
        );


    const total =
        cart.reduce(
            function (sum, item) {

                return sum +
                    item.price *
                    item.quantity;

            },

            0
        );


    if (money < total) {

        alert(
            "El dinero recibido no alcanza."
        );

        return;

    }


    const change =
        money - total;


    /* DESCONTAR STOCK */

    cart.forEach(function (item) {

        const product =
            products.find(
                function (product) {

                    return product.id ===
                        item.productId;

                }
            );


        if (product) {

            product.stock -=
                item.quantity;

        }

    });


    /* GUARDAR VENTA */

    const sale = {

        id: Date.now(),

        date: new Date().toISOString(),

        total: total,

        items: [...cart]

    };


    sales.push(sale);


    saveProducts();

    saveSales();


    document.getElementById("change")
        .innerText =
        "Cambio: $" +
        formatMoney(change);


    alert(
        "Venta realizada correctamente."
    );


    cart = [];


    document.getElementById("moneyReceived")
        .value = "";


    renderCart();

    loadSaleProducts();

    updateDashboard();

}


function saveSales() {

    localStorage.setItem(
        "nexaSales",
        JSON.stringify(sales)
    );

}


/* ==================================================
   CLIENTES
================================================== */

function addClient() {

    const name =
        document.getElementById("clientName")
            .value.trim();


    const phone =
        document.getElementById("clientPhone")
            .value.trim();


    if (!name) {

        alert(
            "Escribe el nombre del cliente."
        );

        return;

    }


    clients.push({

        id: Date.now(),

        name: name,

        phone: phone

    });


    localStorage.setItem(
        "nexaClients",
        JSON.stringify(clients)
    );


    document.getElementById("clientName")
        .value = "";


    document.getElementById("clientPhone")
        .value = "";


    renderClients();

    updateDashboard();

}


function renderClients() {

    const table =
        document.getElementById("clientTable");


    table.innerHTML = "";


    clients.forEach(function (client) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${client.name}
            </td>

            <td>
                ${client.phone || "Sin teléfono"}
            </td>

        `;


        table.appendChild(row);

    });

}


/* ==================================================
   DASHBOARD
================================================== */

function updateDashboard() {

    document.getElementById(
        "productCount"
    ).innerText =
        products.length;


    document.getElementById(
        "salesCount"
    ).innerText =
        sales.length;


    document.getElementById(
        "clientCount"
    ).innerText =
        clients.length;


    const total =
        sales.reduce(
            function (sum, sale) {

                return sum + sale.total;

            },

            0
        );


    document.getElementById(
        "todaySales"
    ).innerText =
        "$" + formatMoney(total);

}


/* ==================================================
   REPORTES
================================================== */

function updateReports() {

    const total =
        sales.reduce(
            function (sum, sale) {

                return sum + sale.total;

            },

            0
        );


    document.getElementById(
        "reportSales"
    ).innerText =
        "$" + formatMoney(total);


    document.getElementById(
        "reportCount"
    ).innerText =
        sales.length;

}


/* ==================================================
   CAJA
================================================== */

function updateCash() {

    const total =
        sales.reduce(
            function (sum, sale) {

                return sum + sale.total;

            },

            0
        );


    document.getElementById(
        "cashTotal"
    ).innerText =
        "$" + formatMoney(total);

}


/* ==================================================
   FORMATO DE DINERO
================================================== */

function formatMoney(number) {

    return Number(number).toLocaleString(
        "es-CO"
    );

}


/* ==================================================
   INICIO
================================================== */

updateDashboard();