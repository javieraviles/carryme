    'use strict';

/* Controllers */

var tfgControllers = angular.module('tfgControllers', ["firebase"]);


tfgControllers.controller('loginController', ['$scope', '$firebase', 'loginService', '$rootScope', function($scope, $firebase, loginService, $rootScope) {

    
    
        $scope.login = function() {
                 $rootScope.loginError = null;
                 if( !$scope.email ) {
                    $rootScope.loginError = 'Please insert an email address';
                 }
                 else if( !$scope.pass ) {
                    $rootScope.loginError = 'The password is needed';
                 }
                 else {
                    loginService.login($scope.email, $scope.pass);
                 }
        };


        $scope.createUser = function() {
                 $rootScope.loginError = null;
                 if( !$scope.email ) {
                    $rootScope.loginError = 'Please insert an email address';
                 }
                 else if( !$scope.pass ) {
                    $rootScope.loginError = 'The password is needed';
                 }
                 else if( $scope.pass !== $scope.confirm ) {
                    $rootScope.loginError = 'Both passwords must be equal!';
                 }
                 else{
                    loginService.createAccount($scope.email, $scope.pass, $scope.name, $scope.phone);
                }
        };

}]);


tfgControllers.controller('profileController', ['$scope', '$rootScope', '$firebase', '$location','loginService',function($scope, $rootScope, $firebase,$location,loginService){
    if($rootScope.loginObj.user==null){
        $location.path('/login');
    }
    
    var refNotifications = new Firebase ("https://tfg.firebaseio.com/users/"+$rootScope.userKey+"/notifications/");
    $scope.notifications = $firebase(refNotifications);
    $scope.keys = $scope.notifications.$getIndex();
    $rootScope.change = null;
    
    $scope.changePassword = function (){
        $rootScope.loginError = null;
            if( !$scope.oldPass ) {
                $rootScope.loginError = 'Please insert the old password';
             }
             else if( !$scope.newPass ) {
                $rootScope.loginError = 'Please insert the new password';
             }
             else if( $scope.newPass !== $scope.newPass2 ) {
                $rootScope.loginError = 'Both passwords must be equal!';
             }
             else{
                loginService.changePassword($rootScope.user.email,$scope.oldPass,$scope.newPass);
                 $scope.oldPass = null;
                 $scope.newPass = null;
                 $scope.newPass2 = null;
            }    
    };
    
    
    $scope.removeNotification = function(notification){
        angular.forEach($scope.keys, function(key) {
            if($scope.notifications[key]===notification){
                $scope.notifications.$remove(key);
            }
        });
        $scope.keys = $scope.notifications.$getIndex();
    }
    
    $scope.menu = function (option){
        if(option==='new-car'){
            location.href = '#/new-car';   
        }
        if(option==='my-cars'){
            location.href = '#/my-cars';   
        }
        if(option==='chosen-cars'){
            location.href = '#/chosen-cars';   
        }
        if(option==='looking-for-car'){
            location.href = '#/looking-for-car';   
        }
    }
  
}]);

tfgControllers.controller('carController', ['$scope', '$rootScope', '$firebase','$location', function($scope, $rootScope, $firebase,$location){
    var refCreatedCars = new Firebase ("https://tfg.firebaseio.com/users/"+$rootScope.userKey+"/createdCars/");
    $scope.createdCars = $firebase(refCreatedCars);
    
    if($rootScope.loginObj.user==null){
        $location.path('/login');
    }

    $scope.done = false;
    $scope.return = false;
    $scope.reuse = false;
    
    if($rootScope.loginObj.user){
        $scope.owner = $rootScope.user.name;
        $scope.contactNumber = $rootScope.user.phoneNumber;
        $scope.ownerKey = $rootScope.userKey;
    }

    
    $scope.addCar = function () {
        $rootScope.cars.$add({
            "from": $scope.from,
            "destination": $scope.destination,
            "owner": $scope.owner,
            "ownerKey":$scope.ownerKey,
            "contactNumber":$scope.contactNumber,
            "seats": $scope.seats,
            "availableSeats": $scope.seats,
            "price": $scope.price,
            "date": $scope.date,
            "time":$scope.time
        });
        
        if($scope.return){
            $rootScope.cars.$add({
                "from": $scope.destination,
                "destination": $scope.from,
                "owner": $scope.owner,
                "ownerKey":$scope.ownerKey,
                "contactNumber":$scope.contactNumber,
                "seats": $scope.seats,
                "availableSeats": $scope.seats,
                "price": $scope.price,
                "date": $scope.date2,
                "time":$scope.time2
            });
        }
        $scope.done=true;
        if($scope.reuse == false){
            $scope.createdCars.$add({
                "from": $scope.from,
                "destination": $scope.destination,
                "availableSeats": $scope.seats,
                "price": $scope.price
            });
        }
    }
    
    $scope.useCar = function (car){
            $scope.from = car.from;
            $scope.destination = car.destination;
            $scope.seats = car.availableSeats;
            $scope.price = car.price;
            $scope.reuse = true;
    }
    
    $scope.cleanCreatedCars = function(){
        $scope.createdCars.$remove();
    }
}]);

tfgControllers.controller('lookingController', ['$scope', '$rootScope', '$firebase','$location', function($scope, $rootScope, $firebase,$location){
        if($rootScope.loginObj.user==null){
            $location.path('/login');
        }
    
        var todayDate =new Date();
        $scope.day=todayDate.getDate();
        $scope.month=todayDate.getMonth() + 1;
        $scope.year=todayDate.getFullYear();
        
        $scope.done=null;
        $scope.error = null;
        var error1 = "You are already interested for this car!";
        var error2="There are no available seats on this car!";

    
        $scope.interested = function(carId,car){
            $scope.done=null;
            $scope.error = null;
            var refPassengers = new Firebase ("https://tfg.firebaseio.com/cars/"+carId+"/passengers/");
            var passengers = $firebase(refPassengers);
            var keys = passengers.$getIndex();
            angular.forEach(keys, function(key) {
                if(passengers[key].name===$rootScope.user.name)
                    $scope.error = true;
            });
            if($scope.error){
                $scope.error = error1;
            }
            else{
                if($rootScope.cars[carId].availableSeats===0){
                    $scope.error=error2;
                }
                else{
                    $scope.done=true;
                    $rootScope.cars[carId].availableSeats --;
                    $rootScope.cars.$save();
                    passengers.$add({
                        "name":$rootScope.user.name,
                        "phone":$rootScope.user.phoneNumber
                    });
                    var refChosen = new Firebase ("https://tfg.firebaseio.com/users/"+$rootScope.userKey+"/chosenCars/");
                    var chosen = $firebase(refChosen);
                    chosen.$add({
                        "keyCar":carId
                    });
                    var refNotifications = new Firebase("https://tfg.firebaseio.com/users/"+car.ownerKey+"/notifications/");
                    var notifications = $firebase(refNotifications);
                    notifications.$add({
                        "notificationGood":'The user "'+$rootScope.user.name+'" with contact number '+$rootScope.user.phoneNumber+' IS INTERESTED in your car with destination "'+car.destination+'" in the '+car.date+' at '+car.time+'.'
                    });
                }

            }
        }
        
        $scope.orderBy = function(order){
            $scope.selectedOrder = order;
        }
}]);

tfgControllers.controller('chosenCarsController', ['$scope', '$rootScope', '$firebase' , '$location', function($scope, $rootScope, $firebase, $location){
    if($rootScope.loginObj.user==null){
        $location.path('/login');
    }
  
    var refUserCarsChosen = new Firebase ("https://tfg.firebaseio.com/users/"+$rootScope.userKey+"/chosenCars");
    var userCarsChosen = $firebase(refUserCarsChosen);
    $scope.chosenCars= new Array();
    $scope.chosenCarsKeys = new Array();
    var i=0;
    $scope.carsKeys = $rootScope.cars.$getIndex();
    $scope.keys = userCarsChosen.$getIndex();
    angular.forEach($scope.keys, function(key) {
        $scope.chosenCarsKeys[i]=userCarsChosen[key].keyCar;
        i++;
        
    });
    var l=0;
    angular.forEach($scope.carsKeys, function(key) {
        for(var j=0;j<$scope.chosenCarsKeys.length;j++){
            if($scope.chosenCarsKeys[j]===key){
                $scope.chosenCars[l]=$rootScope.cars[key];
                l++;
            }
        }
    });
    var removeKey = 0;
    $scope.removeChoice = function (index,car) {
        $scope.chosenCars.splice(index,1);
        
        angular.forEach($scope.carsKeys,function(key){
            if($rootScope.cars[key]==car){
                removeKey = key;
                var refPassengers = new Firebase ("https://tfg.firebaseio.com/cars/"+removeKey+"/passengers/");
                var passengers = $firebase(refPassengers);
                var pKeys = passengers.$getIndex();
                angular.forEach(pKeys, function(pKey) {
                    if(passengers[pKey].name===$rootScope.user.name){
                        passengers.$remove(pKey);
                        $rootScope.cars[removeKey].availableSeats ++;
                        $rootScope.cars.$save(removeKey);
                    }
                });
                angular.forEach($scope.keys, function(key) {
                    if(userCarsChosen[key].keyCar===removeKey){
                        userCarsChosen.$remove(key);
                    }
                });
                var refNotifications = new Firebase("https://tfg.firebaseio.com/users/"+car.ownerKey+"/notifications/");
                var notifications = $firebase(refNotifications);
                notifications.$add({
                    "notificationBad":'The user "'+$rootScope.user.name+'" IS NO LONGER INTERESTED in your car with destination "'+car.destination+'" on the '+car.date+' at '+car.time+'.'
                });
            }
        });
    }
  
}]);

tfgControllers.controller('myCarsController', ['$scope', '$rootScope', '$firebase','$location', function($scope, $rootScope, $firebase,$location){
    if($rootScope.loginObj.user==null){
        $location.path('/login');
    }
 
    $scope.myCars= new Array();
    var keys = $rootScope.cars.$getIndex();
    var i=0;
    if($rootScope.user){
        angular.forEach(keys, function(key) {
            if($rootScope.cars[key].owner===$rootScope.user.name){
                $scope.myCars[i]=$rootScope.cars[key];
                i++;
            }
        });
    }
    
    $scope.removeCar = function (car,index){
        $scope.myCars.splice(index,1);
        $scope.passengerNames = new Array();
        angular.forEach(keys, function(key) {
            if($rootScope.cars[key]===car){
                if(angular.isDefined(car.passengers)){
                    var refPassengers = new Firebase ("https://tfg.firebaseio.com/cars/"+key+"/passengers/");
                    var passengers = $firebase(refPassengers);
                    var pKeys = passengers.$getIndex();
                    var j=0;
                    angular.forEach(pKeys, function(pKey) {
                        $scope.passengerNames[j]=passengers[pKey].name;
                        j++;
                    });
                    var refUsers = new Firebase ("https://tfg.firebaseio.com/users");
                    var users = $firebase(refUsers);
                    var uKeys = users.$getIndex();
                    angular.forEach(uKeys, function(uKey) {
                        for(var l=0;l<$scope.passengerNames.length;l++){
                            if(users[uKey].name===$scope.passengerNames[l]){
                                var refChosenCars = new Firebase ("https://tfg.firebaseio.com/users/"+uKey+"/chosenCars/");
                                var chosenCars = $firebase(refChosenCars);
                                var cKeys = chosenCars.$getIndex();
                                angular.forEach(cKeys, function(cKey) {
                                    if(chosenCars[cKey].keyCar===key){
                                        chosenCars.$remove(cKey);
                                    }   
                                });
                                var refNotifications = new Firebase ("https://tfg.firebaseio.com/users/"+uKey+"/notifications/");
                                var notifications = $firebase(refNotifications);
                                notifications.$add({
                                    "notificationBad":'The user "'+car.owner+'" HAS DELETED the car in which you were going to travel to "'+car.destination+'" on the '+car.date+' at '+car.time+'.'
                                });
                            }
                        }
                        
                    });
                    
                    
                }
                
                $rootScope.cars.$remove(key);
                
                
            }
    });
    
    }
}]);




