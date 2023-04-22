'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// let map, mapEvent; //need to create gloabal variables to assign to them values in different scopes..see below. It's temporary
//DARA BLOCK
class Workout {
  date = new Date();
  id = String(Date.now()).slice(-10);

  constructor(distance, duration, coards) {
    this.distance = distance; //in km
    this.duration = duration; //in min
    this.coards = coards; //[lat, lng]
  }

  _setDescription() {
    //prettier-ignore
    const months = ['January','February','March','April','May','June','July',
'August','September','October','November','December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }${this.date.getDate()}`;
  }

  //click() {
  //clicks++
  //}
}

//CLASSES WITH SPECIFIC PROPERTIES FOR DIFRENT ACTIVITIES
class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, coards, elevationGain) {
    // this.type="cycling"
    super(distance, duration, coards);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); //need to convert to hourse
    return this.speed;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coards, cadence) {
    super(distance, duration, coards);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178); // coards, distance,duration,pace-stapse/min

// const cycling1 = new Cycling([39, -12], 27, 95, 523); //elevationGaine -523 meters
// console.log(run1, cycling1);
////////////APLICATION ARCHITECTURE////////////////////// another words APP BLOCK
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #mapEvent;
  #map;
  #workouts = []; //modern way
  #mapZoomLevel = 13;
  constructor() {
    // this.workouts=[] //classical way
    // console.log(this);

    //ALL METHOTDS IN THE CONSTRUCTOUR FUNTION will  executed after loading map/////

    // get user position
    this._getPositon();
    //get data from local storage
    this._getLocalStorage();
    //Attached event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField); //we don't have to use "this" keyword here because it relais on input and it's really so we need
    containerWorkouts.addEventListener('click', this._moveToPopap.bind(this));
  }

  _getPositon() {
    if (navigator.geolocation)
      // for old browsers
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Couldn't get your position ");
        }
      );
  }

  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}hl=ru`);

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); //here i dealet "const declaretion" because it will couse error

    // console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    //need to add it right  at the end of load method  because the map will have to load first and then markers will be rendered  (asynchrous Java Script)
    this.#workouts.forEach(work => this._renderWorkoutMarker(work));
  }

  _showForm(eMap) {
    this.#mapEvent = eMap; //need to assigne to new value in order to have access to it in submit handle
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value = inputDistance.value = inputDuration.value = ''; // after add workout on a map and in the list we need to clear input fields
    form.style.display = 'none';
    form.classList.add('hidden');
    //using hack in order to get rid of slowling slide  animation
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //   const valudationInput = ()=>{

  //   }

  _newWorkout(e) {
    //helper fucntions for validation
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const positiveNumber = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout; //this declaration need to assign values below in block skope

    //If activity(workout) is ronning, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid

      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        !validInputs(distance, duration, cadence) ||
        !positiveNumber(distance, duration, cadence)
      )
        return alert('Inputs have to be correct and positive numbers!');

      workout = new Running(distance, duration, [lat, lng], cadence);
    }

    //If activity is cycling,create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // // !Number.isFinite(duration) ||
        // // !Number.isFinite(cadence)

        !validInputs(distance, duration, elevation) ||
        !positiveNumber(distance, duration) //elevation might be a negative number because posible down the mountain
      )
        return alert('Inputs have to be correct and positive numbers!');
      workout = new Cycling(distance, duration, [lat, lng], elevation);
    }
    //Add new object to workout array
    this.#workouts.push(workout);
    // console.log(workout);
    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //Render workout on the list

    this._renderWorkout(workout);
    //Hide the form+Clear form fields
    this._hideForm();

    //set localStorage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coards)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running')
      html += ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    if (workout.type === 'cycling')
      html += ` <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>`;
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopap(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    // console.log(workoutEl);
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coards, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    //workout.click() //NOTE: after JSON.stringlify/parse(conver from object to string and vise versa) manipulations all objects received from localStorage no longer has methods which were in their prototype before storing in LocalStorage(it's no longer wether a Running object or Cycling object.Is's just a regular object with default methods)
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);
    //guard block
    if (!data) return;
    this.#workouts = data;
    // console.log(this);
    this.#workouts.forEach(work => this._renderWorkout(work));
  }

  //Using public interace
  //cleer storage from objects
  //reload mpa
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
