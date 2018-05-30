'use strict';

/* Services */


var tfgServices = angular.module('tfgServices', ['firebase']);

tfgServices.factory('loginService', ['$rootScope', '$firebase','$firebaseSimpleLogin','$location',
    function($rootScope, $firebase, $firebaseSimpleLogin, $location) {
        var loginObj = null;
        var refUsers = new Firebase ("https://tfg.firebaseio.com/users");
        var users = $firebase(refUsers);
        $rootScope.user = null;
        $rootScope.loginError = null;
        $rootScope.change = null;
         return {
            init: function() {

                var databaseRef = new Firebase('https://tfg.firebaseio.com');
                return loginObj = $firebaseSimpleLogin(databaseRef);
            },
            

            login: function(email, pass) {
                $rootScope.loginError = null;
               loginObj.$login('password', {
                  email: email,
                  password: pass
               }).then(function(user) {
                    console.log('Logged in as: ', user.uid);
                    
                    
                    var keys = users.$getIndex();
                    angular.forEach(keys, function(key) {
                        if(users[key].id===user.uid){
                            $rootScope.user = users[key];
                            $rootScope.userKey = key;
                        }
                    });
                   $location.path('/profile');
                }, function(error) {
                    console.error('Login failed: ', error);
                    $rootScope.loginError = error;
                });
                
               
            },
            
            changePassword: function(email, oldPass, newPass){
                $rootScope.loginError = null;
                loginObj.$changePassword(email, oldPass, newPass)
                    .then(function(user){
                        console.log('Password change succeded');
                        $rootScope.change = true;
                    }, function(error){
                        console.error('Password change failed: ', error);
                        $rootScope.loginError = error;
                    });
            },
             
            logout: function() {
                $rootScope.loginError = null;
               loginObj.$logout();
                $rootScope.user = null;
            },


            createAccount: function(email, pass, name, phone) {
                $rootScope.loginError = null;
               loginObj.$createUser(email, pass)
                    .then(function(user) { 
                        console.log('User created as: ', user.uid); 
                        users.$add({
                            "name": name,
                            "email": email,
                            "id": user.uid,
                            "phoneNumber": phone,
                            "chosenCars": false
                        });
                        
                        loginObj.$login('password', {
                          email: email,
                          password: pass
                       }).then(function(user) {
                            console.log('Logged in as: ', user.uid);


                            var keys = users.$getIndex();
                            angular.forEach(keys, function(key) {
                                if(users[key].id===user.uid){
                                    $rootScope.user = users[key];
                                    $rootScope.userKey = key;
                                }
                            });
                           $location.path('/profile');
                        }, function(error) {
                            $rootScope.loginError = error;
                            console.error('Login failed: ', error);
                        });
                        
                        
                        
                    }, function(error) {
                     console.error('User creation failed: ', error);
                     $rootScope.loginError = error;
                });  
                
            }
         };

}]);


