
//$('#infosyncRecordID').hide();

/* Utils */
function getAllElementsWithAttribute(rootNode, attribute, value){
	var matchingElements = [];
	var allElements = document.getElementsByTagName('*');
	for (var i = 0, n = allElements.length; i < n; i++){
		if (allElements[i].getAttribute(attribute) !== null &&
			allElements[i].getAttribute(attribute) === value){
			matchingElements.push(allElements[i]);
		}
	}
	return matchingElements;
}

function urlParamstoJson() {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
};

function toggleFieldErrors(show, errorData){
	var formNode, errorTags, i, errorTag, fieldId;
	formNode = document.getElementById("infosyncForm");
	if(show){
		for(fieldId in errorData){
			var elements = getAllElementsWithAttribute(formNode, 'data-infosync-id', fieldId);
			var last = elements.pop();
			var p = document.createElement("p");
			p.className = 'infosync-field-error';
			p.innerText = errorData[fieldId].msg.join(',');
			last.parentNode.appendChild(p);
		}
	}else{
		errorTags = formNode.getElementsByClassName("infosync-field-error");
		while(errorTags.length > 0){
			errorTags[0].parentNode.removeChild(errorTags[0]);
		}
	}
}

function getListOfAnswersIds(elementsInForm) {
	var i, listOfAnswersIds, currId;
	listOfAnswersIds = [];
	for(i=0; i<elementsInForm.length; i++) {
		currId = elementsInForm[i].getAttribute("data-infosync-id");
		if(currId && typeof currId !== "undefined") {
			if(listOfAnswersIds.indexOf(currId) < 0) {
				listOfAnswersIds.push(currId);
			}
		}
	}
	return listOfAnswersIds;
}

function addAnswerToAnswersDictionary(answers, element, listOfAnswersIds) {
	var tmpInfosyncId, tmpPosition;

	tmpInfosyncId = element.getAttribute("data-infosync-id");
  isCatalog = element.getAttribute("infosycCatalogId")
  if (isCatalog != null){
    element.setAttribute('type', 'catalog');
  }
	if(tmpInfosyncId && typeof tmpInfosyncId !== "undefined") {
    if((tmpPosition = listOfAnswersIds.indexOf(tmpInfosyncId)) >= 0) {
      if (isCatalog != null){
        addCatalogAnswerTo(answers, tmpInfosyncId, element)
      }else{
        if (element.type === 'number'){
          answers[tmpInfosyncId] = Number(element.value);
        }else if (element.type === 'radio'){
          addSingleChoiceAnswerTo(answers, tmpInfosyncId, element);
        }else if (element.type === 'checkbox'){
          addMultipleChoiceAnswersTo(answers, tmpInfosyncId, element);
        }else if (element.type === 'select'){
          addSingleChoiceAnswerTo(answers, tmpInfosyncId, element);
        }else if (element.type === 'file'){
          addFileAnswerTo(answers, tmpInfosyncId, element);
        }else if (element.type === 'catalog'){
          addCatalogAnswerTo(answers, tmpInfosyncId, element);
        }else{
          answers[tmpInfosyncId] = element.value;
        }
        }
      }
		}

  listOfAnswersIds.splice(tmpPosition, 1);
	}

function addMultipleChoiceAnswersTo(answers, tmpInfosyncId, element) {
	var answer, tmpInfosyncId;
	answer = getElementsByAttribute(element, tmpInfosyncId, "checkbox");
	addAnswerToAnswers(answers, element, answer);
}

function addSingleChoiceAnswerTo(answers, tmpInfosyncId, element) {
	var answer;
	answer = getElementsByAttribute(element, tmpInfosyncId, "radio");
	addAnswerToAnswers(answers, element, answer);
}

function addFileAnswerTo(answers, tmpInfosyncId, element) {
	var answer;
	answer = getElementsByAttribute(element, tmpInfosyncId, "file");
	addAnswerToAnswers(answers, element, answer);
}

function addCatalogAnswerTo(answers, tmpInfosyncId, element) {
	var answer;
	answer = getElementsByAttribute(element, tmpInfosyncId, "catalog");
	addAnswerToAnswers(answers, element, answer, true);
}
// Adds All Answers
function addAnswerToAnswers(answers, element, answer, isCatalog=false) {
	var tmpInfosyncId;
	tmpInfosyncId = element.getAttribute("data-infosync-id");
	if(answer && typeof answer !== "undefined" &&
		tmpInfosyncId && typeof tmpInfosyncId !== "undefined") {
      if (isCatalog){
        infosyccatalogid = element.getAttribute("infosyccatalogid");
        if ( answers[infosyccatalogid] == undefined && answers[infosyccatalogid] == null ){
          answers[infosyccatalogid] = new Object();
        }
        answers[infosyccatalogid][tmpInfosyncId] = answer[infosyccatalogid][tmpInfosyncId]
        // answers = Object.assign(answers, answer);
      }else{
        answers[tmpInfosyncId] = answer;
      }
	}
}

function getElementsByAttribute(element, tmpInfosyncId, type) {
  var i, elementsOfId;
  elementsOfId = document.getElementsByName(tmpInfosyncId);

  if(type === "checkbox"){
    var listOfAnswers = [];
    for(i=0; i<elementsOfId.length; i++) {
      if(elementsOfId[i].checked) {
        listOfAnswers.push(elementsOfId[i].value);
      }
    }
    if(listOfAnswers.length > 0) {
      return listOfAnswers;
    }
  }else if(type === "radio" || type === "select"){
    for(i=0; i<elementsOfId.length; i++) {
      if(elementsOfId[i].checked) {
        return elementsOfId[i].value;
      }
    }
  }else if(type === "file" ){
    var listFiles = Array();
    var fileJson = Object();
    for(i=0; i<elementsOfId.length; i++) {
      fileJson['file_name'] = elementsOfId[i].attributes.file_name.value;
      fileJson['file_url'] = elementsOfId[i].attributes.file_url.value;
      listFiles.push(fileJson)
      return listFiles;
    }
  }else if(type === "catalog" ){
    var catalogJson = new Object();
    for(i=0; i<elementsOfId.length; i++) {
      catalogId = elementsOfId[i].attributes.infosyccatalogid.value;
      catalogFieldId = elementsOfId[i].attributes.name.value;
      catalogJson[catalogId] = new Object();
      catalogJson[catalogId][catalogFieldId] = elementsOfId[i].value;
      return catalogJson;
    }
  }else{
    return;
  }
}

function sendTipoCita(tipoCita, flagStyle){

  //---Styles Hide and show
  if (flagStyle == 0)
  {
    document.getElementById("btn1").className = "col-md-5 btn btn-primary btn-lg";
    document.getElementById("btn2").className = "col-md-5 btn btn-default btn-lg";
    document.getElementById('calendly_uno').innerHTML = "";
    $('#62214affba46f8ff598c5e43').hide();
    $("#div_text").hide();
    $("#renewSend").remove();
  }else{
    $("#renewSend").remove();
  }

  var valueAnalist = $("#analistValue").val();

  var sendAnswers  = new Object()
  infosyncRecordId = document.getElementById("infosyncRecordID");
  let rut = document.getElementById("calendly_comercial").value;

  if (tipoCita === 'videoconferencia'){
    sendAnswers['620f026af2917a6a9872d10c'] = 'video_conferencia';
  }else{
    sendAnswers['620f026af2917a6a9872d10c'] = 'presencial';
    fileUpload = document.getElementById('62214affba46f8ff598c5e43')
    sendAnswers['62214affba46f8ff598c5e43'] = [{
      "file_url":fileUpload.getAttribute('file_url'),
      "file_name":fileUpload.getAttribute('file_name')
    }]
  }

  if (valueAnalist == 'true'){
    sendAnswers['62882a982b59a655c71d1a63'] = 'sí';
  }else{
    sendAnswers['62882a982b59a655c71d1a63'] = 'no';
  }

  if(infosyncRecordId.value) {
    var method = "PATCH"
    var sendUrl = "https://app.linkaform.com/api/infosync/form_answer/update_records/";
    console.log('infosyncRecordId.value',infosyncRecordId.value);
    
    this.sendToInfosync(sendAnswers, method, sendUrl, infosyncRecordId.value);
    Calendly.initInlineWidget({
      url:  rut + tipoCita,
      parentElement: document.getElementById('calendly_uno'),
      prefill: {},
      utm: {}
    });
  }
  else
  {
    $("#calendly_uno").append(
      '<div class="row mx-auto" style="width: 51%;">'+
        '<center><h3>No cuenta con una invitación para agendar su cita, por favor inscribirse en el siguiente <a href="https://quieroser.cocheros.com.co/inscripcion.php?O=Agendar-Cita"> enlace </a></h3></center>'+
      '</div>');
  }
};

function onError(response) {
		var errorData;
		var message = createResultMessage("infosyncErrorMessage");
		appendToHTML(message, "infosync-error-message");
		if(response){
			try{
				errorData = JSON.parse(response);
				toggleFieldErrors(false);
				toggleFieldErrors(true, errorData);
			} catch(err) {
				console.error('Error: ' + response);
			}
		}
	};

function onSuccessBase() {
		this.onSuccess();
		// document.getElementById("infosyncForm").reset();
		this.resetDataToSend();
		redirectToUrl();
	};

function sendToInfosync(answers, method, url, infosyncRecordId=null ) {
   var xhr, that;
   that = this;
   xhr = new XMLHttpRequest({mozAnon: true, mozSystem: true});
   console.log('INFOSYNC',infosyncRecordId);
   /*return fetch(url, {
     method: method,
     body: JSON.stringify({
       "form_id":81821,
       // "end_timestamp":new Date().getTime() / 1000,
       // "folio":null,
       "answers":answers,
       // "geolocation":[0, 0],
       "records":[infosyncRecordId],
       "type":{"selected":true}
       // "geolocation_method":{"accuracy": 20, "method": "Off"},
       // "properties":{"from":"localhost"}
         }),
     headers:{
       'Content-Type': 'application/json',
     },
   }).then((res) => res.json())
   .then((res) => {
     console.log('aqui esta el return ...',res)
   })*/
 };

function getCatalog(form_id, catalog_id, level, catalogType='select') {
  var start_key = Array();
  var end_key = Array();
  if (level > 1){
    for (next_level = 1; next_level < level; next_level++){
      var catalogSelect = document.getElementById("catalog-"+catalog_id+"-level-"+next_level).value;
      start_key.push(catalogSelect);
      if (next_level + 1 == level){
        if (typeof(catalogSelect) === 'number') {
          end_key.push(catalogSelect + 0.001);
        }else{
          end_key.push(catalogSelect + '\n');
        }
      }else{
        end_key.push(catalogSelect);
      }
    }
    end_key.push('{}');
    }else{
      var next_level = level;
  }
  if (catalogType === 'select'){
    var is_edition = false
  }else{
    var is_edition = true
  }

  //console.log('catalog start_key', start_key)
  //console.log('catalog end_key', end_key)
  return fetch('https://app.linkaform.com/api/infosync/catalog/view/', {
    method: 'POST',
    body: JSON.stringify({
      "form_id":form_id,
      "parent_catalog_id":null,
      "catalog_id":catalog_id,
      "options":{"group_level":level,
      "startkey":start_key,
      "endkey":end_key},
      "is_edition":is_edition
        }),
    headers:{
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())
  .then((res) => {
    var formNode = document.getElementById("catalog-"+catalog_id+"-level-"+next_level);
    if (catalogType === 'select'){
      formNode.options.length = 0
      var elemOption = document.createElement("option");
      elemOption.setAttribute('value','--Seleccione--');
      elemOption.text = '--Seleccione--';
      formNode.appendChild(elemOption);
    }
    for (i = 0; i < res.rows.length; i++){
      if (catalogType === 'select'){
        var elemOption = document.createElement("option");
        elemOption.setAttribute('value',res.rows[i]['key'][next_level-1])
        elemOption.text = res.rows[i]['key'][next_level-1];
        formNode.appendChild(elemOption);
      }else{
        var address = res.rows[i]['key'][next_level-1]['620efb91cad288ba4272d13a'];
        var region = res.rows[i]['key'][next_level-1]['622101b6207745bf33309de4'];

        console.log('Adress',address);
        console.log('REgion',region);
        if (address != null){
          var elemOption = document.createElement("div");
          elemOption.setAttribute('class',"col-sm-12 col-form-label col-form-label-lg");
          elemOption.textContent = "Direccion: " + address;
          formNode.appendChild(elemOption);
        }

      }
    }
  })

}

function getFile(){
  document.getElementById("btn1").className = "col-md-5 btn btn-default btn-lg";
  document.getElementById("btn2").className = "col-md-5 btn btn-primary btn-lg";
  document.getElementById('calendly_uno').innerHTML = "";
  const input = document.getElementById('buttons-div');
  var elemInput = document.createElement("input");
  if(!document.getElementById("62214affba46f8ff598c5e43")){

    $("#buttons-div").append(
      '<div class="row mx-auto" style="width: 100%;margin-top:20px;" id="div_text">'+
		   '<h4 style="text-align: left;margin-left:15px;">Por favor adjunte su documento de identificación:</h4>'+
      '</div>'
    );
    elemInput.setAttribute('id','62214affba46f8ff598c5e43');
    elemInput.setAttribute('onChange',"uploadFile(82421,'62214affba46f8ff598c5e43')");
    elemInput.setAttribute('name','62214affba46f8ff598c5e43');
    elemInput.setAttribute('class','col-sm-10 carga_arc');
    elemInput.setAttribute('type','file');
    elemInput.setAttribute('data-infosync-id',"62214affba46f8ff598c5e43");
    input.appendChild(elemInput);
  }else{
    $('#div_text').show();
    document.getElementById('62214affba46f8ff598c5e43').value= null;
    $('#62214affba46f8ff598c5e43').show();

  }
}

function uploadFile(formId, fieldId, isImage=true){

  const input = document.getElementById(fieldId);
  const file = input.files[0];
  var data = new FormData()
  data.append('form_id', formId);
  data.append('field_id', fieldId);
  data.append('is_image', isImage);
  data.append('File[0]', input.files[0]);

  fetch('https://app.linkaform.com/api/infosync/cloud_upload/', {
    method: 'POST',
    body: data
  }).then((res) => res.json())
  .then((res) => {
    if (res.error)
    {
      $("#renewSend").remove();
      Swal.fire({
        title: '<h2>Error</h2>',
        html: '<h4>Formato de archivo incorrecto, por favor ingrese una imagen en formato PNG o JPG</h4>',
        width: '500px'
      });
    }else{
      docInput = document.getElementById('62214affba46f8ff598c5e43')
      docInput.setAttribute('file_name', res.file_name);
      docInput.setAttribute('file_url', res.file);
      // Agrega botton para cita - Estilos
      const parentInput = document.getElementById('buttons-div');
      $("#renewSend").remove();
      var elemButton = document.createElement("button");
      elemButton.setAttribute('type','button');
      elemButton.setAttribute('class','col-md-12 btn btn-primary btn-lg');
      elemButton.setAttribute('id','renewSend');
      elemButton.setAttribute('onclick',"sendTipoCita('presencial',1)");
      elemButton.textContent = 'Agendar Cita Presencial';
      parentInput.appendChild(elemButton);
      document.getElementById('calendly_uno').innerHTML = "";
    }

})}

function getdate(){
  document.getElementById("btn1").className = "col-md-6 btn btn-success btn-lg";
  document.getElementById("btn2").className = "col-md-6 btn btn-default btn-lg";
  if(document.getElementById('62214affba46f8ff598c5e43')){
    document.getElementById('62214affba46f8ff598c5e43').remove();
    document.getElementById('renewSend').remove();
  }
  document.getElementById('calendly_uno').innerHTML = "";
  let rut = document.getElementById("calendly_comercial").value;
  Calendly.initInlineWidget({
    url: rut  + "videoconferencia",
    parentElement: document.getElementById('calendly_uno'),
    prefill: {},
    utm: {}
  });
}

function getAddress(){
  var departamento = document.getElementById("620efc74c2cd91ae6274d359");
  var municipio = document.getElementById("620efc74c2cd91ae6274d35a");
  var address = getCatalog(82421,81912, 3, 'detail')
}

/* Pre fill form with URI parameters */
window.onload = function(){
	/* Store URI parameters on object */
  // var catalog = getCatalog(82421, 81912, 1);
  // console.log('cagaloyt', catalog)
  var qs = urlParamstoJson();

	var formNode = document.getElementById("infosyncForm");
	for(var key in qs){
		var elements = getAllElementsWithAttribute(formNode, 'data-infosync-id', key);
		var value = decodeURI(qs[key]);
    var calendly_url = 'comercial_defailt'
    if (key === 'infosyncRecordID'){
      var recId = document.getElementById("infosyncRecordID");
      recId.value = value;
    }
    else if (key === 'comercial' && value !== null){
      // comercial = value.match(/^([^@]*)@/)[1];
      comercial = value
      calendly_url = value
    }
    else if(key === 'analista' && value!== null){
      $("#button_exit").hide();
      $("#analistValue").val('');
      $("#analistValue").val('true');

      //var recAnalist = document.getElementById("analistValue");
      //recAnalist.value = value;

      console.log('value',value);
      console.log('Valor',$("#analistValue").val());
    }
    else if(elements.length > 0){
			switch(elements[0].type){
				case 'text':
					elements[0].value = value;
					break;
				case 'textarea':
					elements[0].value = value;
					break;
				case 'select-one':
					elements[0].value = value;
					break;
				case 'radio':
					for(var idx in elements){
						if(elements[idx].value === value){
							elements[idx].checked = true;
						}
					}
					break;
				case 'checkbox':
					var values = value.split(';');
					for(var idx in elements){
						if(values.indexOf(elements[idx].value) !== -1){
							elements[idx].checked = true;
						}
					}
					break;
			}
		}
	}
  getAddress()
};
