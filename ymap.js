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

    button_add.addEventListener('click', function () {
        if (inputName.value && inputReviews.value && input_impression.value) {
            let adressLink = head_address.textContent;

            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();

            if (day.length === 1) day = `0${day}`;
            if (month.length === 1) month = `0${month}`;
            if (hours.length === 1) hours = `0${hours}`;
            if (minutes.length === 1) minutes = `0${minutes}`;
            if (seconds.length === 1) seconds = `0${seconds}`;

            let currentTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

            //создаем метку
            let newPlacemark = new ymaps.Placemark(
                coordinates,
                {
                    balloonContentHeader: inputReviews.value,
                    balloonContentBody: `<a onclick="openBalloonFull()" class="balloon__address_link">${adressLink}</a><br><br>${input_impression.value}<br><br>`,
                    balloonContentFooter: currentTime
                },
                {
                    preset: 'twirl#invertedVioletClusterIcons',
                    draggable: false,
                    OpenBalloonOnClick: false
                }
            );

            //добавляем метку в кластер и массив placemarks
            map.geoObjects.add(newPlacemark);
            clusterer.add(newPlacemark);
            placemarks.push(newPlacemark);

            if (comments.textContent === 'Отзывов пока нет...') {
                comments.textContent = '';
            }
             newPlacemark.commentContent = `${inputName.value} ${inputReviews.value} ${currentTime}\n${input_impression.value}\n\n`;
            comments.textContent += newPlacemark.commentContent;
            newPlacemark.place = head_address.textContent;

            clearInputs();

            newPlacemark.events.add('click', function () {
                openBalloon();
                comments.textContent = newPlacemark.commentContent;
                head_address.textContent = newPlacemark.place;
            });
        } else {
            alert('Заполните путстые поля');
        }
    });
}

function openBalloon() {
    balloon.style.top = event.clientY + 'px';
    balloon.style.left = event.clientX + 'px';
    balloon.style.display = 'block';
}

closeButton.addEventListener('click', function () {
    balloon.style.display = 'none';
    clearInputs();
});

function clearInputs() {
    inputName.value = '';
    inputReviews.value = '';
    input_impression.value = '';
}

function openBalloonFull() {
    head_address.textContent = '';
    comments.textContent = '';
    let adressLink = document.querySelector('.balloon__address_link');

    for (let placemark of placemarks) {
        if (adressLink === placemark.place) {
            head_address.textContent = placemark.place;
            comments.textContent += placemark.commentContent;
        }
    }

    balloon.style.top = event.clientY + "px";
    balloon.style.left = event.clientX + "px";
    balloon.style.display = "block";
}