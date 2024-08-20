const billTypesContainer = document.querySelector('.type-container');
const packagesContainer = document.querySelector('.package-container');

let currentBillType = 1;
let currentPackage = 0;

const BILL_TYPES = [10, 20, 50];

const PACKAGES = [[2000, 300], [3000, 400], [5000, 600]];
const enabledSpecial = false;

const freeShipping = 200;
const MINIMUM_SHIPPING_PRICE = 10;

packagesContainer.innerHTML = '';

for (let i = 0; i < PACKAGES.length; i++) {
    const id = i + 1;
    let text = id;
    let addtionalClasses = '';

    if (enabledSpecial == true && id == PACKAGES.length) {
        text = "SPECIAL";
        addtionalClasses = 'special';
    }

    packagesContainer.innerHTML += `
    <div class="package-item ${addtionalClasses}" data-index="${id}">
        <span>${text}</span>
    </div>`;
}

billTypesContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('out-of-stock') || e.target.classList.contains('type-container')) {
        return;
    }

    const img = e.target.querySelector('.img');
    if (img) {
        const style = img.currentStyle || window.getComputedStyle(img, false);
        const bg_image_url = style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
    
        switch (bg_image_url.split('/')[bg_image_url.split('/').length - 1].slice(0, 2)) {
            case '10':
                currentBillType = 0;
                break;
            case '20':
                currentBillType = 1;
                break;
            case '50':
                currentBillType = 2;
                break;
            default:
                location.reload();
                break;
        }
    
        loadBills();
    }
});

packagesContainer.addEventListener('click', function (e) {
    if (e.target.nodeName == 'DIV' && e.target.classList.contains('package-item')) {
        currentPackage = parseInt(e.target.innerText) - 1;

        if (e.target.innerText == 'SPECIAL') {
            currentPackage = 6;
        }

        loadPackage();
    }
});



function loadBills() {
    const activeItem = document.querySelector('.type-container .type-item.active');

    if (activeItem) {
        activeItem.classList.remove('active');
    }

    document.querySelector(`.type-item div[class="img b${BILL_TYPES[currentBillType]}"]`).parentNode.classList.add('active');

    document.querySelector('.order .right .background').src = `assets/${BILL_TYPES[currentBillType]}_com.gif`;

    document.querySelector('.order .right .back').src = `assets/${BILL_TYPES[currentBillType]}back_com.png`;

    document.querySelectorAll('.quality-item img').forEach(img => {
        const imgLink = img.src.split('/')[img.src.split('/').length - 1];
        const currentBill = imgLink.slice(0, 2);
        img.src = 'assets/' + imgLink.replace(currentBill, BILL_TYPES[currentBillType]);

    });

    const billTypeHolders = document.querySelectorAll('.valBillType');

    billTypeHolders.forEach(elem => {
        elem.innerText = BILL_TYPES[currentBillType];
    });
}

loadBills();

const packageIndex = document.querySelectorAll('.packagesIndex');
const packageToReceiveHolders = document.querySelectorAll('.packagesToReceiveType');
const packageToPayHolders = document.querySelectorAll('.packagesToPayType');

function loadPackage() {
    const activeItem = document.querySelector('.package-container .package-item.active');

    if (activeItem) {
        activeItem.classList.remove('active');
    }

    document.querySelector(`.package-item[data-index="${currentPackage + 1}"]`).classList.add('active');

    packageIndex.forEach(elem => {
        if (enabledSpecial && currentPackage === PACKAGES.length - 1) {
            elem.innerText = "SPECIAL";
        } else {
            elem.innerText = currentPackage + 1;
        }
    });

    packageToReceiveHolders.forEach(elem => {
        elem.innerText = PACKAGES[currentPackage][0]
    });

    packageToPayHolders.forEach(elem => {
        elem.innerText = PACKAGES[currentPackage][1]
    });
}

loadPackage();

let typingTimer;
const doneTypingInterval = 1000;

document.querySelector('#address').addEventListener('input', function (e) {
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
        const inputValue = e.target.value.trim();
        if (inputValue.length > 3) {
            fetchData(inputValue);
        }
    }, doneTypingInterval);
});

async function fetchData(inputValue) {
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'inputValue': inputValue })
    };

    const resp = await fetch('../WEB/completeaddress.php', settings);
    const data = await resp.json();

    if (data.data && data.data.length > 0) {
        console.log(data.data);
        document.querySelector('.autocomplete-holder').classList.remove('hidden');
        document.querySelector('.autocomplete-container').innerHTML = '';

        data.data.forEach(d => {
            const arrAddress = d.split(',');
            console.log(arrAddress);

            let str = arrAddress[0] + ', ' + arrAddress[arrAddress.length - 2] + ' ' + arrAddress[1] + ', ' + arrAddress[arrAddress.length - 1];

            if (!isNaN(arrAddress[0].trim())) {
                // console.log('House number at 0');
                console.log(d);
                str = arrAddress[1].trim() + ' ' + arrAddress[0] + ',' + arrAddress[arrAddress.length - 2] + ' ' + arrAddress[arrAddress.length - 5] + ',' + arrAddress[arrAddress.length - 1];
            } else if (!isNaN(arrAddress[1].trim())) {
                // console.log('House number at 1');
                console.log(d);
                str = arrAddress[0].trim() + ' ' + arrAddress[1] + ',' + arrAddress[arrAddress.length - 2] + ' ' + arrAddress[arrAddress.length - 5] + ',' + arrAddress[arrAddress.length - 1];
            }

            document.querySelector('.autocomplete-container').innerHTML += `
                        <div class="autocomplete-item">
                            ${str}
                        </div>`;
        });
    }
}

document.querySelector('.autocomplete-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('autocomplete-item')) {
        const clickedAddress = e.target.innerText;
        console.log(clickedAddress);
        arrAddress = clickedAddress.split(',');

        document.querySelector('#address').value = arrAddress[0];
        const subArr = arrAddress[1].trim().split(' ');
        document.querySelector('#zipcode').value = subArr[0];
        document.querySelector('#city').value = subArr[1];

        document.querySelector('#zipcode').dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('#city').dispatchEvent(new Event('input', { bubbles: true }));

        document.querySelector('.autocomplete-holder').classList.add('hidden');
    }
})

document.querySelector('.closesuggestions').addEventListener('click', function () {
    document.querySelector('.autocomplete-holder').classList.add('hidden');
});

const buttonsBack = document.querySelectorAll('.back');

buttonsBack.forEach(btn => {
    btn.setAttribute('tab', '0');

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        switch (e.target.getAttribute('tab')) {
            case '0':
                document.querySelector('.cart').classList.add('hidden');
                document.querySelector('.order').classList.remove('hidden');

                packageToPayHolders.forEach(elem => {
                    elem.innerText = PACKAGES[currentPackage][1]
                });

                break;
            case '1':
                document.querySelector('.shipping-section').classList.add('hidden');
                document.querySelector('.order-section').classList.remove('hidden');
                document.querySelector('.cart .topay').classList.toggle('hidden');

                buttonsBack.forEach(btn => {
                    btn.setAttribute('tab', '0');
                });
                break;
            case '2':
                document.querySelector('.finished').classList.add('hidden');
                document.querySelector('.cart').classList.remove('hidden');
                buttonsBack.forEach(btn => {
                    btn.setAttribute('tab', '1');
                });
                break;
            default:
                location.reload();
                break;
        }
    });
});

const buttonsCart = document.querySelectorAll('.btncart');

buttonsCart.forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const prevHTML = e.target.innerHTML;
        e.target.innerHTML = '<span class="loader"></span>';
        setTimeout(() => {
            

            const x = freeShipping - (parseFloat(PACKAGES[currentPackage][1]));

            if (x < 0) {
                console.log("FREE SHIPPING");
                document.querySelector('.topay span').innerHTML = '<span class="toPayForFreeShipping">FREE SHIPPING</span> HAS BEEN APPLIED';
                document.querySelector('.filledin').classList.add('completed');
            } else {
                const percentage = (x / freeShipping) * 100;

                document.querySelector('.topay span').innerHTML = `PAY <span class="toPayForFreeShipping">${x} EUROS</span> MORE AND GET <mark>FREE</mark> SHIPPING`;

                document.querySelector('.filledin').classList.remove('completed');
                document.querySelector('.filledin').style.width = 100 - percentage + '%';
            }


            buttonsBack.forEach(btn => {
                btn.setAttribute('tab', '0');
            });

            calculateFreeShip();
            scrollToTop();
            const packageIndex = document.querySelectorAll('.packagesIndex');
            const packageToReceiveHolders = document.querySelectorAll('.packagesToReceiveType');
            const packageToPayHolders = document.querySelectorAll('.packagesToPayType');
            const billTypeHolders = document.querySelectorAll('.valBillType');
            
            function collectUniqueTextContent(elements) {
                const uniqueValues = new Set();
                elements.forEach(el => uniqueValues.add(el.textContent));
                return Array.from(uniqueValues);
            }
            
            const data = {
                packageIndex: collectUniqueTextContent(packageIndex),
                packageToReceive: collectUniqueTextContent(packageToReceiveHolders),
                packageToPay: collectUniqueTextContent(packageToPayHolders),
                billTypes: collectUniqueTextContent(billTypeHolders)
            };
            
            const encodedData = encodeURIComponent(JSON.stringify(data));
            window.location.href = `../payment/index.html?data=${encodedData}`;
        }, 1000);
    });
})

function calculateFreeShip() {

}

document.querySelector('#btnNextStep').addEventListener('click', function (e) {
    e.preventDefault();
    const errors = orderFormValidate(false);
    if (errors.length == 0) {
        document.querySelector('.order-section').classList.add('hidden');
        document.querySelector('.shipping-section').classList.remove('hidden');
        document.querySelector('.cart .topay').classList.toggle('hidden');
        buttonsBack.forEach(btn => {
            btn.setAttribute('tab', '1');
        });

        document.querySelectorAll('.emailingTo').forEach(lbl => {
            lbl.innerText = document.querySelector('#email').value;
        });

        document.querySelectorAll('.shippingTo').forEach(lbl => {
            lbl.innerText = document.querySelector('#address').value + ', ' + document.querySelector('#zipcode').value + ' ' + document.querySelector('#city').value + ', ' + document.querySelector('#country').value;
        });

        processShipping();
        scrollToTop();
    }

});

document.querySelectorAll('.order-form .inputfield input').forEach(input => {
    input.addEventListener('input', function () {
        orderFormValidate(true);
    });
});

function orderFormValidate(oneway) {
    let arr = [];
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!oneway && !emailPattern.test(document.querySelector('#email').value.trim())) {
        document.querySelector('#email').classList.add('invalid');
        arr.push("Invalid email");
    } else if (emailPattern.test(document.querySelector('#email').value.trim())) {
        document.querySelector('#email').classList.remove('invalid');
    }

    if (!oneway && document.querySelector('#firstname').value.trim() === '') {
        document.querySelector('#firstname').classList.add('invalid');
        arr.push("Empty Firstname")
    } else if (document.querySelector('#firstname').value.trim() !== '') {
        document.querySelector('#firstname').classList.remove('invalid');
    }

    if (!oneway && document.querySelector('#lastname').value.trim() === '') {
        document.querySelector('#lastname').classList.add('invalid');
        arr.push("Empty Lastname")
    } else if (document.querySelector('#lastname').value.trim() !== '') {
        document.querySelector('#lastname').classList.remove('invalid');
    }

    if (!oneway && document.querySelector('#address').value.trim() === '') {
        document.querySelector('#address').classList.add('invalid');
        arr.push("Empty Address")
    } else if (document.querySelector('#address').value.trim() !== '') {
        document.querySelector('#address').classList.remove('invalid');
    }

    if (!oneway && document.querySelector('#zipcode').value.trim() === '') {
        document.querySelector('#zipcode').classList.add('invalid');
        arr.push("Empty Zipcode")
    } else if (document.querySelector('#zipcode').value.trim() !== '') {
        document.querySelector('#zipcode').classList.remove('invalid');
    }

    if (!oneway && document.querySelector('#city').value.trim() === '') {
        document.querySelector('#city').classList.add('invalid');
        arr.push("Empty City")
    } else if (document.querySelector('#city').value.trim() !== '') {
        document.querySelector('#city').classList.remove('invalid');
    }

    return arr;
}

function processShipping() {

    currentPackagePrice = parseFloat(PACKAGES[currentPackage][1]);

    const selShipping = document.querySelector('.shipping-method-item.selected');

    const arr = generateShippingFees(currentPackagePrice)[0].reverse();
    console.log('Shipping Array', arr);
    let count = 0;

    document.querySelectorAll('.shipping-method-item .right .price').forEach(price => {
        console.log(price.innerText.trim().replace('+ â‚¬', ''));
        if (currentPackagePrice >= freeShipping && count == arr.length) {
            price.innerText = 'FREE';
            return;
        }
        price.innerText = '+ â‚¬ ' + arr[count].toFixed(2);
        count++;
    });

    const shippingText = selShipping.querySelector('.right .price').innerText;
    if (shippingText != "FREE") {
        const shippingCost = shippingText.trim().replace('+ â‚¬', '').replace(',', '.');

        packageToPayHolders.forEach(elem => {
            elem.innerText = (parseFloat(PACKAGES[currentPackage][1]) + parseFloat(shippingCost)).toFixed(2);
        });
    } else {
        packageToPayHolders.forEach(elem => {
            elem.innerText = parseFloat(PACKAGES[currentPackage][1]).toFixed(2);
        });
    }
}

function generateShippingFees(price) {
    let shippingPrices = [];

    if (price < 200) {
        shippingPrices.push([MINIMUM_SHIPPING_PRICE, 17.5, 26]);
    } else if (price < 350) {
        shippingPrices.push([30.5, 35]);
    } else if (price < 500) {
        shippingPrices.push([34.5, 44.5]);
    } else if (price < 850) {
        shippingPrices.push([46.5, 51.5]);
    } else if (price < 1000) {
        shippingPrices.push([52.5, 56]);
    } else if (price < 1350) {
        shippingPrices.push([55.5, 59]);
    } else if (price < 2100) {
        shippingPrices.push([59.5, 66]);
    } else {
        shippingPrices.push([65, 80]);
    }

    return shippingPrices;
}


function round(num, rounder) {
    var multiplier = 1 / (rounder || 0.5);
    return Math.round(num * multiplier) / multiplier;
}

document.querySelector('#btnFinishOrder').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('.cart').classList.add('hidden');
    document.querySelector('.finished').classList.remove('hidden');

    buttonsBack.forEach(btn => {
        btn.setAttribute('tab', '2');
    });

    document.querySelector('.packagesToPayType').innerText = "";

    document.querySelector('.order-id-qik').value = formatOrderId();
    scrollToTop();
});

console.log(formatOrderId());

function formatOrderId() {
    const subfix = Math.ceil(parseFloat(packageToPayHolders[1].innerText));
    return (currentBillType + 1) + idqkrp + (getShippingIndex() + 1) + subfix;
    }

function getShippingIndex() {
    const shippingMethods = document.querySelectorAll('.shipping-method-container .shipping-method-item');

    for (let i = 0; i < shippingMethods.length; i++) {
        if (shippingMethods[i].classList.contains('selected')) {
            return i;
        }
    }
}

console.log(getShippingIndex());

document.querySelector('.shipping-method-container').addEventListener('click', function (e) {
    if (e.target.nodeName === 'DIV' && e.target.classList.contains('shipping-method-item')) {
        document.querySelector('.shipping-method-item.selected').classList.remove('selected');
        e.target.classList.add('selected');

        document.querySelectorAll('.shippingWith').forEach(elem => {
            elem.innerText = e.target.querySelector('.left .title').innerText;
        });

        document.querySelectorAll('.shippingWithDays').forEach(elem => {
            elem.innerText = e.target.querySelector('.left .eta').innerText;
        });

        const shippingText = e.target.querySelector('.right .price').innerText;
        if (shippingText != "FREE") {
            const shippingCost = e.target.querySelector('.right .price').innerText.trim().replace('+ â‚¬', '').replace(',', '.');

            packageToPayHolders.forEach(elem => {
                elem.innerText = (parseFloat(PACKAGES[currentPackage][1]) + parseFloat(shippingCost)).toFixed(2);
            });
        } else {
            packageToPayHolders.forEach(elem => {
                elem.innerText = parseFloat(PACKAGES[currentPackage][1]).toFixed(2);
            });
        }
    }
});

const items = document.querySelectorAll(".accordion button");

function toggleAccordion() {
    const itemToggle = this.getAttribute('aria-expanded');

    for (i = 0; i < items.length; i++) {
        items[i].setAttribute('aria-expanded', 'false');
        items[i].querySelector('ion-icon').setAttribute('name', 'caret-down-circle-outline');
    }

    if (itemToggle == 'false') {
        this.setAttribute('aria-expanded', 'true');
        this.querySelector('ion-icon').setAttribute('name', 'caret-up-circle');
    } else {
        this.querySelector('ion-icon').setAttribute('name', 'caret-down-circle-outline');
    }
}

items.forEach(item => item.addEventListener('click', toggleAccordion));

const cartFooter = document.getElementById('cart-footer');

setTimeout(() => {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop >= 400 && !document.querySelector('.order').classList.contains('hidden')) {
            cartFooter.classList.remove('hidden');
        } else {
            cartFooter.classList.add('hidden');
        }
    });
}, 1000);

/* document.body.addEventListener('click', function (e) {

}); */

document.querySelector('.order-id-qik').addEventListener('click', copyOrderId);
document.querySelector('.btnCopy').addEventListener('click', copyOrderId);

function copyOrderId() {
    document.querySelector('.order-id-qik').select();

    const toCopy = document.querySelector('.order-id-qik').value;

    if (!navigator.clipboard) {
        document.execCommand('copy');
        success();
    } else {
        navigator.clipboard.writeText(toCopy).then(
            function () {
                success();
            })
            .catch(
                function () {
                    console.error('Error automatically copying order number');
                });
    }

    function success() {
        const orderIdHeader = document.querySelector('.order-id-holder h2');
        const orderIcon = document.querySelectorAll('ion-icon[name="copy-outline"]');
        orderIdHeader.innerText = 'COPIED!';
        orderIcon.forEach(icon => {
            icon.name = 'checkmark-outline';
        });
        orderIdHeader.style.opacity = '1';

        setTimeout(() => {
            orderIdHeader.style.opacity = '0';
            setTimeout(() => {
                orderIdHeader.innerText = 'YOUR ORDER NUMBER';
                orderIcon.forEach(icon => {
                    icon.name = 'copy-outline';
                });
                orderIdHeader.style.opacity = '1';
            }, 300);
        }, 2500);
    }
}


function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const checkCountry = setInterval(() => {
    if (country === isNaN) {
    } else {
        clearInterval(checkCountry);
        document.querySelector('#country option[selected]').removeAttribute("selected");
        document.querySelector(`#country option[value=${country}]`).setAttribute('selected', '');
    }
}, 1000);