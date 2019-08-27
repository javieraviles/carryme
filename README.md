## CarryMe

My very first project at university (UPCT, Spain) back in 2013: AngularJS + Firebase, including authentication and real-time database. Car sharing app. **Full of bad practices**, but it works.  

[Live demo](http://carryme.tritogether.net)

I didn't use bower, which at that time would have been the ideal tool as a frontEnd package manager, so angularJS 1.1 can be found in the /lib directory. For styling, Bootstrap 3 was used, can be found in /css folder.

Each view has it's own controller, where the business logic resides; the access to the firebase cloudDB endpoints is done from there. At least for the auth a service was used, so that part doesn't look that bad.


Routing
```
    $routeProvider.
        when('/', {
        templateUrl: 'partials/identification.html',
        controller: 'loginController'
      }).
        when('/profile', {
        templateUrl: 'partials/user-profile.html',
        controller: 'profileController'
      }).
        when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'loginController'
      }).
        when('/my-cars', {
        templateUrl: 'partials/my-cars.html',
        controller: 'myCarsController'
      }).
        when('/chosen-cars', {
        templateUrl: 'partials/chosen-cars.html',
        controller: 'chosenCarsController'
      }).
        when('/new-car', {
        templateUrl: 'partials/new-car.html',
        controller: 'carController'
      }).
        when('/looking-for-car', {
        templateUrl: 'partials/looking-for-car.html',
        controller: 'lookingController'
      }).
      otherwise({
        redirectTo: '/'
      });
```

AuthService
```
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
```

Controller example
```
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
```


View example
```
    <div ng-show='loginObj.user === null'>
        <h1 align="center">Welcome to CarryMe!</h1>
        <h4 align="center">Traveling with empty seats? You are losing money!</h4>
        <h4 align="center">Try now CarryMe, the easiest way of sharing car.</h4>
        
        <form class="form-signin" role="form">
            <input type="email" ng-model="email" class="form-control" placeholder="email address" required="" autofocus="">
            <input type="password" ng-model="pass" class="form-control" placeholder="Password" required="">
            <button class="btn btn-lg btn-success btn-block" ng-click="login()">Sign in</button>
            <a style="color:white;" href="#/login"><p class="text-center">Sign up</p></a>
            <div ng-show='loginError!=null' class="alert alert-danger" role="alert">Something went wrong: {{loginError}}</div>
        </form>
    </div>
    <div ng-show='loginObj.user != null'>
        <h1>¡Welcome to CarryMe, {{user.name}}!</h1>
        <a href='#/profile'><button type="button" class="btn btn-success">My profile</button></a>
        <button type="button" class="btn btn-danger" ng-click="loginObj.$logout()">Logout</button>
    </div>
```
