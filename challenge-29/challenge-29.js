(function($) {
  'use strict';
  /*
  Vamos estruturar um pequeno app utilizando módulos.
  Nosso APP vai ser um cadastro de carros. Vamos fazê-lo por partes.
  A primeira etapa vai ser o cadastro de veículos, de deverá funcionar da
  seguinte forma:
  - No início do arquivo, deverá ter as informações da sua empresa - nome e
  telefone (já vamos ver como isso vai ser feito)
  - Ao abrir a tela, ainda não teremos carros cadastrados. Então deverá ter
  um formulário para cadastro do carro, com os seguintes campos:
    - Imagem do carro (deverá aceitar uma URL)
    - Marca / Modelo
    - Ano
    - Placa
    - Cor
    - e um botão "Cadastrar"

  Logo abaixo do formulário, deverá ter uma tabela que irá mostrar todos os
  carros cadastrados. Ao clicar no botão de cadastrar, o novo carro deverá
  aparecer no final da tabela.

  Agora você precisa dar um nome para o seu app. Imagine que ele seja uma
  empresa que vende carros. Esse nosso app será só um catálogo, por enquanto.
  Dê um nome para a empresa e um telefone fictício, preechendo essas informações
  no arquivo company.json que já está criado.

  Essas informações devem ser adicionadas no HTML via Ajax.

  Parte técnica:
  Separe o nosso módulo de DOM criado nas últimas aulas em
  um arquivo DOM.js.

  E aqui nesse arquivo, faça a lógica para cadastrar os carros, em um módulo
  que será nomeado de "app".
  */
  var app = (function(doc) {
    return {
      init: function init() {
        this.companyInfo();
        this.initEvents();
      },

      initEvents: function initEvents() {
        $('[data-js="form-register"]').on('submit', this.handleSubmitForm);
      },

      handleSubmitForm: function handleSubmitForm(event) {
        event.preventDefault();
        var car = app.setCars();
        var $tableCar = $('[data-js="table-car"]').get();
        $tableCar.appendChild(app.createNewCar(car));
        app.postDataStore();
      },

      createNewCar: function createNewCar() {
        var $fragmet = doc.createDocumentFragment();
        var $tr = doc.createElement('tr');
        var $tdImage = doc.createElement('td');
        var $image = doc.createElement('img');
        var $tdBrand = doc.createElement('td');
        var $tdYear = doc.createElement('td');
        var $tdPlate = doc.createElement('td');
        var $tdColor = doc.createElement('td');
        var $tdRemove = doc.createElement('td');
        var $buttonRemove = doc.createElement('button');
        var $buttonClean = $('[data-js="clean-fields"]').get();

        $buttonRemove.textContent = 'Remove';

        $image.setAttribute('src', $('[data-js="image"]').get().value);
        $buttonRemove.setAttribute(
          'style',
          'color: white; height: 30px; width: 120px; text-align: center; border-radius: 5px; background: red;'
        );
        $tdImage.appendChild($image);
        $tdRemove.appendChild($buttonRemove);

        $buttonRemove.addEventListener(
          'click',
          function() {
            app.deleteDataStore();
            $tr.parentNode.removeChild($tr);
          },
          false
        );

        $buttonClean.addEventListener('click', app.cleanFields, false);

        $tdBrand.textContent = $('[data-js="brand-model"]').get().value;
        $tdYear.textContent = $('[data-js="year"]').get().value;
        $tdPlate.textContent = $('[data-js="plate"]').get().value;
        $tdColor.textContent = $('[data-js="color"]').get().value;

        $tr.appendChild($tdImage);
        $tr.appendChild($tdBrand);
        $tr.appendChild($tdYear);
        $tr.appendChild($tdPlate);
        $tr.appendChild($tdColor);
        $tr.appendChild($tdRemove);

        // $tdRemove.addEventListener('click', app.removerCar, false);

        return $fragmet.appendChild($tr);
      },

      // removerCar: function removerCar() {
      //   this.parentNode.remove();
      // },

      companyInfo: function companyInfo() {
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'company.json', true);
        ajax.send();
        ajax.addEventListener('readystatechange', this.getCompanyInfo, false);
      },

      setCars: function setCars() {
        var cars = {
          image: $('[data-js="image"]').get().value,
          brandModel: $('[data-js="brand-model"]').get().value,
          year: $('[data-js="year"]').get().value,
          plate: $('[data-js="plate"]').get().value,
          color: $('[data-js="color"]').get().value
        };
        return cars;
      },

      getCars: function getCars() {
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'http://localhost:3000/car', true);
        ajax.send();
        ajax.addEventListener('readystatechange', app.handleDataStore, false);
      },

      handleDataStore: function handleDataStore() {
        if (app.isRequestOk()) {
          return;
        }
        var cars = JSON.parse(this.responseText);
        var $tableCar = $('[data-js="table-car"]').get();

        cars.forEach(function(car) {
          var $fragment = app.createNewCar(car);
          $tableCar.appendChild($fragment);
        });
      },

      postDataStore: function postDataStore() {
        var car = app.setCars();
        var ajax = new XMLHttpRequest();
        ajax.open('POST', 'http://localhost:3000/car', true);
        ajax.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );
        ajax.send(
          'image=' +
            car.image +
            '&brandModel=' +
            car.brandModel +
            '&year=' +
            car.year +
            '&plate=' +
            car.plate +
            '&color=' +
            car.color
        );
        ajax.addEventListener(
          'readystatechange',
          function() {
            console.log('Carro cadastrado com sucesso.');
          },
          false
        );
      },

      deleteDataStore: function deleteDataStore() {
        var car = app.setCars();
        var ajax = new XMLHttpRequest();
        ajax.open('DELETE', 'http://localhost:3000/car', true);
        ajax.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );
        ajax.send('plate=' + car.plate);
        ajax.addEventListener(
          'readystatechange',
          function() {
            console.log('Carro removido com sucesso');
          },
          false
        );
      },

      getCompanyInfo: function getCompanyInfo() {
        if (!app.isRequestOk.call(this)) {
          return;
        }

        var data = JSON.parse(this.responseText);
        var $companyPhone = $('[data-js="company-phone"]').get();
        var $companyName = $('[data-js="company-name"]').get();

        $companyName.textContent = data.name;
        $companyPhone.textContent = data.phone;
      },

      isRequestOk: function isRequestOk() {
        return this.readyState === 4 && this.status === 200;
      },

      cleanFields: function cleanFields() {
        $('[data-js="image"]').get().value = '';
        $('[data-js="brand-model"]').get().value = '';
        $('[data-js="year"]').get().value = '';
        $('[data-js="plate"]').get().value = '';
        $('[data-js="color"]').get().value = '';
      }
    };
  })(document);
  app.init();
})(window.DOM, document);