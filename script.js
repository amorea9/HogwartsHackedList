"use strict";

window.addEventListener("DOMContentLoaded", init);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const allStudents = [];
const Student = {
  //template
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  imageFile: "",
  house: "",
};

let previousChar;
let studentHouse;
let studentFullName;

function init() {
  console.log("ready");

  loadJSON();
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
  //create object from the student template
  jsonData.forEach((jsonObject) => {
    const student = Object.create(Student);

    //variables for easier use
    studentFullName = jsonObject.fullname.trim();
    studentHouse = jsonObject.house.trim();

    //conditions for exeptions
    for (let i = 1; i < studentFullName.lenght; i++) {
      previousChar = studentFullName[i - 1];
      if (previousChar === '"' || previousChar === "-") {
        studentFullName[i].toUpperCase();
        //makes sure that if the previous character is ", the letter becomes upper case
      } else {
        studentFullName[i];
      }
    }

    //first name
    student.firstName = studentFullName.split(" ")[0].charAt(0).toUpperCase() + studentFullName.split(" ")[0].substring(1).toLowerCase();

    //last name
    student.lastName = studentFullName.split(" ").at(-1).charAt(0).toUpperCase() + studentFullName.split(" ").at(-1).substring(1).toLowerCase();

    //checking for middle name
    if (studentFullName.indexOf(" ") === studentFullName.lastIndexOf(" ")) {
      student.middleName = "";
    } else {
      student.middleName = studentFullName.substring(studentFullName.indexOf(" ") + 1, studentFullName.lastIndexOf(" "));
    }

    //middle name
    student.middleName = student.middleName.charAt(0).toUpperCase() + student.middleName.substring(1).toLowerCase();

    //nickname
    student.nickName = studentFullName.substring(studentFullName.indexOf('"') + 1, studentFullName.lastIndexOf('"'));

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
    student.house = studentHouse.charAt(0).toUpperCase() + studentHouse.substring(1).toLowerCase();
    console.log("student object", student);

    // push object into array
    allStudents.push(student);

    //displaying the list length at the end of the page
    document.querySelector(".number_displayed").textContent = allStudents.length;
  });

  displayStudentsList(allStudents);
}

function displayStudentsList(allStudents) {
  // clear the list
  //   document.querySelector("#list tbody").innerHTML = "";
  console.log("arrayStudents", allStudents);
  // build a new list
  allStudents.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template.student_card_template").content.cloneNode(true);

  // set clone data
  clone.querySelector(".name").textContent = student.firstName;
  clone.querySelector(".last_name").textContent = student.lastName;
  clone.querySelector(".student_picture").src = student.imageFile;
  clone.querySelector(".student_picture").alt = `${student.firstName} ${student.lastName}`;

  // append clone to list
  document.querySelector(".main_wrapper").appendChild(clone);
}

//for searching - use filtering on the input search field return the array of things that match the search
