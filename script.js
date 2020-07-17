"use strict";

window.addEventListener("load", function(event) {
    console.log("All resources finished loading!");

    var plusIcon = document.getElementById('plusIcon');
    var minusIcon = document.getElementById('minusIcon');
    var plusCont = document.getElementById('plusCont');
    var minusCont = document.getElementById('minusCont');
    var productListCont = document.getElementById('productListCont');
    var productMenuCont = document.getElementById('productMenuCont');
    var innerProductListCont = document.getElementById('innerProductListCont');
    var productMenuList = document.getElementById('productMenuList');
    var stageOne = document.getElementById('stageOne');
    var stageOneButton = document.getElementById('stageOneButton');
    var stageTwoButton = document.getElementById('stageTwoButton');
    var stageThreeButton = document.getElementById('stageThreeButton');
    var stageFourButton = document.getElementById('stageFourButton');
    var stageTwo = document.getElementById('stageTwo');
    var stageThree = document.getElementById('stageThree');
    var stageFour = document.getElementById('stageFour');
    var retailChainsCont = document.getElementById('retailChainsCont');


    document.getElementById('datePicker').valueAsDate = new Date();


    // ПЕРВЫЙ ЭТАП - список покупок

    plusCont.addEventListener('click', changePlus, false);

    function changePlus(EO) {
        EO = EO || window.event;
        plusIcon.style.display = 'none';
        minusIcon.style.display = 'block';
        productMenuCont.style.display = 'block';
        productListCont.style.marginTop = '18px';
    }

    minusCont.addEventListener('click', changeMinus, false);

    function changeMinus(EO) {
        EO = EO || window.event;
        plusIcon.style.display = 'block';
        minusIcon.style.display = 'none';
        productMenuCont.style.display = 'none';
        productListCont.style.marginTop = '60px';
    }

    // ПЕРЕХОД НА ВТОРОЙ ЭТАП

    stageOneButton.addEventListener('click', goStageTwo, false);

    function goStageTwo(EO) {
        EO = EO || window.event;
        EO.preventDefault();
        document.body.style.height = '1695px';
        document.body.scrollTo(0, 0);
        stageOne.style.display = 'none';
        stageTwo.style.display = 'block';
    }


    // ВТОРОЙ ЭТАП - Доставка
    // Выбор магазина

    var important = document.querySelector('#important');
    var neverMind = document.querySelector('#neverMind');

    var retailerCont = document.getElementById('retailerCont');
    var paymentCont = document.getElementById('paymentCont');

    function getRadio(cont) {

        var handler = function(event) {
            event = event || window.event;

            var target = event.target || event.srcElement;
            if (target.nodeType == 1 && target.nodeName.toLowerCase() == 'input' && target.type == 'checkbox' && target.checked) {

                var inputs = cont.getElementsByTagName('input');
                for (var i = 0; inputs[i]; i++) {
                    if (inputs[i].type == 'checkbox' && inputs[i] != target) {
                        inputs[i].checked = false;
                    }
                }
            }
        }

        if (cont.addEventListener) {
            cont.addEventListener('click', handler, false);
        } else if (cont.attachEvent) {
            cont.attachEvent('onclick', handler);
        }

    }

    getRadio(retailerCont);
    getRadio(paymentCont);


    important.onclick = function() {
        document.body.style.height = '100%';
        if (important.checked) {
            retailChainsCont.style.display = 'block';
        } else {
            retailChainsCont.style.display = 'none';
        }
    }

    neverMind.onclick = function() {
        $('input.shop-check-input:checked').prop('checked', false);

        var imgs = retailChainsCont.getElementsByClassName('checkmark-img');
        for (var i = 0; imgs[i]; i++) {
            imgs[i].style.display = 'none';
        }

        if (neverMind.checked) {
            retailChainsCont.style.display = 'none';
        }
    }


    // КАТАЛОГ

    async function getResponse() {

        // ВЫБОР МАГАЗИНА

        var respShops = await fetch('https://edavoz.todozzle.com/api/shops');
        var shops = await respShops.json();
        var shopsLength = shops.length;

        function getShops(v, l) {

            retailChainsCont.innerHTML += `
        <div class="shop">
        <label>
        <img src="img/crown.jpg" class="shop-img">
        <img src="img/checkbox.png" class="checkmark-img" id="checkmark_${l}">
        <input type="checkbox" id="checkInput_${l}" class="shop-check-input" name="${v.original_id}"><span class="check-text">${v.name}</span>
        </label>
        </div>
        `
        }

        shops.forEach(getShops);


        // ПОЛУЧЕНИЕ НАИМЕНОВАНИЙ КАТЕГОРИЙ
        var response = await fetch('http://edavoz.todozzle.com/api/categories');
        var categories = await response.json();
        var categoriesLength = categories.length;


        //ЗАПОЛНЕНИЕ МЕНЮ КАТАЛОГА НАИМЕНОВАНИЯМИ КАТЕГОРИЙ

        async function fillMenu(v, i) {

            innerProductListCont.innerHTML += `
           <table border="1" id="goods_${i}">

             <tr>
             <th class="name-td">${v.name}</th>
             <th>Шт/Кг</th>
             </tr>

            </table>
             `
                //Заполнение меню каталога
            productMenuList.innerHTML += `
           <li class="categories" id="category_${i}">${v.name}</li>
             `

            //Получение товаров по каждой категории
            var respCategory = await fetch('https://edavoz.todozzle.com/api/goods?category=' + v.id);
            var category = await respCategory.json();

            function getGoods(g) {

                var goodsId = document.getElementById('goods_' + i); //Таблица

                goodsId.innerHTML += `
               <tr>
               <td>${g.name}</td>
               <td><input type="text" class="goods-quantity" onchange=" if (this.value == '') { this.classList.remove('add-checkmark');} else if (isFinite(this.value) == true) {this.classList.add('add-checkmark');}" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();" name="${g.id}"></td>
               </tr>
                  `
            }
            category.forEach(getGoods);
        }

        categories.forEach(fillMenu);



        var firstLi = document.getElementById('category_0'); //Первая категория
        firstLi.classList.add('add-color');


        // ПРИ ВЫБОРЕ КАТЕГОРИИ - ИЗМЕНЕНИЕ ЦВЕТА ТЕКСТА НА ЗЕЛЕНЫЙ
        let selectedli;

        productMenuList.addEventListener('click', event => {
            let target = event.target;
            if (target.tagName !== 'LI') return;
            if (target !== firstLi) {
                firstLi.classList.remove('add-color');
            }
            highlight(target);
        })

        function highlight(li) {
            if (selectedli) {
                selectedli.classList.remove('add-color');
            }
            selectedli = li;
            selectedli.classList.add('add-color');
        }


        // ПЕРЕХОД С КАТЕГОРИИ НА ДРУГУЮ КАТЕГОРИЮ
        function categoryChange(n) {

            document.getElementById('category_' + n).addEventListener('click', changeCategory, false);

            function changeCategory(EO) {
                EO = EO || window.event;
                innerProductListCont.scrollTo(0, 0);
                document.getElementById('goods_' + n).style.display = 'table';

                for (var z = 0; z < categoriesLength; z++) {
                    if (z !== n) {
                        document.getElementById('goods_' + z).style.display = 'none'; //скрываются все таблицы кроме выбранной категории
                    }
                }
            }
        }

        for (var m = 0; m < categoriesLength; m++) {
            categoryChange(m);
        }


        function checkmark(s) {

            document.getElementById('checkInput_' + s).onclick = function() {

                if (document.getElementById('checkInput_' + s).checked) {
                    document.getElementById('checkmark_' + s).style.display = 'block';
                } else {
                    (document.getElementById('checkmark_' + s)).style.display = 'none';
                }

            }

        }

        for (var z = 0; z < shopsLength; z++) {
            checkmark(z);
        }

    }

    getResponse();



    // ПЕРЕХОД НА ТРЕТИЙ ЭТАП - Контакты

    stageTwoButton.addEventListener('click', goStageThree, false);

    function goStageThree(EO) {
        EO = EO || window.event;
        EO.preventDefault();
        document.body.style.height = '850px';
        window.scrollTo(0, 0);
        stageOne.style.display = 'none';
        stageTwo.style.display = 'none';
        stageThree.style.display = 'block';
    }

    // ПЕРЕХОД НА ЧЕТВЕРТЫЙ ЭТАП - Оплата

    stageThreeButton.addEventListener('click', goStageFour, false);

    function goStageFour(EO) {
        EO = EO || window.event;
        EO.preventDefault();
        document.body.style.height = '600px';
        window.scrollTo(0, 0);
        stageOne.style.display = 'none';
        stageTwo.style.display = 'none';
        stageThree.style.display = 'none';
        stageFour.style.display = 'block';
    }



    // ОПЛАТА ОНЛАЙН

    var cash = document.querySelector('#cash');
    var card = document.querySelector('#card');
    var online = document.querySelector('#online');
    var onlinePaymentCont = document.querySelector('#onlinePaymentCont');

    cash.addEventListener('click', changePayment, false);
    card.addEventListener('click', changePayment, false);

    function changePayment(EO) {
        EO = EO || window.event;
        if (cash.checked || card.checked) {
            onlinePaymentCont.style.display = 'none';
        }
    }


    online.onclick = function() {
        document.body.style.height = '100%';
        if (online.checked) {
            onlinePaymentCont.style.display = 'block';
        } else {
            onlinePaymentCont.style.display = 'none';
        }
    }



    // СБОР ДАННЫХ ИЗ ФОРМЫ И ОТПРАВКА НА СЕРВЕР

    stageFourButton.addEventListener('click', getData, false);

    function getData(EO) {
        EO = EO || window.event;
        EO.preventDefault();

        console.log(serializ(catalogForm) + '&' + serializ(shopForm) + '&' + serializ(customerForm) + '&' + serializ(paymentForm));

        // $.post(
        //     'post.php', // адрес обработчика http://edavoz.todozzle.com/api/order
        //     submitForm, // отправляемые данные
        //     console.log(submitForm),

        //     // function() { // получен ответ сервера  
        //     //     $('#catalogForm').hide('slow');
        //     // }
        // );
        // return false;
    }

});