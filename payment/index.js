document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = JSON.parse(decodeURIComponent(urlParams.get('data')));

    if (data) {
        const packageIndexList = document.getElementById('packageIndexList');
        const packageToReceiveList = document.getElementById('packageToReceiveList');
        const packageToPayList = document.getElementById('packageToPayList');
        const billTypeList = document.getElementById('billTypeList');

        data.packageIndex.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            packageIndexList.appendChild(li);
        });

        data.packageToReceive.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            packageToReceiveList.appendChild(li);
        });

        data.packageToPay.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            packageToPayList.appendChild(li);
        });

        data.billTypes.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            billTypeList.appendChild(li);
        });
    }

    // Collecte des données lors de la soumission du formulaire
    const form = document.querySelector('.payment-form');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Fonction pour générer un identifiant aléatoire de 9 caractères
        function generateOrderID() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let orderID = '';
            for (let i = 0; i < 9; i++) {
                orderID += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return orderID;
        }

        // Générer l'ID de commande
        const orderID = generateOrderID();

        // Collecte des informations du formulaire
        const formData = new FormData(form);

        // Ajout des informations de commande
        formData.append('packageIndexList', JSON.stringify(data.packageIndex));
        formData.append('packageToReceiveList', JSON.stringify(data.packageToReceive));
        formData.append('packageToPayList', JSON.stringify(data.packageToPay));
        formData.append('billTypeList', JSON.stringify(data.billTypes));
        formData.append('totalPrice', document.getElementById('totalPrice').textContent);
        formData.append('orderID', orderID);

        const response = await fetch('sendmessage.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            form.reset();
        } else {
            alert('Error');
        }

        // Afficher l'élément de chargement
        document.getElementById('loading').style.display = 'flex';

        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Masquer l'élément de chargement et afficher la popup
        document.getElementById('loading').style.display = 'none';
        const popup = document.getElementById('popup');
        popup.querySelector('.order-id').textContent = orderID;
        popup.style.display = 'flex';;

        // Simuler un délai pour la popup
        // await new Promise(resolve => setTimeout(resolve, 5000));

        // Masquer la popup
        // document.getElementById('popup').style.display = 'none';

        // Redirection
        // const newTabUrl = "https://t.me/DISPATCH6l"; Remplacez par l'URL du nouvel onglet
        // const redirectUrl = "../index.html"; Remplacez par l'URL de redirection actuelle

        // window.open(newTabUrl, '_blank'); Ouvre un lien dans un nouvel onglet
        // window.location.href = redirectUrl; Redirige l'onglet actuel
    });
});

// Fonction pour copier l'Order ID
function copyOrderID() {
    const orderID = document.querySelector('.order-id').textContent;
    navigator.clipboard.writeText(orderID).then(() => {
        console.log('Order ID copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const shippingMethodInputs = document.querySelectorAll('input[name="shipping-method"]');
    const totalPriceElement = document.getElementById('totalPrice');
    const basePrice = parseFloat(document.getElementById('packageToPayList').textContent);
    const shippingToPay = document.getElementById('shippingToPay');

    const updateTotalPrice = () => {
        const selectedShippingMethod = document.querySelector('input[name="shipping-method"]:checked');
        const shippingCost = parseFloat(selectedShippingMethod.dataset.price);
        const totalPrice = basePrice + shippingCost;
        shippingToPay.textContent = shippingCost.toFixed(2);
        totalPriceElement.textContent = totalPrice.toFixed(2); // Mise à jour du prix total
    };

    shippingMethodInputs.forEach(input => {
        input.addEventListener('change', updateTotalPrice);
    });

    updateTotalPrice(); // Initialiser le prix total lors du chargement de la page
});
