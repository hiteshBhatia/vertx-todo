angular.module('myApp', ['ngCookies']);

var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
console.log(eb);

var loggedOutTemplates = {"navigation": 'templates/signin.html', "display": 'templates/signup.html'};
var loggedInTemplates = {"navigation": 'templates/logout.html', "display": 'templates/todolist.html'};
var cookieNames = ["sessionID", "username"]

//function authorise(sessionID) {
//    eb.send("vertx.basicauthmanager.authorise", {sessionID: sessionID }, function (reply) {
//        console.log(reply.statpus);
//    });
//}
//
//
//
//function findTodos($scope, $http) {
//    eb.send('vertx.mongopersistor', {action: 'find', collection: 'todos', matcher: {"name": "hitesh"} },
//        function (reply) {
//            console.log(reply.results);
//            $scope.$apply(
//                $scope.data = reply.results
//            );
//        });
//}

function updateCookiesAndTemplates($scope, sessionData, $cookieStore) {
    updateCookies(sessionData, $cookieStore)
    updateTemplates($scope, $cookieStore,loggedInTemplates)
}


function updateCookies(sessionData, $cookieStore) {
    for (cookie in cookieNames) {
        var cookieName = cookieNames[cookie];
        var cookieValue = sessionData[cookieName];
        $cookieStore.put(cookieName, cookieValue)
    }
}

function isLoggedIn($cookieStore){
    return $cookieStore.get("sessionID")
}

function loginAndOtherActions(loginCredentials, $scope, $cookieStore) {
    eb.send("vertx.basicauthmanager.login", loginCredentials, function (reply) {
        var sessionData = {"sessionID": reply.sessionID, "username": loginCredentials.username}
        $scope.details.username = loginCredentials.username
        updateCookiesAndTemplates($scope, sessionData, $cookieStore)
    });
}

function updateTemplates($scope, $cookieStore,templates) {
        $scope.details.template = templates
        $scope.$apply($scope.details.template)
}

function registerAndLoginUser($scope, $cookieStore) {
    var userData = $scope.master
    userData.action = "register"
    eb.send("vertx.controller.user", userData, function (reply) {
        loginUserAndUpdateTemplates(userData, $scope, $cookieStore)
    });
}


function GeneralController($scope, $cookieStore) {
    $scope.details = $scope.details || {};
    $scope.details.template = loggedOutTemplates;

    if ($cookieStore.get('sessionID')) {
        $scope.details.username = $cookieStore.get('username')
        $scope.details.template = loggedInTemplates;
    }

    $scope.login = function (loginCredentials) {
        loginUserAndUpdateTemplates(loginCredentials)
    }

    $scope.logout= function () {
        clearCookies();
    }

    function loginUserAndUpdateTemplates(loginCredentials) {
        if (!isLoggedIn($cookieStore)) {
            loginAndOtherActions(loginCredentials, $scope, $cookieStore);
        } else {
            console.log("Already logged in")
        }
    }


    function clearCookies() {
        for (cookie in cookieNames) {
            $cookieStore.remove(cookieNames[cookie]);
        }
        $scope.details.template = loggedOutTemplates;
    }

//    eb.onopen = function () {
//        login();
//        authorise();
//        findTodos($scope, $http)
//    };

}

function SignUpController($scope, $cookieStore) {
    $scope.master = {};

    $scope.register = function (user) {
        $scope.master = angular.copy(user);
        registerAndLoginUser($scope, $cookieStore)
    };

    $scope.isUnchanged = function (user) {
        return angular.equals(user, $scope.master);
    };
}



