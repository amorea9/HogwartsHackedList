"use strict";

window.addEventListener("DOMContentLoaded", init);

//global variables
const urlStudents = "https://petlatkea.dk/2021/hogwarts/students.json";
const urlBlood = "https://petlatkea.dk/2021/hogwarts/families.json";

let allStudents = [];
let studentsBloodStatus = {};
let expelledStudents = [];
let activeStudentsArray = [];
let hacked = false;
const Student = {
  //template
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  imageFile: "",
  house: "",
  gender: "",
  bloodStatus: "",
  expelled: false,
  inquisitorialSquad: false,
  prefect: false,
};
const settings = {
  filterBy: "enrolled",
  sortBy: "firstName",
  sortDir: "asc",
  searchBy: "",
  activeArray: [],
};
async function init() {
  //event listener for the drop down options
  addEventsToButtons();
  loadJSON();
}
async function loadJSON() {
  //load blood status first
  await loadJSONBlood();
  //load students
  fetch(urlStudents)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare student objects
      prepareStudentsData(jsonData);
      console.log("families loaded");
    });
}
//load blood status json
function loadJSONBlood() {
  fetch(urlBlood)
    .then((response) => response.json())
    .then((jsonData) => {
      // loaded - it's an object of two arrays
      studentsBloodStatus = jsonData;
      console.log("blood loaded");
    });
}
function prepareStudentsData(jsonData) {
  allStudents = jsonData.map(prepareStudentData);
  activeStudentsArray = jsonData.map(prepareStudentData);
  settings.activeArray = activeStudentsArray;
  console.log("active array", activeStudentsArray);
  buildStudentsList();
}
//function that defines the student object
function prepareStudentData(jsonObject) {
  //create object from the student template
  const student = Object.create(Student);
  const studentFullNameArray = jsonObject.fullname.trim().split(" ");

  student.gender = jsonObject.gender;
  //first name
  student.firstName = getFirstName(studentFullNameArray);
  //last name
  student.lastName = getLastName(student, studentFullNameArray);
  //middle name
  // student.middleName = student.middleName.charAt(0).toUpperCase() + student.middleName.substring(1).toLowerCase();
  student.middleName = getMiddleName(jsonObject);
  //nickname
  student.nickName = getNickName(jsonObject);
  //image file
  student.imageFile = getImage(student);
  // house
  student.house = getHouse(jsonObject);
  //blood
  student.bloodStatus = setBlood(student) + " blood";

  //conditions for exeptions with letter
  for (let i = 1; i < jsonObject.fullname.lenght; i++) {
    let previousChar = jsonObject.fullname[i - 1];
    if (previousChar === '"' || previousChar === "-") {
      jsonObject.fullname[i].toUpperCase();
      //makes sure that if the previous character is ", the letter becomes upper case
    } else {
      jsonObject.fullname[i];
    }
  }
  //if they have a nickname, they don't have a middlename
  //incorrect but temporary fix for Ernie
  if (student.nickName != "") {
    student.middleName = "";
  } else {
    student.middleName = student.middleName;
  }
  return student;
}
function getFirstName(studentFullNameArray) {
  const name = studentFullNameArray[0].charAt(0).toUpperCase() + studentFullNameArray[0].substring(1).toLowerCase();
  return name;
}

function getLastName(student, studentFullNameArray) {
  let surname;
  if (student.firstName === "Leanne") {
    surname = "Leanne";
    student.bloodStatus = "Unknown";
  } else {
    surname = studentFullNameArray.at(-1).charAt(0).toUpperCase() + studentFullNameArray.at(-1).substring(1).toLowerCase();
  }
  return surname;
}

function getMiddleName(jsonObject) {
  let middleName;
  if (jsonObject.fullname.trim().indexOf(" ") === jsonObject.fullname.trim().lastIndexOf(" ")) {
    middleName = "";
  } else {
    middleName = jsonObject.fullname.trim().substring(jsonObject.fullname.trim().indexOf(" ") + 1, jsonObject.fullname.trim().lastIndexOf(" "));
  }
  return middleName;
}

function getNickName(jsonObject) {
  let nickname;
  nickname = jsonObject.fullname.substring(jsonObject.fullname.indexOf('"'), jsonObject.fullname.lastIndexOf('"') + 1);
  return nickname;
}

function getImage(student) {
  let imageFile;
  if (student.lastName === "Patil") {
    imageFile = `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  } else if (student.lastName === "Finch-fletchley") {
    const finchArray = student.lastName.split("-");
    imageFile = `images/${finchArray[1].toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
    student.lastName = finchArray[1].charAt(0).toUpperCase() + finchArray[1].substring(1).toLowerCase();
    student.middleName = finchArray[0];
  } else {
    imageFile = `images/${student.lastName.toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
  }
  return imageFile;
}

function getHouse(jsonObject) {
  let house = jsonObject.house.trim();
  let studentHouse;
  studentHouse = house.charAt(0).toUpperCase() + house.substring(1).toLowerCase();
  return studentHouse;
}
//blood
function setBlood(student) {
  let blood;
  if (studentsBloodStatus.half.includes(student.lastName)) {
    blood = "half";
  } else if (studentsBloodStatus.pure.includes(student.lastName)) {
    blood = "pure";
  } else if (student.firstName === student.lastName) {
    blood = "unknown";
  } else {
    blood = "muggle";
  }

  return blood;
}
function addEventsToButtons() {
  document.querySelector("#filter").addEventListener("change", readFilterOptionsValues);
  document.querySelectorAll("#sort [data-action='sort']").forEach((button) => button.addEventListener("click", readSortOptionsValues));
  document.querySelector("#search_bar").addEventListener("keydown", searchString);
  //can also use keyup event
  document.querySelector(".hack_button_container").addEventListener("click", hackTheSystem);
}
function searchString() {
  const searchBy = document.querySelector("#search_bar").value;
  settings.searchBy = searchBy.toLowerCase();
  const searchedList = allStudents.filter(isTheStudent);
  function isTheStudent(student) {
    if (student.firstName.toLowerCase().includes(settings.searchBy) || student.lastName.toLowerCase().includes(settings.searchBy)) return student;
  }
  displayStudentsList(searchedList);
}
function readFilterOptionsValues(event) {
  //reads the value of the filter option selected
  const selectedFilterOption = event.target.value;
  setFilter(selectedFilterOption);
}
function readSortOptionsValues(event) {
  //reads the value of the sort option selected
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //find old sort by element
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");
  // active sort button
  event.target.classList.add("sortby");

  //toggle the direcion after first click
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  setSort(sortBy, sortDir);
}
function setSort(sortBy, sortDir) {
  //storing values
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  //updating list with the sorting
  buildStudentsList();
}
function setFilter(filter) {
  settings.filterBy = filter;
  buildStudentsList();
}
function buildStudentsList() {
  //current list is the filtered list
  displayStudentsInfo(allStudents);
  activeStudentsArray = allStudents.filter((student) => student.expelled === false);
  // displayStudentsList(expelledStudents);
  const currentList = filterList(activeStudentsArray);
  const sortedList = sortList(currentList);
  displayStudentsList(currentList);
}
function displayStudentsInfo(allStudents) {
  //displaying the stats info of the origial array of students at the top of the site
  document.querySelector(".number_displayed").textContent = settings.activeArray.length;
  document.querySelector(".number_total_students").textContent = allStudents.length;
  document.querySelector(".number_expelled").textContent = expelledStudents.length;
  document.querySelector(".number_gryffindor").textContent = allStudents.filter(isGryffindor).length;
  document.querySelector(".number_ravenclaw").textContent = allStudents.filter(isRavenclaw).length;
  document.querySelector(".number_hufflepuff").textContent = allStudents.filter(isHufflePuff).length;
  document.querySelector(".number_slytherin").textContent = allStudents.filter(isSlytherin).length;
}
function filterList(filteredList) {
  settings.activeArray = activeStudentsArray;
  if (settings.filterBy === "all") {
    filteredList = allStudents.filter((student) => student.expelled === false || student.expelled === true);
  }
  if (settings.filterBy === "house_gryffindor") {
    filteredList = settings.activeArray.filter(isGryffindor);
  }
  if (settings.filterBy === "house_ravenclaw") {
    filteredList = settings.activeArray.filter(isRavenclaw);
  }
  if (settings.filterBy === "house_hufflepuff") {
    filteredList = settings.activeArray.filter(isHufflePuff);
  }
  if (settings.filterBy === "house_Slytherin") {
    filteredList = settings.activeArray.filter(isSlytherin);
  }
  if (settings.filterBy === "expelled") {
    filteredList = expelledStudents;
  }
  if (settings.filterBy === "enrolled") {
    filteredList = settings.activeArray.filter(isEnrolled);
  }
  if (settings.filterBy === "inquisitorial") {
    filteredList = settings.activeArray.filter(isInquisitorial);
  }
  if (settings.filterBy === "prefect") {
    filteredList = settings.activeArray.filter(isPrefect);
  }
  if (settings.filterBy === "boys") {
    filteredList = settings.activeArray.filter(isBoy);
  }
  if (settings.filterBy === "girls") {
    filteredList = settings.activeArray.filter(isGirl);
  }
  return filteredList;
}
function isGryffindor(student) {
  return student.house === "Gryffindor";
}
function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}
function isHufflePuff(student) {
  return student.house === "Hufflepuff";
}
function isSlytherin(student) {
  return student.house === "Slytherin";
}
function isExpelled(student) {
  return student.expelled === true;
}
function isEnrolled(student) {
  return student.expelled === false;
}
function isPrefect(student) {
  return student.prefect === true;
}
function isInquisitorial(student) {
  return student.inquisitorialSquad === true;
}
function isBoy(student) {
  return student.gender === "boy";
}
function isGirl(student) {
  return student.gender === "girl";
}
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}
function displayStudentsList(students) {
  // clear the list
  document.querySelector("#template_wrapper").innerHTML = " ";
  console.log("arrayStudents", students);
  //number of students currently displayed at the end of the page
  document.querySelector(".number_displayed").textContent = students.length;
  //students length

  // build a new list
  students.forEach(displayStudent);
}
function displayStudent(student) {
  // create clone
  const clone = document.querySelector(".student_card_template").content.cloneNode(true);
  // set clone data
  clone.querySelector(".name").textContent = student.firstName;
  clone.querySelector(".last_name").textContent = student.lastName;
  clone.querySelector(".student_picture").src = student.imageFile;
  clone.querySelector(".student_picture").alt = `${student.firstName} ${student.lastName}`;

  //add event listener to buttons in the clone
  clone.querySelectorAll("[data-action='choice']").forEach((button) => button.addEventListener("click", selectChoice));
  //add event listener to the student card
  clone.querySelector(".student_picture").addEventListener("click", showPopUp);

  function selectChoice(event) {
    const selectedChoice = event.target.dataset.field;
    setChoice(selectedChoice);
  }

  function setChoice(choice) {
    //store the choice
    settings.choice = choice;
    console.log(settings.choice);
    if (settings.choice === "expel_student") {
      // clone.querySelector("[data-field='expel_student']").forEach((card) => card.addEventListener("animationend", expelStudent));
      // clone.querySelector(".student_card").classList.add("student_expelled");
      expelStudent(student);
      buildStudentsList();
    } else if (settings.choice === "add_inquisitorial") {
      if (hacked === true) {
        addInquisitorial(student);
        limitInquisitorialSquad();
        buildStudentsList();
      } else {
        addInquisitorial(student);
        buildStudentsList();
      }
    } else if (settings.choice === "make_prefect") {
      if (student.prefect === true) {
        student.prefect = false;
      } else {
        tryToMakePrefect(student);
      }
      buildStudentsList();
    }
  }
  //remove event listener if the student is expelled and remove responsabilities
  if (student.expelled === true) {
    clone.querySelector("[data-expelled='false']").dataset.expelled = true;
    clone.querySelectorAll("[data-action='choice']").forEach((button) => button.removeEventListener("click", selectChoice));
    student.prefect = false;
    student.inquisitorial = false;
  }
  //change button content
  if (student.prefect === true) {
    clone.querySelector("[data-field='make_prefect']").classList.remove("greyed_out");
  } else {
    clone.querySelector("[data-field='make_prefect']").classList.add("greyed_out");
  }
  if (student.inquisitorialSquad === true) {
    clone.querySelector("[data-field='add_inquisitorial']").classList.remove("greyed_out");
  } else {
    clone.querySelector("[data-field='add_inquisitorial']").classList.add("greyed_out");
  }
  //gets which button of the choice has been clicked
  if (hacked) {
    clone.querySelector(".student_card").classList.add("hacked");
  }
  //arrow function to pass info about student
  //modals styling
  function showPopUp() {
    const modal = document.querySelector(".student_modal");
    modal.classList.add("show");

    //populate the modal with the right information
    modal.querySelector(".student_full_name").textContent = `${student.firstName} ${student.lastName}`;
    modal.querySelector(".name").textContent = student.firstName;
    modal.querySelector(".last_name").textContent = student.lastName;
    modal.querySelector(".nickname").textContent = student.nickName;
    modal.querySelector(".middle_name").textContent = student.middleName;
    modal.querySelector(".blood_status").textContent = student.bloodStatus;
    if (student.prefect) {
      modal.querySelector(".prefect_status").textContent = "yes";
    } else {
      modal.querySelector(".prefect_status").textContent = "no";
    }
    if (student.inquisitorialSquad) {
      modal.querySelector(".inquisitorial_status").textContent = "yes";
    } else {
      modal.querySelector(".inquisitorial_status").textContent = "no";
    }
    if (student.expelled) {
      modal.querySelector(".expelled_status").textContent = "yes";
    } else {
      modal.querySelector(".expelled_status").textContent = "no";
    }

    modal.querySelector(".student_picture").src = student.imageFile;
    modal.querySelector(".student_picture").alt = `${student.firstName} ${student.lastName}`;
    modal.querySelector(".house_crest").src = `images/assets_pictures/${student.house}.png`;
    modal.querySelector(".house_crest").alt = student.house;
    document.querySelector(".student_modal .closebutton").addEventListener("click", closeTextDialog);

    if (student.house === "Gryffindor") {
      modal.querySelector("#student_modal_content").classList.remove("ravenclaw_style");
      modal.querySelector("#student_modal_content").classList.remove("hufflepuff_style");
      modal.querySelector("#student_modal_content").classList.remove("slytherin_style");
      modal.querySelector("#student_modal_content").classList.add("gryffindor_style");
    } else if (student.house === "Ravenclaw") {
      modal.querySelector("#student_modal_content").classList.remove("gryffindor_style");
      modal.querySelector("#student_modal_content").classList.remove("hufflepuff_style");
      modal.querySelector("#student_modal_content").classList.remove("slytherin_style");
      modal.querySelector("#student_modal_content").classList.add("ravenclaw_style");
    } else if (student.house === "Hufflepuff") {
      modal.querySelector("#student_modal_content").classList.remove("gryffindor_style");
      modal.querySelector("#student_modal_content").classList.remove("ravenclaw_style");
      modal.querySelector("#student_modal_content").classList.remove("slytherin_style");
      modal.querySelector("#student_modal_content").classList.add("hufflepuff_style");
    } else if (student.house === "Slytherin") {
      modal.querySelector("#student_modal_content").classList.remove("gryffindor_style");
      modal.querySelector("#student_modal_content").classList.remove("ravenclaw_style");
      modal.querySelector("#student_modal_content").classList.remove("hufflepuff_style");
      modal.querySelector("#student_modal_content").classList.add("slytherin_style");
    }
  }
  // append clone to list
  document.querySelector("#template_wrapper").appendChild(clone);
}
//EXPEL
function expelStudent(student) {
  settings.activeArray = activeStudentsArray;
  if (student.expelled === false) {
    if (student.firstName === "Alessia") {
      student.expelled = false;
      // call pop up function when user tries to expel me
      cannotExpel(student);
    } else {
      const studentIndex = settings.activeArray.indexOf(student);
      expelledStudents.push(student);
      settings.activeArray.splice(studentIndex, 1);
      student.expelled = true;
      // not using a flag //student.expelled = !student.expelled;
    }
  }
}
//INQUISITORIAL
function addInquisitorial(student) {
  if (student.house === "Slytherin" || student.bloodStatus === "pure blood") {
    student.inquisitorialSquad = !student.inquisitorialSquad;
    console.log("added to the inquisitorial squad", student);
  } else {
    cannotInquisitorial(student);
  }
}
//MAKE PREFECT
function tryToMakePrefect(prefectCandidate) {
  settings.activeArray = activeStudentsArray;
  //filter of all prefects
  const prefects = settings.activeArray.filter((student) => student.prefect);

  //all the prefects where the house is the same as the selected prefect (array object)
  const other = prefects.filter((student) => student.house === prefectCandidate.house);
  //number of prefects
  const numberOfPrefects = other.length;
  //if there is another student of the same house
  if (other !== undefined && numberOfPrefects >= 2) {
    removeAorB(other[0], other[1]);
  } else {
    makePrefect(prefectCandidate);
  }

  function removeAorB(prefectA, prefectB) {
    //ask user to ignore or remove A or B
    document.querySelector("#remove_aorb").classList.add("show");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector(".remove_A").addEventListener("click", clickRemoveA);
    document.querySelector(".remove_B").addEventListener("click", clickRemoveB);

    //show names of the two animals
    document.querySelector("#remove_aorb .candidate1").textContent = `${prefectA.firstName}, from ${prefectA.house}`;
    document.querySelector("#remove_aorb .candidate2").textContent = `${prefectB.firstName}, from ${prefectB.house}`;
    //if ignore do nothing

    function closeDialog() {
      document.querySelector("#remove_aorb").classList.remove("show");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector(".remove_A").removeEventListener("click", clickRemoveA);
      document.querySelector(".remove_B").removeEventListener("click", clickRemoveB);
    }
    //if remove A
    function clickRemoveA() {
      removePrefect(prefectA);
      makePrefect(prefectCandidate);
      buildStudentsList();
      closeDialog();
    }
    //if remove B
    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(prefectCandidate);
      buildStudentsList();
      closeDialog();
    }
  }
  function removePrefect(studentPrefect) {
    studentPrefect.prefect = false;
  }
  function makePrefect(student) {
    student.prefect = true;
  }
}
// MODALS AND POP UPS
function cannotExpel(student) {
  //show modal
  document.querySelector("#cannot_expel").classList.add("show");
  //add close button
  document.querySelector("#cannot_expel .closebutton").addEventListener("click", closeTextDialog);
}
function cannotInquisitorial(student) {
  document.querySelector("#cannot_inquisition").classList.add("show");

  document.querySelector("#cannot_inquisition .closebutton").addEventListener("click", closeTextDialog);
}
function removedInquisitorialMemberPopUP(student) {
  document.querySelector("#inquisition_timeout").classList.add("show");
  document.querySelector("#inquisition_timeout .candidate3").textContent = `${student.firstName} ${student.lastName}, from ${student.house}`;
  document.querySelector("#inquisition_timeout .closebutton").addEventListener("click", closeTextDialog);
}
function closeTextDialog() {
  document.querySelector("#cannot_expel").classList.remove("show");
  document.querySelector("#cannot_expel .closebutton").removeEventListener("click", closeTextDialog);
  document.querySelector("#cannot_inquisition").classList.remove("show");
  document.querySelector("#cannot_inquisition .closebutton").removeEventListener("click", closeTextDialog);
  document.querySelector(".student_modal").classList.remove("show");
  document.querySelector(".student_modal .closebutton").removeEventListener("click", closeTextDialog);
  document.querySelector("#inquisition_timeout").classList.remove("show");
  document.querySelector("#inquisition_timeout .closebutton").removeEventListener("click", closeTextDialog);
}
//hack the system
function hackTheSystem() {
  hacked = true;
  document.querySelector(".hack_button_container").removeEventListener("click", hackTheSystem);
  document.querySelector("#do_not_click").classList.add("hacked");
  document.querySelector("body").classList.add("hacked");

  if (hacked === true) {
    insertNewStudent();
    randomizeBloodStatus();
    buildStudentsList();
    limitInquisitorialSquad();
  }
  document.addEventListener("click", randomizeBloodStatus);
}
function insertNewStudent() {
  const myself = {
    firstName: "Alessia",
    lastName: "Amore",
    bloodStatus: "pure blood",
    gender: "girl",
    house: "Ravenclaw",
    imageFile: "images/alessia_a.png",
    expelled: false,
    inquisitorialSquad: false,
    prefect: false,
  };
  allStudents.push(myself);
  buildStudentsList();
}
function randomizeBloodStatus(student) {
  allStudents.forEach((student) => {
    const bloodArray = ["pure", "half", "muggle"];
    let bloodArrayRandom = Math.floor(Math.random() * 3);
    student.bloodStatus = bloodArray[bloodArrayRandom] + " blood";
  });
}
function limitInquisitorialSquad(student) {
  //if a member is in the squad
  //limit time
  allStudents.forEach((student) => {
    if (student.inquisitorialSquad === true) {
      setTimeout(() => {
        student.inquisitorialSquad = false;
        buildStudentsList();
        removedInquisitorialMemberPopUP(student);
      }, 5000);
    }
  });
}
