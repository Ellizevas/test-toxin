/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import { DropdownOptions } from './dropdown-options';

class Dropdown {
	constructor(dropdown) {
		this._dropdown = dropdown;
		this._searchElem();
		this._processElem();
		// Сюда передаем функцию обновления заголовка дропдауна
		this._options = [...this._values].map(
			(item) => new DropdownOptions(item, () => this._newDrop()),
		);
		this._newDrop();
	}

	_searchElem() {
		this._menu = this._dropdown.querySelector('.dropdown__menu');
		this._inner = this._dropdown.querySelector('.dropdown__inner');
		this._title = this._dropdown.querySelector('.dropdown__title');
		// Находим значение data-name у div.dropdown
		this.name = this._dropdown.dataset.name;
		this._titleDefault = this._dropdown.dataset.default || '';
		this._values = this._dropdown.querySelectorAll('.dropdown__items');
		this._btnReset = this._dropdown.querySelector('.dropdown__button-reset') || undefined;
		this._btnUsed = this._dropdown.querySelector('.dropdown__button-used') || undefined;
	}

	_getSumChild() {
		const { length } = this._options;
		let sumChild = 0;
		let array = [];
		this._options.forEach((item, index) => {
			sumChild = item._allChildSum(index, length);
			array = array.concat(sumChild);
		});
		return array;
	}

	// Функция сложения всех значений элементов
	_getSum() {
		let sum = 0;
		this._options.forEach((item) => {
			sum += item._getValue();
		});
		return sum;
	}

	_processElem() {
		this._processMenu = this._processMenu.bind(this);
		this._inner.addEventListener('click', this._processMenu);
		this._processDocument = this._processDocument.bind(this);
		document.addEventListener('click', this._processDocument);
		if (this._btnUsed) this._processUsed = this._processUsed.bind(this);
		this._btnUsed.addEventListener('click', this._processUsed);
		if (this._btnReset) this._processReset = this._processReset.bind(this);
		this._btnReset.addEventListener('click', this._processReset);
	}

	_processMenu() {
		this._inner.classList.toggle('dropdown__toggle_active');
		this._menu.classList.toggle('active');
		this._title.classList.toggle('title-active');
	}

	_processDocument(event) {
		if (event.target.closest('.dropdown') !== this._dropdown) {
			this._closeDrop();
		}
	}

	_closeDrop() {
		const isDropClosed = this._inner.classList.contains('dropdown__toggle_active')
			&& this._menu.classList.contains('active');
		if (isDropClosed) {
			this._inner.classList.remove('dropdown__toggle_active'); // Для кнопки Применить
			this._menu.classList.remove('active');
		}
	}

	_processUsed(event) {
		event.preventDefault();
		this._closeDrop();
	}

	_processReset(event) {
		event.preventDefault();
		this._options.forEach((element) => {
			element._upValue(0);
		});
	}

	// Функция обновления заголовка дропдауна
	// Функция запускает upDataTitle - логику для обновления заголовка
	_newDrop() {
		this._checkBtnReset();
		this._checkBtnUsed();
		this._updateTitle();
		this._checkAdultUsed();
	}

	_checkBtnReset() {
		const allMin = !this._options.map((item) => item.isMin()).includes(false);
		if (allMin === true) {
			this._hiddenBtnReset();
		} else {
			this._visibleBtnReset();
		}
	}

	_checkBtnUsed() {
		const isAllZerro = !this._options
			.map((item) => item.isZerro())
			.includes(false);
		if (isAllZerro === true) {
			this._hiddenBtnUsed();
		} else {
			this._visibleBtnUsed();
		}
	}

	_checkAdultUsed() {
		if (this.sumAdult === 0 && this.sumBabies > 0) {
			this._hiddenBtnReset();
		}
	}

	_hiddenBtnReset() {
		this._btnReset.classList.add('dropdown__button_hidden');
	}

	_visibleBtnReset() {
		this._btnReset.classList.remove('dropdown__button_hidden');
	}

	_hiddenBtnUsed() {
		this._btnUsed.classList.add('dropdown__button_hidden');
	}

	_visibleBtnUsed() {
		this._btnUsed.classList.remove('dropdown__button_hidden');
	}

	_formText(number, form) {
		number = Math.abs(number) % 100;
		const n1 = number % 10;
		if (number > 10 && number < 20) {
			return form[2];
		}
		if (n1 > 1 && n1 < 5) {
			return form[1];
		}
		if (n1 === 1) {
			return form[0];
		}
		return form[2];
	}

	// логика всех заголовков
	_updateTitle() {
		// Проверка, есть ли дата атрибут у div class Dropdown
		// если есть, то склоняем их как гости
		// если нет, то ниже включается условие else
		if (this.name !== undefined) {
			const arraySum = this._getSumChild();

			for (
				let index = 0, sumAdult = 0;
				index < 4;
				sumAdult += arraySum[index++]
			) {
				this.sumAdult = sumAdult;
			}
			for (
				let index = 4, sumBabies = 0;
				index <= 6;
				sumBabies += arraySum[index++]
			) {
				this.sumBabies = sumBabies;
			}
			const formAdult = ['гость', 'гостя', 'гостей'];
			const formBabies = ['младенец', 'младенца', 'младенцев'];
			this.sendAdult = this._formText(this.sumAdult, formAdult);

			this.sendBabies = this._formText(this.sumBabies, formBabies);
			if (this.sumBabies === 0 && this.sumAdult === 0) {
				this._title.innerHTML = 'Сколько гостей';
			} else if (this.sumAdult !== 0 && this.sumBabies === 0) {
				this._title.innerHTML = `${this.sumAdult} ${this.sendAdult}`;
			} else {
				this._title.innerHTML = `${this.sumAdult} ${this.sendAdult}, ${this.sumBabies} ${this.sendBabies}`;
			}
		} else {
			const sum = this._getSum();

			let array = this._options.map((item) => item.getString());
			array = array.filter((element) => element !== null);

			const formBedroom = ['спальня', 'спальни', 'спален'];
			const formBed = ['кровать', 'кровати', 'кроватей'];
			const formBathroom = ['ванная', 'ванные', 'ванных'];

			const sendBedroom = this._formText(array[0], formBedroom);
			const sendBed = this._formText(array[1], formBed);
			const sendBathroom = this._formText(array[2], formBathroom);

			if (sum > 0 && array[2] > 0) {
				this._title.innerHTML = `${array[0]} ${sendBedroom}, ${array[1]} ${sendBed},${array[2]} ${sendBathroom}`
					+ '...';
			} else this._title.innerHTML = `${array[0]} ${sendBedroom}, ${array[1]} ${sendBed}...`;
		}
	}
}

export { Dropdown };
