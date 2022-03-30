new Promise(resolve => ymaps.ready(resolve))
    .then(() => init())
    .catch(e => console.log(e.message));

const balloon = document.querySelector('.balloon');
const head_address = document.querySelector('#address');
const comments = document.querySelector('#comments');
const inputName = document.querySelector('#name');
const inputReviews = document.querySelector('#reviews');
const input_impression = document.querySelector('#input-impression');
const button_add = document.querySelector('#button-add');
const closeButton = document.querySelector('#close');
console.log(head_address);
console.log(balloon);
console.log(comments);

let placemarks = [];

function init() {
    let myPlacemark;
    let coordinates;
    let map = new ymaps.Map('map',
        {
        center: [52.608826, 39.599229],
        zoom: 12,
        controls: ['zoomControl'],
        },
        {
            // Будет производиться поиск по топонимам и организациям.
            searchControlProvider: 'yandex#search'
        });

    // Создание кластеризатора с макетом-каруселью.
    let clusterer = new ymaps.Clusterer({
        preset: 'twirl#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        // Используем макет "карусель"
        clusterBalloonContentLayout: "cluster#balloonCarousel",
        // Запрещаем зацикливание списка при постраничной навигации.
        clusterBalloonCycling: false,
        // Настройка внешнего вида панели навигации.
        // Элементами панели навигации будут маркеры.
        clusterBalloonPagerType: "marker",
        // Количество элементов в панели.
        clusterBalloonPagerSize: 6,
        groupByCoordinates: false,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonPanelMaxMapArea: 0
    });

    clusterer.add(placemarks);
    map.geoObjects.add(clusterer);

    //слушаем клик по карте
    map.events.add('click', function (e) {
       coordinates = e.get('coords');
       //получаем координаты щелчка
       console.log(coordinates);

       //выводим окно с отзывами и формой
        openBalloon();

        myPlacemark = createPlacemark(coordinates);
        getAddress(coordinates);
    });

    function createPlacemark(coords) {
        return new ymaps.Placemark(coords);
    }

    // Определение адреса по координатам (обратное геокодирование).
    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);

            myPlacemark.properties
                .set({
                    // Формируем строку с данными об объекте.
                    iconCaption: [
                        // Название населенного пункта или вышестоящее административно-территориальное образование.
                        firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                        // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                        firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                    ],
                    // В качестве контента балуна задаем строку с адресом объекта.
                    balloonContent: firstGeoObject.getAddressLine()
                });
            head_address.textContent = firstGeoObject.getAddressLine();
        });
    }

    function openBalloon() {
        balloon.style.top = event.clientY + 'px';
        balloon.style.left = event.clientX + 'px';
        balloon.style.display = 'block';
    }

    closeButton.addEventListener('click', function () {
       balloon.style.display = 'none';
    });

    function clearInputs() {
        inputName.value = '';
        inputReviews.value = '';
        input_impression.value = '';
    }
}

//
// let placemarks = [
//     {
//         latitude:52.60574955,
//         longitude:39.60493108,
//         hintContent: '<div class="map__hint">Нижний парк</div>',
//         balloonContent: ['<div class="balloon">\n' +
//         '        <div class="header__balloon">\n' +
//         '            <div class="wrapper">\n' +
//         '                <div>\n' +
//         '                    <img class="geo" src="image/geo.png" alt="">\n' +
//         '                    <p class="head-address">Невский пр., 78, Санкт-Петербург, 191025</p>\n' +
//         '                </div>\n' +
//         '                <a href="#"><img class="close" src="image/close.png"></a>\n' +
//         '            </div>\n' +
//         '        </div>\n' +
//         '        <div class="main">\n' +
//         '            <textarea class="input-textarea output" id="reviews-output" readonly></textarea>\n' +
//         '            <div class="line"></div>\n' +
//         '            <div class="reviews">\n' +
//         '                <h3 class="orange-text">Ваш отзыв</h3>\n' +
//         '                <input class="input-text" id="name" placeholder="Ваше имя" type="text">\n' +
//         '                <input class="input-text" id="reviews" placeholder="Ваш отзыв" type="text">\n' +
//         '                <textarea class="input-textarea" id="input-impression" placeholder="Поделитесь впечатлениями" name=""></textarea>\n' +
//         '                <div class="btn-block">\n' +
//         '                    <button class="btn" id="button-add" >Добавить</button>\n' +
//         '                </div>\n' +
//         '            </div>\n' +
//         '        </div>\n' +
//         '    </div>']
//     },
//     {
//         latitude:52.60550634,
//         longitude:39.60373979,
//         hintContent: '<div class="map__hint">Нижний парк</div>',
//         balloonContent: [
//             '<div class="map__balloon">',
//             'Нижний парк',
//             '</div>'
//         ]
//     },
//     {
//         latitude:52.60544997,
//         longitude:39.60712977,
//         hintContent: '<div class="map__hint">Нижний парк</div>',
//         balloonContent: [
//             '<div class="map__balloon">',
//             'Нижний парк',
//             '</div>'
//         ]
//     }
// ];
//
// let geoObjects = [];
//
// function init() {
//     let map = new ymaps.Map('map', {
//        center: [52.608826, 39.599229],
//         zoom: 12,
//         controls: ['zoomControl'],
//
//     });
//
//     for (let i = 0;  i < placemarks.length; i++) {
//         geoObjects[i] = new ymaps.Placemark([placemarks[i].latitude, placemarks[i].longitude], {
//                 hintContent: placemarks[i].hintContent,
//                 balloonContent: placemarks[i].balloonContent.join('')
//             },
//             {
//                 iconLayout: 'default#image',
//                 iconImageHref: 'image/1.png',
//                 iconImageSize: [44,66],
//                 iconImageOffset: [-22, -66]
//             });
//     }
//
//     let clusterer = new ymaps.Clusterer({
//
//     });
//
//     map.geoObjects.add(clusterer);
//     clusterer.add(geoObjects);
// }
//
// document.addEventListener('click', function (event) {
//    console.log(event);
//    console.log(event.target);
// });