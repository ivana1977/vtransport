/** Carga los vehiculos que estan en la localStorage a la lista */
const loadVehicles = (vehicles) => {
  let lista = document.getElementById('vehicles');
  vehicles.forEach(model => {
    lista.appendChild(createVehicleNode(model));
  });
  onVehiclesChange();  
}

/** Agrega un vehiculo a la lista */
const addVehicle = (evt) => {
  evt.preventDefault();
  let model = document.getElementById('model');
  if (!isValidModel(model.value.toLowerCase())) {
    const errorText = document.getElementById('error-msg');
    errorText.classList.remove('hidden');
    setTimeout(function(){ errorText.classList.add('hidden'); }, 3000);
    return false;
  }
  let lista = document.getElementById('vehicles');  
  lista.appendChild(createVehicleNode(model.value));
  vehiclesArray.push(model.value);
  saveInLocalStorage();
  onVehiclesChange();
  model.value ='';
  model.focus();
}

/** Crea un node del DOM para agregar el vehiculo a la lista */
const createVehicleNode = model => {
  let liDOM = document.createElement('li');
  liDOM.appendChild(document.createTextNode(model));
  let btn = document.createElement('button');
  btn.textContent = 'x';
  btn.setAttribute('onclick', `removeVehicle(event, '${model}')`);
  liDOM.appendChild(btn);
  return liDOM;
}

/** Quita un vehiculo de la lista */
const removeVehicle = (e, model) => {
  let consultar = confirm(`¿Estas seguro de elimiar el modelo ${model} de la lista?`);
  if (consultar === true) {
    e.target.parentElement.remove();
    // remove from array
    vehiclesArray.splice(vehiclesArray.indexOf(model), 1);
    saveInLocalStorage();
    onVehiclesChange();
  }
}

/** Valida si el modelo que toma por parámetro pertenece a algún modelo de los fabricantes */
const isValidModel = model => {
  let result = false;
  for (let i = 0; i < brands.length; i++) {
    const modelsByBrand = eval(`models${brands[i]}`);
    for (models of modelsByBrand) {
      if (models.indexOf(model) > -1) {
        result = true;
        break;
      }
    }
    if (result) {
      break;
    }
  }
  return result;
}

/** Elimina todos los vehiculos cargados hasta el momento. */
const deleteAll = () => {
  const consultar = confirm(`¿Estas seguro de eliminar todos los vehiculos cargados?`);
  if (consultar === true) {
    document.getElementById('vehicles').innerHTML = '';
    vehiclesArray = [];
    saveInLocalStorage();    
    onVehiclesChange();
  }
}

/**
 * Maneja el evento cuando el array de vehiculos fue cambiado.
 * En algún futuro se podrá usar Array.observe pero aun es es7 https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/observe
 */
const onVehiclesChange = () => {
  const buttons = document.querySelectorAll('.btn-limpiar');
  if (vehiclesArray.length === 0) {
    for (btn of buttons) {
      btn.classList.add('hidden');
    }
  } else {   
    for (btn of buttons) {
      btn.classList.remove('hidden');
    }
  }
}

/** Guardar el arreglo de vehiculos en la localStorage del navegador. */
const saveInLocalStorage = () => {
  localStorage.setItem('vehicles', JSON.stringify(vehiclesArray));
}

/** Maneja el evento del boton generar reporte */
const onReportButtonClicked = () => {
  const reportData = generateReportData(vehiclesArray);
  console.log(reportData);
}

/** Crea la matriz para hacer los calculos de vehiculos por fabricante y tipo. */
const buildMatrix = () => {
  let matrix = [];
  let index = 0;
  for (let f = 0; f < brands.length; f++) {
    const modelsByBrand = eval(`models${brands[f]}`);
    for (let i = 0; i < 4; i++) {
      for (let m = 0; m < modelsByBrand[i].length; m++) {
        matrix[index] = [modelsByBrand[i][m], f, i, 0]; // vehiculo [modelo, indice del fabricante, indice del tipo, cantidad]
        index++;
      }
    } 
  }
  return matrix;
}

/** Genera los datos necesarios para el reporte*/
const generateReportData = vehicles => {
  let matrix = buildMatrix(vehicles);
  for (let i = 0; i < vehicles.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      const vehicle = matrix[j];
      if (vehicles[i] === vehicle[0]) {
        matrix[j][3]++;
        break;
      }
    }
  }
  return extractReportDataFromMatrix(matrix);
}

/** Obtiene las catidades por fabricante, tipo y modelo de la matriz. */
const extractReportDataFromMatrix = (matrix) => {
  let brandsCounter = brands.map(() => 0);
  let typesCounter = [0, 0, 0, 0];  
  let modelsData = brands.map(() => []);
  matrix.forEach(model => {
    if (model[3] > 0) {
      typesCounter[model[2]] += model[3];
      brandsCounter[model[1]] += model[3];
      modelsData[model[1]].push([model[0], model[3]]);
    }
  })

  const brandsData = brandsCounter.map((brandCounter, index) => {
    return [brands[index], brandCounter];
  });

  const typesLabels = ['autos', 'subs', 'utilitarios', 'pick-ups'];  
  const typesData = typesCounter.map((typeCounter, index) => {
    return [typesLabels[index], typeCounter];
  });

  return [brandsData, typesData, modelsData];
}

const brands = ['Fiat', 'Renault', 'Chevrolet', 'Ford', 'VW'];
// models
const modelsFiat = [['palio', 'uno', 'linea', 'argo'], [], ['fiorino'], ['toro']];
const modelsRenault = [['megane', 'kiwi', 'zandero'], ['koleos', 'duster'], ['kangoo', 'master'], ['oroch']];
const modelsChevrolet = [['cruze', 'corsa'], ['tracker'], [], ['s-10']];
const modelsFord = [['fiesta', 'focus'], [], ['transit'], ['ranger']];
const modelsVW = [['ka', 'gol', 'vento', 'passat', 'bora'], [], [], ['amarok']];

// recupero los vehiculos de la local storage
let vehiclesArray = localStorage.getItem('vehicles') ? JSON.parse(localStorage.getItem('vehicles')) : [];
loadVehicles(vehiclesArray);