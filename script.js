"use strict";

window.addEventListener("DOMContentLoaded", init);

//global variables
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const urlBlood = "https://petlatkea.dk/2021/hogwarts/families.json";

let allStudents = [];
let studentsBloodStatus = {};
let expelledStudents = [];
const Student = {
  //template
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  imageFile: "",
  house: "",
  gender: "",
  expelled: false,
  bloodStatus: "",
  inquisitorialSquad: false,
  prefect: false,
};
const settings = {
  filterBy: "all",
  sortBy: "firstName",
  sortDir: "asc",
  searchBy: "",
};

function init() {
  console.log("ready");
  //event listener for the drop down options
  addEventsToButtons();
  loadJSON();
}

function loadJSON() {
  //load students json
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare student objects
      prepareStudentsData(jsonData);
    });
}

//load blood status json
fetch(urlBlood)
  .then((response) => response.json())
  .then((jsonData) => {
    // loaded - it's an object of two arrays
    studentsBloodStatus = jsonData;
  });

function prepareStudentsData(jsonData) {
  allStudents = jsonData.map(prepareStudentData);
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
    student.lastName === "Unknown";
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
  console.log("student object", student);
  //blood

  student.bloodStatus = setBlood(student) + " blood";

  return student;
}

//blood doesn't work
function setBlood(student) {
  let blood;
  if (studentsBloodStatus.half.includes(student.lastName)) {
    blood = "half";
  } else if (studentsBloodStatus.pure.includes(student.lastName)) {
    blood = "pure";
  } else if (studentsBloodStatus.half.includes(student.lastName) && studentsBloodStatus.pure.includes(student.lastName)) {
    blood = "muggle";
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
    if (student.firstName.toLowerCase().includes(searchBy) || student.lastName.toLowerCase().includes(searchBy)) return student;
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
  displayStudentsInfo(allStudents);
  //current list is the filtered list
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayStudentsList(sortedList);
}

function displayStudentsInfo(allStudents) {
  //displaying the stats info of the origial array of students at the top of the site
  document.querySelector(".number_total_students").textContent = allStudents.filter(isEnrolled).length;
  document.querySelector(".number_expelled").textContent = allStudents.filter(isExpelled).length;
  document.querySelector(".number_gryffindor").textContent = allStudents.filter(isGryffindor).length;
  document.querySelector(".number_ravenclaw").textContent = allStudents.filter(isRavenclaw).length;
  document.querySelector(".number_hufflepuff").textContent = allStudents.filter(isHufflePuff).length;
  document.querySelector(".number_slytherin").textContent = allStudents.filter(isSlytherin).length;
}
function filterList(filteredList) {
  if (settings.filterBy === "house_gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  }
  if (settings.filterBy === "house_ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  }
  if (settings.filterBy === "house_hufflepuff") {
    filteredList = allStudents.filter(isHufflePuff);
  }
  if (settings.filterBy === "house_Slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  }
  if (settings.filterBy === "expelled") {
    filteredList = allStudents.filter(isExpelled);
  }
  if (settings.filterBy === "enrolled") {
    filteredList = allStudents.filter(isEnrolled);
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
  if (student.expelled === true) {
    clone.querySelectorAll("[data-action='choice']").forEach((button) => button.removeEventListener("click", selectChoice));
    student.prefect = false;
    student.inquisitorialSquad = false;
  }
  //gets which button of the choice has been clicked
  function selectChoice(event) {
    const selectedChoice = event.target.dataset.field;
    setChoice(selectedChoice);
  }

  function setChoice(choice, filteredList) {
    //store the choice
    settings.choice = choice;
    if (settings.choice === "expel_student") {
      if (student.firstName === "Alessia") {
        student.expelled = false;
        // say why can't be expelled pop up
      } else {
        student.expelled = !student.expelled;
        console.log(allStudents);
      }

      //if not expelled, set the expel to true

      // console.log("the student has been expelled", student);
      // expelledStudents = allStudents.filter(isExpelled);
      // console.log("expelled students array", expelledStudents);
      //builds the list of students
      buildStudentsList();
      // } else {
      //   console.log("this student is already expelled");
      // }
    }
  }

  // append clone to list
  document.querySelector("#template_wrapper").appendChild(clone);
}

function removeStudent(student) {
  const expelledStudentIndex = allStudents.indexOf(student);
  allStudents = allStudents.filter(isNotExpelled);
  //allStudents.splice(expelledStudentIndex, 1);
}
