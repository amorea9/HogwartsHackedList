"use strict";

window.addEventListener("DOMContentLoaded", init);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
let allStudents = [];
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
};
const settings = {
  filterBy: "all",
  sortBy: "name",
  sortDir: "asc",
};

let previousChar;

function init() {
  console.log("ready");
  //event listener for the drop down options
  addEventsToButtons();
  loadJSON();
}
function addEventsToButtons() {
  document.querySelector("#filter").addEventListener("change", readOptionsValues);
}

function readOptionsValues(event) {
  //reads the value of the filter option selected
  const selectedFilterOption = event.target.value;
  setFilter(selectedFilterOption);
}

function loadJSON() {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare student objects
      prepareStudentsData(jsonData);
    });
}

function prepareStudentsData(jsonData) {
  allStudents = jsonData.map(prepareStudentData);
  buildStudentsList();
}

function prepareStudentData(jsonObject) {
  //create object from the student template
  const student = Object.create(Student);
  const studentFullNameArray = jsonObject.fullname.trim().split(" ");
  student.gender = jsonObject.gender;
  //first name
  student.firstName = studentFullNameArray[0].charAt(0).toUpperCase() + studentFullNameArray[0].substring(1).toLowerCase();
  //last name
  student.lastName = studentFullNameArray.at(-1).charAt(0).toUpperCase() + studentFullNameArray.at(-1).substring(1).toLowerCase();
  //conditions for exeptions with letter
  for (let i = 1; i < jsonObject.fullname.lenght; i++) {
    previousChar = jsonObject.fullname[i - 1];
    if (previousChar === '"' || previousChar === "-") {
      jsonObject.fullname[i].toUpperCase();
      //makes sure that if the previous character is ", the letter becomes upper case
    } else {
      jsonObject.fullname[i];
    }
  }

  //checking for middle name
  if (jsonObject.fullname.indexOf(" ") === jsonObject.fullname.lastIndexOf(" ")) {
    student.middleName = "";
  } else {
    student.middleName = jsonObject.fullname.substring(jsonObject.fullname.indexOf(" ") + 1, jsonObject.fullname.lastIndexOf(" "));
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

  return student;
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildStudentsList();
}

function buildStudentsList() {
  const currentList = filterList(allStudents);
  console.log("current list:", currentList);

  displayStudentsList(currentList);
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
  if (settings.filterBy === "not_expelled") {
    filteredList = allStudents.filter(isNotExpelled);
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
function isNotExpelled(student) {
  return student.expelled === false;
}

function displayStudentsList(students) {
  // clear the list
  document.querySelector("#template_wrapper").innerHTML = " ";
  console.log("arrayStudents", students);
  // build a new list
  students.forEach(displayStudent);
  //displaying the stats info
  document.querySelector(".number_total_students").textContent = students.length;
  document.querySelector(".number_displayed").textContent = students.length;
  document.querySelector(".number_expelled").textContent = students.filter(isExpelled).length;
  document.querySelector(".number_gryffindor").textContent = students.filter(isGryffindor).length;
  document.querySelector(".number_ravenclaw").textContent = students.filter(isRavenclaw).length;
  document.querySelector(".number_hufflepuff").textContent = students.filter(isHufflePuff).length;
  document.querySelector(".number_slytherin").textContent = students.filter(isSlytherin).length;
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector(".student_card_template").content.cloneNode(true);
  // set clone data
  clone.querySelector(".name").textContent = student.firstName;
  clone.querySelector(".last_name").textContent = student.lastName;
  clone.querySelector(".student_picture").src = student.imageFile;
  clone.querySelector(".student_picture").alt = `${student.firstName} ${student.lastName}`;

  // append clone to list
  document.querySelector("#template_wrapper").appendChild(clone);
}

//for searching - use filtering on the input search field return the array of things that match the search
