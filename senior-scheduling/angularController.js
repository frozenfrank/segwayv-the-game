var app = angular.module('seniorScheduling', ['ngRoute','firebase']);

app.factory('firebaseDb', ($firebaseObject/*, watchers*/) => {
  // Initialize Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyB1E_iXyb-OftTs4xKowo2CYB7_xD7MqO4",
    authDomain: "segwayv.firebaseapp.com",
    databaseURL: "https://segwayv.firebaseio.com",
    projectId: "project-2306767165960722021",
    storageBucket: "",
    messagingSenderId: "1040280244697"
  });

  var getChild = path => firebaseDb.rootRef.child(path);
  var firebaseDb = {
    rootRef: firebase.database().ref("/seniorPresentations/"),
    /*
    watchConnection: func => watchers.register("firebase-offline", func),
    unwatchConnection: id => watchers.deregister("firebase-offline", id),
    */
    $child: path => $firebaseObject(getChild(path)),

    on: (path, callback) => getChild(path).on('value', callback),
    once: path => getChild(path).once("value"), //promise: thenable
    update: (path, data, callback) => getChild(path).update(data, callback),
    set: (path, data, callback) => getChild(path).set(data, callback),
    transaction: (path, handler, callback, intermediateCalls) => getChild(path).transaction(handler, callback, intermediateCalls),

    getUniqueKey: () => firebaseDb.rootRef.push().key,
  };

  /*
  //watch the connected status of the app to raise offline flags...
  firebase.database().ref(".info/connected").on('value', snap => {
    watchers.alert("firebase-offline", snap.val());
  });
  */

  return firebaseDb;
});
app.factory('studentIds', (firebaseDb) => {
  var validStudentIds = firebaseDb.$child("config/validStudentIds");


  //TODO: finish refactoring and restructuring DOM to fit all roles into one document
  var studentIds = {
    exists: (id, firstInitial, lastInitial) => {
      //true if the user exists and their initials match in both their first and last names, otherwise false
      if(!id || !firstInitial || !lastInitial) return false;

      var norm = string => string[0].toLowerCase(),
          student = validStudentIds[id];

      if(student && (!student.firstName || !student.lastName))
        console.warn("Either firstName or lastName is undefined for ID: ", id);

      //if the names are provided in the data to compare against, we obviously can't discredit them for that
      return  !!validStudentIds[id] &&
              (!student.firstName || norm(student.firstName) === norm(firstInitial)) &&
              (!student.lastName || norm(student.lastName) === norm(lastInitial));
    },
    isStudent: (id, firstInitial, lastInitial) => {
      //true if the user is a student: should be scheduling an appointment
      return studentIds.exists(id, firstInitial, lastInitial) && (true || validStudentIds[id].student === true); //todo: implement 'student' property in data
    },
    isStudentAuthorized: (id, firstInitial, lastInitial) => {
      //true if the student is also authorized to actually schedule an appointment
      return studentIds.isStudent(id, firstInitial, lastInitial) && validStudentIds[id].valid === true; //todo: rename 'valid' property to 'authorizedToSchedule'
    },
    isAdmin: (id, firstInitial, lastInitial) => {
      //true if the user has admin access: can view all students and change the days/times, manage students and volunteers
      return studentIds.exists(id, firstInitial, lastInitial) && validStudentIds[id].admin === true;
    },
    isVolunteer: (id, firstInitial, lastInitial) => {
      //true if the user is a volunteer: can view a room schedule for a day
      return studentIds.exists(id, firstInitial, lastInitial) && validStudentIds[id].volunteer === true;
    },

    getInfo: id =>  validStudentIds[id] || false, //warning: data security issue
    getIds: () => {
      if(!validStudentIds || !validStudentIds.$resolved)
        return;

      var studentIds = {};
      validStudentIds.forEach((student, id) => {
        studentIds[id] = student;
      });

      return studentIds;
    },
  };

  return studentIds;
});

app.directive('studentId', (studentIds, $rootScope) => {
  return {
    require: 'ngModel',
    link: (scope, elm, attrs, ctrl) => {
      //TODO: eliminate this hard-coded time; also use a server time to prevent easy get-arounds
      ctrl.$validators.closed     = (modelValue, displayValue) => !$rootScope.isSchedulingClosed();
      ctrl.$validators.time       = (modelValue, displayValue) => Date.now() >= new Date("October 29, 2018 09:29:00");
      ctrl.$validators.exists     = (modelValue, displayValue) => studentIds.isStudent(modelValue, scope.student.firstInitial, scope.student.lastInitial);
      ctrl.$validators.authorized = (modelValue, displayValue) => studentIds.isStudentAuthorized(modelValue, scope.student.firstInitial, scope.student.lastInitial);
    },
  };
});
app.directive('validateOn', () => {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModel) {
          // Force-trigger the parsing pipeline.
          scope.$watchGroup(attrs.validateOn.split(','), () => ngModel.$validate());
        }
    };
});

app.controller('angularController', ($scope, $window, firebaseDb, studentIds, $rootScope) => {
  $scope.days = firebaseDb.$child("data/days");
  $scope.strings = firebaseDb.$child("config/strings");
  $scope.settings = firebaseDb.$child("config/settings");

  $rootScope.isSchedulingClosed = () => !!$scope.settings.schedulingClosed;

  if($window.student){
    $scope.student = {
      id: undefined,
      firstInitial: "",
      lastInitial: "",
      _loaded: false,
    };

    var boundTo = undefined;
    $scope.$watch("student.id", () => {
      var studentId = $scope.student.id;
      if($scope.userInfoForm.studentId.$valid && $scope.student.id){

        if(!boundTo){
          // console.log('Connecting to ID:',studentId);
          $scope.user = firebaseDb.$child(`data/users/${studentId}`);
          $scope.user.$loaded(() => {
            $scope.student._loaded = true;
          });
        }else
          throw Error("We're already bound to a studentID!");


        boundTo = studentId;
      }else{
        if(boundTo){
          //turn off the connection
          // console.log("Destroying connection to ID:", boundTo);
          $scope.user.$destroy();
          boundTo = undefined;

          //reset the forms
          $scope.userInfoForm.$setPristine();
          $scope.userInfoForm.$setUntouched();

          $scope.userInfoForm.extraInfo.$setPristine();
          $scope.userInfoForm.extraInfo.$setUntouched();
        }

        $scope.user = {
          name: "",
          email: "@cloud.ifschools.org",
          studentId: undefined,
          projectTitle: "",
          advisor: "",
        };
        $scope.student._loaded = false;
      }
    });
  }

  var selectingTime = false;
  $scope.selectTime = (dayKey, timeKey) => {
    if(selectingTime){
      console.warn("Wait until the last operation finishes before requesting another time slot");
      return;
    }

    if($scope.hasUserRequested()){
      alert("Request denied: this student ID has already been used to request a time slot!");
      return;
    }

    //just in case, prevent us from attempting another save attempt while this is still occuring
    selectingTime = true;

    var slotKey = firebaseDb.getUniqueKey();

    //tranaction with the slot to ensure a free space, then save to user
    var timeRef = firebaseDb.rootRef.child(`data/days/${dayKey}/times/${timeKey}`);
    timeRef.transaction(time => {
      // console.log("Transaction:", time);
      if(time){
        if(!time.slots)
          time.slots = {};

        if(Object.keys(time.slots).length < time.maximumSlots){
          time.slots[slotKey] = {
            studentId: $scope.student.id,
            requested: firebase.database.ServerValue.TIMESTAMP,
          };
        } else
          return; //we would create too many slots
      }

      return time;
    }, (error, committed, snapshot) => {
      function close(){
        selectingTime = false;
        // $scope.$apply(); //unnecessary
      }

      if(error)
        throw Error(error);
      else if(!committed){
        alert("Reservation not secured: the slot is already full");
        close();
      } else {
        //save the profile information and path to requested slot
        // var userData = angular.copy($scope.user);
        var u = $scope.user,
            userData = {
              name: u.name,
              email: u.email,
              projectTitle: u.projectTitle,
              advisor: u.advisor,
            };
            //TODO: eliminate this horrendous practice of duplication values


        if(!userData.requestedSlots) userData.requestedSlots = {};
        userData.requestedSlots[slotKey] = {
          dayKey: dayKey,
          timeKey: timeKey,
          slotKey: slotKey,
          requested: firebase.database.ServerValue.TIMESTAMP
        };

        firebaseDb.rootRef.child(`data/users/${$scope.student.id}`).update(userData).then(() => {
          // console.log("Finished transaction time slot");
          close();
        });
      }
    }, false);
  };
  $scope.unselectTimes = () => {
    var updateObject = {},
        user = $scope.user;

    for(let requestKey in user.requestedSlots){
      let request = user.requestedSlots[requestKey];
      updateObject[`data/days/${request.dayKey}/times/${request.timeKey}/slots/${request.slotKey}`] = {};
    }

    updateObject[`data/users/${$scope.student.id}/requestedSlots`] = {};

    firebaseDb.rootRef.update(updateObject);
  };

  $scope.getTimeStatus = time => {
    var maxSlots = time.maximumSlots,
        availableSlots = maxSlots - Object.keys(time.slots || {}).length;

    return {
      maximumSlots: maxSlots,
      availableSlots: availableSlots,
      filledSlots: maxSlots - availableSlots,

      lowSlots: 0 < availableSlots && availableSlots <= 2, //TODO: eliminate this hardcoded value
      noSlots: availableSlots <= 0,
      acceptingRequests: availableSlots > 0,
    };
  };
  $scope.hasUserRequested = (manualId) => {
    var user = manualId ? users[manualId] : $scope.user;

    if(!user || !user.requestedSlots) return false; //they don't even exist: they can't have requested
    return Object.keys(user.requestedSlots).length > 0; //they might have requested by now
  };
  $scope.getSelectedSlotInfo = () => {
    var user = $scope.user,
        firstRequest = user.requestedSlots[Object.keys(user.requestedSlots)[0]],
        day = $scope.days[firstRequest.dayKey],
        time = day.times[firstRequest.timeKey];

    return {
      day: day.displayTitle,
      time: time.displayTime,
    };
  };

  $scope.arrayFromObject = obj => obj ? Object.keys(obj).map(key => obj[key]) : [];


  // ADMIN page
  if($window.admin){
    var users = firebaseDb.$child(`data/users`);
    $scope.getStudentName = id => {
      var student = studentIds.getInfo(id);
      return `${student.firstName} ${student.lastName}`; //official name

      // return users[id].name; //typed name
    };
    $scope.getSlotStatus = time => {
      var status = $scope.getTimeStatus(time);
      return `(${status.filledSlots} of ${status.maximumSlots})`;
    };

    //special functions
    $scope.hardResetDatabase = () => {
      if(!confirm("Reset the database by overwriting all old data?"))
        return;

      var days = ["Wednesday, March 13th", "Thursday, March 14th"];
      var times = "4:00,4:20,4:40,5:00,5:20,5:40,6:00,6:20".split(',').map(t => t + " pm");
      var maximumSlots = 8;

      var data = {
        days: {
        /*
          "dayKey": {
            displayTitle: "Monday...",
            times: {
              "timeKey": {
                displayTime: "4:00 pm...",
                maximumSlots: 6666,
                slots: {
                  "slotKey": {
                    studentId: "<<studentId>>",
                    requested: "<<timestamp>>",
                    roomKey: "<<roomKey>>", //added in later by the program
                    assignmentKey: "<<assignmentKey>>", //not yet present in the data
                  }
                  ...
                }
              }
            },
            rooms: {
              "roomKey": {
                roomNumber: "<<roomNumber>>",
                roomLeader: "<<volunteerKey>>",
                volunteers: {
                  "volunteerKey": {
                    name: "<<name>>",
                    email: "<<email>>",
                    roomLeader: <Boolean>,
                    //other info...
                  },
                  ...
                },
                assignments: {
                  "<<asignmentKey>>": {
                    timeKey: "<<timeKey>>",
                    slotKey: "<<slotKey>>",
                    // studentId: "<<studentId>>", //I don't want to include this because that remove the reliance on the slots. They need to exist to manage the correct number reserved etc...
                  }
                },
              }
              ...
            }
          }
        */
        }
      };
      for(let day of days){
        let dayKey = firebaseDb.getUniqueKey();
        data.days[dayKey] = {
          displayTitle: day,
          times: {},
        }

        for(let time of times){
          let timeKey = firebaseDb.getUniqueKey();
          data.days[dayKey].times[timeKey] = {
            displayTime: time,
            maximumSlots: maximumSlots,
            slots: {},
          }
        }
      }


      firebaseDb.set('data', data).then(snap => {
        console.log("Hard reset the datbase");
        // $scope.$apply();
      });
    };
    $scope.assignRoomNumbers = () => {
      console.log("Assigning room numbers");
      //TODO: what??
      var volunteerData = [
        [{roomNumber: '223',roomLeader:'Mitzi Ellingson',volunteers:'Karl Casperson++kcasperson@co.bonneville.id.us;Brandi Newton++bnewton@idahofallsarts.org;Allen Cain++allendcain@gmail.com'},{roomNumber: '203',roomLeader:'Danae Rogers',volunteers:'Tona Duncan++dunctona@d91.k12.id.us;Yula Cisneros++;Mary Searle++searmary@d91.k12.id.us'},{roomNumber: '213',roomLeader:'Catarina Janotti',volunteers:'Natalie Martin++martnata@cloud.ifschools.org;Valerie Rodel++rodevale@cloud.ifschools.org;Rebecca Chapple++rebeccareading7@gmail.com'},{roomNumber: '225',roomLeader:'Ryan Hansen',volunteers:'Shauna Belknap++s.holyoak@yahoo.com;Liza Raley++liza@klce.com;Lori Johnson++johnlori@d91.k12.id.us'},{roomNumber: '224',roomLeader:'Susan Bradley',volunteers:'Rick Whitmore++;Angie Wood++;Megan Sanderson++sandmega@d91.k12.id.us'},{roomNumber: '204',roomLeader:'Michelle Ward',volunteers:'Traci Johnson++tracij1990@gmail.com;Heather Medema++medemj1455@yahoo.com;Jackie Stewart++rnjstewart@gmail.com'}],
        [{roomNumber: '223',roomLeader:'Michelle Ward',volunteers:'Tona Duncan++dunctona@d91.k12.id.us;Krista Mayes++mayekris@d91.k12.id.us;Jon Jorgenson++jorgjona@d91.k12.id.us'},{roomNumber: '203',roomLeader:'Danae Rogers',volunteers:'Rachel Hoy++chips4hoy@icloud.com;Traci Johnson++tracij1990@gmail.com;Ressha Mitchell++resshamm@gmail.com'},{roomNumber: '213',roomLeader:'Catarina Janotti',volunteers:'Ryan Cook++cookryan@d91.k12.id.us;Nicole Cook++cookryan@d91.k12.id.us;Clarissa Mecham++mechamclarissa@gmail.com'},{roomNumber: '225',roomLeader:'Ryan Hansen',volunteers:'Lori Johnson++johnlori@d91.k12.id.us;Shelly Nash++shelleyrnash@gmail.com;Sarah Jorgenson++jorgsara@d91.k12.id.us'},{roomNumber: '224',roomLeader:'Susan Bradley ',volunteers:'Carol Anderson++loverofbrains@gmail.com;Brenda Passmore++passbren@d91.k12.id.us;Sam Gillihan++samantha.gillihan@gmail.com'}],
        [{roomNumber: '223',roomLeader:'Michelle Ward',volunteers:'Jeff Pinkham++jpinkham@postregister.com;Natalie Martin++martnata@d91.k12.id.us;Stacey Comba++scomba@idahoheartinstitute.com'},{roomNumber: '203',roomLeader:'Danae Rogers',volunteers:'Amy Parsons++amyzgreat@gmail.com;Dawnyel Rush++rushdawn@d91.k12.id.us;James Bradley++'},{roomNumber: '213',roomLeader:'Catarina Janotti',volunteers:'Sandy Bryan ++Sandy.Bryan@outlook.com;Margaret Wimborne ++wimbmarg@d91.k12.id.us;Margaret’s friend++'},{roomNumber: '225',roomLeader:'Ryan Hansen',volunteers:'Bryce Rasmussen++natalierasmussen@yahoo.com;Natalie Rasmussen++natalierasmussen@yahoo.com;Sarah Jorgenson++jorgsara@d91.k12.id.us'},{roomNumber: '224',roomLeader:'Susan Bradley ',volunteers:'Traci Johnson++tracij1990@gmail.com;Sarah Atwell++sarahkoonce6@gmail.com;LaNay Robbins++lanayrobbins@yahoo.com'}]];


      /*
      days = [`Room 203	Room 204	Room 213	Room 223	Room 224	Room 225
      Natalie Jardine	Oaklee Monson	Ashley Okeson	Madeline Krager	Hannah Gardner	Leah Smith
      Isabella Wenstrom	Brittnie Gavin	Gus Hahn	Abbigayle Farnsworth	Jaidyn Clement	Carson Thronley
      Mikayla Cook	Jezerae Redman	Julia Rasmussen	Logan Mecham	Clay Ankeny	Larissa Barros
      Madylene Smith	MaKayla Searle	Keegan Swanson	Conner Burns	Viktor Gyenes	Ashleigh Neider
      Alyssa Cook	Jordan Badachi	Allie Erickson	Grace Shirley	Rachel Ruigi Jiang	Natalie Hudson & Alene Korell
      Mykaela Scott	Camille Nielsen	Katie Killpack	Brenner Erickson	Cecilia Brown	Chase Baker
      Leslie Timmins	Camille Langston	Baryn Butte	Tristan Denning	Parker Comba	Logan Shelley
      Javiera Echegoyen	Emily McAllister	Nathan Dineen	Jason Creager	John Stewart	Olivia Hillam
      Matthew Decker	Sydney Davenport	Joshua Creager	Jack Troyer	Ian Finnigan	Brittany Neider`,
      `Room 203	Room 213	Room 223	Room 224	Room 225
      London Hall	Laurna Chapman	Emma Williams	Bronsyn Meagher	Kaleb Belknap
      Darcy Ritchie	Jonathan Nebeker	Matthew Reeb	Chloe Jones	Berringer Scherr
      Jayden Thompson	Eva Whipple	Claire Andary	Mattie Moad	Kennedy Ybarguen
      Cabes Woolf	Zach Merrill	Kashlyn Taylor	Shelbi Manwell	Clayton Kunz
      Rachel Harris	Anna Young	Laurel Taylor	Noe Coughenour	Austin Sumsion
      Benjamin Christofferson	Noah Allen	Cara Garrity	Caitley Neider	Alvaro Ponce
      Bree Ellingson	Marisol Lopez	Graicyn Smith	Sophia Stolworthy	Carson Fugleberg
      Emma Jackson	Caden White	Ashley McCarty	Kailee Puetz	Lincoln Mitchell
      Kennady Goddard	Amber Brower	Kyler Layton	Madalyn Burton	Kennedy Burton`,
      `Room 203	Room 213	Room 223	Room 224	Room 225
      Gabe Wenstrom	Brendon Sperry	Caralle Brasher	James Finlinson	Gabe Elsethagen
      Olivia Hansen	Alexis Eborn	Ivan Reyna-Espinoza	Brooke Stenquist	Shaylee Robertson
      Faith Katseanes	Kristen Ehardt	Isabelle Monroe	Allyn Hansen	Ashlan Monson
      Vivian Jones	Chance Wilde	Jasmin Landeros	Deaven Jorgenson	Natalie Jessmore
      Genesis Cortez	Samantha Perez Gonzalez	Kayden McWilliams	Bridget Lee	Hunter McCord
      Alyssa Rawson	Ayden Cutler	Leif Olson	Lucas Ozmun	Carson Medeiros
      Dallin Maddock	Conner Randall	Whitney Yorgason	McKenna Clark	Keenan Bryan
      Arianna Manwill	Ashlynn Davis	Kimberly Arreola	Kailee Smith	Raylie Bryant
      Zachary Erikson	Noah Wulf	Cielle Wenstrom	Halle Manwaring	Peyton Merwin`];
      students = {};
      for(let data of days){
      data = data.split("\n");

      for(let i=0;i<data.length;i++)
        data[i] = data[i].split("	");
      // console.log(data);
      for(let i=1;i<data.length;i++)
        for(let ii=0;ii<data[0].length;ii++)
          students[data[i][ii]] = data[0][ii].substr(-3);
      }
      console.log(students);
      */
      var students = {
        "Natalie Jardine": "203",
        "Oaklee Monson": "204",
        "Ashley Okeson": "213",
        "Madeline Krager": "223",
        "Hannah Gardner": "224",
        "Leah Smith": "225",
        "Isabella Wenstrom": "203",
        "Brittnie Gavin": "204",
        "Gus Hahn": "213",
        "Abbigayle Farnsworth": "223",
        "Jaidyn Clement": "224",
        "Carson Thronley": "225",
        "Mikayla Cook": "203",
        "Jezerae Redman": "204",
        "Julia Rasmussen": "213",
        "Logan Mecham": "223",
        "Clay Ankeny": "224",
        "Larissa Barros": "225",
        "Madylene Smith": "203",
        "MaKayla Searle": "204",
        "Keegan Swanson": "213",
        "Conner Burns": "223",
        "Viktor Gyenes": "224",
        "Ashleigh Neider": "225",
        "Alyssa Cook": "203",
        "Jordan Badachi": "204",
        "Allie Erickson": "213",
        "Grace Shirley": "223",
        "Rachel Ruigi Jiang": "224",
        "Natalie Hudson & Alene Korell": "225",
        "Mykaela Scott": "203",
        "Camille Nielsen": "204",
        "Katie Killpack": "213",
        "Brenner Erickson": "223",
        "Cecilia Brown": "224",
        "Chase Baker": "225",
        "Leslie Timmins": "203",
        "Camille Langston": "204",
        "Baryn Butte": "213",
        "Tristan Denning": "223",
        "Parker Comba": "224",
        "Logan Shelley": "225",
        "Javiera Echegoyen": "203",
        "Emily McAllister": "204",
        "Nathan Dineen": "213",
        "Jason Creager": "223",
        "John Stewart": "224",
        "Olivia Hillam": "225",
        "Matthew Decker": "203",
        "Sydney Davenport": "204",
        "Joshua Creager": "213",
        "Jack Troyer": "223",
        "Ian Finnigan": "224",
        "Brittany Neider": "225",
        "London Hall": "203",
        "Laurna Chapman": "213",
        "Emma Williams": "223",
        "Bronsyn Meagher": "224",
        "Kaleb Belknap": "225",
        "Darcy Ritchie": "203",
        "Jonathan Nebeker": "213",
        "Matthew Reeb": "223",
        "Chloe Jones": "224",
        "Berringer Scherr": "225",
        "Jayden Thompson": "203",
        "Eva Whipple": "213",
        "Claire Andary": "223",
        "Mattie Moad": "224",
        "Kennedy Ybarguen": "225",
        "Cabes Woolf": "203",
        "Zach Merrill": "213",
        "Kashlyn Taylor": "223",
        "Shelbi Manwell": "224",
        "Clayton Kunz": "225",
        "Rachel Harris": "203",
        "Anna Young": "213",
        "Laurel Taylor": "223",
        "Noe Coughenour": "224",
        "Austin Sumsion": "225",
        "Benjamin Christofferson": "203",
        "Noah Allen": "213",
        "Cara Garrity": "223",
        "Caitley Neider": "224",
        "Alvaro Ponce": "225",
        "Bree Ellingson": "203",
        "Marisol Lopez": "213",
        "Graicyn Smith": "223",
        "Sophia Stolworthy": "224",
        "Carson Fugleberg": "225",
        "Emma Jackson": "203",
        "Caden White": "213",
        "Ashley McCarty": "223",
        "Kailee Puetz": "224",
        "Lincoln Mitchell": "225",
        "Kennady Goddard": "203",
        "Amber Brower": "213",
        "Kyler Layton": "223",
        "Madalyn Burton": "224",
        "Kennedy Burton": "225",
        "Gabe Wenstrom": "203",
        "Brendon Sperry": "213",
        "Caralle Brasher": "223",
        "James Finlinson": "224",
        "Gabe Elsethagen": "225",
        "Olivia Hansen": "203",
        "Alexis Eborn": "213",
        "Ivan Reyna-Espinoza": "223",
        "Brooke Stenquist": "224",
        "Shaylee Robertson": "225",
        "Faith Katseanes": "203",
        "Kristen Ehardt": "213",
        "Isabelle Monroe": "223",
        "Allyn Hansen": "224",
        "Ashlan Monson": "225",
        "Vivian Jones": "203",
        "Chance Wilde": "213",
        "Jasmin Landeros": "223",
        "Deaven Jorgenson": "224",
        "Natalie Jessmore": "225",
        "Genesis Cortez": "203",
        "Samantha Perez Gonzalez": "213",
        "Kayden McWilliams": "223",
        "Bridget Lee": "224",
        "Hunter McCord": "225",
        "Alyssa Rawson": "203",
        "Ayden Cutler": "213",
        "Leif Olson": "223",
        "Lucas Ozmun": "224",
        "Carson Medeiros": "225",
        "Dallin Maddock": "203",
        "Conner Randall": "213",
        "Whitney Yorgason": "223",
        "McKenna Clark": "224",
        "Keenan Bryan": "225",
        "Arianna Manwill": "203",
        "Ashlynn Davis": "213",
        "Kimberly Arreola": "223",
        "Kailee Smith": "224",
        "Raylie Bryant": "225",
        "Zachary Erikson": "203",
        "Noah Wulf": "213",
        "Cielle Wenstrom": "223",
        "Halle Manwaring": "224",
        "Peyton Merwin": "225"
      };

      var dayCount = 0;
      for(let dayKey in $scope.days){
        if(dayKey[0] === "$")
          continue;
        console.log("dayKey: %s", dayKey);

        let day = $scope.days[dayKey];

        day.rooms = {};
        for(let i=0;i<volunteerData[dayCount].length;i++){
          let room = volunteerData[dayCount][i];
          roomKey = firebaseDb.getUniqueKey();

          let obj = {
            roomNumber: room.roomNumber,
            roomLeader: "<<volunteerKey>>",
            volunteers: {},
            assignments: {},
          }

          //create volunteers
          let volunteerList = room.volunteers.split(";");
          volunteerList.push(room.roomLeader+"++343");
          for(let volunteer of volunteerList){
            let data = volunteer.split("++");
            let volunteerKey = firebaseDb.getUniqueKey();
            let roomLeader = data[1] === "343";

            obj.volunteers[volunteerKey] = {
              name: data[0],
              email: roomLeader ? "" : data[1] || "",
              roomLeader: roomLeader,
            }
            if(roomLeader)
              obj.roomLeader = volunteerKey;
          }

          day.rooms[roomKey] = obj;
          console.log(obj);
        }

        if(++dayCount >= volunteerData.length)
          break;
      }

      //create a conversion between room numbers and room keys
      var roomNumConversions = {};
      for(let dayKey in $scope.days){
        if(dayKey[0] !== "$" && $scope.days[dayKey].rooms){
          roomNumConversions[dayKey] = {};
          for(let roomKey in $scope.days[dayKey].rooms){
            let room = $scope.days[dayKey].rooms[roomKey];
            roomNumConversions[dayKey][room.roomNumber] = roomKey;
          }
        }
      }

      //from the users list, add in the correct room number data etc...
      for(let studentId in users){
        let user = users[studentId];

        if(user && user.requestedSlots){
          var officialData = studentIds.getInfo(studentId);
          for(let slotKey in user.requestedSlots){
            let slot = user.requestedSlots[slotKey];
            let fullName = officialData.firstName + " " + officialData.lastName;
            var roomNumber, roomKey, attempts = 0;
            do {
              roomNumber = students[fullName] || prompt(`To which room is ${fullName} assigned?`);
              roomKey = roomNumConversions[slot.dayKey][roomNumber];
            } while(!roomKey && ++attempts < 2);

            if(roomKey){
              //write the data in three places
              $scope.days[slot.dayKey].times[slot.timeKey].slots[slot.slotKey].roomKey = roomKey;
              $scope.days[slot.dayKey].rooms[roomKey].assignments[firebaseDb.getUniqueKey()] = {
                timeKey: slot.timeKey,
                slotKey: slot.slotKey,
                // studentId: studentId, //not actually necessary, but added here for convience
              };
              slot.roomKey = roomKey; //also save into the user
            }else
              console.warn(`Did not save room information for ${fullName} because a roomKey could not be found for day: ${slot.dayKey} and roomNumber: ${roomNumber}`);
          }
        }
      }

      console.log($scope.days);
      $scope.days.$save();
      users.$save(); //save in the roomKeys

    };
    $scope.generateEmailList = () => {
      var emailList = [];

      for(let studentId in users){
        let student = users[studentId];
        let officialStudent = studentIds.getInfo(studentId);

        if(student && student.requestedSlots){
          let slotCount = 0;
          for(let slotKey in student.requestedSlots){
            let slot = student.requestedSlots[slotKey];
            let day = $scope.days[slot.dayKey],
                time = day.times[slot.timeKey],
                room = day.rooms[slot.roomKey];

            emailList.push({
              replacements: {
                "%student_full_name%": `${officialStudent.firstName} ${officialStudent.lastName}`,
                "%student_first_name%": officialStudent.firstName,
                "%student_last_name%": officialStudent.lastName,

                "%reservation_day%": day.displayTitle,
                "%reservation_time%": time.displayTime,
                "%reservation_room_number%": room.roomNumber,
              },
              firstGivenName: officialStudent.firstName, //given means official, from school records
              lastGivenName: officialStudent.lastName,
              firstProvidedName: student.name.split(" ")[0], //provided means typed in by student
              lastProvidedName: (function(string){
                //this will fail if they have a suffix on their name
                let words = string.split(" ");
                return words[words.length -1];
              })(student.name),
              email: student.email,
            });

            if(slotCount++ > 1)
              console.warn(`${studentId} has somehow managed to reserve multiple slots!!`);
          }
        }
      }

      console.log(emailList);
      return emailList;
    }

    //add user form
    var newUserData = Object.freeze({
      firstName: "",
      lastName: "",
      advisor: "",
      advisorRoomNumber: "",
      valid: true,
    });
    function resetNewUserForm(){
      $scope.newUser = { id: "" };
      $scope.newUserData = angular.copy(newUserData);

      //reset the form for another submission
      if($scope.newUserForm){
        $scope.newUserForm.$setPristine();
        $scope.newUserForm.$setUntouched();
      }
    }
    resetNewUserForm();
    $scope.addNewUser = () => {
      console.log("Adding student with credentials: ", $scope.newUserData);
      firebaseDb.update(`config/validStudentIds/${$scope.newUser.id}`, $scope.newUserData, snap => {
        resetNewUserForm();
        console.log("Successfully added user!");
        $scope.$apply();
      });
    }


    $scope.getPresentationRoom = id => {
      let request = Object.values(users[id].requestedSlots)[0];
      let room = $scope.days[request.dayKey].rooms[request.roomKey];

      return room.roomNumber;
    }
    $scope.getPresentationDate = id => {
      let request = Object.values(users[id].requestedSlots)[0];
      let day = $scope.days[request.dayKey];
      let time = day.times[request.timeKey];

      return `${day.displayTitle} at ${time.displayTime}`;
    }
    $scope.getProjectTitle = id => {
      return users[id].projectTitle;
    }

    $scope.updateNumberOfSlots = (dayKey, timeKey) => {
      if(!dayKey || !timeKey)
        console.error("dayKey or timeKey is not defined");

      let day = $scope.days[dayKey],
          time = day.times[timeKey];

      let response = prompt(`How many slots should be allowed on ${day.displayTitle} at ${time.displayTime}?`),
          numberOfSlots = parseInt(response, 10);

      if(response == null || response == "")
        return;
      if(isNaN(numberOfSlots)){
        alert(`Sorry, '${response}' is not a number.`);
        return;
      }else if(numberOfSlots < 0){
        alert(`The number must be at least zero.`);
        return;
      }

      let scheduledSlots = time.slots ? Object.keys(time.slots).length : 0;
      if(numberOfSlots < scheduledSlots){
        alert(`Cannot lower the available slots to ${numberOfSlots} because at least that many people have already selected it.`);
        return;
      }

      firebaseDb.set(`data/days/${dayKey}/times/${timeKey}/maximumSlots`, numberOfSlots, () => {
        console.log("Time slots successfully updated");
      });
    };
    $scope.toggleScheduling = () => firebaseDb.set("config/settings/schedulingClosed", $rootScope.isSchedulingClosed() ? false : true);

    $scope.getUnscheduledStudents = () => {
      var studentNames = [],
          users = studentIds.getIds();

      if(!users)
        return;

      for(let studentId in users){
        let student = users[studentId];
        if(student.valid === true && !$scope.hasUserRequested(studentId))
          studentNames.push(student.firstName + " " + student.lastName);
      }

      studentNames.sort((a, b) => a.localeCompare(b));
      return studentNames;
    }
    $scope.importValidatedStudents = () => {
      console.log("Importing csv file");
      let file = document.getElementById("acceptedStudentsCSV").files[0];
        /*
        validStudentIds: {
          "studentId": {
            advisor: "",
            advisorRoomNumber: 0,
            firstName: "",
            lastName: "",
            valid: true,
          }
        }
        */
        /** Parsing notes!
        the first row, a header row will be skipped
        the columns must appear in this order
          - last name
          - first name
          - student id
          - advisor
          - advisor room number
        **/

      Papa.parse(file, {
        complete: results => {
          var validStudentIds = {};
          for(let i=1;i<results.data.length;i++){
            let line = results.data[i];
            let studentObj =  {
              lastName: line[0],
              firstName: line[1],
              valid: true,
            };

            if(line[3])
              studentObj.advisor = line[3];
            if(line[4])
              studentObj.advisorRoomNumber = line[4];

            validStudentIds[line[2]] = studentObj;
          }

          firebaseDb.set("config/validStudentIds", validStudentIds).then(snapshot => {
            console.log("Finished saving student Id's:", snapshot);
          });
        }
      });
    }
  }

  //VOLUNTEERS
  if($window.volunteer){
    // $scope.presentationDay = {};
    // $scope.presentationRoom = {};
    var users = firebaseDb.$child("data/users");

    $scope.getTime = assignment => $scope.presentationDay.times[assignment.timeKey];
    $scope.getOfficialStudent = assignment => studentIds.getInfo($scope.getTime(assignment).slots[assignment.slotKey].studentId);
    $scope.getStudent = assignment => users[$scope.getTime(assignment).slots[assignment.slotKey].studentId];
  }
});
