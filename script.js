"use strict";

window.addEventListener("DOMContentLoaded", init);

//global variables
const urlStudents = "https://petlatkea.dk/2021/hogwarts/students.json";
const urlBlood = "https://petlatkea.dk/2021/hogwarts/families.json";

let allStudents = [];
let studentsBloodStatus = {};
let expelledStudents = [];
let activeStudentsArray = [];

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
function prepareStudentData(jsonObject, studentsBloodStatus) {
  //create object from the student template
  const student = Object.create(Student);
  const studentFullNameArray = jsonObject.fullname.trim().split(" ");
  student.gender = jsonObject.gender;
  //first name
  student.firstName = studentFullNameArray[0].charAt(0).toUpperCase() + studentFullNameArray[0].substring(1).toLowerCase();
  //last name

  if (student.firstName === "Leanne") {
    student.lastName = "Leanne";
    student.bloodStatus = "Unknown";
  } else {
    student.lastName = studentFullNameArray.at(-1).charAt(0).toUpperCase() + studentFullNameArray.at(-1).substring(1).toLowerCase();
  }
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

  //checking for middle name
  if (jsonObject.fullname.trim().indexOf(" ") === jsonObject.fullname.trim().lastIndexOf(" ")) {
    student.middleName = "";
  } else {
    student.middleName = jsonObject.fullname.trim().substring(jsonObject.fullname.trim().indexOf(" ") + 1, jsonObject.fullname.trim().lastIndexOf(" "));
  }

  //middle name
  student.middleName = student.middleName.charAt(0).toUpperCase() + student.middleName.substring(1).toLowerCase();

  //nickname
  student.nickName = jsonObject.fullname.substring(jsonObject.fullname.indexOf('"') + 1, jsonObject.fullname.lastIndexOf('"'));

  //if they have a nickname, they don't have a middlename
  //incorrect but temporary fix for Ernie
  if (student.nickName != "") {
    student.middleName = "";
  } else {
    student.middleName = student.middleName;
  }

  //image file
  if (student.lastName === "Patil") {
    student.imageFile = `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  } else if (student.lastName === "Finch-fletchley") {
    const finchArray = student.lastName.split("-");
    student.imageFile = `images/${finchArray[1].toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
    student.lastName = finchArray[1].charAt(0).toUpperCase() + finchArray[1].substring(1).toLowerCase();
    student.middleName = finchArray[0];
  } else {
    student.imageFile = `images/${student.lastName.toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
  }

  // house
  student.house = jsonObject.house.trim();
  student.house = student.house.charAt(0).toUpperCase() + student.house.substring(1).toLowerCase();

  //blood
  student.bloodStatus = setBlood(student) + " blood";
  return student;
}
//blood
function setBlood(student) {
  let blood;
  if (studentsBloodStatus.half.includes(student.lastName)) {
    blood = "half";
  } else if (studentsBloodStatus.pure.includes(student.lastName)) {
    blood = "pure";
  } else if (studentsBloodStatus.half.includes(student.lastName) && studentsBloodStatus.pure.includes(student.lastName)) {
    blood = "muggle";
  } else if (student.firstName === "Leanne") {
    blood = "unknown status of";
  }
  return blood;
}
function addEventsToButtons() {
  document.querySelector("#filter").addEventListener("change", readFilterOptionsValues);
  document.querySelectorAll("#sort [data-action='sort']").forEach((button) => button.addEventListener("click", readSortOptionsValues));
  document.querySelector("#search_bar").addEventListener("keydown", searchString);
  //can also use keyup event
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
function clear() {
  document.querySelector("#search_bar").value = "";
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
  // displayStudentsList(expelledStudents);
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);
  displayStudentsList(sortedList);
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
  //remove event listener if the student is expelled
  if (student.expelled === true) {
    clone.querySelectorAll("[data-action='choice']").forEach((button) => button.removeEventListener("click", selectChoice));
  }
  //change button content
  if (student.prefect === true) {
    clone.querySelector("[data-prefect='false']").dataset.prefect = true;
    clone.querySelector("[data-prefect='true']").textContent = "Revoke prefect status";
  }
  if (student.inquisitorialSquad === true) {
    clone.querySelector("[data-inquisitorial='false']").dataset.inquisitorial = true;
    clone.querySelector("[data-inquisitorial='true']").textContent = "Revoke inquisitorial status";
  }
  //add event listener to buttons in the clone
  clone.querySelectorAll("[data-action='choice']").forEach((button) => button.addEventListener("click", selectChoice));

  function selectChoice(event) {
    const selectedChoice = event.target.dataset.field;
    setChoice(selectedChoice);
  }

  function setChoice(choice) {
    //store the choice
    settings.choice = choice;
    if (settings.choice === "expel_student") {
      expelStudent(student);
      buildStudentsList();
    } else if (settings.choice === "add_inquisitorial") {
      addInquisitorial(student);
      buildStudentsList();
    } else if (settings.choice === "make_prefect") {
      if (student.prefect === true) {
        student.prefect = false;
      } else {
        tryToMakePrefect(student);
      }
      buildStudentsList();
    }
  }
  //gets which button of the choice has been clicked

  //arrow function to pass info about student

  //modals styling

  if (student.house === "Gryffindor") {
    clone.querySelector("article.student_card").classList.add("gryffindor_style");
  } else if (student.house === "Ravenclaw") {
    clone.querySelector("article.student_card").classList.add("ravenclaw_style");
  } else if (student.house === "Hufflepuff") {
    clone.querySelector("article.student_card").classList.add("hufflepuff_style");
  } else if (student.house === "Slytherin") {
    clone.querySelector("article.student_card").classList.add("slytherin_style");
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
    //popup message
    console.log("this student can't be added to the inquisitorial squad");
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
    console.log("there can only be two prefect for each house");
    removeAorB(prefects[0], prefects[1]);
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
      console.log("click A is not a prefect anymore");
      console.log(prefects);
    }
    //if remove B
    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(prefectCandidate);
      buildStudentsList();
      closeDialog();
      console.log("click B is not a prefect anymore");
      console.log(prefects);
    }
  }
  function removePrefect(studentPrefect) {
    studentPrefect.prefect = false;
    console.log(prefects);
  }
  function makePrefect(student) {
    student.prefect = true;
    console.log(prefects);
  }
}
// MODALS AND POP UPS
function cannotExpel(student) {
  //show modal
  document.querySelector("#cannot_expel").classList.add("show");
  //add close button
  document.querySelector("#cannot_expel .closebutton").addEventListener("click", closeTextDialog);
}

function closeTextDialog() {
  document.querySelector("#cannot_expel").classList.remove("show");
  document.querySelector("#cannot_expel .closebutton").removeEventListener("click", closeTextDialog);
}
