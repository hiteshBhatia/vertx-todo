angular.module('myApp', ['ngCookies']);

var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

console.log(eb);

var loggedOutTemplates = {"navigation": 'templates/signin.html', "display": 'templates/signup.html'};
var loggedInTemplates = {"navigation": 'templates/logout.html', "display": 'templates/todolist.html'};
var cookieNames = ["sessionID", "username"];

//function authorise(sessionID) {
//    eb.send("vertx.basicauthmanager.authorise", {sessionID: sessionID }, function (reply) {
//        console.log(reply.statpus);
//    });
//}
//
//
//


function GeneralController($scope, $cookieStore) {
    $scope.master = {};
    $scope.details = $scope.details || {};
    $scope.details.template = loggedOutTemplates;
    $scope.todos = {};



    if ($cookieStore.get('sessionID')) {
        $scope.details.username = $cookieStore.get('username')
        $scope.details.template = loggedInTemplates;
    }



    $scope.login = function (loginCredentials) {
        loginUserAndUpdateTemplates(loginCredentials)
    }


    $scope.logout = function () {
        clearCookies();
    }

    $scope.register = function (user) {
//        $scope.master = angular.copy(user);
        registerAndLoginUser(user)
    };

    $scope.isUnchanged = function (user) {
        return angular.equals(user, $scope.master);
    };

    function registerAndLoginUser(userData) {
        userData.action = "register"
        eb.send("vertx.controller.user", userData, function (reply) {
            loginUserAndUpdateTemplates(userData)
        });
    }

    function loginUserAndUpdateTemplates(loginCredentials) {
        if (!isLoggedIn()) {
            performLoginAndOtherActions(loginCredentials);
        }
    }

    function isLoggedIn() {
        return $cookieStore.get("sessionID")
    }

    function performLoginAndOtherActions(loginCredentials) {
        eb.send("vertx.basicauthmanager.login", loginCredentials, function (reply) {
            var sessionData = {"sessionID": reply.sessionID, "username": loginCredentials.username}
            $scope.details.username = loginCredentials.username
            updateCookiesAndTemplates(sessionData)
            findTodos()

        });
    }

    function updateCookiesAndTemplates(sessionData) {
        updateCookies(sessionData);
        updateTemplates(loggedInTemplates)
    }

    function updateCookies(sessionData) {
        for (cookie in cookieNames) {
            var cookieName = cookieNames[cookie];
            var cookieValue = sessionData[cookieName];
            $cookieStore.put(cookieName, cookieValue)
        }
    }

    function updateTemplates(templates) {
        $scope.details.template = templates
        $scope.$apply($scope.details.template)
    }

    function clearCookies() {
        for (cookie in cookieNames) {
            $cookieStore.remove(cookieNames[cookie]);
        }
        $scope.details.template = loggedOutTemplates;
    }

    function findTodos() {
        console.log("Finding todos")
        eb.send('vertx.mongopersistor', {action: 'find', collection: 'todos', matcher: {"username": "hitesh"} },
            function (reply) {
                console.log(typeof reply.results);
                console.log(reply.results[0].todo);
                $scope.$apply(
                    $scope.todos = reply.results[0]
                );
                console.log($scope.todos.todo);
            });
    }


    eb.onopen = function () {
        if(isLoggedIn()) {
            findTodos()
        }
    };

}


